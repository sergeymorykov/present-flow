@title
# Полиморфизм в C++
Курс по разработке приложений
\date{2026}

---

@section Что такое полиморфизм?

---

# Определение

Полиморфизм — способность объектов **разных классов**
реагировать на одни и те же методы по-разному.

Базовая формула в теории типов: $\forall T. \, f : T \to T$

@fragment
> Один интерфейс — множество реализаций
@end

---

# Виды полиморфизма

@table(noborder)
| Вид | Время | Механизм |
|---|---|---|
| Статический | Компиляция | Перегрузка, шаблоны |
| Динамический | Runtime | Виртуальные функции |
@end

---

# Статический полиморфизм

@columns
@column
**Перегрузка функций:**

Компилятор выбирает нужную версию по типу аргумента во время компиляции.

@column
**Шаблоны (Templates):**

```cpp
template<typename T>
T max(T a, T b) {
    return a > b ? a : b;
}
```
@end

---

# Динамический полиморфизм

Базовый класс с виртуальным методом:

```cpp
class Animal {
public:
    virtual void makeSound() {
        std::cout << "..." << std::endl;
    }
    virtual ~Animal() {}
};

class Dog : public Animal {
public:
    void makeSound() override {
        std::cout << "Woof!" << std::endl;
    }
};
```

Ключевое слово `override` защищает от опечаток в сигнатуре.

---

# Live Demo: C++

Измени код и запусти:

@code cpp editable run=cpp
#include <iostream>
#include <string>

class Animal {
public:
    virtual void makeSound() {
        std::cout << "..." << std::endl;
    }
    virtual ~Animal() {}
};

class Dog : public Animal {
public:
    void makeSound() override {
        std::cout << "Woof!" << std::endl;
    }
};

class Cat : public Animal {
public:
    void makeSound() override {
        std::cout << "Meow!" << std::endl;
    }
};

int main() {
    Animal* animals[] = { new Dog(), new Cat() };
    for (Animal* a : animals) {
        a->makeSound();
    }
    for (Animal* a : animals) delete a;
    return 0;
}
@end

---

# vtable — под капотом

Как реализован динамический полиморфизм:

$$\text{vtable}[i] \rightarrow \text{метод}_i$$

@table(noborder)
| Операция | Обычный вызов | Виртуальный |
|---|---|---|
| Разрешение | Compile-time | Runtime |
| Доп. память | 0 | 1 указатель/объект |
| Накладные расходы | нет | ~1-2 такта |
@end

---

@section Итоги

---

# Вывод

@columns
@column
**Когда использовать:**

- Иерархия классов с общим интерфейсом
- Плагины и расширяемые системы
- Паттерны Strategy, Observer, Factory

@column
**Лучшие практики:**

- Предпочитай `override` явному `virtual`
- Используй умные указатели (`unique_ptr`)
- Деструктор базового класса — `virtual`
@end
