@title
\align center
Итераторы
Лекция 7. Шаблоны (продолжение) и итераторы в C++

Разработка приложений на C++
\date{2026}

---

@section SFINAE: Когда ошибка — это не ошибка

---
# SFINAE
**Substitution Failure Is Not An Error**. Это правило позволяет компилятору тихо игнорировать шаблоны, которые не подходят под аргументы, вместо того чтобы прерывать сборку.

@code cpp readonly
// C++11
template<typename T>
void clear(T& t, typename std::enable_if<std::is_pod<T>::value>::type* = nullptr) {
    std::memset(&t, 0, sizeof(t)); // Быстро зануляем сырую память
}

template<typename T>
void clear(T& t, typename std::enable_if<!std::is_pod<T>::value>::type* = nullptr) {
    t = T{}; // Вызываем конструктор по умолчанию
}
@step
// C++14
template<typename T>
void clear(T& t, typename std::enable_if<std::is_pod<T>::value>* = nullptr) {
    std::memset(&t, 0, sizeof(t)); // Быстро зануляем сырую память
}

template<typename T>
void clear(T& t, typename std::enable_if<!std::is_pod<T>::value>* = nullptr) {
    t = T{}; // Вызываем конструктор по умолчанию
}
@end

---

# SFINAE
**Substitution Failure Is Not An Error**. Это правило позволяет компилятору тихо игнорировать шаблоны, которые не подходят под аргументы, вместо того чтобы прерывать сборку.

@columns
@column
\width 60%
@note
Мы выбираем реализацию на этапе компиляции. Если `is_pod` ложно, первая функция просто исчезает из списка кандидатов.
@column
\width 40%
@image assets/one-mistake.jpg


---

# Что такое POD-типы?
**POD** (Plain Old Data) — это "простые старые данные". Типы, которые ведут себя как обычные структуры в языке C.

\list disc
- Их можно копировать через `std::memcpy`.
- Их можно безопасно передавать через границы модулей (ABI).
- У них нет "скрытой" логики (виртуальных таблиц, нетривиальных конструкторов).

@important deprecated
В **C++20** термин POD признан слишком широким. Его разделили на две более точные характеристики: **Triviality** (простота операций) и **Standard Layout** (предсказуемость в памяти). 

---

# Standard Layout
Это гарантия того, что структура памяти объекта предсказуема и совместима с языком **C**.

\list disc
- Нет виртуальных функций и виртуального наследования.
- Все нестатические члены имеют одинаковый модификатор доступа (`public`/`protected`/`private`).
- Все базовые классы и члены также являются `standard_layout`.
- Позволяет использовать `reinterpret_cast` к первому члену структуры (и обратно).

@tip Зачем это нужно?
Для прямой передачи данных в C-библиотеки, работы с системными API и использования `memcpy`.

---

# Trivial и Scalar типы
**C++20** разделяет "простоту" на несколько ортогональных понятий.

@columns
@column
\width 50%
**Trivial Types**

\fontSize 0.9rem
Тип, который можно скопировать как набор байт и чьи конструкторы/деструкторы не делают ничего полезного. 
@column
\width 50%
**Scalar Types**

\fontSize 0.9rem
- Арифметические типы (`int`, `float`)
- Перечисления (`enum`)
- Указатели
- `nullptr_t`
@end

@columns
@column
\width 60%
@important C++26
Тип `std::is_trivial` также планируется к удалению (deprecated), так как он объединяет слишком много разных свойств.
@column
\width 40%
@image assets/wolf-auf-pharaoh.jpg


---
@yesScroll

# Как работает enable_if?
`enable_if` строится на частичной специализации шаблонов.

@code cpp readonly
template<bool B, typename T = void>
struct enable_if {};
@step
template<bool B, typename T = void>
struct enable_if {};

// Если первый параметр true — внутри появляется тип 'type'
template<typename T>
struct enable_if<true, T> {
    using type = T;
};
@end

@fragment
- `enable_if<false, int>::type` — вызовет ошибку (типа нет).
- Но в сигнатуре функции эта ошибка просто исключает перегрузку.
- Используется для принятия решений в compile-time.
@end

---

@section Traits

---
@yesScroll
# Что такое Traits?
Это **"свойства"** типов. Мы создаем структуру-обертку, которая хранит метаинформацию о типе, не меняя сам тип.

@code cpp readonly
template <typename T>
struct NumericTraits {};

template <>
struct NumericTraits<char> {
    static constexpr int64_t min = -128;
    static constexpr int64_t max = 127;
};

template <typename T>
class Calculator {
    void validate(int64_t val) {
        if (val < NumericTraits<T>::min || val > NumericTraits<T>::max)
            throw std::range_error("Too big!");
    }
};
@end

---

# Стандартные type_traits
Заголовочный файл `<type_traits>` хранит множество функций определения свойств:
\list disc
- `is_integral<T>`
- `is_floating_point<T>`
- `is_const<T>`
- `has_virtual_destructor<T>`

@tip Зачем это нужно?
Вы можете запретить инстанцировать ваш класс для `double` или автоматически выбрать другой алгоритм для типов с виртуальным деструктором.

---

@section Пишем свой std::optional

---

@yesScroll

# Пишем свой Optional
Идея проста: храним значение и флаг `has_value`. Но как сделать это эффективно?

@code cpp readonly
template<typename T>
class Optional {

};
@step
template<typename T>
class Optional {
private:
    T value_;
    bool has_value_;
};
@step highlight=4:blue
template<typename T>
class Optional {
private:
    T value_; // Храним объект класса как поле. Какие у него недостатки? Как их обойти?
    bool has_value_;
};
@step highlight=9:blue,10:blue,12:blue,13:blue,14:blue,15:blue,
template<typename T>
class Optional {
private:
    T value_;
    bool has_value_;

// Добавим конструкторы
public:
    Optional() : has_value_(false)
    {}
        
    Optional(const T& another_value) 
        : value_(another_value)
        , has_value_(true)
    {}   
};
@step highlight=12:blue,
template<typename T>
class Optional {
private:
    T value_;
    bool has_value_;

// Добавим конструкторы
public:
    Optional() : has_value_(false)
    {}
        
    Optional(const T& another_value) // Почему здесь const&?
        : value_(another_value)
        , has_value_(true)
    {}   
};
@step highlight=16:blue,17:blue,18:blue,19:blue,20:blue,
template<typename T>
class Optional {
private:
    T value_;
    bool has_value_;

public:
    Optional() : has_value_(false)
    {}
        
    Optional(const T& another_value) 
        : value_(another_value)
        , has_value_(true)
    {}   

    Optional(const Optional&) = default;
    Optional(Optional&&) = default;
    Optional& operator = (const Optional&) = default;
    Optional& operator = (Optional&&) = default;
    ~Optional() = default;
};
@step
template<typename T>
class Optional {
private:
    T value_;
    bool has_value_;

public:
    Optional() : has_value_(false)
    {}
        
    Optional(const T& another_value) 
        : value_(another_value)
        , has_value_(true)
    {}   

    Optional(const Optional&) = default;
    Optional(Optional&&) = default;
    Optional& operator = (const Optional&) = default;
    Optional& operator = (Optional&&) = default;
    ~Optional() = default;

    // Добавим функционал
    bool has_value() const { return has_value_; }
    
    T&       get_value()       { return value_; }
    const T& get_value() const { return value_; }
    
    T*       get_ptr()       { return has_value_ ? &value_ : nullptr; }    
    const T* get_ptr() const { return has_value_ ? &value_ : nullptr; }
    
};
@step
template<typename T>
class Optional {
private:
    T value_;
    bool has_value_;

public:
    Optional() : has_value_(false)
    {}
        
    Optional(const T& another_value) 
        : value_(another_value)
        , has_value_(true)
    {}   

    Optional(const Optional&) = default;
    Optional(Optional&&) = default;
    Optional& operator = (const Optional&) = default;
    Optional& operator = (Optional&&) = default;
    ~Optional() = default;

    // Добавим функционал
    bool has_value() const { return has_value_; }
    
    T&       get_value()       { return value_; }
    const T& get_value() const { return value_; }
    
    T*       get_ptr()       { return has_value_ ? &value_ : nullptr; }    
    const T* get_ptr() const { return has_value_ ? &value_ : nullptr; }
    
    void reset() {
        value_ = T();
        has_value_ = false;
    }

    void reset(const T& another_value) {
        value_ = another_value;
        has_value_ = true;
    }  
};
@step
template<typename T>
class Optional {
private:
    T value_;
    bool has_value_;

public:
    Optional() : has_value_(false)
    {}
        
    Optional(const T& another_value) 
        : value_(another_value)
        , has_value_(true)
    {}   

    Optional(const Optional&) = default;
    Optional(Optional&&) = default;
    Optional& operator = (const Optional&) = default;
    Optional& operator = (Optional&&) = default;
    ~Optional() = default;

    // Добавим функционал
    bool has_value() const { return has_value_; }
    
    T&       get_value()       { return value_; }
    const T& get_value() const { return value_; }
    
    T*       get_ptr()       { return has_value_ ? &value_ : nullptr; }    
    const T* get_ptr() const { return has_value_ ? &value_ : nullptr; }
    
    void reset() {
        value_ = T();
        has_value_ = false;
    }

    void reset(const T& another_value) {
        value_ = another_value;
        has_value_ = true;
    }  
    
    void emplace() {
        value_ = T();
        has_value_ = true;
    }
};
@end

---

# Пример использования

@code cpp readonly width=500px
Optional<std::string> maybe_string_1("hello world");

if (maybe_string_1.has_value())
    std::cout << maybe_string_1.get_value() << std::endl;

if (std::string* s = maybe_string_1.get_ptr())
    std::cout << *s << std::endl;

maybe_string_1.reset();

maybe_string_1.emplace();
@end

---

@yesScroll
# Добавим операторы сравнения
@code cpp readonly
template<typename T>
bool operator == (const Optional<T>& lhs, const Optional<T>& rhs) {
    if (!lhs.has_value())
        return !rhs.has_value();
    
    if (!rhs.has_value())
        return false;
    
    return lhs.get_value() == rhs.get_value();    
}

template<typename T>
bool operator != (const Optional<T>& lhs, const Optional<T>& rhs) {
    return !(lhs == rhs);
}

template<typename T>
bool operator == (const Optional<T>& lhs, const T& rhs) {
    return
        lhs.has_value() &&
        lhs.get_value() == rhs;
}

template<typename T>
bool operator == (const T& lhs, const Optional<T>& rhs) {
    return rhs == lhs;
}

template<typename T>
bool operator != (const Optional<T>& lhs, const T& rhs) {
    return !(lhs == rhs);
}

template<typename T>
bool operator != (const T& lhs, const Optional<T>& rhs) {
    return !(lhs == rhs);
}
@end

---

# Пример использования операторов сравнения

@code cpp readonly
Optional<std::string> maybe_string_1("hello world");
Optional<std::string> maybe_string_2 = maybe_string_1;

if (maybe_string_1 != maybe_string_2)
    std::cout << "unreachable!" << std::endl;

Optional<int> maybe_int;

if (maybe_string_1 == maybe_int)  // compile-time error!
    std::cout << "unreachable!" << std::endl;
@end

---

# Пример использования операторов сравнения

@code cpp readonly
Optional<std::string> maybe_string("hello world");

if (maybe_string == "C++ is designed for faster code")
    std::cout << "Fast enough?" << std::endl;
@step highlight=3:red
Optional<std::string> maybe_string("hello world");

if (maybe_string == "C++ is designed for faster code")
    std::cout << "Fast enough?" << std::endl;
@end

@warning Вопрос:
Какая проблема в этом коде?

---
@yesScroll

# Пример использования операторов сравнения

Для решения этой проблемы добавим более хитрые операторы сравнения

@code cpp readonly showLines highlight=1:blue,8:blue,13:blue,18:blue,
template<typename T, typename U>
bool operator == (const Optional<T>& lhs, const U& rhs) {
    return
        lhs.has_value() &&
        lhs.get_value() == rhs;
}

template<typename T, typename U>
bool operator == (const T& lhs, const Optional<U>& rhs) {
    return rhs == lhs;
}

template<typename T, typename U>
bool operator != (const Optional<T>& lhs, const U& rhs) {
    return !(lhs == rhs);
}

template<typename T, typename U>
bool operator != (const T& lhs, const Optional<U>& rhs) {
    return !(rhs == lhs);
@end

---

@yesScroll
# Шаблонные методы
Методы внутри шаблонного класса тоже могут быть шаблонами.

@code cpp readonly
template<typename T>
class Optional {
    // ...
public:
    // ...
    // уже было
    void emplace(const T& another_value) {
        value_ = another_value;
        has_value_ = true;
    }
};
@step highlight=13:blue,14:blue,15:blue,16:blue,17:blue,
template<typename T>
class Optional {
    // ...
public:
    // ...
    // уже было
    void emplace(const T& another_value) {
        value_ = another_value;
        has_value_ = true;
    }

    // добавили
    template<typename U>
    void emplace(const U& source) {
        value_ = T(source); // Гибкость: принимаем всё, что конвертируется в T
        has_value_ = true;
    }
};
@end


---

@code cpp readonly width=500px
Optional<std::string> maybe_string;
maybe_string.emplace("hello world");
@end

@warning Вопрос:
Что поменялось при вызове `emplace`?

---

@yesScroll
# Шаблонные конструкторы
Самое время добавить в класс шаблонный конструктор!

@code cpp readonly
template<typename T>
class Optional {
    // ...
public:
    // ...
    // уже было
    Optional(const T& another_value)
        : value_(another_value)
        , has_value_(true)
    {}
};
@step highlight=13:blue,14:blue,15:blue,16:blue,17:blue,
template<typename T>
class Optional {
    // ...
public:
    // ...
    // уже было
    Optional(const T& another_value)
        : value_(another_value)
        , has_value_(true)
    {}

    // добавили
    template<typename U>
    Optional(const U& source)
        : value_(source)
        , has_value_(true)
    {}
};
@end

---

@code cpp readonly width=500px
Optional<std::string> maybe_string("hello world");
@end

@warning Вопрос:
Что поменялось в вызове конструктора от `const char*` ?
@end

@warning Вопрос:
Можем ли мы что-нибудь выиграть от шаблонного деструктора ?
@end



---

@section Итераторы

---

# Итератор — это абстракция указателя
Контейнер хранит данные, а итератор позволяет по ним ходить.

@code cpp readonly
std::vector<int> v = {1, 2, 3};
auto it = v.begin(); 

++it;            // Перешли к следующему
*it = 42;        // Изменили значение
std::cout << *it; // Разыменовали
@end

@fragment
- `begin()` — указывает на первый элемент.
- `end()` — указывает на элемент **за** последним.
@end

@important
Никогда не разыменовывайте `end()`!


---

# Итератор — это абстракция указателя

Но итератор не обязан быть указателем на элемент контейнера:

@code cpp readonly
std::vector<bool> v = {true, false};
auto it = v.begin();
auto ref = *it; // Это не bool&, а специальный класс-обертка
ref = false;    // Оператор присваивания прокси-объекта меняет бит в векторе
@end

@fragment
По этой причине у вас не получится скомпилировать `auto& x : v`.

Абстракция итератора позволяет работать с данными, которые физически не существуют в памяти как отдельные объекты.

---

# Как разворачивается Range-for?
Современный цикл `for (auto x : container)` — это просто [синтаксический сахар](https://en.cppreference.com/w/cpp/language/range-for) над итераторами.

@code cpp readonly
{
    auto&& __range = container;
    auto __begin = __range.begin();
    auto __end = __range.end();
    for (; __begin != __end; ++__begin) {
        auto& x = *__begin;
        // Тело вашего цикла
    }
}
@end

@tip
Если вы реализуете `begin()` и `end()` для своего класса, для него тут же заработает `range-based for`.
@end

---

# Категории итераторов
Не все итераторы одинаково полезны. Именно здесь **Traits** решают, какой алгоритм запустить.

@table noborder
| Категория | Возможности | Пример |
|-----------|-------------|--------|
| **Forward** | Только вперед, по одному шагу | `std::forward_list` |
| **Bidirectional** | Вперед и назад | `std::list`, `std::set` |
| **Random Access** | Прыжки на любой индекс (it + n) | `std::vector` |
@end

@note
`std::sort` требует Random Access. Поэтому `std::list` нельзя отсортировать обычным `std::sort` — у него нет быстрого доступа к середине.
@end

---

# Категории итераторов
Не все итераторы одинаково полезны. Именно здесь Traits решают, какой алгоритм запустить.

@video assets/Iterators.mp4

---

# Операции над итераторами доступа

Стандартные операции над итераторами доступа (access iterators):

- `std::next`
- `std::prev`
- `std::advance`
- `std::distance`


@code cpp readonly
std::vector<int> v = {10, 20, 30, 40, 50};
auto it = v.begin();
auto jt_1 = std::next(it);
auto jt_2 = std::prev(it);  // ?
std::advance(it, 4);
std::cout << *it;  // v[4] = 50
std::advance(it, -4);
std::cout << *it;  // v[0] = 10
// некоторые итераторы позволяют считать расстояние между ними:
std::cout << std::distance(it, jt_1);  // 1
@end

---

# Инвалидация итераторов
Итераторы могут "сломаться" при изменении контейнера. Это источник самых коварных багов.

@code cpp readonly
std::vector<int> v = {10, 20};
auto it = v.begin();
v.push_back(30); // Вектор перевыделил память!

std::cout << *it; // ОШИБКА: итератор указывает в мусор
@end

@important
У каждого метода в [документации]() прописано, когда итераторы инвалидируются. Читайте это внимательно.
@end

@image assets/push_back_invalidation.png

---

# Инвалидация итераторов
Итераторы могут "сломаться" при изменении контейнера. Это источник самых коварных багов.

@video assets/IteratorsInvalidation.mp4

---
@yesScroll
# Инвалидация итераторов
А могут и не "сломаться" при изменении контейнера. 

@code cpp editable run=cpp width=500px
#include <iostream>
#include <set>

int main() {
    std::set<int> s = {20, 30, 40, 50};
            
    auto it = s.begin();
    std::cout << *it << std::endl;  // 20

    s.insert(10);

    std::cout << *it << std::endl;
}
@end

---

# Инвалидация итераторов
А могут и не "сломаться" при изменении контейнера. 

@code cpp readonly
std::set<int> s = {20, 30, 40, 50};
        
auto it = s.begin();
std::cout << *it;  // 20

s.insert(10);

std::cout << *it;  // ok, 20
@end

@image assets/insert_invalidation.png

---

# Инвалидация итераторов
А могут и не "сломаться" при изменении контейнера. 

@video assets/SetInsertIteratorSafety.mp4


---

# Неправильное удаление из Set
Частая ошибка — удалять элемент и продолжать идти по итератору, который только что удалили.

@code cpp readonly
std::set<int> s = {1, 2, 3, 4, 5};

auto it = s.begin();
for(; it != s.end(); ++it)
    if((*it) % 2 == 1)
        s.erase(it);
@end

@warning
В каком месте баг?
@end

---

# Правильное удаление из Set
Частая ошибка — удалять элемент и продолжать идти по итератору, который только что удалили.

@code cpp readonly
std::set<int> s = {1, 2, 3, 4, 5};

for (auto it = s.begin(); it != s.end(); ) {
    if (*it % 2 == 1) {
        it = s.erase(it); // erase возвращает итератор на СЛЕДУЮЩИЙ элемент
    } else {
        ++it;
    }
}
@end
---

# Правильная работа с циклом `range-for`

Обобщённо проблема выглядит следующим образом:

@code cpp readonly
for (const auto& item : container) {    
    operate_with(item, container);
    // внутри цикла работа с container-ом не должна
    // инвалидировать его итераторы, иначе перебор
    // элементов в контейнере сломается.
}
@end

---

# Итоги

\list decimal
- **SFINAE** позволяет выбирать код без ошибок компиляции.
- **Traits** дают информацию о типах для принятия решений.
- **Шаблоны** позволяют писать универсальные контейнеры вроде Optional.
- **Итераторы** скрывают детали реализации контейнеров, давая единый интерфейс для алгоритмов.