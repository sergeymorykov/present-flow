@title
\align center
\fontSize 2.2rem
Концепты
Лекция 17: Концепты, requires и requires

Разработка приложений на C++
\date{2026}

---

@section Зачем нужны концепты?

---

# Нечитаемые ошибки шаблонов

У шаблонов есть серьёзный недостаток - сообщения при выводе ошибок практически нечитаемые.

@code cpp readonly
#include <vector>
#include <algorithm>

struct X {
    int a;
};

int main() {
    std::vector<X> v = { {10}, {9}, {11} };
    std::sort(v.begin(), v.end());
}
@end

@warning Что выдаст компилятор?
\marginTop -0.25rem
Кучу строк, указывающих куда-то внутрь `<algorithm>`, хотя на самом деле отстутствует `operator<` у структуры `X`.
@end

---

# Перегрузка шаблонов

@columns
@column
\width 60%

@code cpp readonly
template<typename CollT, typename T>
void add(CollT& coll, const T& val) {
    coll.push_back(val);
}

template<typename CollT, typename T>
void add(CollT& coll, const T& val) {
    coll.insert(val);
}
@end

@column
\width 40%

@important Ошибка компиляции
Две функции с одинаковой сигнатурой -- ошибка переопределения.
@end

@end

@fragment
@warning До C++20
для решения использовали `std::enable_if` и SFINAE -- громоздкие конструкции, которые сложно читать и поддерживать.


---

# Концепты

Концепты позволяют **накладывать ограничения на шаблонные параметры**.

@columns
@column
\width 55%
@code cpp readonly highlight=8:blue
template<class T>
concept IterToComparable = 
    requires(T a, T b) {
        {*a < *b} -> std::convertible_to<bool>;
    };
    
template<IterToComparable InputIt>
void SortDefaultComparator(InputIt begin, InputIt end) {
    std::sort(begin, end);
}
@end
@column
\width 45%

@code cpp readonly highlight=7:blue
struct X {
    int a;
};

int main() {
    std::vector<X> v = { {10}, {9}, {11} };
    SortDefaultComparator(v.begin(), v.end());
}
@end
@end

@tip Что выдаст комплиятор?
\marginTop -0.25rem
Компилятор все равно выдаст ошибку, но сразу укажет на наш концепт `SortDefaultComparator` вплоть до неудовлетворения условия `{*a < *b} -> std::convertible_to<bool>;`.


---

# Концепты

Концепты позволяют **накладывать ограничения на шаблонные параметры**.

@columns
@column
\width 55%

@code cpp readonly
template<typename CollT>
concept HasPushBack =
    requires (CollT c, CollT::value_type v) {
        c.push_back(v);
    };

template<typename CollT, typename T>
requires HasPushBack<CollT>
void add(CollT& coll, const T& val) {
    coll.push_back(val);
}

template<typename CollT, typename T>
void add(CollT& coll, const T& val) {
    coll.insert(val);
}
@end

@column
\width 45%

@code cpp readonly
std::vector<int> coll1;
std::set<int> coll2;

add(coll1, 42); // OK: 1-я add(), push_back
add(coll2, 42); // OK: 2-я add(), insert
@end


@tip Ключевое преимущество
При разрешении перегрузок, компилятор предпочитает более **специализированную функцию**. Неограниченная функция используется в самую последнюю очередь.
@end

@end

---

# Три ключевых понятия

@columns
@column
\width 33%

@style
\bg rgba(220, 38, 38, 0.1)
\borderLeft 4px solid #dc2626
\padding 1rem
\borderRadius 8px

### Requirements

Выражения внутри `requires{...}`, которые определяют:
- Операции, которые должны быть валидны
- Типы, которые должны существовать

@end

@column
\width 33%

@style
\bg rgba(37, 99, 235, 0.1)
\borderLeft 4px solid #2563eb
\padding 1rem
\borderRadius 8px

### Concepts

Именованные наборы **requirements**. 

Compile-time булевы значения, привязанные к типу.

@end

@column
\width 34%

@style
\bg rgba(22, 163, 74, 0.1)
\borderLeft 4px solid #16a34a
\padding 1rem
\borderRadius 8px

### Constraints

Ограничения ограничения шаблонного кода. Задаются через:
- `requires`-clause
- Type constraints

@end

@end

@note Код концептов не генерирует машинный код
Он вычисляется только на **этапе компиляции**, чтобы решить, какой шаблон инстанциировать.
@end

---

@section Синтаксис концептов

---

# Концепт

**Концепт** -- это шаблонное булево выражение с именем.

@code cpp readonly
// Простейший концепт -- всегда true
template<class T>
concept AlwaysTrue = true;
@step
// Простейший концепт -- всегда true
template<class T>
concept AlwaysTrue = true;

// На основе type traits
template<class T>
concept Integral = std::is_integral_v<T>;

template<class T>
concept SignedIntegral = Integral<T> && std::is_signed_v<T>;

template<class T>
concept UnsignedIntegral = Integral<T> && !SignedIntegral<T>;
@step
// С requires-выражением
template<class T>
concept Addable = requires (T a, T b) {
    a + b;  // Проверяет, что выражение валидно
};
@end

Концепты комбинируются через `&&` и `||`, как обычные булевы значения.

---

# requires-выражение

Внутри `requires{...}` можно проверять четыре вида требований.

@code cpp readonly
template<class T>
concept MyContainer = requires(T c, typename T::value_type v) {
    // 1. Простое требование -- выражение должно компилироваться
    c.push_back(v);
    // 2. Требование к типу -- тип должен существовать
    typename T::value_type;
    // 3. Составное требование -- проверка типа результата
    { c.size() } -> std::convertible_to<std::size_t>;
    // 4. Вложенное требование
    requires std::default_initializable<T>;
};
@end

@warning Опасность опечаток
\marginTop -0.25rem
`c.pushback(v)` вместо `c.push_back(v)` -- концепт не сработает, но компилятор выдаст это как ошибку.
@end

---

# Проверка типов результата выражений

Составное требование `{ expr } -> concept<args...>` проверяет, что тип результата удовлетворяет указанному концепту.

@code cpp readonly
template<class T>
concept Eq =
    requires(T a, T b) {
        { a == b } -> std::convertible_to<bool>;
        { a != b } -> std::convertible_to<bool>;
    };
@step
template<class T>
concept Eq =
    requires(T a, T b) {
        { a == b } -> std::convertible_to<bool>;
        { a != b } -> std::convertible_to<bool>;
    };

template<class T>
concept Dereferenceable =
    requires(T x) {
        { *x } -> std::convertible_to<typename T::inner>;
        { x * 1 } -> std::convertible_to<T>;
    };
@end

---

@section Синтаксис использования

---

# Как применить концепт к шаблонной функции

@code cpp readonly
// 1. Концепт вместо typename
template<Incrementable T>
void f(T arg);
@step
// 1. Концепт вместо typename
template<Incrementable T>
void f(T arg);

// 2. requires-clause после template
template<class T>
requires Incrementable<T>
void f(T arg);
@step
// 1. Концепт вместо typename
template<Incrementable T>
void f(T arg);

// 2. requires-clause после template
template<class T>
requires Incrementable<T>
void f(T arg);

// 3. Trailing requires-clause
template<class T>
void f(T arg) requires Incrementable<T>;
@step
// 1. Концепт вместо typename (type constraint)
template<Incrementable T>
void f(T arg);

// 2. requires-clause после template
template<class T>
requires Incrementable<T>
void f(T arg);

// 3. Trailing requires-clause
template<class T>
void f(T arg) requires Incrementable<T>;

// 4. Abbreviated function template
void f(Incrementable auto arg);
@end

@fragment
@note
\marginTop -1rem
Для классов доступны способы `1` и `2`.

---

# Шаблонная функция с параметрами `auto`

@columns
@column
\width 50%

@code cpp readonly
// Сокращённая запись
void add(auto& coll, const auto& val) {
    coll.push_back(val);
}

// Эквивалент:
template<typename T1, typename T2>
void add(T1& coll, const T2& val) {
    coll.push_back(val);
}
@end

@column
\width 50%

@code cpp readonly
// С концептом вместо auto
void add(HasPushBack auto& coll,
         const auto& val) {
    coll.push_back(val);
}

// Эквивалент:
template<HasPushBack T1, typename T2>
void add(T1& coll, const T2& val) {
    coll.push_back(val);
}
@end

@end

@note Определение в заголовочных файлах
Так как `auto`-параметры создают шаблон, поэтому определение должно быть в заголовочном файле.
@end

---

# requires-выражение vs requires-clause

Не путайте два `requires` -- они делают разные вещи.

@columns
@column
\width 50%

@style
\bg rgba(37, 99, 235, 0.1)
\padding 1rem
\borderRadius 8px

**requires-выражение** определяет *requirements* (требования):

```cpp
requires (CollT c, T v) {
    c.push_back(v);
};
```

@end

@column
\width 50%

@style
\bg rgba(220, 38, 38, 0.1)
\padding 1rem
\borderRadius 8px

**requires-clause** определяет *constraints* (ограничения):

```cpp
requires HasPushBack<CollT>
```

@end

@end

@fragment
Можно комбинировать оба -- `requires requires`:

@code cpp readonly
void add(auto& coll, const auto& val)
requires requires { coll.push_back(val); } {
    coll.push_back (val); 
}
@end
@end

---

# Детальность концептов

@code cpp readonly highlight=1:red
// Не используйте концепты для каждого случая:
template<typename CollT, typename T>
concept CanPushBack = 
    requires (CollT c, T v) {
        c.push_back(v); 
    };

void add(auto& coll, const auto& val)
requires CanPushBack<decltype(coll), decltype(val)>
@step highlight=1:blue
// Вместо этого соберите концепт в логическую группу:
template<typename CollT>
concept SequenceCont = 
    std::ranges::range<CollT> && 
    requires (std::remove_cvref_t<CollT> c, std::ranges::range_value_t<CollT> v) {
        c.push_back(v);
        c.insert(c.begin(), v);
        c.erase(c.begin());
        c.clear();
        {c < c} -> std::convertible_to<bool>;
        ...
    };

template<typename CollT, typename T>
requires SequenceCont<CollT>
void add(CollT& coll, const T& val) {
    coll.push_back(val);
}
@end


---

@section Перегрузки и концепты

---

# Перегрузки с концептами

Компилятор предпочитает более ограниченную перегрузку.

@code cpp readonly
template<typename CollT>
concept HasPushBack = requires (CollT c, CollT::value_type v) {
    c.push_back(v);
};

void add(HasPushBack auto& coll, const auto& val) {
    coll.push_back(val);  // Более специализированная
}
void add(auto& coll, const auto& val) {
    coll.insert(val);
}

std::vector<int> coll1;
std::set<int> coll2;
add(coll1, 42);  // OK: 1-я add() -- push_back
add(coll2, 42);  // OK: 2-я add() -- insert
@end

---

# Неоднозначность перегрузки

"Поглощение" концептов помогает решать случаи **неоднозначности (ambiguity)**, когда подходят два концепта с *разными* ограничениями.

@code cpp readonly
template<typename CollT>
concept HasSize = requires (CollT c) {
    { c.size() } -> std::convertible_to<int>;
};

template<typename CollT>
concept HasIndexOp = requires (CollT c) { c[0]; };
@step
template<typename CollT>
requires HasSize<CollT>
void foo(CollT& coll) { /* ... */ }

template<typename CollT>
requires HasIndexOp<CollT>
void foo(CollT& coll) { /* ... */ }
@step
std::list<int> lst{0, 8, 15};
std::vector<int> vec{0, 8, 15};

foo(lst);
foo(vec);
@step highlight=4:green,5:red
std::list<int> lst{0, 8, 15};
std::vector<int> vec{0, 8, 15};

foo(lst);  // OK: только HasSize
foo(vec);  // ERROR: ambiguous!
@end

@fragment
@video assets/patrick-uhh.mp4 height=180px nocontrols

@end

---

# Неоднозначность перегрузки

Решить данную проблему можно сделать выбор концепта более строгим: 

@code cpp readonly highlight=6:blue
template<typename CollT>
requires HasSize<CollT>
void foo(CollT& coll) { /* ... */ }

template<typename CollT>
requires HasSize<ColltT> && HasIndexOp<CollT>
void foo(CollT& coll) { /* ... */ }
@step highlight=4:green,5:green
std::list<int> lst{0, 8, 15};
std::vector<int> vec{0, 8, 15};

foo(lst);  // OK: только HasSize
foo(vec);  // OK: и HasSize, и HasIndexOp
@end

@fragment
@video assets/patrick-drooling-patrick-star.mp4 width=180px

@end

---

# Правила поглощений

@code cpp readonly
template<typename T>
concept BigType = sizeof(T) > 8;

template<typename T>
concept ClassType = std::is_class_v<T>;

// BigOrClass НЕ поглощает BigAndClass и наоборот
template<typename T>
concept BigClassType0 = sizeof(T) > 8 && std::is_class_v<T>;
@step
template<typename T>
concept BigType = sizeof(T) > 8;

template<typename T>
concept ClassType = std::is_class_v<T>;

// Правильно -- ссылаться на именованный концепт:
template<typename T>
concept BigClassType = BigType<T> && ClassType<T>;
@end

@fragment
@important Subsumption работает только через именованные концепты
Дублирование `sizeof(T) > 8` в двух концептах -- это два *разных* ограничения.
@end

---

@section Использование на практике

---

# Вспоминаем домашку

В задании было написать шаблонный класс `Warehouse<T>`, который должен работать с типами `Product`

@code cpp readonly
template <typename T>
class Warehouse {
    static_assert(std::is_base_of_v<Product, T>, "T must derive from Product");

    std::vector<StorageSlot<T>> slots;
    std::shared_ptr<OperationLog> log;
    ...
}
@end

---

# Использование концептов

Вместо этого можно задать концепт и добавить дополнительные ограничения:

@code cpp readonly
template <typename T>
concept ProductLike = 
    std::is_base_of_v<Product, T> && 
    requires(const T& t) {
        { t.getPrice() } -> std::convertible_to<double>;
        { t.getDescription() } -> std::convertible_to<std::string>;
    };

template <ProductLike T>
class Warehouse {
    std::vector<StorageSlot<T>> slots;
    std::shared_ptr<OperationLog> log;
    ...
}
@step
// даже можно использовать концепт в классе StorageSlot<T>
template <ProductLike T>
class StorageSlot {
    std::unique_ptr<T> item;
    std::shared_ptr<OperationLog> log;
    ...
}
@end

---

# constexpr + requires

Вместо перегрузок можно использовать `if constexpr` с `requires`-выражением прямо в теле функции.

@columns
@column
\width 65%
@code cpp readonly
void add(auto& coll, const auto& val)
{
    if constexpr (requires { coll.push_back(val); }) {
        coll.push_back(val);
    }
    else {
        coll.insert(val);
    }
}

std::vector<int> coll1;
std::set<int> coll2;

add(coll1, 42);  // OK: push_back
add(coll2, 42);  // OK: insert
@end

@column
\width 35%
@warning
Если вместо `set<int>` будет `set<std::string>`, то при вставке `42` ошибка возникнет глубоко внутри `insert()`, а не в месте вызова `add()`.
@end

---

# Ограничения + if constexpr

@columns
@column
\width 65%
@code cpp readonly highlight=2:blue,16:blue
template<std::ranges::range CollT,
         std::convertible_to<std::ranges::range_value_t<CollT>> T>
void add(CollT& coll, const T& val) {
    if constexpr (requires { coll.push_back(val); }) {
        coll.push_back(val);
    }
    else {
        coll.insert(val);
    }
}

std::vector<int> coll1;
std::set<std::string> coll2;

add(coll1, 42);   // OK: push_back
add(coll2, 42);   // ERROR при вызове add(): int не convertible_to<string>
@end
@column
\width 35%
@tip теперь
Ошибка теперь указывает точно на место вызова и говорит, какое условие не выполнено.

---

# Ограничения для функций класса

Концепты работают и внутри шаблонных классов -- ограничивают доступность отдельных методов.

@columns
@column
\width 60%
@code cpp readonly
template<typename T>
class MyType {
    T value;
public:
    void print() const {
        std::cout << value << '\n';
    }
    bool isZero() const
    requires std::integral<T> || std::floating_point<T> {
        return value == 0;
    }
    bool isEmpty() const
    requires requires { value.empty(); } {
        return value.empty();
    }
};
@end
@column
\width 40%
@code cpp readonly highlight=2:green,4:green,6:red
MyType<double> mt1;
mt1.print();       // OK

mt1.isZero();      // OK -- double is floating_point

mt1.isEmpty();     // ERROR -- double не имеет .empty()
@end

---

# Ограничения для функций класса

Концепты работают и внутри шаблонных классов -- ограничивают доступность отдельных методов.

@columns
@column
\width 60%
@code cpp readonly
template<typename T>
class MyType {
    T value;
public:
    void print() const {
        std::cout << value << '\n';
    }
    bool isZero() const
    requires std::integral<T> || std::floating_point<T> {
        return value == 0;
    }
    bool isEmpty() const
    requires requires { value.empty(); } {
        return value.empty();
    }
};
@end
@column
\width 40%
@code cpp readonly highlight=2:green,4:red,6:green
MyType<std::string> mt2;
mt2.print();       // OK

mt2.isZero();      // ERROR -- string не integral/floating_point

mt2.isEmpty();     // OK -- string имеет .empty()
@end

---

# Тестирование концептов

Концепты -- compile-time булевы значения. Их можно проверять через `static_assert`.

@code cpp readonly
template<typename CollT>
concept HasPushBack = requires (CollT c, CollT::value_type v) {
    c.push_back(v);
};

// Тестируем концепт
static_assert(HasPushBack<std::vector<int>>);
static_assert(!HasPushBack<std::set<int>>);

std::vector<int> coll1;
static_assert(HasPushBack<decltype(coll1)>);
@end

@tip
\marginTop -0.25rem
Можно использовать `require`-выражения прямо в тестах `static_assert(requires { /* код */ })` для быстрой проверки условия.
@end

---

@section Стандартные концепты

---

# Концепты в стандартной библиотеке

@columns
@column
\width 50%

**`<concepts>`** -- базовые концепты:

- `std::same_as<T, U>`
- `std::derived_from<D, B>`
- `std::convertible_to<From, To>`
- `std::integral<T>`
- `std::floating_point<T>`
- `std::movable<T>`
- `std::copyable<T>`
- `std::regular<T>`
- `std::totally_ordered<T>`
- `std::default_initializable<T>`

@column
\width 50%

**`<iterator>` / `<ranges>`** -- итераторы и диапазоны:

- `std::input_iterator<I>`
- `std::forward_iterator<I>`
- `std::bidirectional_iterator<I>`
- `std::random_access_iterator<I>`
- `std::contiguous_iterator<I>`
- `std::ranges::range<R>`
- `std::ranges::input_range<R>`
- `std::sortable<I>`

@end

---

# Ограничения концептов

Концепты проверяют условия, которые компилируются в compile-time. Семантические требования нужно уточнять в документации. [Например, концепт](https://en.cppreference.com/cpp/ranges/range) `std::ranges::range` из **C++20**:

@code cpp readonly
template<typename T>
concept range = requires(T& t) {
    std::ranges::begin(t);
    std::ranges::end(t);
};
@end

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 0.5rem 1rem
\borderLeft 4px solid #38bdf8
\border 1px solid #334155
\borderRadius 8px
Тип `T` моделирует `range`, если:

- `[ranges::begin(t), ranges::end(t))` обозначает диапазон
- `begin(t)` и `end(t)` работают за амортизированное константное время и не модифицируют `t`
- Тип `begin(t)` моделирует `forward_iterator`, и `begin(t)` сохраняет равенство (equality preserving)
@end

---

@section Концепты с несколькими параметрами

---

# Концепт для нескольких типов

@code cpp readonly
template<typename CollT, typename T>
concept CanPushBack = requires (CollT c, T v) {
    c.push_back(v);
};
@step
template<typename CollT, typename T>
concept CanPushBack = requires (CollT c, T v) {
    c.push_back(v);
};

// Использование в requires-clause
void add(auto& coll, const auto& val)
requires CanPushBack<decltype(coll), decltype(val)>
{
    coll.push_back(val);
}
@step
// Концепт с несколькими параметрами как type constraint:
// первый параметр берётся из шаблонного аргумента,
// остальные указываются явно
template<class T, class U>
concept Derived = std::is_base_of_v<U, T>;

template<Derived<Base> X>  // = Derived<X, Base>
void f(X arg);
@end

---

# Концепты с не-типами данных

Концепты работают и с non-type параметрами.

@code cpp readonly
constexpr bool isPrime(int val) {
    for (int i = 2; i <= val / 2; ++i) {
        if (val % i == 0) return false;
    }
    return val > 1;
}

template<auto Val>
concept IsPrime = Val > 0 && isPrime(Val);

template<auto Val>
requires IsPrime<Val>
class PrimeHolder { // ... };

PrimeHolder<6> p1;  // ERROR: constraint not satisfied
PrimeHolder<7> p2;  // OK
@end

---

@section Где можно использовать концепты

---

# Области применения

Концепты можно использовать для:

- **Шаблонов функций** -- все 4 способа синтаксиса
- **Шаблонов классов** -- type constraints и requires-clause
- **Member-функций** -- trailing requires-clause
- **Шаблонов псевдонимов** (alias templates)
- **Шаблонов переменных** (variable templates)
- **Non-type template parameters**

@important Ограничение
Концепты *нельзя* использовать для ограничения других концептов. `concept A = B<T>` -- это использование `B`, а не ограничение на параметры самого `A`.
@end

---

@section Итоги

---

# Что дают концепты

- Читаемые сообщения об ошибках -- ошибка в месте вызова, а не внутри шаблона
- Перегрузка шаблонов на основе свойств типов -- без SFINAE и `enable_if`
- Документация требований к типам прямо в коде

@fragment
**Рекомендации**:
- Используйте стандартные концепты из `<concepts>`, `<iterator>`, `<ranges>` -- не пишите свои аналоги
- Тестируйте концепты через `static_assert`
- Для поглощений ссылайтесь на именованные концепты
- Не делайте концепты слишком узкими -- один концепт на один метод избыточно

@end
