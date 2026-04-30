@title
\align center
\fontSize 2.2rem
Многопоточность
Лекция 15. Race condition, std::mutex и т.п.

Разработка приложений на C++
\date{2026}
---

@section Race Condition

---

# Race condition

@columns
\gap 1.5rem
@column
\width 50%

**Вопросики:**

- Что такое race condition?
- Как с ним бороться?
- Что гарантирует стандарт C++ при возникновении race condition?
@column
\width 50%

@image assets/questions.png width=200px
@end

---

# Race condition

@columns
@column
\width 60%
@note Определение
**Race condition** — ситуация, когда результат работы программы зависит от порядка выполнения операций в нескольких потоках.
@end

@divider

@warning Гарантии стандарта
При наличии race condition поведение программы **неопределено** (UB). Стандарт не даёт никаких гарантий о результатах.

@column
\marginTop 1rem
\width 40%

@video assets/cars-movie.mp4 nocontrols


---
@yesScroll
# Пример: параллельная сумма

@code cpp editable run=cpp height=380px
#include <cassert>
#include <thread>
#include <vector>
#include <iostream>

int parallel_sum(const std::vector<int>& v, const unsigned threads_count) {
    const unsigned len = v.size() / threads_count;
    assert(len * threads_count == v.size());

    int rv = 0;

    std::vector<std::thread> threads;
    for (unsigned i = 0; i < threads_count; ++i)
        threads.emplace_back([&](){
            const unsigned start_ix = len * i;
            const unsigned final_ix = len * (i + 1);
            for (unsigned ix = start_ix; ix < final_ix; ++ix)
                 rv += v[ix];
        });

    for (auto& t: threads)
        t.join();

    return rv;
}

int main() {
    const std::vector<int> v(3'000'000, 1);
    std::cout << "sum 1 thr: " << parallel_sum(v, 1) << std::endl;
    std::cout << "sum 3 thr: " << parallel_sum(v, 3) << std::endl;
    return 0;
}
@end

---

# Пример: вывод с race condition

@columns
\gap 1.5rem
@column
\width 48%

**Один из возможных выводов:**

@code sh readonly
sum 1 thr: 3000000
sum 3 thr: 1054551
@end

@column
\width 52%

**Как получается race condition:**

@code cpp readonly height=120px
thread_1:             | thread_2:
    read  rv          |     read  rv
    calc  rv + v[i1]  |     calc  rv + v[i2]
    write rv          |     write rv
@end

@end


@note Почему результат неверный?
Несколько потоков одновременно читают, изменяют и записывают `rv` — операции перемежаются.
@end
---

@section std::mutex

---

# std::mutex

**MUTual EXclusive access primitive**

@columns
\gap 1.5rem
@column
\width 50%

@table noborder width=100%
| Метод | Описание |
| --- | --- |
| `lock()` | Ждать освобождения и захватить |
| `unlock()` | Освободить захваченный mutex |
| `try_lock()` | Попытаться захватить, если свободен |
| `native_handle()` | ОС-специфичный handle |
@end

@column
\width 50%

@note
\padding 0.75rem
`std::mutex` — объект ядра ОС. Его захват дорогостоящий: происходит переключение в kernel space.
@end

@warning Плохая практика
\padding 0.75rem
Никогда не делайте частый доступ к `int` через mutex. Используйте `std::atomic` или уменьшайте число синхронизаций.
@end

@end

---
@yesScroll
# mutex: синхронизация parallel_sum

@code cpp editable run=cpp height=400px
#include <cassert>
#include <thread>
#include <vector>
#include <mutex>
#include <iostream>

int parallel_sum(const std::vector<int>& v, const unsigned threads_count)
{
    const unsigned len = v.size() / threads_count;
    assert(len * threads_count == v.size());

    int rv = 0;
    std::mutex mtx;  // synchronization primitive for |rv|

    std::vector<std::thread> threads;
    for (unsigned i = 0; i < threads_count; ++i)
        threads.emplace_back([i, len, &rv, &v, &mtx](){
            const unsigned start_ix = len * i;
            const unsigned final_ix = len * (i + 1);
            for (unsigned ix = start_ix; ix < final_ix; ++ix)
            {
                mtx.lock();    // acquire resource
                rv += v[ix];
                mtx.unlock();  // release resource
            }
        });

    for (auto& t: threads)
        t.join();

    return rv;
}

int main() {
    const std::vector<int> v(3'000'000, 1);
    std::cout << "sum 1 thr: " << parallel_sum(v, 1) << std::endl;
    std::cout << "sum 3 thr: " << parallel_sum(v, 3) << std::endl;
    return 0;
}
@step
int parallel_sum(const std::vector<int>& v, const unsigned threads_count)
{
    int rv = 0;
    std::mutex mtx;  // synchronization primitive for |rv|

    // ...
        // вас ничего здесь не смущает?
        for (unsigned ix = start_ix; ix < final_ix; ++ix)
        {
            mtx.lock();    // acquire resource
            rv += v[ix];
            mtx.unlock();  // release resource
        }

    // ...
    return rv;
}
@end

---

@section std::lock_guard

---

# std::lock_guard

@columns
\gap 1.5rem
@column
\marginTop 0.5rem
\width 50%
@code cpp readonly
{
    mtx.lock();    // acquire resource
    rv += v[ix];
    mtx.unlock();  // release resource
}
@end

@column
\width 50%
@warning
Парные `lock()/unlock()` — та же проблема, что `new/delete`. При исключении `unlock()` не вызовется.
@end
@end

`std::lock_guard` — RAII-обёртка над `std::mutex::lock/unlock`.

В конструкторе захватывает **mutex**, в деструкторе освобождает.

@columns
\gap 1.5rem
@column
\marginTop 0.5rem
\width 50%
@code cpp readonly
{
    std::lock_guard<std::mutex> guard(mtx);
    rv += v[ix];
}  // release resource
@end

@column
\width 50%
@tip
Всегда используйте `lock_guard` вместо парных `lock/unlock`. Это гарантирует освобождение **mutex** даже при исключении.
@end
@end
---

@yesScroll
# Вариант многопоточного логирования в `std::cout`

@code cpp editable run=cpp height=380px
#include <mutex>
#include <iostream>
#include <vector>
#include <thread>

std::mutex ostream_mutex;

static void print_hello_world()
{
    std::lock_guard<std::mutex> guard(ostream_mutex);
    std::cout << "hello world! (from function)" << std::endl;
}

int main()
{
    std::vector<std::thread> threads;
    for (int i = 0; i < 5; ++i)
        threads.emplace_back(print_hello_world);

    std::lock_guard<std::mutex> guard(ostream_mutex);
    std::cout << "hello world! (from main before threads join)" << std::endl;

    for (auto& thread : threads)
        thread.join();

    std::cout << "hello world! (from main after  threads join)" << std::endl;
    return 0;
}
@end

---

# Вариант многопоточного логирования в `std::cout`

@code cpp readonly
int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 5; ++i) { threads.emplace_back(print_hello_world); }
    {
        std::lock_guard<std::mutex> guard(ostream_mutex);
        std::cout << "hello world! (from main before threads join)" << std::endl;
    } // деструктор std::lock_guard освободит mutex 

    for (auto& thread : threads) { thread.join(); }

    // почему здесь без std::lock_guard?
    std::cout << "hello world! (from main after  threads join)" << std::endl;
    return 0;
}
@step highlight=11:blue
int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 5; ++i) { threads.emplace_back(print_hello_world); }
    {
        std::lock_guard<std::mutex> guard(ostream_mutex);
        std::cout << "hello world! (from main before threads join)" << std::endl;
    } // деструктор std::lock_guard освободит mutex 

    for (auto& thread : threads) { thread.join(); }

    // почему здесь без std::lock_guard?
    std::cout << "hello world! (from main after  threads join)" << std::endl;
    return 0;
}
@end

@fragment
@note После join()
\marginTop -0.5rem
После `join()` ни один дочерний поток уже не работает — синхронизация не нужна.
@end

---

@section Объекты с доступом из нескольких потоков


---
@yesScroll
# Многопоточная очередь: MTQueue

@code cpp readonly
template<typename T>
class MTQueue
{

}
@step
template<typename T>
class MTQueue
{
private:
    std::deque<T> queue;
    std::mutex mtx;
}
@step
template<typename T>
class MTQueue
{
public:
    std::optional<T> pop() {
        std::lock_guard<std::mutex> guard(mtx);
        if (queue.empty())
            return std::nullopt;
        T x = queue.front();
        queue.pop_front();
        return x;
    }
    
private:
    std::deque<T> queue;
    std::mutex mtx;
}
@step
template<typename T>
class MTQueue
{
public:
    std::optional<T> pop();

    void push(T x) {
        std::lock_guard<std::mutex> guard(mtx);
        queue.push_back(std::move(x));
    }
    
private:
    std::deque<T> queue;
    std::mutex mtx;
}
@step
template<typename T>
class MTQueue
{
public:
    std::optional<T> pop();
    void push(T x);

    MTQueue() = default;
    MTQueue(const MTQueue& rhs) {
        std::lock_guard<std::mutex> guard(rhs.mtx);
        queue = rhs.queue;
    }
    MTQueue(MTQueue&& rhs) noexcept {
        std::lock_guard<std::mutex> guard(rhs.mtx);
        queue = std::move(rhs.queue);
    }
    
    ~MTQueue() noexcept {
        std::lock_guard<std::mutex> guard(mtx);
        queue.clear();
    }
private:
    std::deque<T> queue;
    std::mutex mtx;
}
@step highlight=18:red
template<typename T>
class MTQueue
{
public:
    std::optional<T> pop();
    void push(T x);

    MTQueue() = default;
    MTQueue(const MTQueue& rhs) {
        std::lock_guard<std::mutex> guard(rhs.mtx);
        queue = rhs.queue;
    }
    MTQueue(MTQueue&& rhs) noexcept {
        std::lock_guard<std::mutex> guard(rhs.mtx);
        queue = std::move(rhs.queue);
    }
    
    // вопрос: точно ли нам нужен такой деструктор?
    ~MTQueue() noexcept {
        std::lock_guard<std::mutex> guard(mtx);
        queue.clear();
    }
private:
    std::deque<T> queue;
    std::mutex mtx;
}
@step highlight=14:red
template<typename T>
class MTQueue
{
public:
    std::optional<T> pop();
    void push(T x);

    MTQueue() = default;
    MTQueue(const MTQueue& rhs);
    MTQueue(MTQueue&& rhs) noexcept;
    
    // вопрос: точно ли нам нужен такой деструктор?
    ~MTQueue() noexcept {
        std::lock_guard<std::mutex> guard(mtx); // <-- если lock_guard действительно понадобился, программа уже сломана
        queue.clear();
    }
private:
    std::deque<T> queue;
    std::mutex mtx;
}

---

# `std::lock_guard` в деструкторе

@columns
@column
\width 65%
@code 
thread_1:              | thread_2:
    m.~MTQueue()       |     m.push(5)
        lock_guard     |         lock_guard
        queue.clear()  |         queue.push_front(...)
        ~mutex()       |         // mutex уже уничтожен
@end

@column
\width 35%
@warning
Если другой поток работает с этим объектом -- это `use-after-destroy` 
@end
@end

@fragment
\list decimal
- **`unlock()` на мёртвом мьютексе** — после `~MTQueue()` мьютекс уничтожен, второй поток вызовет `unlock()` на разрушенном объекте -> UB
- **Запись в мёртвый контейнер** — если первый поток выиграл гонку, а второй попытается сделать `push_front` в уже разрушенный `std::deque` -> UB
- **Повторный вызов метода** — даже если деструктор дождался завершения `push`, другой поток может снова обратиться к объекту, которого уже нет

---
@yesScroll
# Многопоточная очередь: MTQueue

@code cpp readonly highlight=12:blue,13:blue
template<typename T>
class MTQueue
{
public:
    std::optional<T> pop();
    void push(T x);
    MTQueue() = default;
    MTQueue(const MTQueue& rhs);
    MTQueue(MTQueue&& rhs) noexcept;

    // Присваивание требует блокировки двух объектов — не реализуем
    MTQueue& operator=(const MTQueue&) = delete;
    MTQueue& operator=(MTQueue&&) = delete;
private: 
    std::deque<T> queue;
    std::mutex mtx;
}
@step
template<typename T>
class MTQueue
{
public:
    std::optional<T> pop() {
        std::lock_guard<std::mutex> guard(mtx);
        if (queue.empty())
            return std::nullopt;
        T x = queue.back();
        queue.pop_back();
        return x;
    }

    void push(T x) {
        std::lock_guard<std::mutex> guard(mtx);
        queue.push_front(std::move(x));
    }

    MTQueue() = default;

    MTQueue(const MTQueue& rhs) {
        std::lock_guard<std::mutex> guard(rhs.mtx);
        queue = rhs.queue;
    }

    MTQueue(MTQueue&& rhs) noexcept {
        std::lock_guard<std::mutex> guard(rhs.mtx);
        queue = std::move(rhs.queue);
    }

    // Присваивание требует блокировки двух объектов — не реализуем
    MTQueue& operator=(const MTQueue&) = delete;
    MTQueue& operator=(MTQueue&&) = delete;

private:
    std::deque<T> queue;
    std::mutex mtx;
};
@end

---
@yesScroll

# Многопоточная очередь: MTQueue

@warning Вопрос:
Почему бессмысленно иметь метод `empty`?
@end

@code cpp readonly
template<typename T>
class MTQueue
{
public:
    std::optional<T> pop() {
        std::lock_guard<std::mutex> guard(mtx);
        if (queue.empty())
            return std::nullopt;
        T x = queue.back();
        queue.pop_back();
        return x;
    }

    void push(T x) {
        std::lock_guard<std::mutex> guard(mtx);
        queue.push_front(std::move(x));
    }

    // конструкторы...

private:
    std::deque<T> queue;
    std::mutex mtx;
};
@end

---

# Многопоточная очередь: MTQueue

Рассмотрим такой вариант:

@code cpp readonly
class MTQueue {
    ...;
    bool empty() {
        std::lock_guard<std::mutex> guard(mtx);

        return queue.empty();
    }
    
    T pop() {
        std::lock_guard<std::mutex> guard(mtx);

        T x = queue.back();
        queue.pop_back();
        return x;
    }
}
@end

---

# Многопоточная очередь: MTQueue
И вот такой код, исполняющийся параллельно двумя потоками:

@code cpp readonly
void process_queue(MTQueue& q)   |    void process_queue(MTQueue& q)
{                                |    {
    if (!q.empty())              |        if (!q.empty())
        process_item(q.pop());   |            process_item(q.pop());
}                                |    }
@end

@warning
Что будет, если мы дадим потокам на вход **одну и ту же очередь** с одним элементом?
@end

@fragment
@important Атомарность композиции
`empty()` и `pop()` — два отдельных захвата мьютекса. Между ними другой поток может изменить состояние очереди. Результат `empty()` к моменту вызова `pop()` уже ничего не гарантирует.

---

# Типичные ошибки с синхронизацией

**Поисковый сервис**: поток запросов читает `max_search_result_size`, админский поток меняет его на лету через REST API.

*Найдите ошибку в коде*. Почему это является ошибкой?

@code cpp readonly height=315px
class MTSearcher
{
private:
    std::mutex mtx;
    unsigned max_search_result_size;
   
public:
    unsigned get_max_search_result_size() const noexcept {
        return max_search_result_size;
    }
    
    ...
};
@step
class MTSearcher
{
private:
    std::mutex mtx;
    unsigned max_search_result_size;
   
public:
    unsigned get_max_search_result_size() const noexcept {
        return max_search_result_size;
    }
    
    void set_max_search_result_size(unsigned size) noexcept {
        std::lock_guard<std::mutex> guard(mtx);
        
        max_search_result_size = size;
    }
    
    ...
};
@step highlight=4:blue,9:blue
class MTSearcher
{
private:
    mutable std::mutex mtx;
    unsigned max_search_result_size;
   
public:
    unsigned get_max_search_result_size() const noexcept {
        std::lock_guard<std::mutex> guard(mtx);
        return max_search_result_size;
    }
    
    ...
};
@end

---

# Типичные ошибки с синхронизацией

**Очередь заказов**: UI-поток через `peek()` показывает оператору последний заказ, воркер-поток забирает заказы на обработку. *Найдите ошибку в коде*

@code cpp readonly
template<typename T>
class MTQueue
{
private:
    std::mutex mtx;
    std::queue<std::shared_ptr<T>> queue;

public:
    std::shared_ptr<T>& peek() noexcept {
        std::lock_guard<std::mutex> guard(mtx);
        return queue.back();
    }
};
@step highlight=9:red
template<typename T>
class MTQueue
{
private:
    std::mutex mtx;
    std::queue<std::shared_ptr<T>> queue;

public:
    std::shared_ptr<T>& peek() noexcept {
        std::lock_guard<std::mutex> guard(mtx);
        return queue.back();
    }
};
@end

---

# Типичные ошибки с синхронизацией

Допустим есть два потока:

@columns
@column
\width 50%
@code cpp readonly
// thread 1:
mt_queue.peek() = nullptr;
// thread 2:
std::cout << *mt_queue.peak();
@end
@column
\width 50%
@warning
\marginTop -0.4rem
\marginLeft -0.5rem
Оба потока держат ссылку на один и тот же `shared_ptr<T>` **внутри** контейнера. 
@end
@end

@columns
\gap 1rem
@column
\width 50%
@code cpp readonly
// Плохо: ссылка утекает наружу
std::shared_ptr<T>& peek() noexcept
{
    std::lock_guard<std::mutex> guard(mtx);
    return queue.back(); // ссылка
}
@end
@column
\width 50%
@code cpp readonly
// Хорошо: defensive copy
std::shared_ptr<T> peek() noexcept
{
    std::lock_guard<std::mutex> guard(mtx);
    return queue.back(); // копия
}
@end
@end

@important
\marginTop -0.25rem
Если вы видите метод многопоточного класса, возвращающий `T&` или `T*` — это почти всегда баг.

---

# Типичные ошибки с синхронизацией

**Игровой сервер**: `cur_volume_` — текущее HP, `max_volume_` — максимальное.

**Инвариант**: `cur_volume_ <= max_volume_`, иначе клиент крашится.

@code cpp readonly height=340px
class MTJuiceBottle
{
public:
    float get_cur_volume() const {
        std::lock_guard guard(mtx_);
        return cur_volume_;
    }
    
    void set_cur_volume(const float value) {
        std::lock_guard guard(mtx_);
        cur_volume_ = value;
    }
    
    float get_max_volume() const {
        std::lock_guard guard(mtx_);
        return max_volume_;
    }
    
    void set_max_volume(const float value) {
        std::lock_guard guard(mtx_);
        max_volume_ = value;
    }

private:
    float cur_volume_;
    float max_volume_;
    mutable std::mutex mtx_;
};
@end

---

# Типичные ошибки с синхронизацией

В это время два потока вызывают методы:

@code cpp readonly
// thread 1:
bottle.set_max_volume(100);
bottle.set_cur_volume(50);

// thread 2:
bottle.set_cur_volume(25);
bottle.set_max_volume(25);
@step highlight=2:blue,3:blue,6:red,7:red,
// thread 1:
bottle.set_max_volume(100);
bottle.set_cur_volume(50);   // инвариант: cur <= max

// thread 2:
bottle.set_cur_volume(25);
bottle.set_max_volume(25);   // между вызовами: cur=50, max=25 — нарушение!
@end

@fragment
```
thread 1:                        thread 2:
  set_max_volume(100)  → ok
                                   set_cur_volume(25)  → ok
                                   set_max_volume(25)  → ok
  set_cur_volume(50)   → ok
```
@end

---

# Типичные ошибки с синхронизацией

@warning
\marginBottom -0.5rem
Методы `set_cur_volume` и `set_max_volume` атомарны, но их **композиция** -- нет.
@end 
@fragment
Нужен метод, который меняет оба поля за раз:
@code cpp readonly
void set_volumes(float cur, float max) {
    std::lock_guard guard(mtx_);
    if (cur > max)
        throw std::invalid_argument("cur > max");
    cur_volume_ = cur;
    max_volume_ = max;
}
@end

@fragment
@tip Рекомендация:
\marginTop -0.75rem
**Минимизируйте** число классов и объектов в программе, поддерживающих многопоточный доступ. Классы с поддержкой многопоточности сложнее проектировать и сложнее в использовании.
@end
---

@section Deadlock

---

# Deadlock

@columns
\gap 1.5rem
@column
\width 55%

**Классический deadlock (взаимная блокировка):**

@code cpp readonly
std::mutex m1;
std::mutex m2;

void worker_1() {
    std::lock_guard guard1(m1);
    std::lock_guard guard2(m2);
    // ...
}
void worker_2() {
    std::lock_guard guard2(m2);
    std::lock_guard guard1(m1);
    // ...
}         
@end
@column
\width 45%
\marginTop 1.8rem
@image assets/deadlock.png 

@divider #00000000

@warning Вопрос
<-- Как это починить?
@end
@end

---

# Deadlock

**Решение — единый порядок захвата:**

@columns
@column
\width 50%
@code cpp readonly
void worker_1() {
    std::lock_guard guard1(m1);
    std::lock_guard guard2(m2);
    // ...
}
void worker_2() {
    std::lock_guard guard1(m1);
    std::lock_guard guard2(m2);
    // ...
}
@end

@column
\width 50%
@tip Минимальный deadlock
\marginTop -1rem
\padding 0.75rem
Одного потока и одного мьютекса достаточно:

@code cpp readonly
std::mutex m;
m.lock();
m.lock(); // UB (чаще всего зависание)
@end

@divider #00000000
@divider
@note Правило
\padding 0.75rem
Всегда захватывайте несколько мьютексов в **одном и том же порядке** во всём коде.
@end
---

@section std::scoped_lock

---

# scoped_lock: захват нескольких мьютексов

Не всегда можно определить правильный порядок захвата. Например, `operator=` у MTQueue:

@columns
@column
\width 60%
@code cpp readonly height=380px
class MTQueue
{
private:
    std::mutex mtx;
    std::queue<T> queue;
public:
    MTQueue& operator=(const MTQueue& rhs) {
        if (this != &rhs) {
            // что блокировать первым?
            // std::lock_guard guard_1(mtx);
            // std::lock_guard guard_2(res.mtx);
            queue = rhs.queue;
        }
        return *this;
    }
};
@end

@column
\width 40%
@code cpp readonly
MTQueue<int> q1;
MTQueue<int> q2;

// thread 1:
q2 = q1;

// thread 2:
q1 = q2;
@end
@image assets/think.jpg width=180px

---

# scoped_lock: захват нескольких мьютексов

Аналогично с оператором сравнения `operator==`:

@columns
@column
\width 60%
@code cpp readonly
bool operator == (const MTQueue& lhs, const MTQueue& rhs)
{
    // что блокировать первым?
    // std::lock_guard guard_1(lhs.mtx);
    // std::lock_guard guard_2(rhs.mtx);
    return lhs.queue == rhs.queue;
}
@end

@column
\width 40%
@code cpp readonly
MTQueue<int> q1;
MTQueue<int> q2;

// thread 1:
q1 == q2

// thread 2:
q2 == q1
@end
@end

@columns
@column
\width 60%

@column
\width 40%
@image assets/shleppantsy.jpg width=180px

---

# scoped_lock: захват нескольких мьютексов

Решается с помощью `std::scoped_lock`:

@columns
@column
\width 50%
@code cpp readonly height=220px
bool operator == (const MTQueue& lhs, const MTQueue& rhs) 
{
    std::scoped_lock guard(lhs.mtx, rhs.mtx);

    return lhs.queue == rhs.queue;
}
@end
@column
\width 50%
@code cpp readonly
MTQueue& operator=(const MTQueue& rhs) {
    if (this != &rhs) 
    {
        std::scoped_lock guard(mtx, rhs.mtx);
        queue = rhs.queue;
    }
    return *this;
}
@end
@end

@code cpp readonly height=110px
// Эквивалентно — scoped_lock сам разберётся:
std::scoped_lock guard_1{m1, m2};  // thread 1
std::scoped_lock guard_2{m2, m1};  // thread 2
// Блокирования потоков не приведут к deadlock 
@end

---

@section std::condition_variable

---

# condition_variable: уведомления между потоками

`std::condition_variable` позволяет одному потоку сообщить другому, что произошло событие.

@columns
\gap 1rem
@column
\width 48%

**Методы:**

@table noborder width=100%
| Метод | Описание |
| --- | --- |
| `notify_one()` | Разбудить один поток |
| `notify_all()` | Разбудить все потоки |
| `wait(lock)` | Ждать нотификации (может проснуться сам!) |
| `wait(lock, pred)` | Ждать, пока `pred` не станет `true` |
@end

@image assets/huh-what.gif width=150px

@column
\width 52%

@note Принцип
\padding 0.6rem
Всегда есть тройка: `std::mutex` + условие (переменная) + `std::condition_variable`. Условие проверяется только под мьютексом.
@end

@tip unique_lock
\padding 0.6rem
`condition_variable` работает только с `std::unique_lock<std::mutex>`. Для других типов мьютексов — `condition_variable_any`.
@end

@end

---

# condition_variable: пример

Если запустить код, то все работает, **но здесь есть проблема:**

@code cpp readonly height=380px
std::mutex m;
std::condition_variable cv_ready, cv_compl;
std::string data;
bool is_inp_ready = false;
bool is_completed = false;
void worker_function() {
    std::unique_lock lk(m);
    std::cout << "[worker] waiting for data...\n";
    cv_ready.wait(lk, []{ return is_inp_ready; }); // mutex захвачен, данные готовы
    std::cout << "[worker] got data: " << data << "\n";

    std::transform(data.begin(), data.end(), data.begin(), ::toupper);
    std::cout << "[worker] transformed data: " << data << "\n";
    is_completed = true;

    std::cout << "[worker] done, notifying main\n";
    cv_compl.notify_one();
}

int main() {
    std::thread thr(worker_function);
    std::cin >> data;

    {
        std::lock_guard guard(m);
        is_inp_ready = true;
    }
    std::cout << "[main] input is ready, notifying worker" << "\n";
    cv_ready.notify_one();

    {
        std::unique_lock lk(m);
        cv_compl.wait(lk, []{ return is_completed; });
        std::cout << "[main] transformed input: " << data << "\n";
    }

    thr.join();
}
@end

---

# condition_variable: исправленный пример

@code cpp readonly height=380px highlight=17:blue
std::mutex m;
std::condition_variable cv_ready, cv_compl;
std::string data;
bool is_inp_ready = false;
bool is_completed = false;
void worker_function() {
    std::unique_lock lk(m);
    std::cout << "[worker] waiting for data...\n";
    cv_ready.wait(lk, []{ return is_inp_ready; }); // mutex захвачен, данные готовы
    std::cout << "[worker] got data: " << data << "\n";

    std::transform(data.begin(), data.end(), data.begin(), ::toupper);
    std::cout << "[worker] transformed data: " << data << "\n";
    is_completed = true;

    std::cout << "[worker] done, notifying main\n";
    lk.unlock();           // !избегаем лишних переключений!
    cv_compl.notify_one();
}

int main() {
    std::thread thr(worker_function);
    std::cin >> data;

    {
        std::lock_guard guard(m);
        is_inp_ready = true;
    }
    std::cout << "[main] input is ready, notifying worker" << "\n";
    cv_ready.notify_one();

    {
        std::unique_lock lk(m);
        cv_compl.wait(lk, []{ return is_completed; });
        std::cout << "[main] transformed input: " << data << "\n";
    }

    thr.join();
}
@end

---

@section А что там с Мандельбротом?
---

@section std::recursive_mutex

---

# recursive_mutex

Иногда в одном потоке мьютекс захватывается повторно — через цепочку вызовов:

@columns
\gap 1rem
@column
\width 55%
@code cpp readonly height=380px highlight=13:red,18:green
class TasksQueue {
public:
    void push(Task task) {
        std::lock_guard guard(mtx);
        tasks_queue.emplace_back(std::move(task));
    }

    void pop_and_run() {
        std::lock_guard guard(mtx);
        if (!tasks_queue.empty()) {
            const auto task = std::move(tasks_queue.back());
            tasks_queue.pop_back();
            task();  // <- task может вызвать push() -> deadlock с std::mutex!
        }
    }

private:
    std::recursive_mutex mtx;  // решение: счётчик захватов
    std::queue<Task> tasks_queue;
};
@end
@column
\width 45%


@note Как работает
\padding 0.6rem
`recursive_mutex` хранит счётчик. Каждый `lock` +1, каждый `unlock` -1. Освобождается при счётчике = 0.
@end

@tip Альтернатива
\padding 0.6rem
Можно вынести `task()` за пределы критической секции — тогда хватит одного `std::mutex`.
@end

@end

---

@section thread_local

---

# thread_local

`thread_local` делает переменную глобальной в рамках одного потока. У каждого потока — своя копия.

@code cpp readonly
int func()
{
    thread_local unsigned i = 0;
    ++i;
    // в каждом потоке будет своя личная глобальная переменная i,
    // которая будет равна числу вызовов функции |func| на этом потоке
    
    ...;
}
@end

---

# Примеры использования thread_local

@code cpp readonly
std::string convert_to_string(const int number)
{
    // кеш памяти для конвертации, чтобы избежать частых переаллокаций
    thread_local std::string data_cache;
    
    // не нужно синхронизаций потоков для |data_cache|, т.к. у каждого
    // потока свой личный |data_cache|.
    convert_to_cached_location(data_cache, number);
    
    return data_cache;    
}
@end

@fragment
@warning Замечание:
Cконвертировать число в строку можно и другими более быстрыми способами.
@end

---

# Плюсы и минусы использования thread_local


@columns
@column
\width 50%
**Плюсы:**

- Потокобезопасные глобальные кеши без мьютексов

@column
\width 50%
**Минусы:**

- Создание потока дороже: для каждого нового потока вызываются конструкторы всех `thread_local` переменных — включая те, что в сторонних библиотеках.

- На старых ОС (Windows XP без SP3) `thread_local` молча становится `static` — программа ловит race condition без предупреждений.
@end

---

@section Резюме

---

# Резюме

- `std::mutex` - один из вариантов избавления от race condition
- захватывать и освобождать `std::mutex` желательно через RAII: `std::lock_guard`
- объекты с многопоточным доступом требуют более тщательной проработки дизайна
- `std::scoped_lock` как вариант лечения deadlock
- `std::recursive_mutex` поможет, если нужно std::mutex захватить больше одного раза в одном потоке
- `std::conditional_variable` - примитив синхронизации лоя нотификации других потоков о событиях (помните о spurios wakeups)
- `thread_local` - глобальные данные, видимые для одного потока (у каждого потока свои)

@fragment
@tip Главное правило
\padding 0.75rem
Минимизируйте число классов и объектов с многопоточным доступом. Они сложнее в проектировании и использовании.
@end
