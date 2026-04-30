@title
# Виртуальные функции и полиморфизм
Лекция 2 — Повторение, виртуальные функции, наследование
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

**01 — Повторение**

class vs struct, порядок инициализации, функтор
@end

@column

@style
\bg rgba(168, 85, 247, 0.1)
\borderLeft 4px solid #a855f7
\borderRadius 8px
\padding 0.75rem 1rem

**02 — Полиморфизм**

Сокрытие, virtual, override, vtable, деструкторы, абстрактные классы
@end

@column

@style
\bg rgba(34, 197, 94, 0.1)
\borderLeft 4px solid #22c55e
\borderRadius 8px
\padding 0.75rem 1rem

**03 — Наследование**

Модификаторы доступа, множественное, ромбовидное, final
@end

@end

---

@section Повторение

---

# class vs struct

@columns
@column

@style
\bg rgba(168, 85, 247, 0.08)
\borderLeft 3px solid #a855f7
\borderRadius 6px
\padding 0.5rem 0.75rem

**struct** — поля по умолчанию <span style="color:#a855f7">**public**</span>

```cpp
struct Point {
    float x, y;
};
```
@end

@column

@style
\bg rgba(59, 130, 246, 0.08)
\borderLeft 3px solid #3b82f6
\borderRadius 6px
\padding 0.5rem 0.75rem

**class** — поля по умолчанию <span style="color:#3b82f6">**private**</span>

```cpp
class Point {
    float x_, y_;
public:
    Point(float x, float y);
};
```
@end

@end

@divider

@note tip Когда что использовать?
- **struct** — если поля независимы (Point, Color)
- **class** — если есть инвариант, данные связаны
@end

---

# Порядок инициализации

@code cpp readonly
class A {
    A(int value)
        : y(value)   // y инициализируется первым? Нет!
        , x(y * y)   // x инициализируется ПЕРВЫМ (по порядку объявления)
    { }

public:
    int x; // value ^ 2  <-- инициализируется первым
    int y; // value       <-- инициализируется вторым
};
@end

@important Ловушка!
Порядок инициализации определяется **порядком объявления полей**, а не порядком в списке инициализации!
@end

---
@yesScroll
# Семантика указателя и функтор

@columns
@column
\width 55%

**Умный указатель** (перегрузка `*` и `->`):

@code cpp readonly
class MyObjectPtr {
    MyObject* ptr_;
public:
    MyObjectPtr()
        : ptr_(new MyObject()) {}
    ~MyObjectPtr() { delete ptr_; }

    MyObject& operator*() { return *ptr_; }
    MyObject* operator->() { return ptr_; }
};

MyObjectPtr p;
p->foo();
(*p).foo();
@end

@column
\width 45%

**Функтор** (`operator()`):

@code cpp readonly
class Less {
public:
    bool operator()(
        const BigInt& left,
        const BigInt& right) const
    {
        return left < right;
    }
};

Less less;
if (less(3, 5))
    ...
@end

@note note
Функтор — объект, который ведёт себя как функция. Широко используется в STL.
@end

@end

---

@section Виртуальные функции

---

# Сокрытие (Hiding) — проблема

@columns
@column
\width 55%


@code cpp readonly
struct A {
    void foo() {}  // 1
};

struct B : public A {
    void foo() {}  // 2
};

A a;
a.foo();  // Вызвана 1

B b;
b.foo();  // Вызвана 2

A* c = new B();
c->foo(); // Какая будет вызвана?
@end

@column
\width 45%

@warning Early Binding
Будет вызвана **1** (метод A).

Компилятор смотрит на **тип указателя**, а не на реальный объект.

Это **статическое связывание**.
@end

@end

---

# Виртуальные функции — решение

@columns
@column
\width 55%

@code cpp readonly height=420px
struct A {
    virtual void foo() const {} // 1
};

struct B : public A {
    void foo() const override {} // 2
};

A a;
a.foo();  // Вызвана 1 (статическое)

B b;
b.foo();  // Вызвана 2 (статическое)

A* c = new B();
c->foo(); // Вызвана 2 (динамическое!)

const A& d = B();
d.foo();  // Вызвана 2 (динамическое!)
@end

@column
\width 45%

@note Runtime
С ключевым словом **virtual** используется <span style="color:#a855f7">позднее (динамическое) связывание</span> — выбор метода происходит во время выполнения.
@end

@end

---

# virtual / override / final

@columns
@column

**virtual** — объявляет виртуальную функцию

**override** — гарантирует переопределение

**final** — запрещает переопределение

@column

@code cpp readonly height=290px
struct Base {
    virtual void process(int x);
};

struct Derived : Base {
    void process(int x) override;
};

struct Final : Derived {
    void process(int x) final;
};

struct Sealed final { };
struct Bad : Sealed { }; // Ошибка!
@end

@end

@tip Совет
Всегда используйте **override** — если сигнатура базового метода изменится, компилятор выдаст ошибку вместо скрытого бага.
@end

---

# Live Demo: Полиморфизм

@code cpp editable run=cpp width=800px height=300px
#include <iostream>

struct Animal {
    virtual void cry() {
        std::cout << "..." << std::endl;
    }
    virtual ~Animal() {}
};

struct Dog : Animal {
    void cry() override {
        std::cout << "Woof!" << std::endl;
    }
};

struct Cat : Animal {
    void cry() override {
        std::cout << "Meow!" << std::endl;
    }
};

int main() {
    Animal* animals[] = { new Dog(), new Cat() };
    for (auto* a : animals) {
        a->cry();
    }
    for (auto* a : animals) delete a;
    return 0;
}
@end

---
# Полиморфизм «на C»

@columns
@column 
\width 48%

@code cpp readonly height=300px
struct DeviceVFT {
    void (*write)(Device* self,
                  const char* msg);
};

struct Device {
    DeviceVFT vft_;
};

void Device_write(Device* self,
                  const char* msg) {
    self->vft_.write(self, msg);
}
@end

@column
\width 49%

@code cpp readonly height=300px
struct Console {
    DeviceVFT vft_;
    int id_;
};

void Console_write(Device* self,
                   const char* msg) {
    Console* c = (Console*)self;
    printf("Console %d: %s\n",
           c->id_, msg);
}

Device* Console_new(int id) {
    Console* inst = malloc(...);
    inst->vft_.write = Console_write;
    inst->id_ = id;
    return (Device*)inst;
}
@end

@end

@note note Под капотом
Именно так работает полиморфизм в C++ — компилятор генерирует vtable и vptr автоматически.
@end

---

# Таблица виртуальных функций (vtable)

@columns
@column
\width 55%

Если в классе есть **virtual**-метод — каждый объект хранит указатель на vtable.

@code cpp readonly
struct A {
    void foo() {}
    int x;
};

struct B {
    virtual void foo() {}
    int x;
};

sizeof(A) == 4   // только int x
sizeof(B) == 16  // vptr(8) + int(4) + padding(4)
@end

@column
\width 45%

@image assets/lecture2/vftable.jpg width=380

@end

---

# Виртуальный деструктор

@columns
@column
\width 55%

@code cpp readonly
struct A {
    ~A() { std::cout << "A"; }
};

struct B : public A {
    ~B() {
        std::cout << "B";
        delete object_;
    }
    SomeObject* object_;
};

A* a = new B();
delete a;  // Вывод: "A" — утечка!
@end

@column
\width 45%

@important Утечка памяти!
Без **virtual** деструктор `B` не вызван — ресурс `object_` не освобождён!
@end

@style
\marginTop 0.5rem
\bg rgba(34, 197, 94, 0.1)
\borderLeft 3px solid #22c55e
\borderRadius 6px
\padding 0.5rem 0.75rem

**Решение:**

```cpp
struct A {
    virtual ~A() {}
};
```

> Используете наследование? Деструктор — **virtual**!
@end

@end

---

# Чисто виртуальные функции

@code cpp readonly height=280px
class Writer {
public:
    virtual ~Writer() {}
    virtual void write(const char* message) = 0;  // pure virtual
};

class ConsoleWriter : public Writer {
public:
    void write(const char* message) override {
        std::cout << message;
    }
};
@end

@columns
@column

@note note Абстрактный класс
Класс с `= 0` **нельзя** создать напрямую. Наследник обязан реализовать все pure virtual методы.
@end

@column

@note tip Интерфейсы
Абстрактные классы в C++ — аналог **interface** в Java/C#. Определяют контракт без реализации.
@end

@end

---

# Параметры по умолчанию — ловушка

@columns
@column
\width 55%

@code cpp readonly
struct A {
    virtual void foo(int i = 10) {
        std::cout << i;  // 1
    }
};

struct B : public A {
    void foo(int i = 20) override {
        std::cout << i;  // 2
    }
};

A* a = new B();
a->foo();  // Вызвана 2, вывод: 10 (!!)

B* b = new B();
b->foo();  // Вызвана 2, вывод: 20
@end

@column
\width 45%

@warning Ловушка!
Параметры по умолчанию берутся из **типа указателя**, а тело метода — из **реального объекта**.

Избегайте default-параметров в virtual-методах!
@end

@end

---

@section Наследование

---

# Модификаторы доступа при наследовании

@table
| Наследование | public → | protected → | private → |
|---|---|---|---|
| **public** | public | protected | недоступен |
| **protected** | protected | protected | недоступен |
| **private** | private | private | недоступен |
@end

@columns
@column

@style
\bg rgba(59, 130, 246, 0.08)
\borderRadius 6px
\padding 0.5rem 0.75rem

**public** — классическое ООП

`A* a = new B(); // OK`
@end

@column

@style
\bg rgba(239, 68, 68, 0.08)
\borderRadius 6px
\padding 0.5rem 0.75rem

**private** — наследование реализации

`A* a = new B(); // Ошибка!`
@end

@end

---

# Множественное наследование

@columns
@column
\width 55%

@code cpp readonly
struct A {
    virtual ~A() {}
    double x, y;
};

struct B : public A { };
struct C : public A { };

struct D : public B, public C { };

sizeof(A) == 24   // 2*double + vptr
sizeof(D) == 48   // два экземпляра A!
@end

@note warning Дублирование!
Класс D содержит **две копии** полей A: через B и через C. Обращение к `x` неоднозначно: `B::x` или `C::x`?
@end

@column
\width 45%

@image assets/lecture2/classes_diagram_cat.png width=350

@end

---

# Ромбовидное наследование

@columns
@column
\width 55%

@code cpp readonly
struct A {
    virtual ~A() {}
    double x, y;
};

struct B : virtual public A { };
struct C : virtual public A { };

struct D : public B, public C { };

sizeof(D) == 40  // одна копия A!
@end

@note tip Виртуальное наследование
Ключевое слово **virtual** при наследовании гарантирует единственный экземпляр базового класса.
@end

@column
\width 45%

@image assets/lecture2/std-basic_iostream-inheritance.png width=350

Пример из стандартной библиотеки: `std::basic_iostream`

@end

---

@section Итоги лекции 7.1

---

# Итоги

@columns
@column

@style
\bg rgba(59, 130, 246, 0.08)
\borderRadius 8px
\padding 0.75rem 1rem
\border 1px solid rgba(59, 130, 246, 0.3)

### Виртуальные функции

- **virtual** включает динамическое связывание
- **override** защищает от ошибок
- **vtable** — массив указателей на методы
- **vptr** — 8 байт overhead на объект
- Деструктор базового класса — **virtual**!

@end

@column

@style
\bg rgba(168, 85, 247, 0.08)
\borderRadius 8px
\padding 0.75rem 1rem
\border 1px solid rgba(168, 85, 247, 0.3)

### Наследование

- **public** — классическое ООП
- **private** — наследование реализации
- Множественное → дублирование базы
- **virtual** наследование → одна копия
- **final** — запрет наследования

@end

@end

@divider

@style
\align center
\fontSize 1.1rem
\marginTop 0.5rem

В следующей лекции: **layout памяти**, **операторы**, **static** и **принципы дизайна классов**.
@end
