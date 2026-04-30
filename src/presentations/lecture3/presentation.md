@title
# Qt Framework
Разработка приложений с помощью Qt
\date{25 февраля 2026 г.}

---

@video assets/intro.mp4

---

# Выбор стратегии

**Есть несколько путей:**

@fragment
1) Qt Online Installer (официальный устновщик)
@end
@fragment
2) MSYS2
@end
@fragment
3) vcpkg
@end
@fragment
4) aqtinstall
@end

---

@section Вариант 1: vcpkg

---

# Что такое vcpkg

@fragment
vcpkg — это менеджер C++ библиотек от Microsoft.

> Qt — это просто библиотека.
@end

@fragment
Он:

- скачивает исходники  
- собирает их под ваш компилятор  
- подключает к Visual Studio автоматически
@end

---

# Установка vcpkg

@code PowerShell width=650px
PS C:\>git clone https://github.com/microsoft/vcpkg C:\vcpkg
PS C:\>cd C:\vcpkg
PS C:\>.\bootstrap-vcpkg.bat
PS C:\>.\vcpkg integrate install
@end

@code bash 
# Установка Qt через vcpkg
PS C:\>.\vcpkg install qtbase:x64-windows
@end

Это установит:

- Qt6 Core  
- Qt6 Widgets  
- зависимости  
- сборку под MSVC x64  

---

# Создание первого проекта

\list numbers
1) Открываем Visual Studio  
2) Create → CMake Project  
3) Добавляем CMakeLists.txt  

@code cmake editable width=500px height=250px
cmake_minimum_required(VERSION 3.21)
project(MyQtApp)

find_package(Qt6 REQUIRED COMPONENTS Widgets)

add_executable(MyQtApp main.cpp)

target_link_libraries(MyQtApp PRIVATE Qt6::Widgets)
@end

---

@section Вариант 2. aqtinstall

---

# aqtinstall

**aqtinstall** — Python-инструмент, но на Windows проще использовать готовый `.exe` — Python внутри, ничего не надо устанавливать отдельно.

Ссылка: `github.com/miurahr/aqtinstall/releases`

В разделе **Assets** найти файл: `aqt.exe`
@image assets/aqt_releases.png width=460


Положить `aqt.exe` в удобную папку, например `C:\Qt\`

---

# Установка Qt через aqt.exe

Открыть **PowerShell** в папке с `aqt.exe`:

@code bash width=650px height=150px
# Посмотреть доступные версии Qt
PS C:\>.\aqt.exe list-qt windows desktop

# Установить Qt 6.7.0 (MSVC, 64-bit)
PS C:\>.\aqt.exe install-qt windows desktop ^6.7.0 win64_msvc2019_64
@end

После этого в `C:\Qt\` появится папка с Qt.

---

# После установки Qt — настроить IDE

Qt установлен в `C:\Qt\6.7.0\mingw_64\`

Visual Studio 2022 поддерживает CMake **нативно** — просто открыть папку проекта.

**File → Open → Folder** → выбрать папку с `CMakeLists.txt`

В файле `CMakeSettings.json` (создаётся автоматически) добавить:

@code json editable
{
  "configurations": [
    {
      "name": "x64-Debug",
      "cmakeCommandArgs": "-DCMAKE_PREFIX_PATH=C:/Qt/6.7.0/msvc2019_64"
    }
  ]
}
@end

---

@section Первое Qt-приложение

---

# После создания проекта 

@code cpp editable width=500px
// main.cpp
#include <QApplication>
#include <QPushButton>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    QPushButton button("Hello Qt");
    button.resize(200, 60);
    button.show();

    return app.exec();
}
@end

@fragment
Если всё установлено правильно — появится окно.
@end

---

# CMakeLists.txt для Qt

@code cmake editable width=600px
cmake_minimum_required(VERSION 3.16)
project(my_app)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_AUTOMOC ON)    # нужно для Qt мета-объектов
set(CMAKE_AUTOUIC ON)    # если используем .ui файлы
set(CMAKE_AUTORCC ON)    # если используем .qrc ресурсы

find_package(Qt6 REQUIRED COMPONENTS Widgets)

add_executable(my_app main.cpp)

target_link_libraries(my_app Qt6::Widgets)
@end

---

@section А зачем мы его устанавливали?

---

# GUI на чистом C++ - тяжко

@columns
@column
\width 50%

**Без Qt:**

- Win32 API: тысячи строк ради одной кнопки
- Нет кроссплатформенности из коробки
- Ручное управление событиями, перерисовкой, потоками

@column
\width 50%

**С Qt:**

- Один код → Windows, Linux, macOS, Android
- Декларативные UI + мощная C++ логика
- Готовые виджеты, сеть, БД, мультимедиа

@end

---

@section Архитектура Qt: главные концепции

---

# QObject — основа всего

Как объектам «разговаривать» друг с другом без жёсткой связи?

@code cpp editable width=700px height=400px
// Кнопка не знает ничего о логике приложения
// Логика не знает ничего о кнопке
// Они связаны через сигнал-слот

class Counter : public QObject {
    Q_OBJECT
public:
    int value = 0;

signals:
    void valueChanged(int newVal);

public slots:
    void increment() {
        value++;
        emit valueChanged(value);
    }
};
@end

---

## Ключевые возможности QObject:

@fragment
- Сигналы и слоты
@end
@fragment
- Иерархия объектов (parent/child)
@end
@fragment
- Автоматическое удаление дочерних объектов
@end
@fragment
- `Q_OBJECT` — обязательный макрос для MOC
@end

---

# 1. Signals & Slots: замена колбэкам

Callbacks в C++ — это указатели на функции. Они хрупкие, небезопасные и плохо масштабируются.

@code cpp editable
QPushButton* btn = new QPushButton("Нажми меня");
QLabel* label = new QLabel("0");
Counter* counter = new Counter();
// Подключаем: сигнал кнопки → слот счётчика
connect(btn, &QPushButton::clicked, counter, &Counter::increment);
// Подключаем: сигнал счётчика → обновление label
connect(counter, &Counter::valueChanged, label, [label](int val) {
          label->setText(QString::number(val)); });
@end

**Что важно знать**:


- `connect()` — безопасно (проверяется на этапе компиляции)
- Один сигнал → много слотов, один слот ← много сигналов
- Работает across threads (Qt::QueuedConnection)

---

# 2. Parent-Child: дерево объектов

В GUI сотни объектов — как не забыть `delete`?

@code cpp editable width=600px height=330px
// Создаём дерево объектов
QWidget* window = new QWidget();  // root

QPushButton* btn = new QPushButton("OK", window);  // parent = window

QLabel* lbl = new QLabel("Hello", window);  // parent = window

// Когда window удаляется —
// btn и lbl удаляются автоматически
window->show();
// delete window; // или просто закрыть
@end

---

**Правила:**

- Передаёшь `parent` → Qt владеет объектом
- Не передаёшь → сам отвечаешь за `delete`
- На стеке создавать виджеты — нормально для главного окна

**Антипаттерн:**
@code cpp editable height=70px
// ❌ утечка — нет parent, нет delete
QPushButton* b = new QPushButton("X");
@end

---

# QString и Qt-типы
## Почему не std::string?

`std::string` — байты. Qt работает с Unicode повсеместно.

@code cpp editable height=300px
// QString — Unicode (UTF-16) из коробки
QString name = "Привет, мир!";
QString upper = name.toUpper();          // "ПРИВЕТ, МИР!"
QString msg   = QString("x = %1, y = %2").arg(10).arg(3.14);

// Конвертации
std::string s = name.toStdString();
QByteArray  b = name.toUtf8();

// QStringList — часто используется
QStringList parts = "a,b,c".split(","); // ["a", "b", "c"]
QString joined = parts.join(" | ");      // "a | b | c"

// Числа ↔ строки
int n = QString("42").toInt();
QString str = QString::number(3.14, 'f', 2); // "3.14"
@end

@fragment
\marginTop 0.5rem

**Другие важные Qt-типы:** `QList<T>`, `QMap<K,V>`, `QVariant` (тип-хамелеон), `QDateTime`, `QSize`, `QRect`

@end

---

@section Спасибо за внимание!

---