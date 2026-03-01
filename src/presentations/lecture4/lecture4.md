@title
# Layout памяти, операторы и дизайн классов
Лекция 4 — Внутреннее устройство, операторы, static, принципы
Курс по C++
\date{2026}

---

@section План лекции

---

# План лекции

@columns
@column

@style
\bg rgba(59, 130, 246, 0.1)
\borderLeft 4px solid #3b82f6
\borderRadius 8px
\padding 0.75rem 1rem

**01 — Layout памяти**

Структуры, padding, наследование, vtable
@end

@column

@style
\bg rgba(168, 85, 247, 0.1)
\borderLeft 4px solid #a855f7
\borderRadius 8px
\padding 0.75rem 1rem

**02 — Операторы и static**

Перегрузка, const/mutable, static-поля и методы
@end

@column

@style
\bg rgba(34, 197, 94, 0.1)
\borderLeft 4px solid #22c55e
\borderRadius 8px
\padding 0.75rem 1rem

**03 — Дизайн классов**

RAII, Rule of 6, SRP, типичные ошибки
@end

@end

---

@section Повторение

---

# Конструктор базового класса

@code cpp readonly height=250px
struct Animal {
    Animal(const std::string& name)
        : name_(name) {}
    virtual void cry() = 0;
    virtual ~Animal() {}
protected:
    std::string name_;
};

struct Turtle : Animal {
    Turtle()
        : Animal("Turtle")
    {}
    void cry() override {
        std::cout << name_ << ": ...";
    }
};
@end


@note note Важно
Конструктор базового класса вызывается **до** конструктора производного.

Если у базового нет конструктора по умолчанию — его нужно вызвать **явно** в списке инициализации.
@end


---

# Виртуальные функции в конструкторах

@columns
@column
\width 58%

@code cpp readonly
struct Base {
    Base() {
        init(); // Какая версия?
    }
    virtual void init() {
        std::cout << "Base::init";
    }
};

struct Derived : Base {
    void init() override {
        std::cout << "Derived::init";
    }
};

Derived d; // Вывод: "Base::init" (!)
@end

@column
\width 42%

@warning Ловушка!
В конструкторе/деструкторе вызывается версия **текущего** класса, а не производного.

Объект `Derived` ещё **не сконструирован** на момент вызова `Base::Base()`.
@end

@end

---

@section Layout памяти

---

# Layout простых структур

@columns
@column
\width 50%

@code cpp readonly
struct Point {
    float x;  // 4 байта
    float y;  // 4 байта
};
sizeof(Point) == 8
@end

@image assets/lecture4/layout_point.jpg width=350

@column
\width 50%

@code cpp readonly
struct S {
    char  m0[3];    // 3 байта
    short m1;       // 2 байта + 1 padding
    long long m2;   // 8 байт
    char  m3;       // 1 байт
    double m4;      // 8 байт + 7 padding
};
@end

@image assets/lecture4/layout_padding.jpg width=350

@end

---

# Padding и выравнивание

@columns
@column
\width 50%

@image assets/lecture4/layout_padding_2.jpg width=400

@column
\width 50%

@image assets/lecture4/layout_padding_3.jpg width=400

@end

@divider #22c55e

@note tip Оптимизация размера
Располагайте поля от **большего к меньшему** — это минимизирует padding и уменьшает размер структуры.
@end

---

# Layout при наследовании

@columns
@column
\width 50%

**Простое наследование:**

@image assets/lecture4/layout_inheritance.jpg width=380

@column
\width 50%

**Множественное наследование:**

@image assets/lecture4/layout_multiple_inheritance.jpg width=380

@end

---
@yesScroll
# Layout с vtable

@image assets/lecture4/layout_vtable_3.jpg width=700

@note note Overhead
Каждый объект с virtual-методами хранит **vptr** (8 байт на 64-bit). Таблица vtable — одна на класс, а не на объект.
@end

---

# vftable: детали

@columns
@column
\width 50%

@code cpp readonly
struct Animal {
    virtual void cry() {}
    virtual ~Animal() {}
    std::string name;
};

struct Dog : Animal {
    void cry() override {}
    int age;
};

sizeof(Animal) == 16  // vptr + string
sizeof(Dog)    == 24  // vptr + string + int + pad
@end

@column
\width 50%

@image assets/lecture4/vftable.jpg width=380

@note note
Каждый класс с virtual-методами имеет **свою** vtable. Объекты хранят только указатель на неё (vptr).
@end

@end

---

@section Операторы и static

---

# Перегрузка операторов

@columns
@column
\width 48%

**Свободные функции:**

@code cpp readonly height=250px
Vec operator+(const Vec& a,
              const Vec& b) {
    return {a.x + b.x, a.y + b.y};
}

std::ostream& operator<<(
    std::ostream& os,
    const Vec& v) {
    return os << v.x << ", " << v.y;
}
@end

@column
\width 49%

**Методы класса:**

@code cpp readonly height=250px
class Vec {
    double x, y;
public:
    Vec& operator+=(const Vec& o) {
        x += o.x;
        y += o.y;
        return *this;
    }
    bool operator==(const Vec& o) const {
        return x == o.x && y == o.y;
    }
};
@end

@end

@note note Функтор
`operator()` позволяет использовать объект как функцию — используется в STL (компараторы, предикаты).
@end

---

# Когда метод, когда свободная функция?

@columns
@column

@style
\bg rgba(59, 130, 246, 0.08)
\borderLeft 3px solid #3b82f6
\borderRadius 6px
\padding 0.5rem 0.75rem

**Метод класса:**

- `operator=`, `operator+=`, `operator-=`
- `operator[]`, `operator()`
- `operator->`, `operator*`
- Унарные: `operator++`, `operator--`

@end

@column

@style
\bg rgba(168, 85, 247, 0.08)
\borderLeft 3px solid #a855f7
\borderRadius 6px
\padding 0.5rem 0.75rem

**Свободная функция (или friend):**

- `operator+`, `operator-`, `operator*`
- `operator<<`, `operator>>`
- `operator==`, `operator!=`
- Когда левый операнд — не наш класс

@end

@end

@fragment
Используйте **friend**-функции, когда свободной функции нужен доступ к приватным полям.
@end

---

# const и mutable

@columns
@column

**const-методы** не меняют состояние объекта:

@code cpp readonly
class Container {
    std::vector<int> data_;
    mutable size_t cache_ = 0;
public:
    size_t size() const {
        cache_ = data_.size();
        return cache_;
    }
};
@end

@column

@style
\fontSize 0.95rem

@note note Что такое состояние?
«Состояние» — это то, что влияет на **наблюдаемое поведение** объекта. Кеш — не состояние.
@end

@note tip mutable
Поля `mutable` можно менять даже в const-методах. Используйте для **кешей** и **мьютексов**.
@end

---

# Перегрузка const-методов

@columns
@column
\width 53%

@code cpp readonly height=220px
class Foo {
public:
    void f() {
        std::cout << "non-const";
    }
    void f() const {
        std::cout << "const";
    }
};
@end

@column
\width 44%

@code cpp readonly height=220px
Foo a;
a.f();          // "non-const"

const Foo b;
b.f();          // "const"

const Foo& c = a;
c.f();          // "const"
@end

@end

@note note
Компилятор выбирает перегрузку по **const-квалификации** объекта (или ссылки/указателя).
@end

---

# static-поля и методы

@columns
@column

@code cpp readonly height=367px
class Animal {
    static std::string unknown;
public:
    static const std::string& get_unknown() {
        return unknown;
    }
};

// Определение (в .cpp):
std::string Animal::unknown = "???";
@end

@column

@style
\fontSize 0.95rem

- **static-поля** — общие для всех объектов класса
- **static-методы** — не имеют `this`, работают только со static-полями
- Определение static-поля — **вне** класса

@note tip Фабричный метод
static-метод идеален для паттерна **Factory**:

```cpp
class House {
public:
    static House make(int rooms);
};
```
@end


---

@section Принципы дизайна

---

# class vs struct — принцип выбора

@columns
@column

@style
\bg rgba(168, 85, 247, 0.08)
\borderLeft 3px solid #a855f7
\borderRadius 6px
\padding 0.6rem 0.8rem

**struct** — для простых агрегатов

```cpp
struct Point { float x, y; };
struct Color { uint8_t r, g, b, a; };
```

Поля **независимы**, нет инварианта.
@end

@column

@style
\bg rgba(59, 130, 246, 0.08)
\borderLeft 3px solid #3b82f6
\borderRadius 6px
\padding 0.6rem 0.8rem

**class** — для объектов с инвариантом

```cpp
class String {
    char* data_;
    size_t size_;
    size_t capacity_;
};
```

Поля **связаны**, нужен контроль доступа.
@end

@end

@divider

@note note Правило
Если можно нарушить целостность объекта, изменив одно поле независимо — нужен **class** с приватными полями и методами-аксессорами.
@end

---

@yesScroll

# Принципы проектирования классов

@columns
\gap 0.75rem
@column
\width 50%

@style
\bg rgba(59, 130, 246, 0.08)
\borderRadius 8px
\padding 0.6rem 0.8rem
\borderLeft 3px solid #3b82f6

**RAII**

Захват ресурса = инициализация. Освобождение — в деструкторе.
@end

@style
\bg rgba(168, 85, 247, 0.08)
\borderRadius 8px
\padding 0.6rem 0.8rem
\borderLeft 3px solid #a855f7
\marginTop 0.4rem

**Rule of 6**

Если определил одну из 6 операций — определи все или используй `= default` / `= delete`.
@end

@style
\bg rgba(34, 197, 94, 0.08)
\borderRadius 8px
\padding 0.6rem 0.8rem
\borderLeft 3px solid #22c55e
\marginTop 0.4rem

**SRP**

Один класс — одна ответственность. Не мешайте логику и I/O.
@end

@column
\width 50%

@style
\bg rgba(234, 179, 8, 0.08)
\borderRadius 8px
\padding 0.6rem 0.8rem
\borderLeft 3px solid #eab308

**noexcept**

Деструкторы и move-операции — **noexcept**. Иначе STL-контейнеры не оптимизируют.
@end

@style
\bg rgba(239, 68, 68, 0.08)
\borderRadius 8px
\padding 0.6rem 0.8rem
\borderLeft 3px solid #ef4444
\marginTop 0.4rem

**override**

Всегда используйте override для переопределённых virtual-методов.
@end

@style
\bg rgba(59, 130, 246, 0.08)
\borderRadius 8px
\padding 0.6rem 0.8rem
\borderLeft 3px solid #3b82f6
\marginTop 0.4rem

**const**

Методы, не меняющие состояние — const. Никогда не используйте **protected**-поля.
@end

@end

---

@yesScroll

# Типичные ошибки

@columns
\gap 0.5rem
@column

@style
\bg rgba(239, 68, 68, 0.08)
\borderLeft 3px solid #ef4444
\borderRadius 6px
\padding 0.5rem 0.75rem

<span style="color:#f87171">**Забыли virtual ~**</span>

Утечка памяти при `delete` через указатель на базовый класс
@end

@style
\bg rgba(239, 68, 68, 0.08)
\borderLeft 3px solid #ef4444
\borderRadius 6px
\padding 0.5rem 0.75rem
\marginTop 0.3rem

<span style="color:#f87171">**Нет override**</span>

Скрытый баг при изменении сигнатуры базового метода
@end

@style
\bg rgba(234, 179, 8, 0.08)
\borderLeft 3px solid #eab308
\borderRadius 6px
\padding 0.5rem 0.75rem
\marginTop 0.3rem

<span style="color:#facc15">**Default-параметры + virtual**</span>

Значение берётся из типа указателя, а не из объекта
@end

@column

@style
\bg rgba(234, 179, 8, 0.08)
\borderLeft 3px solid #eab308
\borderRadius 6px
\padding 0.5rem 0.75rem

<span style="color:#facc15">**Плохой порядок полей**</span>

Лишний padding увеличивает sizeof в разы
@end

@style
\bg rgba(239, 68, 68, 0.08)
\borderLeft 3px solid #ef4444
\borderRadius 6px
\padding 0.5rem 0.75rem
\marginTop 0.3rem

<span style="color:#f87171">**virtual в конструкторе**</span>

Вызывается версия текущего класса, а не производного
@end

@style
\bg rgba(34, 197, 94, 0.1)
\borderLeft 3px solid #22c55e
\borderRadius 6px
\padding 0.5rem 0.75rem
\marginTop 0.3rem

<span style="color:#4ade80">**Золотое правило**</span>

Компилятор — ваш друг. Используйте override, final, const и = delete.
@end

@end

---

@section Итоги лекции 7.2

---

# Итоги

@columns
@column

@style
\bg rgba(59, 130, 246, 0.08)
\borderRadius 8px
\padding 0.75rem 1rem
\border 1px solid rgba(59, 130, 246, 0.3)

### Layout и производительность

- Padding зависит от порядка полей
- vptr = 8 байт на объект
- vtable = одна на класс
- Поля от большего к меньшему

@end

@column

@style
\bg rgba(168, 85, 247, 0.08)
\borderRadius 8px
\padding 0.75rem 1rem
\border 1px solid rgba(168, 85, 247, 0.3)

### Дизайн классов

- RAII — ресурсы в конструкторе/деструкторе
- Rule of 6 — `=default` / `=delete`
- const на методах, noexcept на move
- struct = агрегат, class = инвариант

@end

@end

@divider

@style
\align center
\fontSize 1.1rem
\marginTop 0.5rem

**Хороший класс** = RAII + const-корректность + Rule of 6 + SRP.
@end
