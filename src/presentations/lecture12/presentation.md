@title
# Корутины в C++20
@subtitle Асинхронное программирование и генераторы нового поколения
@badge Лекция 12
@items
- Stackless Coroutines
- co_await, co_yield, co_return
- Promise Object, Coroutine Handle
- std::suspend_always, std::suspend_never
@end

---

@section Основы корутин
@subtitle Функции, которые умеют ставить себя на паузу
@icon ⏳

---

@category Основы
@subtitle Обобщение понятия функции
# Что такое корутина?

**Корутина** — это функция, выполнение которой может быть **приостановлено** (suspend) с сохранением состояния и **возобновлено** (resume) позже.

@badge-row
C++20 Standard | blue
Stackless | green
Zero-overhead | purple
@end

- Сохраняет локальные переменные при приостановке
- Возвращает управление вызывающему коду без уничтожения фрейма
- В C++20 корутины **бесстековые** (stackless) — состояние хранится в куче
- Любая функция, содержащая `co_await`, `co_yield` или `co_return`, становится корутиной

---

@category Основы
# Функция vs Корутина

@diagram
<div style="display:flex; justify-content: space-around; align-items: flex-start; gap: 40px; margin-top: 20px;">
  <div style="border: 2px solid var(--accent-blue); padding: 15px; border-radius: 12px; flex: 1;">
    <div style="text-align:center; font-weight:bold; margin-bottom:10px;">Обычная функция</div>
    <div style="line-height:1.8">
      1. Вызов (Call)<br/>
      2. Выполнение кода<br/>
      3. Возврат (Return)<br/>
      <span style="color:var(--accent-red)">⚠ Стек очищается</span>
    </div>
  </div>
  <div style="font-size: 2em; align-self: center;">➔</div>
  <div style="border: 2px solid var(--accent-green); padding: 15px; border-radius: 12px; flex: 1;">
    <div style="text-align:center; font-weight:bold; margin-bottom:10px;">Корутина</div>
    <div style="line-height:1.8">
      1. Вызов (Invoke)<br/>
      2. <span style="color:var(--accent-yellow)">Приостановка (Suspend)</span><br/>
      3. <span style="color:var(--accent-blue)">Возобновление (Resume)</span><br/>
      4. Завершение (Finalize)
    </div>
  </div>
</div>
@end

@tip
Корутины позволяют писать асинхронный код так, будто он синхронный, избавляя от "Callback Hell".
@end

---

@section Три кита корутин
@subtitle co_await, co_yield и co_return
@icon 🔑

---

@category Ключевые слова
# co_yield — Генераторы

Используется для возврата значения и **приостановки**. Идеально подходит для создания бесконечных последовательностей или ленивых вычислений.

@code cpp
Generator<int> count(int start) {
    for (int i = start; ; ++i) {
        co_yield i; // Возвращаем i и ждём следующего вызова resume()
    }
}

auto g = count(10);
std::cout << g.next(); // 10
std::cout << g.next(); // 11
@end

---

@category Ключевые слова
# co_await — Асинхронность

Приостанавливает корутину до тех пор, пока **ожидаемый объект** (awaitable) не будет готов.

@code cpp
Task<void> processData() {
    auto data = co_await socket.readAsync(); // Корутина засыпает до прихода данных
    std::cout << "Data received: " << data;
    // После пробуждения выполнение продолжается отсюда
}
@end

@tip
co_await не блокирует поток исполнения. Пока корутина "спит", поток может выполнять другие задачи.
@end

---

@section Анатомия корутины
@subtitle Promise, Handle и Awaiter
@icon 🛠

---

@category Архитектура
# Механика корутины

@table
| Компонент | Роль |
| :--- | :--- |
| **Promise Object** | Управляет результатом, исключениями и точками остановки. |
| **Coroutine Handle** | Объект для управления корутиной снаружи (resume, destroy). |
| **Coroutine State** | Объект в куче, хранящий аргументы, переменные и promise. |
| **Awaitable** | Объект, определяющий логику ожидания (ready? suspend? resume?). |
@end

@diagram
<div style="text-align:left; line-height:1.6; border: 1px dashed var(--accent-blue); padding: 15px; border-radius: 12px;">
  <span style="color:var(--accent-purple)">Compiler transforms your code:</span><br/>
  1. Allocate <b>Coroutine State</b> on heap<br/>
  2. Copy parameters to state<br/>
  3. Create <b>Promise Object</b><br/>
  4. <code>co_await promise.initial_suspend()</code>
</div>
@end

---

@category Архитектура
# Интерфейс Promise

Чтобы создать тип корутины, нужно определить внутренний класс `promise_type`.

@code cpp
struct MyTask {
    struct promise_type {
        MyTask get_return_object() { return {}; }
        std::suspend_always initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void unhandled_exception() {}
        void return_void() {}
    };
};
@end

---

@category Архитектура
# Жизненный цикл корутины

@diagram
<div style="font-size: 0.9em; line-height: 1.5;">
  <div style="color:var(--accent-green)">[Start]</div>
  <div style="margin-left: 20px;">↓ promise.get_return_object()</div>
  <div style="margin-left: 20px; border-left: 2px solid var(--accent-blue); padding-left: 10px;">
    ↓ co_await promise.initial_suspend()<br/>
    ↓ <b>Body Execution</b> (co_yield / co_await)<br/>
    ↓ co_await promise.final_suspend()
  </div>
  <div style="color:var(--accent-red)">[Destroy State]</div>
</div>
@end

@badge-row
initial_suspend | blue
yield_value | yellow
return_value | green
@end

---

@section Практический пример
@subtitle Создаем ленивый генератор чисел
@icon 💻

---

@category Практика
# Реализация Generator<T>

@code cpp
template<typename T>
struct Generator {
    struct promise_type {
        T value;
        auto get_return_object() { return Generator{handle_type::from_promise(*this)}; }
        auto initial_suspend() { return std::suspend_always{}; }
        auto final_suspend() noexcept { return std::suspend_always{}; }
        auto yield_value(T v) { value = v; return std::suspend_always{}; }
        void return_void() {}
        void unhandled_exception() { std::terminate(); }
    };

    using handle_type = std::coroutine_handle<promise_type>;
    handle_type h;

    bool next() { h.resume(); return !h.done(); }
    T current() { return h.promise().value; }
};
@end

---

@category Практика
# Использование генератора

@code cpp
Generator<uint64_t> fibonacci() {
    uint64_t a = 0, b = 1;
    while (true) {
        co_yield a;
        auto next = a + b;
        a = b;
        b = next;
    }
}

int main() {
    auto gen = fibonacci();
    for (int i = 0; i < 10; ++i) {
        gen.next();
        std::cout << gen.current() << " ";
    }
}
@end

---

@section Итоги
@subtitle Плюсы, минусы и будущее
@icon 🏁

---

@category Итоги
# Резюме по корутинам

- ✅ **Производительность:** Минимальный оверхед по сравнению с потоками.
- ✅ **Масштабируемость:** Можно запустить миллионы корутин на одном ядре.
- ✅ **Читаемость:** Асинхронный код выглядит как линейный.
- ❌ **Сложность:** Требуется написание большого количества шаблонного кода (Infrastructure).
- ❌ **Аллокации:** Состояние корутины обычно выделяется в куче (хотя компилятор может это оптимизировать).

@tip
В C++23 и выше ожидается появление стандартных библиотечных типов (std::generator, std::task), что упростит их использование.
@end
