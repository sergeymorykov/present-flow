@title
# Исключения
Лекция 11. Обработка ошибок в С++

\fontSize 2.2rem
Разработка приложений на C++
\date{2026}

---

@section Зачем вообще обрабатывать ошибки

---

## Код без проверок

@code cpp readonly
FILE* f = fopen("config.json", "r");
char buf[4096];
fread(buf, 1, sizeof(buf), f);   // f == nullptr → UB
auto cfg = parse_json(buf);       // buf содержит мусор → UB
serve(cfg);                       // отправляем мусор клиенту
@end

@warning Что произойдёт?
\padding 0.75rem
- Файла нет → `fopen` вернёт `nullptr`
- `fread` разыменует `nullptr` → **undefined behavior**
- В лучшем случае — segfault, в худшем — мусор в базе данных
@end

---

## Цепочка допущений

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1.2rem
\borderLeft 4px solid #f87171
\border 1px solid #334155
\borderRadius 8px
\fontSize 1.1rem
Каждая строка кода полагается на успех предыдущей.
Если хоть одно допущение нарушено — всё последующее поведение **неопределено**.
@end

@fragment
\marginTop 1rem
\fontSize 1.1rem
- Программа — это цепочка зависимостей
- Ошибка на шаге N делает шаги N+1, N+2, ... бессмысленными
- Без обработки ошибок мы **не контролируем** что происходит после сбоя
@end

---

## Три категории ошибок

@columns
\gap 1.5rem

@column
\width 33%

@note Bugs
**Программные ошибки**

- Разыменование `nullptr`
- Выход за границы массива
- Нарушение инварианта

**Реакция:** `assert`, статический анализ, тесты
@end

@column
\width 34%

@tip Recoverable
**Ожидаемые сбои**

- Файл не найден
- Невалидный ввод
- Таймаут сети

**Реакция:** исключения, `expected`, коды ошибок
@end

@column
\width 33%

@important Fatal
**Фатальные сбои**

- Нехватка памяти
- Повреждение данных
- Stack overflow

**Реакция:** `std::terminate`, аварийное завершение
@end

---

@section Механизм исключений в C++

---

# std::exception

@note Базовый класс
\padding 0.75rem
`std::exception` — единый базовый класс для всех стандартных исключений. Метод `what()` возвращает `const char*` с описанием ошибки.
@end

@columns
\gap 1rem
@column
\width 50%

@code cpp readonly
// Плохо: ловим всё подряд
try { do_work(); }
catch (...) {
    // что упало? неизвестно
    std::cerr << "ошибка\n";
}
@end

@column
\width 50%

@code cpp readonly
// Хорошо: ловим базовый класс
try { do_work(); }
catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
    // тип, сообщение — всё есть
}
@end
---

# Иерархия std::exception

@code cpp readonly
std::exception                      ← базовый класс, метод what()
├── std::logic_error                ← ошибки логики (предотвратимые)
│   ├── std::invalid_argument
│   ├── std::out_of_range
│   └── std::length_error
├── std::runtime_error              ← ошибки среды выполнения
│   ├── std::overflow_error
│   ├── std::underflow_error
│   └── std::range_error
├── std::bad_alloc                  ← new не смог выделить память
├── std::bad_cast                   ← неудачный dynamic_cast
└── std::bad_typeid                 ← typeid от nullptr
@end

---

# logic_error vs runtime_error

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #f59e0b
\border 1px solid #334155
\borderRadius 8px

**std::logic_error**

Можно было предотвратить до запуска.
Баг в коде программиста.

@end

@code cpp readonly
// Выход за границы вектора
std::vector<int> v = {1, 2, 3};
v.at(10);  // throws std::out_of_range

// Некорректный аргумент
std::stoi("abc");  // throws std::invalid_argument
@end

@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #3b82f6
\border 1px solid #334155
\borderRadius 8px

**std::runtime_error**

Нельзя предсказать при компиляции.
Зависит от внешних условий.

@end

@code cpp readonly
// Файл не найден
throw std::runtime_error("Config missing");

// Ошибка сети
throw std::runtime_error("Connection timed out");
@end
@end

---

# Механизм `throw` / `try` / `catch`

@code cpp readonly
void readFile(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open()) {
        throw std::runtime_error(
            "Не удалось открыть: " + path
        );
    }
    // работаем с файлом...
}
@step
void readFile(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open()) {
        throw std::runtime_error(
            "Не удалось открыть: " + path
        );
    }
    // работаем с файлом...
}

void processData() {
    readFile("data.txt");  // НЕТ проверок!
    // просто работаем...
}
@step
int main() {
    try {
        processData();
    } catch (const std::runtime_error& e) {
        std::cerr << "Ошибка: " << e.what() << "\n";
    }
}
@end


---

# Почему `const`-ссылка?

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #ef4444
\border 1px solid #334155
\borderRadius 8px

**По значению — ПЛОХО**
@code cpp readonly
catch (std::exception e) {
    // Object slicing!
    // e.what() вернёт
    // сообщение базового класса
}
@end

Срезка объекта: теряем данные производного класса.
@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #22c55e
\border 1px solid #334155
\borderRadius 8px

**По const ссылке — ПРАВИЛЬНО**
@code cpp readonly
catch (const std::exception& e) {
    // Полиморфизм работает!
    // e.what() вернёт сообщение
    // "Не удалось открыть: " + path
}
@end

Полиморфный вызов `what()` через виртуальную таблицу.

---

# Ловим исключения правильно

@code cpp readonly
try {
    riskyOperation();
}
@step
try {
    riskyOperation();
} catch (const std::out_of_range& e) {
    // Сначала — конкретный тип
    std::cerr << "Индекс: " << e.what() << "\n";
}
@step
try {
    riskyOperation();
} catch (const std::out_of_range& e) {
    // Сначала — конкретный тип
    std::cerr << "Индекс: " << e.what() << "\n";
} catch (const std::runtime_error& e) {
    // Затем — более общий
    std::cerr << "Runtime: " << e.what() << "\n";
}
@step
try {
    riskyOperation();
} catch (const std::out_of_range& e) {
    // Сначала — конкретный тип
    std::cerr << "Индекс: " << e.what() << "\n";
} catch (const std::runtime_error& e) {
    // Затем — более общий
    std::cerr << "Runtime: " << e.what() << "\n";
} catch (const std::exception& e) {
    // Последний — базовый класс
    std::cerr << "Ошибка: " << e.what() << "\n";
} catch (...) {
    // Совсем всё остальное
    std::cerr << "Неизвестная ошибка\n";
}
@end

---

# Ловим исключения правильно

@columns
@column
\width 60%
@code cpp readonly
try {
    riskyOperation();
} catch (const std::out_of_range& e) {
    // Сначала — конкретный тип
    std::cerr << "Индекс: " << e.what() << "\n";
} catch (const std::runtime_error& e) {
    // Затем — более общий
    std::cerr << "Runtime: " << e.what() << "\n";
} catch (const std::exception& e) {
    // Последний — базовый класс
    std::cerr << "Ошибка: " << e.what() << "\n";
} catch (...) {
    // Совсем всё остальное
    std::cerr << "Неизвестная ошибка\n";
}
@end

@column
\width 40%
@warning Порядок важен!
`catch`-блоки проверяются **сверху вниз**. Если поставить `std::exception` первым — он перехватит всё, и специализированные блоки никогда не сработают.
@end

---

# Под капотом: throw / catch

@columns
\gap 1.5rem
@column
\width 55%

### Что делает компилятор при `throw`:
1. **Выделяет память** под объект исключения (в специальной области, не на стеке).
2. **Ищет обработчик** — проходит по таблицам раскрутки вверх по стеку (**фаза 1**).
3. **Раскручивает стек** — вызывает деструкторы локальных объектов в каждом фрейме (**фаза 2**).
4. **Передает управление** в подходящий `catch`-блок.

На Windows это реализовано поверх SEH, на Linux/macOS — через Itanium ABI с таблицами DWARF. Принцип одинаковый.

@column
\width 45%

@warning Ключевой момент
Деструкторы вызываются **автоматически** при раскрутке стека — именно поэтому RAII и умные указатели безопасны при исключениях.

Сырые указатели (`new` без `delete`) — **утечка памяти**.
@end
@end

---

# Спецификатор noexcept

@columns
\marginTop -1rem
\gap 1.5rem
@column
\width 55%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1.2rem
\border 1px solid #334155
\borderRadius 8px

**noexcept** — контракт: функция обещает не бросать исключений.

Нарушение контракта → `std::terminate()` → программа завершается немедленно.

Компилятор использует `noexcept` для оптимизаций.

@end

@column
\width 45%

@code cpp readonly
// Деструкторы — всегда noexcept
~Widget() noexcept {
    // безопасная очистка
}

// Move-конструктор
Widget(Widget&&) noexcept {
    // vector будет перемещать
    // а не копировать
}

// swap — классический пример
void swap(Widget& other) noexcept;
@end
@end

@warning Контракт, а не фильтр
\padding 0.75rem
`noexcept` — это **не** try/catch. Это **обещание**. Нарушение → немедленный `std::terminate()`. Без раскрутки стека, без деструкторов.
@end

---

# Зачем вообще нужен `noexcept`?

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(153, 0, 17, 0.12)
\padding 1rem
\borderLeft 4px solid #990011
\borderRadius 8px
\border 1px solid rgba(153, 0, 17, 0.25)

**Компилятор не знает**, бросает ли функция исключение

Он обязан генерировать:
- таблицы раскрутки стека
- landing pad для каждого фрейма
- код восстановления регистров

Всё это занимает место в бинарнике

@end

@column
\width 50%

@style
\bg rgba(44, 95, 45, 0.12)
\padding 1rem
\borderLeft 4px solid #2C5F2D
\borderRadius 8px
\border 1px solid rgba(44, 95, 45, 0.25)

С `noexcept` вы **обещаете компилятору**: эта функция не бросит

Компилятор может:
- убрать таблицы раскрутки
- инлайнить агрессивнее
- переупорядочивать код свободнее
- упростить CFG (control flow graph)

@end

@end

---

# Правила расстановки noexcept

@important STL проверяет noexcept у move-конструктора
\padding 0.75rem
\marginTop -1rem
\marginBottom -1rem
`std::vector::push_back` при реаллокации переносит элементы в новый буфер

Если move-конструктор **может бросить**, вектор **копирует** вместо перемещения — это в разы медленнее

@end

@table width=100%
| Функция | noexcept? | Почему |
| --- | --- | --- |
| Move-конструктор | **Да** | STL контейнеры проверяют |
| Move-присваивание | **Да** | Та же причина |
| swap() | **Да** | Используется в sort, алгоритмах |
| Деструктор | **По умолчанию** | Уже noexcept неявно с C++11 |
| Геттеры (getX()) | **Да** | Не аллоцируют, не бросают |
| Функции с аллокацией | **Нет** | new может бросить bad_alloc |
| Функции с I/O | **Нет** | Любой I/O может упасть |
@end

---

## Исключения в конструкторах и деструкторах

@columns
\gap 1rem
@column
\width 50%
@code cpp readonly
// Утечка при исключении
class Conn {
  int* buf;
  FILE* file;
public:
  Conn()
    : buf(new int[1024])       // выделено
    , file(fopen("x", "r"))    // открыт
  {
    if (!file)
      throw std::runtime_error("!"); 
      // buf утёк: ~Conn() не вызван
  }
  ~Conn() { delete[] buf; fclose(file); }
};
@end
@column
\width 50%
@code cpp readonly
// RAII: каждый ресурс — отдельный объект
class Conn {
  std::unique_ptr<int[]> buf;
  std::unique_ptr<FILE, decltype(&fclose)> file;
public:
  Conn()
    : buf(std::make_unique<int[]>(1024))
    , file(fopen("x", "r"), &fclose)
  {
    if (!file)
      throw std::runtime_error("!");
      // buf уже уничтожится сам
  }
  // деструктор не нужен
};
@end
@end

---

## Исключения в конструкторах и деструкторах

@note Правило
**Конструктор** — единственный способ сообщить об ошибке создания объекта. Бросать исключение из конструктора **нормально**, если каждый подресурс обёрнут в RAII-обёртку (unique_ptr, vector, fstream…). Уже построенные подобъекты и члены будут корректно разрушены при stack unwinding.
@end

@fragment
\marginTop 0.3rem

@warning Деструкторы
В **деструкторах** бросать исключения **нельзя**. С C++11 деструкторы неявно `noexcept`. Если исключение вылетает из деструктора во время stack unwinding (когда уже летит другое исключение), вызывается `std::terminate` - программа падает.
@end

---
@yesScroll
# Zero-cost exceptions
### Happy path: `return` vs `try`/`catch`

@columns
\gap 1rem
@column
\width 50%

**Коды возврата**

@code cpp readonly
int foo() {
    int res = bar();
    if (res < 0) return res;
    return 0;
}
@end
@divider
@code asm readonly
foo():
    sub     rsp, 16
    call    bar()
    mov     dword ptr [rbp - 8], eax
    cmp     dword ptr [rbp - 8], 0
    mov     eax, dword ptr [rbp - 8]
    add     rsp, 16
    ret
@end

@column
\width 50%

**Исключения**

@code cpp readonly
int foo() {
    try { bar(); } 
    catch (...) { return 1; }
    return 0;
}
@end
@divider
@code asm readonly highlight=5:blue,6:blue,7:blue
foo():
    mov     rbp, rsp
    call    bar()
    call    __cxa_begin_catch@PLT
    mov     dword ptr [rbp - 4], 1
    call    __cxa_end_catch@PLT
    xor     eax, eax
    ret
@end
@end

@fragment
@note Zero-cost
Строки 5-7 (синие) **не выполняются** на happy path — они живут в отдельной cold-секции. На happy path try/catch **не генерирует лишних инструкций** — в отличие от `if (res < 0)` у кодов возврата.
@end

---

# Zero-cost exceptions

### А что на стороне `throw`?

@columns
\gap 1.5rem
@column
\width 55%
@code cpp readonly
int bar() { throw 1; }
@end
@divider

@code asm readonly
bar():
    mov     edi, 16
    call    __cxa_allocate_exception
    mov     rbx, rax
    mov     esi, OFFSET FLAT:.LC0
    mov     rdi, rbx
    call    std::runtime_error::runtime_error(char const*) 
    mov     esi, OFFSET FLAT:typeinfo for std::runtime_error
    mov     rdi, rbx
    call    __cxa_throw
@end
@column
\width 45%

@warning Стоимость throw
\list disc
- `__cxa_allocate_exception` — выделяет память в **куче** даже для `int`
- `typeinfo` — RTTI для полиморфного перехвата
- `__cxa_throw` — запускает **stack unwinding**: обход фреймов, вызов деструкторов
@end

---
## Как работают исключения

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.75)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #f87171
\border 1px solid #4b2222
\borderRadius 8px
**Генерация исключений**
@end

\list disc
- Останавливает функцию
- Выделяется память под объект исключения — *дорого*
- Раскручивает стек — *дорого*
  - Вызывает деструкторы локальных объектов
  - Поднимается по стеку вызовов
  - Повторяет для каждого фрейма
@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.75)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #60a5fa
\border 1px solid #1e3a5f
\borderRadius 8px
**Перехват исключений**
@end

\list disc
- Обработчик исключения находит подходящий `catch`
- Использует RTTI для полиморфного перехвата — *дорого*
  - Не специфицировано стандартом, но всегда используется на практике
  - Иерархии исключений — как правило, длинные цепочки иерархий классов
@end

@fragment
@important Вывод
Используйте исключения для [исключительных](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#e2-throw-an-exception-to-signal-that-a-function-cant-perform-its-assigned-task) ситуаций — не для управления потоком.
@end

---

# Исключительные ситуации

@columns
@column
\width 55%
### Когда бросать?
- **Нарушение инвариантов**: когда продолжение работы приведет к UB или порче данных.
- **Глубокий возврат**: передача ошибки через 5+ уровней вызова без замусоривания `std::expected`.
- **Ошибки конструкторов**: единственный способ сигнализировать о провале инициализации объекта.
@column
\width 45%
@note Современный подход
\fontSize 0.9rem
Использование `std::stacktrace` (C++23) позволяет избежать дорогостоящего логирования на каждом уровне раскрутки ст

---

@section Альтернативные подходы

---

# Коды ошибок, `std::error_code`

Подход в стиле **C**, но с типизацией **C++**. Это объект, объединяющий целочисленный код ошибки (код зависит от ОС) и "категорию" (контекст), к которой эта ошибка относится.

@code cpp readonly
void check_file() {
    std::error_code ec;
    auto size = std::filesystem::file_size("config.json", ec);
    if (ec) {
        // ec.value() — числовой код
        // ec.message() — текстовое описание от ОС
        // ec.category().name() — имя категории (например, "generic" или "system")
        std::cerr << "Error [" << ec.category().name() << "]: " << ec.message() << "\n";
        return;
    }
    std::cout << "File size: " << size << " bytes\n";
}
@end

@fragment
Используется при сетевом взаимодействии и файловом вводе-выводе. Такой способ многословен и легко проигнорировать — часто эти функции перегружены без этого аргумента.

---

# `std::optional`, `std::variant` (С++17)

@columns
@column
\width 50%
**std::optional**

Простейший вариант, если неизвестно, вернет ли функция значение или нет, но не возвращает ошибку, из-за которой значения нет.

@code cpp readonly
std::optional<double> divide(double a, double b) {
    if (b == 0.0) return std::nullopt; // создаем объект `optional` без значения
    return a / b;
}

auto r = divide(10.0, 0.0);
if (!r) { /* ошибка, но почему - хз */ }
@end
@column
\width 50%
**std::variant**

Типобезопасный вариант `union`. Позволяет возвращать тип ошибки, но обработка слишком "многословна".
@code cpp readonly
std::variant<double, std::string> divide(double a, double b) {
    if (b == 0.0) return std::string{"division by zero"};
    return a / b;
}
auto r = divide(10.0, 0.0);
// проверяем, есть ли тип ошибки
if (std::holds_alternative<std::string>(r)) {
    std::cerr << std::get<std::string>(r);
}
@end

---

# `std::expected` (C++23)

Современный способ обработки ошибок. Функция возвращает либо нужное значение, либо ошибку — без выброса исключений. До **С++23** есть [библиотека](https://github.com/TartanLlama/expected) с тем же API.

@code cpp readonly
std::expected<double, std::string> divide(double a, double b) {
    if (b == 0.0) return std::unexpected("division by zero");
    return a / b;
}

auto result = divide(10.0, 0.0);
// проверяем, есть ли результат
if (result) {
    std::cout << *result;
} else {
    // если результата нет, выводим ошибку
    std::cerr << result.error();
}
@step
std::expected<double, std::string> divide(double a, double b) {
    if (b == 0.0) return std::unexpected("division by zero");
    return a / b;
}

auto result = divide(12.0, 0.0)
    .and_then([](double result) { return divide(result, 2); })
    .or_else([](const std::string& error) { 
        std::cerr << "Error: " << error << std::endl;
    }
);

if (result) {
    std::cout << "Result: " << *result << std::endl;
}
@end

---

# `assert()`

В **debug** сборках используется `assert()`, которая аварийно завершает программу. С ее помощью не следует "исправлять" ошибку — программа должна падать, когда **инвариант нарушается**, случаи, которые *никогда не должны* произойти, если код корректный.

@code cpp readonly
void process(std::span<int> data) {
    assert(!data.empty()); // ошибка программиста, не пользователя
    // ...
}
@end

@fragment
@tip
Использовать для багов, не для ошибок в рантайме

---

@section Гарантии exception safety

---

# Программа при выбросе исключения
@video assets/sofa-explosion.mp4 nocontrols speed=0.5

@fragment
@warning Exception safety
Можно ли безопасно продолжить выполнение программы после исключения?

---
## Exception safety

1. **No-throw/no-fail** guarantee — гарантия того, что функция не вызовет исключений (деструкторы, `swap`, move-конструкторы)
2. **Basic guarantee** — при исключении программа сохраняет валидное состояние, утечек нет
3. **Strong guarantee** — при исключении — откат к состоянию до вызова (`std::vector::push_back`)
4. **No guarantee** — возможны утечки, порча памяти, нарушение инвариантов (недопустимо)

@columns
\marginTop -1rem
@column
\width 50%

@code cpp readonly
// Nothrow — деструктор
~Buffer() noexcept {
    delete[] data_; // никогда не бросает
}

// Nofail — swap
void swap(Buffer& o) noexcept {
    std::swap(data_, o.data_);
    std::swap(size_, o.size_);
}
@end

@column
\width 50%

@code cpp readonly
// Strong — copy-and-swap идиома
Buffer& operator=(Buffer rhs) noexcept {
    swap(rhs); // сильная гарантия через swap
    return *this;
}
// Basic — минимально безопасно
void append(int v) {
    data_.push_back(v); // может бросить,
    // но вектор останется валидным
}
@end
@end

---
## Exception safety

@note Exception-neutral гарантия
Шаблонные компоненты (`std::sort`, `std::make_shared`) обязаны пробрасывать исключения из параметров шаблона наружу без изменений — это **exception-neutral** гарантия. Они не берут на себя обработку, но и не «глотают» чужие ошибки.
@end

---

@section Примеры и антипаттерны

---

@yesScroll
# Управление ресурсами

@code cpp readonly highlight=12:blue,16:blue,19:blue,
int process_file(const std::string& fileName_) {
    FILE * f = ::fopen(fileName_.c_str(), "r");
    …
    int rc;
    try {
        do {
        rc = printTaggedDataDumpEntries(OStream, f);
        } while (!::feof(f) && ::ftell(f) < file_length);
        return rc;
    }
    catch (const StreamingException& e) {
        ::fclose(f);
        throw;
    }
    catch (const std::exception& e) {
        ::fclose(f);
        throw;
    }
    ::fclose(f);
    return rc;
}
@step highlight=12:blue,16:blue,19:blue,9:red
int process_file(const std::string& fileName_) {
    FILE * f = ::fopen(fileName_.c_str(), "r");
    ...
    int rc;
    try {
        do {
        rc = printTaggedDataDumpEntries(OStream, f);
        } while (!::feof(f) && ::ftell(f) < file_length);
        return rc; // БАГ!
    }
    catch (const StreamingException& e) {
        ::fclose(f);
        throw;
    }
    catch (const std::exception& e) {
        ::fclose(f);
        throw;
    }
    ::fclose(f);
    return rc;
}
@end

---

# Управление ресурсами

@code cpp readonly
struct FileManager {
    FileManager(const std::string& fileName_) : fptr{::fopen(fileName_.c_str(), "r")} {};
    ~FileManager() { ::fclose(fptr); }
    FILE* fptr;
};
int process_file(const std::string& fileName_) {
    FileManager fmgr{fileName_};
    FILE* f = fmgr.fptr;
    int rc;
    do {
        rc = printTaggedDataDumpEntries(OStream, f);
    } while (!::feof(f) && ::ftell(f) < file_length);
    return rc;
}
@end

@fragment
@tip Вывод
\marginTop -0.75rem
Используйте RAII вместо catch для освобождения ресурсов.

---

# Несколько попыток "достучаться"

@code cpp readonly highlight=11:blue,12:blue,13:blue,14:blue
// функция может выбросить исключение
void connect(...);
bool try_connection(int max_retries) {
    bool connected = false;
    int retry_count = 0;
    while(!connected) {
        try {
            connect (...);
            connected = true;
        } catch(const std::runtime_error&) {
            if (retry_count++ > max_retries) {
                notify(connected);
                throw;
            }
        }
    }
    ...
}
@end

---

# Несколько попыток "достучаться"


@code cpp readonly highlight=8:blue
// если не получилось, возвращается false
bool connect(...)

bool try_connection(int max_retries) {
    bool connected = false;
    int retry_count = 0;
    while (!connected && (retry_count++ < max_retries)) {
        connected = connect(...);
    }
    notify(connected);
    return connected;
}
@end

@fragment
@tip Вывод
\marginTop -0.75rem
Используйте статус для проверки в циклах

---

# Ищем заказ в базе данных

@code cpp readonly highlight=9:blue
Order findOrder(unsigned int id) {
    auto it = orders.find(id);
    if(it == orders.end())
        throw std::runtime_error ("Order not found", id);
    return it->second;
}
bool funca(unsigned int id) {
    try {
        Order ord = findOrder(id);
        std::cout << "Order id : " << id << ", value : " << ord << std::endl;
        return true;
    }
    catch(std::runtime_error& e) {
        std::cerr << "Error Order missing: " << e.what() << std::endl;
    }
    return false;
}
@step highlight=4:blue
Order findOrder(unsigned int id) {
    auto it = orders.find(id);
    if(it == orders.end())
        throw std::runtime_error("Order not found", id);
    return it->second;
}
bool funca(unsigned int id) {
    try {
        Order ord = findOrder(id);
        std::cout << "Order id : " << id << ", value : " << ord << std::endl;
        return true;
    }
    catch(std::runtime_error& e) {
        std::cerr << "Error Order missing: " << e.what() << std::endl;
    }
    return false;
}
@step highlight=14:blue
Order findOrder(unsigned int id) {
    auto it = orders.find(id);
    if(it == orders.end())
        throw std::runtime_error ("Order not found", id);
    return it->second;
}
bool funca(unsigned int id) {
    try {
        Order ord = findOrder(id);
        std::cout << "Order id : " << id << ", value : " << ord << std::endl;
        return true;
    }
    catch(std::runtime_error& e) {
        std::cerr << "Error Order missing: " << e.what() << std::endl;
    }
    return false;
}
@end

---

# Ищем заказ в базе данных

@code cpp readonly highlight=8:blue
std::optional<Order> findOrder(unsigned int id) {
    auto it = orders.find(id);
    if(it == orders.end())
        return std::nullopt;
    return it->second;
}
bool funca(unsigned int id) {
    std::optional<Order> opt_ord = findOrder(id);
    if(opt_ord) {
        std::cout << "Order id : " << id << ", value : " << opt_ord->value_ << std::endl;
        return true;
    } 
    std::cerr << "Order not found for id : " << id << std::endl;
    return false;
}
@step highlight=13:blue,14:blue
std::optional<Order> findOrder(unsigned int id) {
    auto it = orders.find(id);
    if(it == orders.end())
        return std::nullopt;
    return it->second;
}
bool funca(unsigned int id) {
    std::optional<Order> opt_ord = findOrder(id);
    if(opt_ord) {
        std::cout << "Order id : " << id << ", value : " << opt_ord->value_ << std::endl;
        return true;
    } 
    std::cerr << "Order not found for id : " << id << std::endl;
    return false;
}
@step highlight=9:blue
std::optional<Order> findOrder(unsigned int id) {
    auto it = orders.find(id);
    if(it == orders.end())
        return std::nullopt;
    return it->second;
}

bool funca(unsigned int id) {
    std::optional<Order> opt_ord = findOrder(id).or_else([] -> std::optional<Order> {std::cerr << "Order not found"; return std::nullopt;}); 

    return opt_ord.has_value();
}
@end

@fragment
@tip Вывод
\marginTop -0.75rem
Лучше использовать `std::optional`, показывающее, что значение найдено/пусто

---

# Исключения в control flow

@code cpp readonly
bool process(const Info& data) {
    try {
        Msg request = apply(data);
        return send(request);
    }
    catch(ExceptionOrderNotFound& e) {
        err_log(e.what());
        return send_error(e.msg_);
    }
    catch(ExceptionIllegalCurrency& e) {
        err_log(e.what());   
        return send_error(e.msg_);
    }
    catch(ExceptionInvalidClientId& e) {
        err_log(e.what());  
        return send_error(e.msg_);
    }
    return true;
}
@step highlight=7:blue,11:blue,15:blue
bool process(const Info& data) {
    try {
        Msg request = apply(data);
        return send(request);
    }
    catch(ExceptionOrderNotFound& e) {
        err_log(e.what());
        return send_error(e.msg_);
    }
    catch(ExceptionIllegalCurrency& e) {
        err_log(e.what());   
        return send_error(e.msg_);
    }
    catch(ExceptionInvalidClientId& e) {
        err_log(e.what());  
        return send_error(e.msg_);
    }
    return true;
}
@end

---

# Исключения в control flow

@code cpp readonly
using ExceptionProcessing = std::variant<ExceptionOrderNotFound, ExceptionIllegalCurrency, ExceptionInvalidClientId>;
using ExpectedProcessing = std::expected<Msg, ;ExceptionProcessing>;

ExpectedProcessing apply(const Info& data);

bool process(const Info& data) {
    ExpectedProcessing result = apply(data);
    if (result.has_value()) 
        return send(*result);
    return std::visit([](auto& e){err_log(e.what()); return send_error(e.msg_);}, result.error());
}
@end

@fragment
@tip Вывод
\marginTop -0.75rem
Если функция вызывается непосредственно тем кодом, который готов обработать ошибку, то лучше использовать `std::expected` с вариантами разных исключений.

---

# Иерархия исключений

@code cpp readonly 
int main() {
    bool stay_active = true;
    while (stay_active) {
        try {
            check_even(ip_num);
            apply_subtraction(ip_num, subtractor);
            apply_division(ip_num, divisor);
        } catch (const std::underflow_error& e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (const std::range_error& e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (const std::runtime_error & e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (const std::logic_error& e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (...) {
            std::cout << "Unknown error : " << std::endl;
        }
    }
}
@step highlight=8:blue,9:blue,10:blue,11:blue,12:blue,13:blue,14:blue,15:blue
int main() {
    bool stay_active = true;
    while (stay_active) {
        try {
            check_even(ip_num);
            apply_subtraction(ip_num, subtractor);
            apply_division(ip_num, divisor);
        } catch (const std::underflow_error& e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (const std::range_error& e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (const std::runtime_error & e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (const std::logic_error& e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (...) {
            std::cout << "Unknown error : " << std::endl;
        }
    }
}
@end

---

# Иерархия исключений

@code cpp readonly highlight=8:blue,9:blue
int main() {
    bool stay_active = true;
    while (stay_active) {
        try {
            check_even(ip_num);
            apply_subtraction(ip_num, subtractor);
            apply_division(ip_num, divisor);
        } catch (const std::exception& e) {
            std::cout << "error : " << e.what() << std::endl;
        } catch (...) {
            std::cout << "Unknown error : " << std::endl;
        }
    }
}
@end

---

# Иерархия исключений

@code cpp readonly highlight=3:blue,7:blue,12:blue
void check_even(int a) {
    if (a % 2 != 0) 
        throw std::logic_error("Odd number given, even number required");
}
int apply_subtraction(unsigned int operand, unsigned int subtractor) {
    if (subtractor > operand) 
        throw std::underflow_error("subtractor too large for operand");
    return operand - subtractor;
}
double apply_division(double operand, double divisor) {
    if (divisor == 0) 
        throw std::range_error("zero divisor operation not allowed");
    return operand / divisor;
}
@end

---

# Иерархия исключений

@code cpp readonly highlight=3:blue,7:blue,12:blue
void check_even(int a) {
    if (a % 2 != 0) 
        throw std::runtime_error("Odd number given, even number required");
}
int apply_subtraction(unsigned int operand, unsigned int subtractor) {
    if (subtractor > operand) 
        throw std::runtime_error("subtractor too large for operand");
    return operand - subtractor;
}
double apply_division(double operand, double divisor) {
    if (divisor == 0) 
        throw std::runtime_error("zero divisor operation not allowed");
    return operand / divisor;
}
@end

@fragment
@tip Вывод
\marginTop -1rem
**Предпочитайте бросать тот же базовый тип ошибки, что обрабатывается в catch.** А еще лучше, бросать один тип ошибки, если код в `catch` одинаковый.
@end

---

# Выводы

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1.2rem
\borderLeft 4px solid #22c55e
\border 1px solid #334155
\borderRadius 8px

**Для чего использовать исключения?**

\list disc
- Трассировка ошибок (логирование)
- Раскрутка стека (сброс / завершение)
- Передача данных / управление потоком (когда необходимо)

@end

@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1.2rem
\borderLeft 4px solid #f59e0b
\border 1px solid #334155
\borderRadius 8px

**Когда использовать исключения?**

\list disc
- Как можно **реже**
- Серьёзные / нечастые / неожиданные ошибки
- С минимальным числом типов исключений (определяется логикой `catch`)
- Предпочтительно — один базовый тип на модуль

@end
@end

@fragment
@important Главное правило
Исключения определяются тем, **как их ловят**. Проектируйте иерархию исключений от `catch`-блоков, а не от `throw`. Если обработка одинаковая — бросайте один тип.
@end

---

# Выводы

@image assets/cpp_error_handling_decision_tree.png width=450px


---

# Полезные доклады

1. [Exceptionally Bad: The Misuse of Exceptions in C++](https://www.youtube.com/watch?v=Oy-VTqz1_58)
2. [James McNellis “Unwinding the Stack: Exploring How C++ Exceptions Work on Windows”](https://www.youtube.com/watch?v=COEv2kq_Ht8)
3. [Dave Watson “C++ Exceptions and Stack Unwinding”](https://www.youtube.com/watch?v=_Ivd3qzgT7U)
4. [Back to Basics: Exceptions - Klaus Iglberger](https://www.youtube.com/watch?v=0ojB8c0xUd8)

---

@style
\marginTop 5rem
\align center
# Спасибо за внимание

@image assets/do-good-dont-bad.jpg width=300px

---