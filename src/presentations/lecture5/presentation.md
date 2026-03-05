@title
\align center
Шаблоны в C++
Лекция 5. Шаблоны, псевдонимы, статическое определение типов
Разработка приложений на C++
\date{2026}

---

@section Шаблоны классов и функций
\align center
\fontSize 2rem

---
# Перегрузка функций

Перегрузка функций на примере `swap`

@code cpp readonly width=500px
// поменять местами два int
void my_swap(int& a, int& b)
{
    int tmp = a;
    a = b;
    b = tmp;    
}

// поменять местами два short
void my_swap(short& a, short& b)
{
    short tmp = a;
    a = b;
    b = tmp;
}
@end

---
# Перегрузка функций

Или же реализация класса `Matrix` с разными типами данных `int` и `double`:

@code cpp readonly
class Matrix
{
    double* data_;
};

class MatrixInt
{
    int* data_;
};
@end

@important
В обоих случаях нарушение принципа [DRY (Don't Repeat Yourself)](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#es3-dont-repeat-yourself-avoid-redundant-code)
@end

---
# Как избежать дублирования кода?

**Решение**: в С++ существуют шаблоны (templates) — сущности, позволяющие определять функции и классы произвольных типов.

@code cpp
#include <iostream>

template<typename T>
void my_swap(T& a, T& b)
{
    T tmp = a;
    a = b;
    b = tmp;
}
@end

---

@yesScroll
# Попробуем запустить такой пример

@code cpp editable run=cpp
#include <iostream>

template<typename T>
void my_swap(T& a, T& b)
{
    T tmp = a;
    a = b;
    b = tmp;
}

int main () {
    int a = 3, b = 5;
    // вызов my_swap(int&, int&), тип T указывается программистом явно
    my_swap<int>(a, b);
    // вызов my_swap(int&, int&), тип T выводится компилятором автоматически
    my_swap(a, b); 
    std::cout << "a = " << a << ", b = " << b << std::endl;

    float x = 3.f, y = 5.f;
    my_swap(x, y);
    my_swap<float>(x, y);
    std::cout << "x = " << x << ", y = " << y << std::endl;
}
@end

---

# Аналогично с классом `Matrix`

@code cpp readonly
template <class T>
class Matrix
{
    T* data_;
};

Matrix<double> m; // double* data_ 
Matrix<int> m; // int* data_
@end

---

# Свойства шаблонов

@columns
@column
\width 60%
@important Шаблон по сравнению с перегрузкой функции:
- компилируется столько раз, сколько раз инстанциируется в единицах трансляции:
    - можно в **одном** cpp-файле **10 раз** позвать `my_swap(int&, int&)` - эта функция скомпилируется **единожды**
    - можно в **10 cpp-файлах один раз** позвать `my_swap(int&, int&)` - эта функция скомпилируется **10 раз**
- накладные расходы во время компиляции на кодогенерацию при истанциации
@end
@column
\width 40%
@image assets/bruce-lee-quote.jpeg
@end

---

# Свойства шаблонов

**Инстанцирование шаблона** – это генерация кода функции или класса по шаблону для конкретных параметров.

@code cpp readonly height=200px
template <class T>
bool lessThan7(T value) { return value < (T)7; }

lessThan7(5); //  Инстанцирование
// bool lessThan7(int value) { return value < (int)7; }

lessThan7(5.0); //  Инстанцирование
// bool lessThan7(double value)  { return value < (double)7; }
@end

С явным указанием типа

@code cpp readonly
lessThan7<double>(5); //  Инстанцирование
// bool print(float value) { return value < (float)7; }
@end

---

# Наглядная визуализация

@video assets/TemplatesInstancing.mp4

---

# Особенности и накладные расходы

@columns
@column
\width 45%
**Плюсы:**
- Меньше кода.
- Быстрее (инлайнинг).
- Максимальная производительность.
@column
\width 55%
**Минусы:**
- Дольше компилируется.
- Сложнее писать и отлаживать.
- Бинарный файл становится больше (Code Bloat).
@end

@important ODR (One Definition Rule)
Шаблоны позволяют (и требуют) нарушать привычное правило: их реализация обычно находится прямо в заголовочных файлах, а не в .cpp.
@end

---

# Параметры по умолчанию
Как и у функций, параметры шаблона могут иметь значения по умолчанию.

@code cpp readonly height=200px
template <class T, class ContainerT = std::vector<T>>
class Queue {
    ContainerT data_;
};

Queue<int> q1; // Использует std::vector<int>
Queue<int, std::list<int>> q2; // Использует std::list<int>
@end

Это дает гибкость пользователю, не заставляя его всегда писать длинные списки типов.

---

# Аргументы-константы (Non-type)
Параметром шаблона может быть не только тип, но и значение, известное при компиляции.

@code cpp readonly height=160px
template <class T, size_t Size>
class Array {
    T data_[Size]; // Статический массив нужного размера
};

Array<int, 5> a; // Размер — часть типа!
@end

@warning Ограничения
До стандарта **C++20** нельзя было использовать `double` или `float` как параметры шаблона. Только целые числа, указатели или перечисления.
@end

---

# Константы в шаблонах
Параметры должны быть известны на этапе компиляции.

@code cpp readonly width=500px
template <int N> void foo() {}

int x = 3;
foo<x>(); // Ошибка! x - переменная рантайма.

const int y = 3;
foo<y>(); // OK (литеральная константа).

constexpr int z = bar();
foo<z>(); // OK, если bar() - constexpr функция.
@end

---

# Специализация шаблона
Мы можем написать особую реализацию для конкретного типа. Классический пример — `std::vector<bool>`, который экономит память, упаковывая биты.

@code cpp readonly
template <class T>
class Vector { /* общий код */ };

template <>
class Vector<bool> {
    // Особая реализация для bool
    // Например, хранение 8 значений в одном байте
};
@end

---

@yesScroll

# Специализация шаблона
Суммирование последовательности от $n$ до $0$:

@columns
\gap 1rem
@column
\width 50%
@note main.cpp
@end
@code cpp readonly highlight=5:red,8:yellow,10:orange,16:green
template <int n>
int sum();

template <>
int sum<0>() { return 0; }

template <>
int sum<1>() { return 1; }
template <>
int sum<2>() { return 2 + 1; }
// ...

template <int n>
int sum()
{
    return n + sum<n - 1>();
}

int main()
{
    std::cout << sum<3>() << '\n';
    return 0;
}
@end

@column
\width 50%
@warning x86-64 clang
@end
@code asm readonly highlight=1:red,2:red,3:red,16:yellow,17:yellow,18:yellow,19:yellow,12:orange,13:orange,14:orange,15:orange,8:green,9:green,10:green,11:green,
int sum<0>():
    mov     eax, 0
    ret
main:
    call    int sum<3>()
    call    operator<<(int)
    ret
int sum<3>():
    call    int sum<2>()
    add     eax, 3
    ret
int sum<2>():
    call    int sum<1>()
    add     eax, 2
    ret
int sum<1>():
    call    int sum<0>()
    add     eax, 1
    ret
@end
---

# Вычисления во время компиляции
Мы можем заставить компилятор считать за нас через рекурсивные шаблоны с помощью спецификатора `constexpr` ([godbolt](https://godbolt.org/z/5YanMhsdx))

@columns
\gap 1rem
@column
\width 50%
@code cpp readonly highlight=13:orange
template <int n>
struct sum {
    static constexpr int value = n + sum<n - 1>::value;
};

template <>
struct sum<0> {
    static constexpr int value = 0;
};

int main() {
    // Компилятор просто подставит 6
    std::cout << sum<3>::value;
}
@end

@column
\width 50%
@code asm readonly height=100% highlight=4:orange,5:orange,6:orange
main:
    push    rbp
    mov     rbp, rsp
    movabs  rdi, offset std::cout
    mov     esi, 6 ; посчитано компилятором
    call    std::ostream::operator<<(int)
@end
@end

---

# Шаблоны операторов
Мы можем шаблонизировать операторы для работы с произвольными типами данных. Например, для N-мерных векторов.

@code cpp readonly
template<typename T, int N>
struct VectorN { T data[N]; };

template<typename T, int N>
VectorN<T, N> operator+(const VectorN<T, N>& l, const VectorN<T, N>& r) {
    VectorN<T, N> res;
    for (int i = 0; i < N; ++i)
        res.data[i] = l.data[i] + r.data[i];
    return res;
}
@end

---

# Псевдонимы типов
Забудьте про `typedef`. Используйте `using` — он чище и поддерживает шаблоны.

@code cpp readonly
// Старый стиль
typedef Queue<int> IntegerQueue;

// Новый стиль
using IntegerQueue = Queue<int>;

// Псевдонимы для шаблонов
template <class T>
using MyQueue = Queue<T, std::deque<T>>;
@end

---

# Статическое определение типов
Со стандартом **C++11** в язык принесли мощный механизм вывода типов.

@columns
@column
@tip auto
Приказывает компилятору вывести тип переменной на основе её инициализатора.
@end

@code cpp readonly height=220px
auto i = 5; // int
auto j = foo(); // хз, смотря что возвращает функция

for (auto i : { 1, 2, 3 })
    std::cout << i;

for (auto& i : data)
    i.foo();
@end
@column
@divider #00000000
@warning decltype
Возвращает тип указанного выражения без его вычисления.
@end

@divider #00000000

@code cpp readonly height=220px
// decltype берет тип из выражения
int foo() { return 0; }
decltype(foo()) x = 5;
// decltype(foo()) -> int
// int x = 5;

void foo(decltype(bar()) i) {}
@end
@end

---

# Определение типа аргументов шаблона функций

@code cpp editable run=cpp
#include <iostream>

template <typename T>
T min(T x, T y) { return x < y ? x : y; }

int main() {
    std::cout << min(1, 2) << std::endl;
    // std::cout << min(0.5, 2) << std::endl;
}
@end

---

# Определение типа аргументов шаблона функций

@code cpp editable run=cpp
#include <iostream>

template <typename X, typename Y>
X min(X x, Y y) { return x < y ? x : y; }

int main() {
    std::cout << min(1, 2) << std::endl;
    std::cout << min(1, 0.5) << std::endl;
}
@end

---

# Определение типа аргументов шаблона функций


@code cpp editable run=cpp
#include <iostream>

template <typename X, typename Y>
auto min(X x, Y y) -> decltype(x + y) { return x < y ? x : y; }

int main() {
    std::cout << min(1, 2) << std::endl;
    std::cout << min(1, 0.5) << std::endl;
}
@end

---

# Новый синтаксис функций

@columns
@column
\width 55%
@tip Trailing Return Type
Стандарт **C++14** теперь позволяет определять возвращаемый тип функции на момент компиляции
@end

@divider #00000000

@code cpp readonly height=30%
auto foo() -> void {
    /* ... */
}
@end

@column
@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\align center
\padding 1rem
\margin 0.5rem 0 0.5rem 0
\borderLeft 4px solid #38bdf8
\border 1px solid #334155
\borderRadius 8px
Питонист, увидевший новый синтаксис в C++:
@end
@video assets/thats-it-yes-thats-it.mp4 width=50px
@end

---

# Где можно столкнуться с этим?

В Qt многие виджеты имеют сигналы с одинаковыми именами, но разными аргументами.

@code cpp readonly height=180px
// QComboBox::activated
void activated(int index)
void activated(const QString &text)

// Попытка прокинуть сигнал в QComboBox
connect(comboBox, &QComboBox::activated, this,
    &MyClass::onActivated);
@end

@important ОШИБКА: Ambigious signal
Компилятору не понятно, какой именно сигнал должен быть обработан
@end

---

# QOverload

Для того, чтобы указать, какой именно сигнал использовать, существует вспомогательная структрура `QOverload`
@code cpp readonly
// qOverload<int> подсказывает компилятору тип аргументов
connect(comboBox, 
    qOverload<int>(&QComboBox::activated),
    this, 
    &MyClass::onActivated);

// qOverload<const QString&> выбирает вторую версию
connect(comboBox, 
    qOverload<const QString&>(&QComboBox::activated),
    this, 
    &MyClass::onTextChanged);
@end

---

# Как реализуется `QOverload`?

Фрагмент `qoverload.h` ([строка 58](https://github.com/qt/qtbase/blob/6f8308baf7fe081567c479be6d4f913e73ac8fb8/src/corelib/global/qoverload.h#L58)):

@code cpp readonly height=120px
template <typename... Args>
template <typename R>
constexpr auto operator()(R (*ptr)(Args...)) const noexcept 
    -> decltype(ptr) { return ptr; }

@end

@note Где,
- `Args...` — пакет типов, который мы передали в угловых скобках.
- `decltype(ptr)` — гарантирует, что возвращаемый тип точно совпадет с входным.
- `Trailing Return` — избавляет от написания R (T::*)(Args...) перед именем функции.
@end

---

# Ключевое слово typename
Если имя внутри шаблона зависит от параметра шаблона, компилятор не знает, тип это или переменная. По умолчанию он считает, что это **не тип**.

@code cpp readonly
template <class T>
class Parser {
    // Ошибка: компилятор не знает, что T::Char - это тип
    // T::Char buffer[10]; 

    // OK: явно говорим, что это имя типа
    typename T::Char buffer[10]; 
};
@end

---

@section Дополнительно: SFINAE и Traits
\align center

---

# SFINAE
**Substitution Failure Is Not An Error.**
Если при попытке подставить тип в шаблон возникает ошибка — компилятор не падает, а просто пробует следующую перегрузку.

@code cpp readonly
template<typename T>
void clear(T& t, std::enable_if_t<std::is_pod<T>::value>* = nullptr) {
    // Для простых типов - зануляем память через memset
    std::memset(&t, 0, sizeof(t));
}

template<typename T>
void clear(T& t, std::enable_if_t<!std::is_pod<T>::value>* = nullptr) {
    // Для сложных - вызываем конструктор по умолчанию
    t = T{};
}
@end

---

# Traits (Свойства типов)
Это способ «запросить» информацию о типе на этапе компиляции.

@code cpp readonly
template <typename T>
struct NumericTraits;

template <>
struct NumericTraits<char> {
    static constexpr int64_t min = -128;
    static constexpr int64_t max = 127;
};

// Использование:
if (val > NumericTraits<T>::max) { /* ... */ }
@end

---

# Динамический vs Статический полиморфизм

@columns
@column
**Динамический (virtual):**
- Настройка в рантайме.
- Плата за вызов (vtable).
- Гибко, но есть накладные расходы.
@column
**Статический (templates):**
- Решение при компиляции.
- Нет накладных расходов.
- Инлайнинг и агрессивные оптимизации.
@end

@important Итог
Используйте шаблоны там, где типы известны заранее. Используйте виртуальные функции, когда поведение должно меняться динамически.
@end

---

@image assets/thank-you-for-attention.jpg width=450px

