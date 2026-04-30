@title
# Unit-тестирование на C++
@subtitle От «у меня работает» к «у меня гарантированно работает»
@badge C++ · Unit Testing
@items
- Visual Studio Test Framework
- Google Test / Catch2
- Паттерн AAA
- CI/CD · Coverage
@end

---

@category Основы
# Что такое unit-тест?

- **Unit** = минимальная часть программы (функция / метод / класс)
- **Тест** = автоматизированная проверка ожидаемого поведения
- **Изолированность** — зависимости заменяются заглушками (mocks/stubs)
- **Детерминированность** — один и тот же результат при каждом запуске
- **Скорость** — каждый тест выполняется менее 100 мс

@tip
⚠️ Unit-тест НЕ проверяет UI, базу данных или сеть. Только бизнес-логику.
@end

---

@category Мотивация
# Зачем это нужно?

- 🐛 **Ловля багов на этапе написания** — дешевле в 10–100× по сравнению с продакшеном
- 🛡️ **Безопасный рефакторинг** — упавший тест сразу сигнализирует о регрессии
- 📖 **Живая документация** — тест показывает, как правильно использовать API
- 🔄 **Обязательное условие для CI/CD** — без зелёных тестов мёрж заблокирован
- 📊 **Code review** — тесты упрощают понимание намерений автора

@tip
По данным исследований 2026 года: более 68% компаний требуют покрытие >70% для бизнес-логики.
@end

---

@category Настройка среды
# Что установить в Visual Studio

1. Открыть **Visual Studio Installer** → выбрать workload `Разработка классических приложений на C++`
2. В разделе «Дополнительные компоненты» отметить `Адаптер тестов для Google Test`
3. **Перезапустить** IDE после установки

@badge-row
MSVC Test Framework | blue
Google Test | green
Catch2 (vcpkg) | cyan
Boost.Test (опц.) | purple
@end

---

@category Настройка проекта
# Создание тестового проекта

@columns
@column
- **Файл → Создать → Native Unit Test Project**
- Открыть свойства нового проекта
- **Ссылки → Добавить ссылку** на основной проект решения
- В тестовом файле добавить заголовок основного проекта

@tip
Тестовый проект компилируется отдельно и линкуется с основным кодом — это гарантирует изоляцию.
@end

@column
@code cpp
#include "pch.h"
#include "CppUnitTest.h"

// Подключаем тестируемый модуль
#include "..\\MyProject\\Calculator.h"

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace CalculatorTests {
    TEST_CLASS(CalculatorTests) {
        // методы тестов здесь
    };
}
@end
@end

---

@category Архитектура теста
# Структура теста: паттерн AAA

@columns
@column
- 🔧 **Arrange** — подготовка данных, объектов и зависимостей
- ⚡ **Act** — вызов тестируемого метода / функции
- ✅ **Assert** — сравнение фактического результата с ожидаемым

@column
@code cpp
TEST_METHOD(MethodName_Scenario_Expected) {
    // Arrange
    Calculator calc;
    int a = 3, b = 5;
    int expected = 8;

    // Act
    int actual = calc.Add(a, b);

    // Assert
    Assert::AreEqual(expected, actual);
}
@end
@end

---
@yesScroll
@category Примеры кода
# Пример 1: Базовый тест

@code cpp
TEST_CLASS(CalculatorTests) {
public:
    // Именование: Метод_Сценарий_ОжидаемыйРезультат
    TEST_METHOD(Add_PositiveNumbers_ReturnsSum) {
        // Arrange
        Calculator calc;
        int a = 3, b = 5, expected = 8;

        // Act
        int result = calc.Add(a, b);

        // Assert
        Assert::AreEqual(expected, result);
    }

    TEST_METHOD(Add_NegativeAndPositive_ReturnsCorrectSum) {
        Calculator calc;
        Assert::AreEqual(-2, calc.Add(-5, 3));
    }

    TEST_METHOD(Add_Zeros_ReturnsZero) {
        Calculator calc;
        Assert::AreEqual(0, calc.Add(0, 0));
    }
};
@end

---
@yesScroll
@category Примеры кода
# Пример 2: Граничные случаи и исключения

@code cpp
TEST_CLASS(CalculatorDivisionTests) {
public:
    // Деление на ноль → ожидаем исключение
    TEST_METHOD(Divide_ByZero_ThrowsInvalidArgument) {
        // Arrange
        Calculator calc;

        // Act + Assert (лямбда захватывает calc по ссылке)
        Assert::ExpectException<std::invalid_argument>([&]() {
            calc.Divide(10.0, 0.0);
        });
    }

    // Граничный случай: деление единицы на единицу
    TEST_METHOD(Divide_OneByOne_ReturnsOne) {
        Calculator calc;
        const double eps = 1e-9;
        Assert::AreEqual(1.0, calc.Divide(1.0, 1.0), eps);
    }

    // Отрицательное деление
    TEST_METHOD(Divide_NegativeByPositive_ReturnsNegative) {
        Calculator calc;
        Assert::IsTrue(calc.Divide(-10.0, 2.0) < 0.0);
    }
};
@end

@tip
Тестирование ошибочных путей так же важно, как тестирование успешных. Непроверенный exception = скрытый баг.
@end

---

@category Справочник
# Полный разбор проверок (Assertions)

@table
| Категория | Метод Assert:: | Применение |
| Равенство | `AreEqual(exp, act)` | int, char, enum, строки |
| Неравенство | `AreNotEqual(exp, act)` | Проверка различий |
| Идентичность ссылок | `AreSame(ptr1, ptr2)` | Один объект в памяти |
| Null-проверки | `IsNull / IsNotNull(ptr)` | Указатели и умные указатели |
| Логические флаги | `IsTrue / IsFalse(cond)` | bool-выражения |
| Вещественные числа | `AreEqual(exp, act, eps)` | **Всегда с epsilon!** |
| Ожидание исключений | `ExpectException<T>([&]{...})` | Гарантия выброса T |
| Принудительный провал | `Fail(L"message")` | Недостижимая ветка кода |
| Тест не готов | `Inconclusive(L"reason")` | Пункт-заглушка в чек-листе |
@end

@tip
💡 Для float/double НИКОГДА не используйте AreEqual без eps — числа с плавающей точкой редко равны точно.
@end

---
@yesScroll
@category Архитектура
# Организация тестового кода

@columns
@column
- **TEST_CLASS_INITIALIZE** — выполняется *один раз* перед всеми тестами класса
- **TEST_CLASS_CLEANUP** — выполняется *один раз* после всех тестов класса
- **TEST_METHOD_INITIALIZE** — перед *каждым* тестом
- **TEST_METHOD_CLEANUP** — после *каждого* теста
- Один тест = **одна проверка**. Не смешивай сценарии.

@tip
Порядок запуска тестов не должен влиять на результат — каждый тест обязан быть независимым.
@end

@column
@code cpp
TEST_CLASS(StackTests) {
    Stack<int>* stack;   // общий ресурс

public:
    // Создаём перед каждым тестом
    TEST_METHOD_INITIALIZE(SetUp) {
        stack = new Stack<int>();
    }

    // Освобождаем после каждого теста
    TEST_METHOD_CLEANUP(TearDown) {
        delete stack;
        stack = nullptr;
    }

    TEST_METHOD(Push_OneItem_SizeIsOne) {
        stack->push(42);
        Assert::AreEqual(1u, stack->size());
    }
};
@end
@end

---

@category Процесс
# Внедрение в рабочий процесс

- 🔄 **Запускать тесты до каждого коммита** — red тест блокирует push в защищённую ветку
- 📊 **Coverage ≥80%** для модулей бизнес-логики (OpenCppCoverage / gcovr)
- 🔴 **Падение теста = баг или устаревший тест**. Никогда не игнорируй красный.
- 🛠️ **Частые ошибки:** тест приватных методов напрямую, зависимость от времени / random, глобальный стейт
- 🧩 **Трудный тест → сигнал рефакторинга**: функция делает слишком много

@badge-row
Pre-commit hook | blue
GitHub Actions | green
OpenCppCoverage | cyan
SonarQube Gate | orange
@end

---

@category Практика
# Практическое задание

@columns
@column
Реализовать шаблонный класс `Stack<T>` с методами:
- → `push(T value)` — добавить элемент
- → `pop()` — удалить верхний элемент
- → `top()` → T — вернуть верхний элемент
- → `empty()` → bool — проверить пустоту
- → `size()` → size_t — размер стека

@tip
Сдать через Pull Request с зелёными тестами и coverage ≥90% для файла Stack.h.
@end

@column
**Написать 5 тестов:**
- ✅ push + top возвращает правильное значение
- ✅ pop уменьшает размер
- ❗ top на пустом стеке → `std::underflow_error`
- ❗ pop на пустом стеке → `std::underflow_error`
- ✅ empty() = true для нового стека

@badge-row
≥90% coverage | green
Зелёный CI | cyan
PR + review | purple
@end
@end

---

@category Итоги
# Итоги и ресурсы

- ✅ **Тесты — страховка, а не бюрократия.** Они экономят часы отладки.
- ✅ **Покрывай то, что может сломаться** — бизнес-логику, алгоритмы, граничные случаи
- ✅ **Паттерн AAA** делает тесты читаемыми для всей команды
- 📚 **xUnit Test Patterns** — Gerard Meszaros (классика)
- 📚 **The Art of Unit Testing** — Roy Osherove (практика)
- 🔗 Шаблон репозитория · Чек-лист именования · Видео-разбор домашки

@badge-row
Unit Testing | blue
AAA Pattern | green
VS Test Framework | cyan
CI/CD Ready | orange
Coverage ≥80% | purple
@end

@tip
Вопросы? Приносите код домашнего задания — разберём тесты вместе.
@end
