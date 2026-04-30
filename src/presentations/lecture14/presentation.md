@title
# Асинхронность и многопоточность в Qt
@subtitle Практический подход на примере расчета ряда Фурье
@badge Qt Framework
@items
- Qt Framework
- QML + C++ Integration
@end

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

---
@yesScroll
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

---
@yesScroll
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


---
@yesScroll
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

---
@yesScroll
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

---
@yesScroll
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

---
@yesScroll
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

---
@yesScroll
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


---
@yesScroll
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


---
@yesScroll
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

