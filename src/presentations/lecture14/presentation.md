@title
# Асинхронность и многопоточность в Qt
@subtitle Практический подход на примере расчета ряда Фурье
@badge Qt Framework
@items
- Qt Framework
- QML + C++ Integration
@end

<!--
Сегодня мы разберем, как правильно организовать асинхронные вычисления в Qt приложениях, чтобы интерфейс оставался отзывчивым при выполнении тяжелых задач.
-->

---

@category Проблема
# Почему нужен отдельный поток?

**Главный поток (Main Thread) отвечает за:**
- Отрисовку UI
- Обработку событий пользователя
- Таймеры и анимации

**Тяжелые вычисления в главном потоке приводят к:**
- "Зависанию" интерфейса
- Невозможности отмены операции
- Плохому пользовательскому опыту

@diagram
[UI Events] → [Main Thread] ←X [Heavy Calculation] (блокировка)
@end

<!--
Когда вычисление выполняется в главном потоке, все события интерфейса ставятся в очередь и ждут завершения расчета. Пользователь видит "замороженное" приложение.
-->

---

@category Архитектура
# Архитектура приложения

Три уровня архитектуры:
- **UI Layer (QML)**
  - Отображение данных
  - Ввод пользователя
- **Controller Layer (Backend)**
  - Управление потоком
  - Связь UI и логики
  - Живет в главном потоке
- **Worker Layer (Worker)**
  - Тяжелые вычисления
  - Живет в отдельном потоке

@diagram
[QML UI] ↔ [Backend (Main Thread)] ↔ signals/slots ↔ [Worker (Worker Thread)]
@end

<!--
Важно: Backend всегда живет в главном потоке и выступает посредником между UI и Worker.
-->

---

@category Worker
# Worker.h - объявление класса

@code cpp
class Worker : public QObject
{
    Q_OBJECT
public:
    explicit Worker(QObject* parent = nullptr);

public slots:
    void doWork(int harmonicsCount);
    void stopWork();

signals:
    void progress(int value);
    void finished(const QVector<double>& result);
    void started();
    void stopped();

private:
    bool m_stopRequested = false;
};
@end

<!--
Worker наследуется от QObject, а не от QThread. Это современный подход Qt. Слоты - это методы, которые будут выполняться в потоке. Сигналы - способ коммуникации с внешним миром.
-->

---

@category Worker
# Worker.cpp - выполнение задачи

@code cpp
void Worker::doWork(int harmonicsCount)
{
    m_stopRequested = false;
    emit started();

    const int pointsCount = 1000;
    QVector<double> result(pointsCount, 0.0);

    for (int n = 1; n <= harmonicsCount; n += 2) {
        // Проверка флага остановки
        if (m_stopRequested) {
            emit stopped();
            return;
        }

        // Вычисления...
        emit progress(progressValue);
        QThread::msleep(5);
    }

    emit finished(result);
}
@end

<!--
Ключевые моменты: 1. Флаг m_stopRequested для кооперативной остановки 2. Регулярная отправка прогресса через сигналы 3. Никогда не блокируйте поток надолго без проверки флага остановки
-->

---

@category Backend
# Backend.h - интерфейс для QML

@code cpp
class Backend : public QObject
{
    Q_OBJECT
    QML_ELEMENT

    Q_PROPERTY(int progress READ progress NOTIFY progressChanged)
    Q_PROPERTY(bool isWorking READ isWorking NOTIFY isWorkingChanged)
    Q_PROPERTY(QVector<double> result READ result NOTIFY resultChanged)

public:
    Q_INVOKABLE void startCalculation(int harmonicsCount);
    Q_INVOKABLE void stopCalculation();

signals:
    void progressChanged();
    void isWorkingChanged();
    void resultChanged();
};
@end

<!--
Q_PROPERTY делает данные доступными из QML с автоматическим обновлением UI. Q_INVOKABLE позволяет вызывать методы C++ из QML кода.
-->

---

@category Backend
# Backend.cpp - создание и настройка потока

@code cpp
Backend::Backend(QObject* parent) : QObject(parent)
{
    m_thread = new QThread(this);
    m_worker = new Worker();

    // КЛЮЧЕВОЙ МОМЕНТ
    m_worker->moveToThread(m_thread);

    // Соединение сигналов
    connect(m_worker, &Worker::progress, this, &Backend::onProgress);
    connect(m_worker, &Worker::finished, this, &Backend::onFinished);

    // Очистка памяти
    connect(m_thread, &QThread::finished, m_worker, &QObject::deleteLater);
    connect(m_thread, &QThread::finished, m_thread, &QObject::deleteLater);

    m_thread->start();
}
@end

<!--
moveToThread() меняет принадлежность объекта потоку. Все слоты Worker теперь будут выполняться в m_thread. Соединения между потоками автоматически используют очередь событий.
-->

---

@category Backend
# Вызов метода в другом потоке

@code cpp
void Backend::startCalculation(int harmonicsCount)
{
    if (m_isWorking) return;

    m_progress = 0;
    m_result.clear();
    emit progressChanged();
    emit resultChanged();

    // Вызов в другом потоке
    QMetaObject::invokeMethod(m_worker, "doWork",
        Qt::QueuedConnection,
        Q_ARG(int, harmonicsCount));
}
@end

<!--
Qt::QueuedConnection гарантирует, что метод выполнится в потоке worker'а, а не в главном потоке. Параметры копируются и передаются безопасно между потоками.
-->

---

@category Backend
# Корректная остановка потока

@code cpp
// Backend.cpp
void Backend::stopCalculation()
{
    if (!m_isWorking) return;
    m_worker->stopWork();  // Устанавливаем флаг
}

// Worker.cpp
void Worker::stopWork()
{
    m_stopRequested = true;
}

// Backend destructor
Backend::~Backend()
{
    if (m_thread->isRunning()) {
        m_thread->quit();
        if (!m_thread->wait(3000)) {
            qWarning() << "Thread did not finish!";
        }
    }
}
@end

<!--
Никогда не используйте terminate() для потоков! Только кооперативная остановка через флаги. В деструкторе обязательно ждем завершения потока с таймаутом.
-->

---

@category Backend
# Слоты обработки сигналов от Worker

@code cpp
void Backend::onProgress(int value)
{
    m_progress = value;
    emit progressChanged();  // QML обновится автоматически
}

void Backend::onFinished(const QVector<double>& result)
{
    m_result = result;
    m_isWorking = false;
    emit isWorkingChanged();
    emit resultChanged();
    emit calculationFinished();
}

void Backend::onStarted()
{
    m_isWorking = true;
    emit isWorkingChanged();
}
@end

<!--
Эти слоты выполняются в главном потоке (благодаря соединению сигналов). Они обновляют свойства и эмитят сигналы для уведомления QML интерфейса.
-->

---

@category QML
# main.qml - привязка к данным

@code qml
Backend {
    id: backend
    onCalculationStarted: console.log("Начато")
    onCalculationFinished: console.log("Завершено")
}

ProgressBar {
    value: backend.progress / 100.0
    visible: backend.isWorking
}

Label {
    text: backend.isWorking ? 
          "Прогресс: " + backend.progress + "%" : 
          "Готов"
}

Button {
    text: "Запустить"
    enabled: !backend.isWorking
    onClicked: backend.startCalculation(500)
}
@end

<!--
QML автоматически подписывается на изменения свойств через NOTIFY сигналы. Когда Backend эмитит progressChanged(), ProgressBar автоматически обновится.
-->

---

@category Signals / Slots
# Как работает межпоточная коммуникация

**В одном потоке:**
- Signal → Direct Connection → Slot
- Мгновенный вызов

**В разных потоках:**
- Signal → Queued Connection → Event Queue → Slot
- Сигнал копируется в очередь событий целевого потока
- Выполняется когда поток обработит события

**Автоматический выбор:** Qt::AutoConnection выбирает тип соединения автоматически на основе принадлежности объектов потокам.

@diagram
[Thread 1: emit signal] → [Queue] → [Thread 2: process event → call slot]
@end

<!--
Это обеспечивает потокобезопасность - данные копируются и передаются через очередь событий, никаких гонок данных.
-->

---

@category Safety
# Что можно и нельзя делать

**✅ МОЖНО:**
- Передавать данные через сигналы/слоты
- Использовать Q_PROPERTY для обмена с UI
- Эмитить сигналы из любого потока

**❌ НЕЛЬЗЯ:**
- Обращаться к UI элементам из Worker
- Изменять общие данные без мьютексов
- Использовать terminate() для остановки потока
- Создавать/удалять QObject в чужом потоке

<!--
Worker должен быть полностью изолирован от UI. Он только эмитит сигналы. Все изменения UI происходят в главном потоке через слоты Backend.
-->

---

@category Types
# Передача сложных типов между потоками

**Встроенные типы Qt (работают из коробки):**
- int, double, bool
- QString, QByteArray
- QVector<T>, QList<T>
- QVariant

**Свои типы (требуется регистрация):**

@code cpp
// В заголовке
struct MyData {
    int value;
    QString name;
};

Q_DECLARE_METATYPE(MyData)

// В коде инициализации
qRegisterMetaType<MyData>("MyData");
@end

<!--
QVector<double> из нашего примера работает автоматически. Для своих структур нужно использовать Q_DECLARE_METATYPE и qRegisterMetaType.
-->

---

@category Итоги
# Почему именно такая архитектура?

**1. Отзывчивость UI**
- Интерфейс не блокируется
- Можно отменить операцию
- Плавная анимация прогресса

**2. Безопасность**
- Автоматическая синхронизация через сигналы
- Нет явных блокировок (mutex)
- Qt гарантирует потокобезопасность

**3. Чистая архитектура**
- Разделение ответственности
- Легко тестировать
- Просто расширять

**4. Интеграция с QML**
- Автоматическое обновление UI
- Простая привязка данных
- Минимум кода

<!--
Этот паттерн - стандарт де-факто для многопоточности в Qt/QML приложениях.
-->
