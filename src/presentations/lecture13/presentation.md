@title
\align center
\fontSize 2.2rem
Многопоточность
Лекция 13. Процессы, потоки, std::thread

Разработка приложений на C++
\date{2026}

---

@section Процессы и потоки

---

# Процессы и потоки

[Wikipedia](https://en.wikipedia.org/wiki/Thread_(computing)):
@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\marginTop -1rem
\borderLeft 4px solid #38bdf8
\border 1px solid #334155
\borderRadius 8px
**Thread of execution** — the smallest *sequence of programmed instructions* that can be managed independently by a *scheduler*, which is typically a part of the *operating system*
@end

Таненбаум, Современные операционные системы, гл. 2:
@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\marginTop -1rem
\borderLeft 4px solid #38bdf8
\border 1px solid #334155
\borderRadius 8px
**Процесс** — абстракция, описывающая выполняющуюся программу
@end

[Wikipedia](https://en.wikipedia.org/wiki/Process_(computing)):
@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\marginTop -1rem
\borderLeft 4px solid #38bdf8
\border 1px solid #334155
\borderRadius 8px
**Process** — the *instance of a computer program* that is being executed by one or many threads
@end

---

# Программа из одного потока

@code cpp readonly
#include <cstdio>

int main() {
    std::puts("hello world!\n");
    return 0;
}
@end

@code sh readonly
$ ./hello_world.exe  # ОС порождает процесс → 1 поток → поток умирает → процесс умирает
hello world!
$ ./hello_world.exe  # каждый запуск — новый процесс
hello world!
@end

@fragment
@note Замечание
В наше время серьёзные приложения уже используют несколько процессов.
@end

---

# Потоки в рамках одного процесса

Поток, который выполняет `main`, называется **главным**.

Любой поток (в том числе главный) может порождать другие потоки:

@code cpp readonly
#include <cstdio>

void print_hello_world() {
    std::puts("hello world!\n");
}

void thread_worker() {
    print_hello_world();
    print_hello_world();
    print_hello_world();
}
@step
int main() {
    std::puts("hello world!\n");

    // Псевдокод:
    CREATE THREAD TO RUN (thread_worker);
    CREATE THREAD TO RUN (thread_worker);
    CREATE THREAD TO RUN (print_hello_world);
    ...

    return 0;
}
@end

---

# Вопросы для обсуждения

@columns
@column
\width 60%
- Сколько `main`-ов в одном процессе? В одном потоке? Во всех потоках?
@column
\width 30%
@image assets/question-dude.png
---

# Вопросы для обсуждения

@columns
@column
\width 60%
- Сколько `main`-ов в одном процессе? В одном потоке? Во всех потоках?
- Как разделяется память в процессах и потоках?
@column
\width 30%
@image assets/question-dude.png

---

# Вопросы для обсуждения

@columns
@column
\width 60%
- Сколько `main`-ов в одном процессе? В одном потоке? Во всех потоках?
- Как разделяется память в процессах и потоках?
- Как передавать данные между потоками? Между процессами?
@column
\width 30%
@image assets/question-dude.png
---

# Вопросы для обсуждения

@columns
@column
\width 60%
- Сколько `main`-ов в одном процессе? В одном потоке? Во всех потоках?
- Как разделяется память в процессах и потоках?
- Как передавать данные между потоками? Между процессами?
- Сколько стеков в многопоточном приложении?
@column
\width 30%
@image assets/question-dude.png
---

# Вопросы для обсуждения

@columns
@column
\width 60%
- Сколько `main`-ов в одном процессе? В одном потоке? Во всех потоках?
- Как разделяется память в процессах и потоках?
- Как передавать данные между потоками? Между процессами?
- Сколько стеков в многопоточном приложении?
- Что такое context switch?
@column
\width 30%
@image assets/question-dude.png
---

# Вопросы для обсуждения

@columns
@column
\width 60%
- Сколько `main`-ов в одном процессе? В одном потоке? Во всех потоках?
- Как разделяется память в процессах и потоках?
- Как передавать данные между потоками? Между процессами?
- Сколько стеков в многопоточном приложении?
- Что такое context switch?
- Сколько процессов может быть у одного приложения?
@column
\width 30%
@image assets/question-dude.png

---

@section std::thread

---

# Потоки. std::thread

[Потоки стандартной библиотеки (с **C++11**):](https://en.cppreference.com/w/cpp/thread/thread)

@code cpp readonly
#include <iostream>
#include <thread>

int main() {
    std::thread thr([](){
        std::cout << "hello";
        std::cout << " ";
        std::cout << "world!";
        std::cout << std::endl;
    });

    std::cout << "run, Forest, run!" << std::endl;
    std::cout << "run, Forest, run!" << std::endl;

    return 0;
}
@end

---

# join и detach

@columns
@column
\width 70%
Если вызывается деструктор `std::thread`, а поток не закончил работу — вызывается `std::terminate`.
@column
\width 20%
@video assets/meme-vaporized.mp4 height=200px nocontrols
@end

@divider

Два варианта поведения потока до деструктора:

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(34, 197, 94, 0.12)
\borderLeft 4px solid #22c55e
\padding 1rem
\borderRadius 8px
**`join`** — дождаться завершения потока
@end

@column
\width 50%

@style
\bg rgba(239, 68, 68, 0.12)
\borderLeft 4px solid #ef4444
\padding 1rem
\borderRadius 8px
**`detach`** — отпустить поток в свободное плавание
@end

@end

---
@yesScroll
# Пример с join

@code cpp editable run=cpp
#include <iostream>
#include <thread>

int main() {
    std::thread thr([](){
        std::cout << "hello";
        std::cout << "_";
        std::cout << "world!";
        std::cout << std::endl;
    });

    std::cout << "run, Forest, run!" << std::endl;
    thr.join();  // ждём завершения thr
    std::cout << "run, Forest, run!" << std::endl;

    return 0;
}
@end

---

@yesScroll
# Пример с detach

@code cpp editable run=cpp
#include <iostream>
#include <thread>

int main() {
    std::thread thr([](){
        std::cout << "hello";
        std::cout << " ";
        std::cout << "world!";
        std::cout << std::endl;
    });

    std::cout << "run, Forest, run!" << std::endl;
    thr.detach();  // отпускаем thr
    std::cout << "run, Forest, run!" << std::endl;

    return 0;
}
@end

---

@yesScroll
# Несколько потоков

@code cpp editable run=cpp
#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([](){
            std::cout << "hello world!" << std::endl;
        });
    }

    for (auto& thread : threads)
        thread.join();

    return 0;
}
@end

---

@section Чё б сделать такое

---

# Множество Мандельброта

В качестве примера параллельных вычислений возьмем построение множества Мандельброта.

**Идея**: для каждого пикселя экрана проверяем, уходит ли последовательность $z_{n+1} = z_n^2 + c$ в бесконечность. Каждый пиксель — независимое вычисление.


@image assets/mandelbrot_set.png width=500px


---

@yesScroll

# Однопоточная версия

@code cpp readonly showLines
// Инициализируем переменные
constexpr int screenWidth = 800;
constexpr int screenHeight = 450;
constexpr int maxIterations = 333;
constexpr float max2 = 4.0f * 4.0f;
@step
int main() {
    // ...
    // Проверяем должно ли закрыться окно
    while (!WindowShouldClose()) {
        // ...
    }
    // ...
    return 0;
}
@step
int main() {
    // ...
    while (!WindowShouldClose()) {
        // Для каждого пикселя — вычисляем принадлежность множеству
        for (int y = 0; y < screenHeight; y++) {
            for (int x = 0; x < screenWidth; x++) {
                // ...
            }
        }
    }
    // ...
    return 0;
}
@step highlight=8:blue,9:blue,10:blue,
int main() {
    // ...
    while (!WindowShouldClose()) {
        // Для каждого пикселя — вычисляем принадлежность множеству
        for (int y = 0; y < screenHeight; y++) {
            for (int x = 0; x < screenWidth; x++) {
                // z_n = 0, c = (x,y)
                float zx = 0.0f, zy = 0.0f;
                float cx = float(x) / screenWidth;
                float cy = float(y) / screenHeight;
                // ...
            }
        }
    }
    // ...
    return 0;
}
@step highlight=12:blue,13:blue,14:blue,
int main() {
    // ...
    while (!WindowShouldClose()) {
        // Для каждого пикселя — вычисляем принадлежность множеству
        for (int y = 0; y < screenHeight; y++) {
            for (int x = 0; x < screenWidth; x++) {
                // ...

                // z_n = 0, c = (x,y)
                int iter = 0;
                while (zx*zx + zy*zy < max2 && iter < maxIterations) {
                    float xtemp = zx*zx - zy*zy + cx;
                    zy = 2.0f*zx*zy + cy;
                    zx = xtemp;
                    iter++;
                }
            }
        }
    }
    // ...
    return 0;
}
@step
int main() {
    // ...
    while (!WindowShouldClose()) {
        // Для каждого пикселя — вычисляем принадлежность множеству
        for (int y = 0; y < screenHeight; y++) {
            for (int x = 0; x < screenWidth; x++) {
                // ...
                // проверили точку на принадлежность

                // Рисуем пиксель
                ImageDrawPixel(/* ... */);
            }
        }
    }
    // ...
    return 0;
}
@step
int main() {
    // ...
    while (!WindowShouldClose()) {
        // Для каждого пикселя — вычисляем принадлежность множеству
        for (int y = 0; y < screenHeight; y++) {
            for (int x = 0; x < screenWidth; x++) {
                // z_n = 0, c = (x,y)
                float zx = 0.0f, zy = 0.0f;
                float cx = float(x) / screenWidth;
                float cy = float(y) / screenHeight;

                int iter = 0;
                while (zx*zx + zy*zy < max2 && iter < maxIterations) {
                    float xtemp = zx*zx - zy*zy + cx;
                    zy = 2.0f*zx*zy + cy;
                    zx = xtemp;
                    iter++;
                }
                // Рисуем пиксель
                ImageDrawPixel(/* ... */);
            }
        }
    }
    // ...
    return 0;
}
@end

@fragment
@warning Проблема
800 × 450 × 333 итерации = **~120 млн операций** на кадр. На одном потоке FPS будет низким.
@end

---

@section Параллельные вычисления

---

# hardware_concurrency

В **C++** узнать, сколько у процессора ядер можно через `std::thread::hardware_concurrency`:

@columns
@column
\width 60%
@code cpp editable run=cpp height=260px
#include <iostream>
#include <thread>

int main()
{
    const unsigned int n = std::thread::hardware_concurrency();
    std::cout << "threads count: " << n << std::endl;
    return 0;
}
@end

@column
\width 40%
@image assets/2-core-3-gigs.webp



---

@yesScroll

# Распараллеливание: горизонтальные полосы

Каждый поток рендерит свою горизонтальную полосу экрана. 

@code cpp readonly
constexpr int N = 8; // Количество потоков

void mandelbrotSet(int threadNum, float zoom, const float offset[2], Image& screenImage) {
    int yStart = threadNum * screenHeight / N;
    int yEnd   = (threadNum + 1) * screenHeight / N;

    for (int y = yStart; y < yEnd; y++) {
        for (int x = 0; x < screenWidth; x++) {
            // то же самое вычисление
        }
    }
}
@end

---

# Fork-Join: запуск потоков

@code cpp readonly
while (!WindowShouldClose()) {
    std::vector<std::thread> threads;
    // Fork: создаём N потоков для горизонтальных полос
    for (int i = 0; i < N - 1; i++) {
        threads.emplace_back(mandelbrotSet, i, zoom, offset, std::ref(screenImage));
    }
    // Join: ждём завершения всех потоков
    for (auto& j : threads)
        j.join();

    // обработка ввода, рендеринг ...
}
@end

@tip Паттерн Fork-Join
Создаём потоки (**fork**), каждый делает свою часть работы, потом ждём все (**join**). Классический подход для задач, которые легко разбить на независимые части.
@end

---
# Накладные расходы параллелизма

@table width=100%
| Потоков (N) | Время (мс) | Ускорение | Эффективность |
| --- | --- | --- | --- |
| 1 |  115.26 | 1.00× | 100% |
| 2 | 59.36 | 1.94× | 97% |
| 4 | 53.63 | 2.15× | 54% |
| 6 | 45.17 | 2.55× | 43% |
| 8 | 41.36 | 2.79× | 35% |
| 12 |  36.51 | 3.16× | 26% |
| 16 |  34.37 | 3.35× | 21% |
| 32 |  31.10 | 3.71× | 12% |
@end

@warning Вопрос:
Возможно ли [сверхлинейное ускорение](https://en.wikipedia.org/wiki/Speedup#Super-linear_speedup)? (эффективность > 1).
@end


---

# Почему ускорение далеко от линейного?

@important дисбаланс нагрузки
\marginTop -0.75rem
Горизонтальные полосы распределяют работу неравномерно. 

Полоса через центр множества — в десятки раз тяжелее, чем полоса по краю. 

Все потоки ждут на `join()` самого медленного.
@end

@fragment
@note Дополнительные факторы
\marginTop -1rem
- **Создание/уничтожение потоков** каждый кадр — десятки микросекунд на поток
- **N > числа ядер** — потоки конкурируют за процессорное время (context switching)
- **False sharing** — потоки пишут в соседние участки буфера, инвалидируя кэш-линии друг друга
@end

@fragment
@warning Эффективность 97% → 54%
\marginTop -1rem
Уже на 4 потоках половина вычислительных ресурсов простаивает. Добавление потоков сверх этого даёт убывающую отдачу.
@end

---

@section Закон Амдала

---

# Закон Амдала

Формулируется в предположении, что параллельная часть не имеет сверхлинейного ускорения.

@divider

Пусть $T = T_0 + T_1$, где:
- $T$ — время работы однопоточной версии
- $T_0$ — время нераспараллеливаемой части
- $T_1$ — время распараллеливаемой части

Пусть $P$ — количество параллельных исполнителей. Тогда время $T_P $ работы алгоритма на $P$ исполнителях:

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1.2rem
\border 1px solid #334155
\borderRadius 8px
\align center
\fontSize 1.3rem
$$T_P \ge T_0 + \frac{T_1}{P}$$
@end

---

# Закон Амдала: следствие

@warning Пример
Если $T_0 = \frac{9}{10} T$, то увеличив хоть до бесконечности число исполнителей, за счёт распараллеливания более чем на **10%** алгоритм не ускорить.
@end

@fragment

@tip Для Mandelbrot
В построении множества последовательная часть — это обработка ввода, отрисовка кадра. Вычисление пикселей — параллельная часть. Чем больше доля вычислений (больше итераций, крупнее область), тем эффективнее распараллеливание.

---

@yesScroll

# Закон Амдала

Измерения fork-join рендеринга при разном числе потоков (800×450, 333 итерации):

@table noborder width=100%
| Потоков (N) | Параллельно (мс) | Последовательно (мс) | Итого (мс) | Ускорение | Эффективность |
| --- | --- | --- | --- | --- | --- |
| 1 | 112.97 | 2.03 | 115.26 | 1.00× | 100% |
| 2 | 57.23 | 2.02 | 59.36 | 1.94× | 97% |
| 4 | 51.49 | 2.03 | 53.63 | 2.15× | 54% |
| 6 | 42.73 | 2.10 | 45.17 | 2.55× | 43% |
| 8 | 38.96 | 2.06 | 41.36 | 2.79× | 35% |
| 12 | 34.24 | 2.07 | 36.51 | 3.16× | 26% |
| 16 | 31.50 | 2.54 | 34.37 | 3.35× | 21% |
| 32 | 28.39 | 2.41 | 31.10 | 3.71× | 12% |
@end

---

# Закон Амдала

Измерения fork-join рендеринга при разном числе потоков (800×450, 333 итерации):

@note Прирост сильно ниже теоритической
$T_0 \approx 2\text{ мс}$ (последовательная часть — константа).

Теоретический предел ускорения: $\frac{T}{T_0} = \frac{115}{2} \approx 57.5x$

При 32 потоках получаем лишь **3.71x** — параллельная часть тоже не масштабируется идеально.
@end

@fragment
@warning Почему эффективность падает?
- При N=2 от каждого потока выжимаем 97% — почти идеально
- При N=32 каждый поток работает с эффективностью 12%
- Причины: thread creation overhead каждый кадр, cache contention, планировщик ОС

---

@section std::this_thread

---

# std::this_thread namespace

Функции, относящиеся к «текущему потоку»:

@table noborder width=100%
| Функция | Описание |
| --- | --- |
| `get_id` | идентификатор текущего потока |
| `sleep_for` | усыпить поток на время |
| `sleep_until` | усыпить поток до точки во времени |
| `yield` | освободить фрейм выполнения |
@end

---

# std::this_thread namespace

Функции, относящиеся к «текущему потоку»:

@code cpp readonly
// усыпить на 2 секунды (может проспать дольше)
std::this_thread::sleep_for(std::chrono::seconds(2));

// с помощью литералов
using namespace std::chrono_literals;
std::this_thread::sleep_for(2s);

// усыпить до конкретного времени
std::this_thread::sleep_until(std::chrono::system_clock::now() + 2h);
@end

---

# yield и busy wait

@code cpp readonly
while (!is_required_event_happen())
    std::this_thread::yield();

while (!is_another_thread_job_finished())
    std::this_thread::yield();

@end

@divider

---

# yield и busy wait

@code cpp readonly
while (!is_required_event_happen())
    std::this_thread::yield();

while (!is_another_thread_job_finished())
    std::this_thread::yield();

@end

@divider

@columns
@column
\width 70%
@warning Вопросы
- Что будет, если не написать `yield`?
- Что значит «усыпить поток»?
- Что такое «фрейм выполнения»?
- Когда `yield` полезен?
@column
\width 30%
@image assets/if-i-were-to-think.jpg


---

@section std::thread изнутри

---

# std::thread изнутри

`std::thread` переводит высокоуровневые команды в вызовы к ядру ОС. Потоки — объекты ядра, программе отдаётся **handle**.

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #38bdf8
\borderRadius 8px
**Windows**: свой API — `_beginthreadex`
@end

@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #22c55e
\borderRadius 8px
**Linux/macOS**: через `pthread_create`
@end

@end

@note Важно
При работе с потоками происходит переход из user space в kernel space. Эти переходы могут быть дорогими — их желательно минимизировать.
@end

---

# native_handle

Через `native_handle` можно получить доступ к handle объекта ядра ОС и настроить поток более тонко:

@code cpp readonly
int main() {
    std::thread t(/* ... */);
    sched_param sch;
    int policy;
    pthread_getschedparam(t.native_handle(), &policy, &sch);
    sch.sched_priority = 20;
    if (pthread_setschedparam(t.native_handle(), SCHED_FIFO, &sch)) {
        std::cout << "Failed to setschedparam: " << std::strerror(errno) << '\n';
    }
    t.join();
}
@end

@warning Внимание
Такие трюки — за рамками стандартной библиотеки. Они ОС-специфичны.
@end

---

# std::jthread (C++20)

`std::jthread` — развитие `std::thread` с важными улучшениями (но дороже в использовании):

- `jthread` можно **прерывать** (`stop_token`)
- В деструкторе ведёт себя аккуратнее:
  - прерывает выполнение
  - `join`-ит поток

@tip Практика
В построении множества Мандельброта `jthread` может упростить код: не нужно явно вызывать `join()`, потоки автоматически дождутся завершения при выходе из scope.
@end

---

@section promise — future

---

# promise — future

Связка `std::promise - std::future` — один из способов передать информацию между потоками:
- результат выполнения
- нотификация о событии

`promise` и `future` **некопируемы** — идеологически это «канал связи» с одним входом и одним выходом.

@divider

@fragment
**Как пользоваться**:
1. Создаём `std::promise<T> p` — вход канала
2. `auto f = p.get_future()` — выход канала
3. Рабочий поток: `p.set_value(...)` или `p.set_exception(...)`
4. Ожидающий поток: `f.wait()`, `f.get()`, `f.wait_for(...)`, `f.wait_until(...)`
@end

---

# promise-future

@code cpp readonly
int parallel_max(const std::vector<int>& arr)
{
    // ...
}
@step
int parallel_max(const std::vector<int>& arr)
{
    // функция, считающая максимум, и выставляющая результат в promise
    const auto max_worker = [](std::vector<int>::const_iterator first,
                               std::vector<int>::const_iterator last,
                               std::promise<int> promise){
        const int res = *max_element(first, last);
        promise.set_value(res);
    };
}
@step
int parallel_max(const std::vector<int>& arr)
{
    // ...
    // заводим promise-future связки между потоками
    std::promise<int> thread_1_promise;
    std::promise<int> thread_2_promise;
    std::future<int> thread_1_future = thread_1_promise.get_future();
    std::future<int> thread_2_future = thread_2_promise.get_future();
}
@step
int parallel_max(const std::vector<int>& arr)
{
    // ...
    // ...
    // запускаем потоки для параллельного поиска максимума
    std::thread t1(max_worker,
                   begin(arr), begin(arr) + arr.size() / 2,
                   std::move(thread_1_promise));
    std::thread t2(max_worker,
                   begin(arr) + arr.size() / 2, end(arr),
                   std::move(thread_2_promise));
}
@step
int parallel_max(const std::vector<int>& arr)
{
    // ...
    // ...
    // ...
    // дожидаемся, пока оба потока не выставят результат
    const int max_1 = thread_1_future.get();
    const int max_2 = thread_2_future.get();
}
@step highlight=10:blue,11:blue
int parallel_max(const std::vector<int>& arr)
{
    // ...
    // ...
    // ...
    // ...

    // дожидаемся окончания работы потоков
    // Вопрос: что будет, если не написать этих двух строк?
    t1.join();
    t2.join();
}
@step highlight=10:blue
int parallel_max(const std::vector<int>& arr)
{
    // ...
    // ...
    // ...
    // ...
    // ...

    // возвращаем результат - максимум из двух половинок
    return std::max(max_1, max_2);
}
@end

---

# promise-future

@columns
@column
\width 60%
@code cpp readonly highlight=14:red
// заводим promise-future связку между потоками
std::promise<int> p;
std::future<int> f = p.get_future();

const auto worker = [&p](int x) {
    // захват promise по ссылке!
    const int res = x * x;
    // упс, мы забыли про set_value
};

// запускаем поток
std::thread t1(worker, 5);
// дожидаемся результата
const int result = f.get();  // здесь зависли навсегда

// дожидаемся окончания работы потоков
t1.join();
@end

@column
\width 40%
@important Замечание
Если фоновый поток забудет вызвать `set_value`, деструктор `promise` вызовет `set_exception`. Но это работает только если `promise` уничтожается — при захвате по ссылке можно зависнуть навсегда.
@end
---

@section promise — shared_future

---

@yesScroll
# shared_future

Для канала «один вход — много выходов» есть `std::shared_future`.

Несколько `shared_future` могут ожидать событие от одного `promise`.

@code cpp editable run=cpp height=950px
#include <future>
#include <iostream>
#include <thread>

void worker_1(std::shared_future<int> f)
{
    std::cout << "worker 1 waits for user input\n";
    const int x = f.get();
    std::cout << "worker 1 result: " << x * x << std::endl;
}

void worker_2(std::shared_future<int> f)
{
    std::cout << "worker 2 waits for user input\n";
    const int x = f.get();
    std::cout << "worker 2 result: " << x * x * x << std::endl;
}

int main()
{
    std::cout << "enter x:\n";

    // связка один вход - два выхода
    std::promise<int> p;
    std::shared_future<int> f1 = p.get_future().share();
    std::shared_future<int> f2 = f1;

    // стартуем потоки, каждому свой future
    std::thread t1(worker_1, std::move(f1));
    std::thread t2(worker_2, std::move(f2));

    // читаем пользовательский ввод и сообщаем потокам значение
    int x;
    std::cin >> x;
    p.set_value(x);

    // не забываем за-join-ить потоки
    t1.join();
    t2.join();

    return 0;
}
@end

---

@section std::async

---

# std::async

`std::async` — более высокоуровневый способ параллелизма, работающий в терминах **задач**, а не потоков.

Возвращает `std::future` для ожидания результата.

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(34, 197, 94, 0.12)
\borderLeft 4px solid #22c55e
\padding 1rem
\borderRadius 8px
**`std::launch::async`** — запускается новый поток
@end

@column
\width 50%

@style
\bg rgba(59, 130, 246, 0.12)
\borderLeft 4px solid #3b82f6
\padding 1rem
\borderRadius 8px
**`std::launch::deferred`** — ленивое вычисление при `get()`
@end

@end

---

# std::async

@code cpp readonly
int parallel_max(const std::vector<int>& arr, const unsigned tasks_count) {
    // создать |tasks_count| фоновых задач
    std::vector<std::future<int>> futures;
    for (unsigned i = 0; i < tasks_count; ++i) {
        futures.emplace_back(
            std::async(std::launch::async,
                       [&]() -> int {
                           return *max_element(begin(arr) + arr.size() / tasks_count * i,
                                               begin(arr) + arr.size() / tasks_count * (i + 1));
                        }));
    }
    // collect results and reduce
    int res = INT_MIN;
    for (auto& f: futures) res = std::max(res, f.get());

    return res;
}
@end

---

# std::async

На примере множества Мандельброта:

@code cpp readonly
// как создавались потоки раньше
while (!WindowShouldClose()) {
    std::vector<std::thread> threads;
    // Fork: создаём N-1 потоков для горизонтальных полос
    for (int i = 0; i < N - 1; i++) {
        threads.emplace_back(mandelbrotSet, i, zoom, offset, std::ref(screenImage));
    }
    // Join: ждём завершения всех потоков
    for (auto& j : threads)
        j.join();

    // обработка ввода, рендеринг ...
}
@step
// с помощью std::async
while (!WindowShouldClose()) {
    std::vector<std::future<void>> threads;
    for (int i = 0; i < N; i++) {
        threads.emplace_back(std::async(std::launch::async, mandelbrotSet, i, zoom, offset, std::ref(screenImage)));
    }

    // обработка ввода, рендеринг ...
}
@end

---

# Преимущества std::async

@style
\bg rgba(34, 197, 94, 0.08)
\padding 1rem
\borderLeft 4px solid #22c55e
\borderRadius 8px
- Функция просто возвращает результат нужного типа
- Код запуска — один вызов
- Нет шума с `join`, `promise`, `set_value`
- Объект для ожидания результата — из коробки
@end

@fragment

@warning Недостатки
- Интерфейс не предоставляет тонкого контроля: когда, где и как запускается задача. 
- Для серьёзных проектов создавать поток на каждую задачу может быть дорого. 
- Зачастую используют собственные **пулы потоков**.
@end

---

# Цена создания потока

Для каждого потока нужно:
- Создать объект в ядре ОС (переход в kernel space)
- Разместить стек в куче
- Выделить место под регистры
- Инициализировать все `thread_local`-данные
- Дополнительная нагрузка на OS scheduler
- Дополнительные переключения контекстов

---

# Упражнение

В чём здесь проблемы и как их починить?

@code cpp readonly
std::thread create_worker_thread(int x) {
    return std::thread([&](){ std::cout << x; });
}

int main() {
    const auto t1 = create_worker_thread(1);
    const auto t2 = create_worker_thread(2);
    const auto t3 = create_worker_thread(3);
}
@end

@fragment
@tip Ответ
1. `std::thread` надо либо `join`-ить, либо `detach`-ить
2. Временный `x` передаётся в лямбду по ссылке — невалиден к моменту выполнения
@end

---

@section Резюме

---

# Резюме

- **Потоки и процессы** — объекты ядра ОС. Процесс содержит несколько потоков, память общая
- **`std::thread`** — класс для управления потоками (C++11). Надо `join` или `detach`
- **Закон Амдала** — последовательная часть ограничивает эффективность
- Альтернативы: `std::jthread`, `boost::thread`
- **`promise-future`** — канал для передачи сообщения между потоками
- **`std::async`** — высокоуровневый интерфейс в терминах задач
- **Создавать потоки дорого** — в реальных проектах используют пулы
