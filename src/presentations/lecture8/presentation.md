@title
# Алгоритмы и Контейнеры C++ STL
@subtitle Полный обзор ключевых алгоритмов и структур данных
@badge Лекция 8
@items
- lower_bound, upper_bound, nth_element, partition, make_heap
- priority_queue, std::next, vector, deque, list, forward_list
- set, multiset, map, unordered_set, queue
@end

---

@section Алгоритмы
@subtitle Бинарный поиск, сортировка, разделение, кучи
@icon ⚡

---

@category Алгоритмы
@subtitle Нижняя граница в отсортированном диапазоне
# std::lower_bound

**std::lower_bound** возвращает итератор на **первый элемент**, который **не меньше** заданного значения (≥ value). Работает по принципу бинарного поиска.

@badge-row
#include <algorithm> | blue
O(log N) | green
ForwardIterator | purple
@end

- Диапазон `[first, last)` должен быть **отсортирован**
- Возвращает итератор на первый элемент ≥ value
- Если все элементы меньше value — возвращает `last`
- Для RandomAccess: `O(log N)`, для Forward: `O(N)`

---

@category Алгоритмы
# std::lower_bound — визуализация

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">Отсортированный массив:</span></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:1.1em;margin:16px 0">
  <span class="dim">[ </span>
  <span class="dim">0</span><span class="dim">, </span>
  <span class="dim">1</span><span class="dim">, </span>
  <span class="dim">2</span><span class="dim">, </span>
  <span class="hl">3</span><span class="dim">, </span>
  <span class="hl">3</span><span class="dim">, </span>
  <span class="hl">3</span><span class="dim">, </span>
  <span class="hl">3</span><span class="dim">, </span>
  <span class="hl">3</span><span class="dim">, </span>
  <span class="hl">3</span><span class="dim">, </span>
  <span class="hl2">4</span><span class="dim">, </span>
  <span class="dim">5</span><span class="dim">, </span>
  <span class="dim">6 ...</span>
  <span class="dim"> ]</span>
</div>
<div style="margin-top:16px;font-size:1.1em">
  <span class="arr">↑</span> <span class="label">lower_bound(3)</span> = индекс <span class="hl">3</span>
</div>
<div style="margin-top:8px">
  <span class="dim">Указывает на ПЕРВУЮ тройку</span>
</div>
<div style="margin-top:24px;border:1px dashed var(--accent-blue);border-radius:12px;padding:16px">
  Вставка с сохранением порядка:<br/>
  <span class="hl2">v = {1, 3, 5, 7}</span><br/>
  <span class="hl3">pos = lower_bound(v, 4)</span><br/>
  <span class="hl3">v.insert(pos, 4)</span> → {1, 3, <span class="hl">4</span>, 5, 7}
</div>
</div>
@end

---

@category Алгоритмы
# std::lower_bound — пример кода

@code cpp
std::vector<int> vec{0,1,2,3,3,3,3,3,3,4,5,6,7,8,9};

auto lo = std::lower_bound(
    vec.cbegin(), vec.cend(), 3);

// lo -> первый элемент со значением 3
// *lo == 3, индекс = 3

// Вставка с сохранением порядка
std::vector<int> v{1, 3, 5, 7};
auto pos = std::lower_bound(v.begin(), v.end(), 4);
v.insert(pos, 4); // {1, 3, 4, 5, 7}
@end

---

@category Алгоритмы
@subtitle Верхняя граница в отсортированном диапазоне
# std::upper_bound

**std::upper_bound** возвращает итератор на **первый элемент**, который **строго больше** заданного значения (> value).

@badge-row
#include <algorithm> | blue
O(log N) | green
ForwardIterator | purple
@end

- Возвращает итератор на первый элемент **строго больший** value
- `lower_bound` + `upper_bound` = `equal_range`
- Количество элементов = `upper_bound - lower_bound`
- Диапазон `[lower_bound, upper_bound)` — все элементы == value

---

@category Алгоритмы
# lower_bound vs upper_bound — визуализация

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">Визуализация lower_bound vs upper_bound</span></div>
<div style="margin-top:16px;font-size:1.1em">
<div>Индекс: &nbsp; <span class="dim">0 &nbsp;1 &nbsp;2</span> &nbsp; <span class="hl">3 &nbsp;4 &nbsp;5 &nbsp;6 &nbsp;7 &nbsp;8</span> &nbsp; <span class="dim">9 &nbsp;10 ...</span></div>
<div>Значение: <span class="dim">0 &nbsp;1 &nbsp;2</span> &nbsp; <span class="hl">3 &nbsp;3 &nbsp;3 &nbsp;3 &nbsp;3 &nbsp;3</span> &nbsp; <span class="hl2">4</span> &nbsp; <span class="dim">5 ...</span></div>
</div>
<div style="margin-top:24px;font-size:1.1em">
  <span class="hl3">▲ lower_bound(3)</span> — индекс 3
</div>
<div style="font-size:1.1em">
  <span class="hl4">▲ upper_bound(3)</span> — индекс 9
</div>
<div style="margin-top:24px;border:2px dashed var(--accent-blue);border-radius:12px;padding:16px;font-size:1em">
  Диапазон [3, 9) содержит <span class="hl">6 элементов</span> со значением 3
</div>
</div>
@end

---

@category Алгоритмы
# std::upper_bound — пример кода

@code cpp
std::vector<int> vec{0,1,2,3,3,3,3,3,3,4,5,6,7,8,9};

auto lo = std::lower_bound(vec.cbegin(), vec.cend(), 3);
auto hi = std::upper_bound(vec.cbegin(), vec.cend(), 3);

// Вывод всех троек:
for (auto it = lo; it != hi; ++it)
    std::cout << *it << " "; // 3 3 3 3 3 3

// equal_range делает то же самое:
auto [first, last] = std::equal_range(
    vec.cbegin(), vec.cend(), 3);
@end

---

@category Алгоритмы
@subtitle Частичная сортировка — поиск N-го элемента
# std::nth_element

**std::nth_element** переставляет элементы так, что N-й элемент оказывается на своём месте как в полностью отсортированном массиве.

@badge-row
#include <algorithm> | blue
O(N) в среднем | green
RandomAccessIterator | purple
@end

- Алгоритм **IntroSelect** (QuickSelect + MedianOfMedians)
- Элементы слева ≤ N-му, справа ≥ N-му, но **не отсортированы**
- Идеально для нахождения **медианы** за O(N)
- Быстрее полной сортировки O(N log N)

---

@category Алгоритмы
# std::nth_element — визуализация

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">До nth_element(begin + 3):</span></div>
<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:1.2em;margin:12px 0">
  <span class="dim">[</span>
  <span>83</span> <span>86</span> <span>77</span> <span>15</span> <span>93</span>
  <span>35</span> <span>86</span> <span>92</span> <span>49</span> <span>21</span>
  <span class="dim">]</span>
</div>
<div style="margin:20px 0;font-size:1.1em"><span class="arr">⬇ nth_element(begin, begin+3, end)</span></div>
<div><span class="label">После:</span></div>
<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:1.2em;margin:12px 0">
  <span class="dim">[</span>
  <span class="hl2">15</span> <span class="hl2">21</span> <span class="hl2">35</span>
  <span class="hl3" style="border-bottom:3px solid var(--accent-green);padding-bottom:2px">49</span>
  <span class="hl4">93</span> <span class="hl4">86</span> <span class="hl4">86</span>
  <span class="hl4">92</span> <span class="hl4">83</span> <span class="hl4">77</span>
  <span class="dim">]</span>
</div>
<div style="margin-top:20px;font-size:1em">
  <span class="hl2">≤ 49</span> &nbsp;&nbsp;│&nbsp;&nbsp; <span class="hl3">N-й = 49</span> &nbsp;&nbsp;│&nbsp;&nbsp; <span class="hl4">≥ 49</span>
</div>
<div style="margin-top:10px;color:var(--text-muted)">
  Левая и правая части НЕ отсортированы!
</div>
</div>
@end

---

@category Алгоритмы
# std::nth_element — нахождение медианы

@code cpp
std::vector<int> vec(10);
std::generate(vec.begin(), vec.end(),
    [](){ return std::rand() % 100; });

// Находим медиану за O(N) вместо O(N log N)
std::nth_element(
    vec.begin(),
    vec.begin() + vec.size() / 2,
    vec.end());

int median = vec[vec.size() / 2];
@end

@tip
nth_element — один из самых недооценённых алгоритмов STL. Используйте его вместо полной сортировки, когда нужен только k-й элемент.
@end

---

@category Алгоритмы
@subtitle Разделение диапазона по предикату
# std::partition

**std::partition** переставляет элементы: все, для которых предикат = `true`, перед теми, для которых `false`.

@badge-row
#include <algorithm> | blue
O(N) | green
BidirectionalIterator | purple
@end

- `std::partition` — **не стабильный**, порядок может измениться
- `std::stable_partition` — **стабильный**, порядок сохраняется
- `std::is_partitioned` — проверка разделения
- Возвращает итератор на **границу** (первый false-элемент)
- Основа алгоритма **QuickSort**

---

@category Алгоритмы
# std::partition — визуализация

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">partition(vec, [](int v){ return v < 50; })</span></div>
<div style="margin-top:16px"><span class="dim">До:</span></div>
<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:1.1em;margin:8px 0">
  <span class="dim">[</span>
  <span class="hl4">50</span> <span>83</span> <span>86</span>
  <span>15</span> <span>93</span> <span>35</span>
  <span>86</span> <span>49</span> <span>21</span>
  <span class="dim">]</span>
</div>
<div style="margin:16px 0;font-size:1.1em"><span class="arr">⬇ partition(predicate: val < 50)</span></div>
<div><span class="dim">После:</span></div>
<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:1.1em;margin:8px 0">
  <span class="dim">[</span>
  <span class="hl3">21</span> <span class="hl3">49</span> <span class="hl3">35</span>
  <span class="hl3">15</span>
  <span class="dim" style="font-size:1.4em">│</span>
  <span class="hl4">93</span> <span class="hl4">83</span> <span class="hl4">86</span>
  <span class="hl4">86</span> <span class="hl4">50</span>
  <span class="dim">]</span>
</div>
<div style="margin-top:20px;font-size:1em">
  <span class="hl3">true (< 50)</span>
  &nbsp;&nbsp; <span class="dim">│</span> &nbsp;&nbsp;
  <span class="hl4">false (≥ 50)</span>
  &nbsp;&nbsp; <span class="dim">← итератор на границу</span>
</div>
</div>
@end

---

@category Алгоритмы
# std::partition — QuickSort

@code cpp
template <class ForwardIt>
void quicksort(ForwardIt first, ForwardIt last) {
    if (first == last) return;

    auto pivot = *std::next(first,
        std::distance(first, last) / 2);

    auto mid1 = std::partition(first, last,
        [pivot](const auto& em) {
            return em < pivot;
        });
    auto mid2 = std::partition(mid1, last,
        [pivot](const auto& em) {
            return !(pivot < em);
        });

    quicksort(first, mid1);
    quicksort(mid2, last);
}
@end

---

@category Алгоритмы
@subtitle Построение двоичной кучи (max-heap)
# std::make_heap

**std::make_heap** преобразует диапазон в **max-heap**. Максимальный элемент на позиции `first`. Куча хранится в массиве.

@badge-row
#include <algorithm> | blue
O(N) | green
RandomAccessIterator | purple
@end

- `make_heap` — построение кучи, **O(N)**
- `push_heap` — добавление (swim up), O(log N)
- `pop_heap` — удаление max (sink down), O(log N)
- `sort_heap` — сортировка кучи, O(N log N)
- Свойство: `parent ≥ children`

---

@category Алгоритмы
# std::make_heap — структура кучи

@diagram
<div style="text-align:center;line-height:1.9">
<div><span class="label">Бинарная куча (max-heap)</span></div>
<pre style="font-size:1.2em;margin-top:16px">
            <span class="hl">9</span>
          /   \
        <span class="hl2">8</span>       <span class="hl2">6</span>
       / \     / \
     <span class="hl3">7</span>   <span class="hl3">4</span> <span class="hl3">5</span>   <span class="hl3">2</span>
    / \  /
  <span class="dim">0</span> <span class="dim">3</span> <span class="dim">1</span>
</pre>
<div style="margin-top:16px;font-size:0.9em">
  Массив: [<span class="hl">9</span>, <span class="hl2">8</span>, <span class="hl2">6</span>, <span class="hl3">7</span>, <span class="hl3">4</span>, <span class="hl3">5</span>, <span class="hl3">2</span>, <span class="dim">0</span>, <span class="dim">3</span>, <span class="dim">1</span>]
</div>
<div style="margin-top:20px;border:2px dashed var(--accent-blue);border-radius:12px;padding:16px;font-size:0.9em">
  Дети узла i: <span class="hl2">2i+1</span> и <span class="hl2">2i+2</span> &nbsp;&nbsp;│&nbsp;&nbsp;
  Родитель узла i: <span class="hl3">(i-1)/2</span>
</div>
</div>
@end

---

@category Алгоритмы
# std::make_heap — пример кода

@code cpp
std::vector<int> heap{0,1,2,3,4,5,6,7,8,9};

std::make_heap(heap.begin(), heap.end());
// heap: [9, 8, 6, 7, 4, 5, 2, 0, 3, 1]

heap.push_back(42);
std::push_heap(heap.begin(), heap.end());
// 42 "всплывает" (swim) наверх

std::pop_heap(heap.begin(), heap.end());
// max перемещается в конец
heap.pop_back(); // удаляем max

std::sort_heap(heap.begin(), heap.end());
// Сортировка через кучу: O(N log N)
@end

---

@category Алгоритмы
@subtitle Очередь с приоритетом (адаптер контейнера)
# std::priority_queue

**std::priority_queue** — адаптер, реализующий **очередь с приоритетом** поверх кучи. По умолчанию — max-heap.

@badge-row
#include <queue> | blue
push: O(log N) | green
top: O(1) | cyan
pop: O(log N) | orange
@end

- `push(val)` — добавить элемент
- `top()` — доступ к максимальному (const ref)
- `pop()` — удалить максимальный элемент
- Min-heap: `priority_queue<int, vector<int>, greater<int>>`
- Внутренний контейнер — `std::vector`

---

@category Алгоритмы
# std::priority_queue — операции

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Операции priority_queue</span></div>
<pre style="font-size:1.1em;margin-top:16px">
  push(5):  [ <span class="hl">9</span> 8 6 7 4 <span class="hl3">5</span> ]  ← swim up

  top():    → <span class="hl">9</span>  (O(1), без удаления)

  pop():    [ <span class="hl4">×</span> 8 6 7 4 5 ]  → [ <span class="hl">8</span> 7 6 5 4 ]
            max → конец → sink down
</pre>
</div>
@end

@code cpp
const std::vector<int> data{1,8,5,6,3,4,0,9,7,2};

// Max-heap (по умолчанию)
std::priority_queue<int> maxQ;
for (auto& i : data) maxQ.push(i);
// top() = 9, 8, 7, 6, ...

// Min-heap
std::priority_queue<int, std::vector<int>,
    std::greater<int>> minQ(
        data.begin(), data.end());
// top() = 0, 1, 2, 3, ...
@end

---

@category Алгоритмы
@subtitle Навигация по итераторам
# std::next / advance / distance

**std::next** возвращает итератор, продвинутый на N позиций, **не модифицируя** исходный. **std::advance** модифицирует на месте.

@badge-row
#include <iterator> | blue
RandomAccess: O(1) | green
Other: O(N) | orange
@end

@table
| Функция | Действие | Модификация |
| :--- | :--- | :--- |
| `std::next(it, n)` | Возвращает it + n | Нет |
| `std::prev(it, n)` | Возвращает it - n | Нет |
| `std::advance(it, n)` | Двигает it на n | Да |
| `std::distance(a, b)` | Расстояние a→b | Нет |
@end

---

@category Алгоритмы
# Категории итераторов

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">Категории итераторов и допустимые операции:</span></div>
<pre style="font-size:1.1em;margin-top:16px">
<span class="hl">RandomAccess</span> (vector, deque):
  it + n, it - n, it += n, it[n]  → <span class="hl3">O(1)</span>

<span class="hl2">Bidirectional</span> (list, set, map):
  ++it, --it                       → <span class="hl3">O(1)</span>
  std::advance(it, n)              → <span class="hl4">O(N)</span>

<span class="hl4">Forward</span> (forward_list, unordered_set):
  ++it                             → <span class="hl3">O(1)</span>
  std::advance(it, n)              → <span class="hl4">O(N)</span>
  нет --it!
</pre>
</div>
@end

---

@category Алгоритмы
# std::next — пример кода

@code cpp
std::vector<int> v{0,1,2,3,4,5,6,7,8};

auto it = std::next(v.cbegin(), 3);
// *it == 3, v.cbegin() не изменился

++it;  // *it == 4
--it;  // *it == 3

// Для list нет operator+=
std::list<int> lst{0,1,2,3,4,5};
auto lit = lst.begin();
std::advance(lit, 3);  // lit -> 3

// Расстояние
auto pos = std::distance(v.cbegin(), it);
@end

---

@section Последовательные контейнеры
@subtitle vector, deque, list, forward_list
@icon 📦

---

@category Контейнеры
@subtitle Динамический массив — основа STL
# std::vector

**std::vector** — динамический массив с **непрерывным** хранением в памяти. Ёмкость растёт автоматически (×1.5 или ×2).

@badge-row
#include <vector> | blue
Random Access | green
Contiguous Memory | cyan
@end

@table
| Операция | Сложность |
| :--- | :--- |
| `push_back` | Аморт. O(1) |
| `pop_back` | O(1) |
| `operator[]` / `at(i)` | O(1) |
| `insert(pos)` / `erase(pos)` | O(N) |
| `reserve(n)` | O(N) |
@end

---

@category Контейнеры
# std::vector — структура памяти

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Структура vector в памяти</span></div>
<pre style="font-size:1.1em;margin-top:16px">
Стек:
┌─────────────────┐
│ vector obj      │  size: 5
│ ptr ────────────┼──┐  capacity: 8
│ size, capacity  │  │
└─────────────────┘  │
                     ▼
Куча (heap):         Непрерывный блок
┌────┬────┬────┬────┬────┬────┬────┬────┐
│  0 │  1 │  2 │  3 │  4 │    │    │    │
└────┴────┴────┴────┴────┴────┴────┴────┘
  ← size=5 данные  →   ← резерв →
</pre>
<div style="margin-top:16px;font-size:0.9em">
<span class="hl4">push_back при capacity == size:</span><br/>
1. Выделить новый блок (×2) &nbsp; 2. Переместить всё &nbsp; 3. Освободить старый<br/>
→ Все итераторы <span class="hl4">НЕВАЛИДНЫ!</span>
</div>
</div>
@end

---

@category Контейнеры
# std::vector — reserve и реаллокация

@code cpp
std::vector<int> values;
// capacity растёт: 0→1→2→4→8→16→32...

values.reserve(100); // предаллокация
// capacity = 100, size = 0

for (int i = 0; i < 50; ++i)
    values.push_back(i);
// capacity = 100, size = 50 (без реаллокаций!)

values.shrink_to_fit();
// capacity = 50, size = 50
@end

@note
Инвалидация: push_back при реаллокации и insert в середину делают ВСЕ итераторы невалидными!
@end

---

@category Контейнеры
@subtitle Двусторонняя очередь — массив массивов
# std::deque

**std::deque** — контейнер с эффективной вставкой/удалением с **обоих концов**. Реализован как массив указателей на блоки (бакеты).

@badge-row
#include <deque> | blue
Random Access | green
Не непрерывная память | orange
@end

@table
| Операция | Сложность |
| :--- | :--- |
| `push_back` / `push_front` | Аморт. O(1) |
| `pop_back` / `pop_front` | O(1) |
| `operator[]` / `at(i)` | O(1) |
| `insert` / `erase` (середина) | O(N) |
@end

---

@category Контейнеры
# std::deque — структура памяти

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Структура deque в памяти</span></div>
<pre style="font-size:1.1em;margin-top:16px">
Map (массив указателей):
┌──────┬──────┬──────┬──────┬──────┐
│ ptr  │ ptr  │ ptr  │ ptr  │ ptr  │
└──┬───┴──┬───┴──┬───┴──┬───┴──┬───┘
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
 ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
 │ .  │ │<span class="hl2">0  1</span>│ │<span class="hl2">2  3</span>│ │<span class="hl2">4  5</span>│ │ .  │
 └────┘ └────┘ └────┘ └────┘ └────┘
 свобод  bucket  bucket  bucket свобод

<span class="hl3">push_front</span>: заполняет левый бакет ←
<span class="hl3">push_back</span>:  заполняет правый бакет →
</pre>
<div style="margin-top:12px;font-size:0.9em">
Указатели на элементы <span class="hl3">валидны</span> при push_back/front.<br/>
Итераторы <span class="hl4">инвалидируются</span> при любой вставке.
</div>
</div>
@end

---

@category Контейнеры
# std::deque — пример кода

@code cpp
std::deque<int> d{0,1,2,3,4,5,6,7,8};
auto iter = std::next(d.cbegin(), 3);
auto ptr = &*iter;  // указатель на элемент

d.push_back(42);
// iter — НЕВАЛИДЕН
// ptr  — ещё ВАЛИДЕН!

d.insert(d.begin() + 2, 42);
// iter — НЕВАЛИДЕН
// ptr  — может быть НЕВАЛИДЕН!
@end

@note
deque — контейнер по умолчанию для std::stack и std::queue.
@end

---

@category Контейнеры
@subtitle Двусвязный список
# std::list

**std::list** — двусвязный список. Каждый элемент в отдельном узле с указателями prev/next. O(1) вставка/удаление при наличии итератора.

@badge-row
#include <list> | blue
Bidirectional Iterator | purple
O(1) insert/erase | green
@end

- **Нет** `operator[]` — доступ через `std::advance`: O(N)
- Итераторы **не инвалидируются** при insert/push
- Каждый узел аллоцируется отдельно → плохая cache locality
- Собственный метод `sort()` — merge sort

---

@category Контейнеры
# std::list — структура памяти

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Двусвязный список в памяти</span></div>
<pre style="font-size:1.1em;margin-top:16px">
 nullptr ← ┌─────┐ ⇄ ┌─────┐ ⇄ ┌─────┐ ⇄ ┌─────┐ → nullptr
           │  <span class="hl2">0</span>  │   │  <span class="hl2">1</span>  │   │  <span class="hl2">2</span>  │   │  <span class="hl2">3</span>  │
           │ prev│   │ prev│   │ prev│   │ prev│
           │ next│   │ next│   │ next│   │ next│
           └─────┘   └─────┘   └─────┘   └─────┘

<span class="hl3">Вставка</span> (insert):
  Переключить 2 указателя → <span class="hl3">O(1)</span>

<span class="hl4">Удаление</span> (erase):
  Переключить 2 указателя → <span class="hl3">O(1)</span>

Итераторы <span class="hl3">стабильны</span> при любых вставках!
</pre>
</div>
@end

---

@category Контейнеры
# std::list — пример кода

@code cpp
std::list<int> lst{0,1,2,3,4,5,6,7,8};
auto iter = std::next(lst.cbegin(), 3);
// *iter == 3

lst.push_back(42);
lst.push_front(42);
lst.insert(lst.cbegin(), 42);

// iter по-прежнему валиден!
std::cout << *iter; // 3

// Нет operator+= для Bidirectional
// iter += 3; // ОШИБКА!
std::advance(iter, 3); // OK, O(N)
@end

---

@category Контейнеры
@subtitle Односвязный список — минимальный overhead
# std::forward_list

**std::forward_list** — односвязный список (C++11). Каждый узел хранит только указатель на **следующий** элемент.

@badge-row
#include <forward_list> | blue
Forward Iterator | purple
C++11 | orange
@end

- `push_front` — O(1), **нет** `push_back`
- `insert_after` — вставка **после** позиции
- `before_begin()` — итератор «перед началом»
- Нет `size()` — для экономии памяти
- Нет `--it` — только `++it`

---

@category Контейнеры
# std::forward_list — структура

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Односвязный список</span></div>
<pre style="font-size:1.1em;margin-top:16px">
 ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
 │  <span class="hl2">0</span>  │──→ │  <span class="hl2">1</span>  │──→ │  <span class="hl2">2</span>  │──→ │  <span class="hl2">3</span>  │──→ nullptr
 │ next│    │ next│    │ next│    │ next│
 └─────┘    └─────┘    └─────┘    └─────┘

<span class="hl3">insert_after(it, X)</span>:
  A → B → C
  A → <span class="hl3">X</span> → B → C   — переключить 1 указатель

<span class="hl4">before_begin()</span>:
  <span class="hl4">[bb]</span> → 0 → 1 → 2 → 3
  Нужен для вставки перед первым элементом
</pre>
</div>
@end

---

@category Контейнеры
# std::forward_list — пример кода

@code cpp
std::forward_list<int> fl{0,1,2,3,4,5,6,7,8};

auto it = std::next(fl.cbegin(), 3);
// *it == 3

// Только вперёд!
++it;  // OK, *it == 4
// --it; // ОШИБКА КОМПИЛЯЦИИ!

fl.push_front(42);
fl.insert_after(fl.cbegin(), 99);

// before_begin — для вставки перед началом
fl.insert_after(fl.before_begin(), -1);
@end

---

@category Контейнеры
# Сравнение последовательных контейнеров

@table
| | vector | deque | list | forward_list |
| :--- | :--- | :--- | :--- | :--- |
| Память | Непрерывная | Блоки | Узлы | Узлы |
| Доступ [i] | **O(1)** | **O(1)** | O(N) | O(N) |
| push_back | Аморт. O(1) | O(1) | O(1) | — |
| push_front | **O(N)** | O(1) | O(1) | O(1) |
| insert | O(N) | O(N) | **O(1)** | **O(1)** |
| Итератор | Random | Random | Bidir | Forward |
| Cache | +++ | ++ | + | + |
@end

@tip
По умолчанию используйте vector. Другие — только при необходимости O(1) вставки или стабильных итераторов.
@end

---

@section Ассоциативные контейнеры
@subtitle set, multiset, map, unordered_set
@icon 🌳

---

@category Контейнеры
@subtitle Упорядоченное множество уникальных элементов
# std::set

**std::set** хранит **уникальные** элементы в **отсортированном порядке**. Реализован как **красно-чёрное дерево**.

@badge-row
#include <set> | blue
O(log N) | green
Bidirectional Iterator | purple
@end

- Дубликаты **не допускаются**: insert → `{iterator, false}`
- Элементы **нельзя модифицировать** через итератор
- Итераторы стабильны при insert/erase
- `lower_bound` и `upper_bound` за O(log N)

---

@category Контейнеры
# std::set — Red-Black Tree

@diagram
<div style="text-align:center;line-height:2">
<div><span class="label">Red-Black Tree (std::set)</span></div>
<pre style="font-size:1.2em;margin-top:20px">
           <span class="hl">Charlie</span>
          /         \
      <span class="hl4">Alpha</span>        <span class="hl4">Echo</span>
         \        /
       <span class="hl2">Bravo</span>  <span class="hl2">Delta</span>
</pre>
<div style="margin-top:24px;font-size:1em">
  Обход (in-order):<br/>
  Alpha → Bravo → Charlie → Delta → Echo<br/>
  <span class="dim">Всегда в отсортированном порядке!</span>
</div>
</div>
@end

---

@category Контейнеры
# std::set — пример кода

@code cpp
std::set<int> values;

auto [it, ok] = values.insert(42);
// *it == 42, ok == true

auto [it2, ok2] = values.insert(42);
// *it2 == 42, ok2 == false (дубликат!)

// Итерация всегда в порядке сортировки
for (int i = 10; i >= 0; --i)
    values.insert(i);
// Обход: 0 1 2 3 4 5 6 7 8 9 10 42

// Bidirectional итератор
auto iter = values.begin();
++iter; --iter;          // OK
// iter += 3;            // ОШИБКА!
std::advance(iter, 2);  // OK
@end

---

@category Контейнеры
@subtitle Упорядоченное множество с дубликатами
# std::multiset

**std::multiset** — аналог set, но **допускает дубликаты**. Метод `insert` всегда успешен.

@badge-row
#include <set> | blue
O(log N) | green
Дубликаты ✓ | orange
@end

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">set vs multiset</span></div>
<pre style="font-size:1.1em;margin-top:16px">
<span class="hl2">std::set</span>:
  insert(42) → {it, <span class="hl3">true</span>}
  insert(42) → {it, <span class="hl4">false</span>}  ← дубликат отклонён
  count(42)  → 1

<span class="hl">std::multiset</span>:
  insert(42) → it  (всегда OK)
  insert(42) → it  (снова OK)
  count(42)  → <span class="hl3">2</span>

Обход multiset{3, 1, 4, 1, 5, 1}:
  → 1, 1, 1, 3, 4, 5
</pre>
</div>
@end

---

@category Контейнеры
# std::multiset — пример кода

@code cpp
std::multiset<int> values;

auto it1 = values.insert(42);
auto it2 = values.insert(42);
// Оба вызова успешны

std::cout << values.count(42);  // 2

// equal_range — все дубликаты
auto [lo, hi] = values.equal_range(42);
for (auto it = lo; it != hi; ++it)
    std::cout << *it << " "; // 42 42
@end

---

@category Контейнеры
@subtitle Словарь с упорядоченными ключами
# std::map

**std::map** хранит пары `{ключ, значение}` в отсортированном порядке ключей. Ключи уникальны.

@badge-row
#include <map> | blue
O(log N) | green
pair<const Key, Value> | purple
@end

@table
| Операция | Сложность | Примечание |
| :--- | :--- | :--- |
| `insert({k,v})` | O(log N) | Не перезаписывает |
| `operator[k]` | O(log N) | Создаёт если нет! |
| `at(k)` | O(log N) | throw если нет |
| `find(k)` | O(log N) | Итератор или end |
@end

@note
operator[] создаёт элемент с дефолтным значением, если ключа нет!
@end

---

@category Контейнеры
# std::map — Red-Black Tree

@diagram
<div style="text-align:center;line-height:2">
<div><span class="label">std::map — Red-Black Tree</span></div>
<pre style="font-size:1.2em;margin-top:20px">
            <span class="hl">"Marina":17</span>
           /              \
    <span class="hl2">"Alex":1</span>          <span class="hl2">"Petia":42</span>
                         /         \
                  <span class="hl3">"Mike":22</span>    <span class="hl3">"Vasia":10</span>
</pre>
<div style="margin-top:24px;font-size:1em">
  Обход (по ключу):<br/>
  Alex:1 → Marina:17 → Mike:22 → Petia:42 → Vasia:10
</div>
</div>
@end

---

@category Контейнеры
# std::map — пример кода

@code cpp
std::map<int, std::string> m;

// insert не перезаписывает
auto [it, ok] = m.insert({42, "Petia"});
auto [it2, ok2] = m.insert({42, "Vasia"});
// ok2 == false, значение осталось "Petia"

// operator[] создаёт если нет
m[42] = "Vasia"; // перезапишет!
m[100];          // создаст {100, ""}

// Безопасный доступ
if (auto it = m.find(42); it != m.end())
    std::cout << it->second;

// Итерация — по порядку ключей
for (auto& [key, value] : m)
    std::cout << key << ":" << value;
@end

---

@category Контейнеры
@subtitle Хеш-таблица — O(1) поиск и вставка
# std::unordered_set

**std::unordered_set** — контейнер на основе **хеш-таблицы**. Амортизированный O(1). Элементы **не упорядочены**.

@badge-row
#include <unordered_set> | blue
Аморт. O(1) | green
C++11 | orange
@end

- Требует `std::hash<T>` и `operator==`
- Дубликаты не допускаются
- Порядок итерации **не определён**
- Rehashing инвалидирует **все** итераторы
- Нет `lower_bound` / `upper_bound`

---

@category Контейнеры
# std::unordered_set — хеш-таблица

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Хеш-таблица (open hashing / chaining)</span></div>
<pre style="font-size:1.1em;margin-top:16px">
  bucket 0: ──→ [<span class="hl2">0</span>] → ∅
  bucket 1: ──→ [<span class="hl2">1</span>] → ∅
  bucket 2: ──→ [<span class="hl2">2</span>] → ∅
  bucket 3: ──→ [<span class="hl">3</span>] → [<span class="hl4">13</span>] → ∅  ← коллизия
  bucket 4: ──→ [<span class="hl2">4</span>] → ∅
  bucket 5: ──→ [<span class="hl2">5</span>] → ∅

  hash(key) % bucket_count → индекс бакета

  load_factor = size / bucket_count
  Rehashing при load_factor > max_load_factor
</pre>
</div>
@end

---

@category Контейнеры
# std::unordered_set — пример кода

@code cpp
std::unordered_set<int> values;

auto [it, ok] = values.insert(42);
// ok == true

auto [it2, ok2] = values.insert(42);
// ok2 == false (дубликат)

// Порядок итерации НЕ определён!
for (int i = 0; i < 10; ++i)
    values.insert(i);

for (auto& v : values)
    std::cout << v << " ";
// Может быть: 9 8 7 6 5 4 3 2 1 0
// или любой другой порядок!
@end

---

@category Контейнеры
# Сравнение ассоциативных контейнеров

@table
| | set | multiset | map | unordered_set |
| :--- | :--- | :--- | :--- | :--- |
| Структура | RB-дерево | RB-дерево | RB-дерево | Хеш-таблица |
| Порядок | Да | Да | По ключу | Нет |
| Дубликаты | Нет | Да | Нет | Нет |
| Поиск | O(log N) | O(log N) | O(log N) | **O(1)** |
| lower_bound | Да | Да | Да | Нет |
@end

@tip
unordered — для скорости, set/map — когда нужен порядок или lower_bound.
@end

---

@section Адаптеры контейнеров
@subtitle queue — обёртка над существующими контейнерами
@icon 🔄

---

@category Адаптеры
@subtitle Очередь FIFO — First In, First Out
# std::queue

**std::queue** — адаптер, реализующий очередь **FIFO**. По умолчанию использует `std::deque`.

@badge-row
#include <queue> | blue
FIFO | cyan
Адаптер над deque | purple
@end

@table
| Операция | Сложность | Описание |
| :--- | :--- | :--- |
| `push(val)` | O(1) | Добавить в конец |
| `pop()` | O(1) | Удалить из начала |
| `front()` | O(1) | Первый элемент |
| `back()` | O(1) | Последний элемент |
@end

---

@category Адаптеры
# std::queue — визуализация FIFO

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">FIFO — First In, First Out</span></div>
<pre style="font-size:1.2em;margin-top:20px">
  <span class="hl3">push()</span>                         <span class="hl4">pop()</span>
    │                              │
    ▼                              ▼
  ┌────┬────┬────┬────┬────┬────┬────┐
  │  9 │  8 │  7 │  6 │  5 │  4 │  3 │
  └────┴────┴────┴────┴────┴────┴────┘
  back()                       front()
</pre>
<div style="margin-top:20px;font-size:1em">
  push(10): [<span class="hl3">10</span>, 9, 8, 7, 6, 5, 4, 3]<br/>
  pop(): &nbsp;&nbsp; [10, 9, 8, 7, 6, 5, 4] → <span class="hl4">3</span> удалён<br/>
  front(): → 4 &nbsp;&nbsp; back(): → 10
</div>
</div>
@end

---

@category Адаптеры
# std::queue — пример кода

@code cpp
std::queue<int> q;

for (int i = 0; i < 10; ++i)
    q.push(i);

while (!q.empty()) {
    std::cout << "size=" << q.size()
              << " back=" << q.back()
              << " front=" << q.front()
              << std::endl;
    q.pop();
}
// front: 0, 1, 2, ..., 9 (по порядку)

// Нет итераторов, нет operator[]
// Нет конструктора от initializer_list
@end

---

@category Контейнеры
@subtitle Сводная таблица
# Инвалидация итераторов

@table
| Контейнер | insert/push | erase/pop |
| :--- | :--- | :--- |
| `vector` | Все (реаллок) | От точки удаления |
| `deque` | Все итераторы | От точки удаления |
| `list` | Никакие | Только удалённый |
| `forward_list` | Никакие | Только удалённый |
| `set / map` | Никакие | Только удалённый |
| `unordered_set` | Все (rehash) | Только удалённый |
@end

@note
Использование невалидного итератора — undefined behavior! Для vector сохраняйте индексы.
@end

---

@title Итоги
@subtitle Выбор правильного контейнера и алгоритма — ключ к эффективному C++
@badge Резюме
@items
- vector — по умолчанию
- set/map — когда нужен порядок
- unordered — когда нужна скорость
- lower/upper_bound — бинарный поиск
- partition — основа quicksort
- nth_element — медиана за O(N)
- priority_queue — очередь с приоритетом
@end

---

@title Корутины в C++20
@subtitle Приостановка, возобновление, генераторы и асинхронность
@badge C++20
@items
- co_await, co_yield, co_return
- promise_type, coroutine_handle
- Generator, Awaitable, suspend_always
@end

---

@section Что такое корутины?
@subtitle Функции, которые могут приостанавливать и возобновлять выполнение
@icon ⏸️

---

@category Корутины
@subtitle Эволюция функций в C++
# Корутины — определение

**Корутина** — это функция, которая может **приостановить** своё выполнение и **возобновить** его позже, сохраняя при этом своё состояние. Концепция предложена Мелвином Конвеем в 1963 году.

- Обычная функция: **вызов → выполнение → возврат**
- Корутина: **вызов → выполнение → приостановка → возобновление → ... → возврат**
- Корутины в C++20: **бесстековые** (stackless), **первого класса**
- Могут быть аргументами и возвращаемыми значениями функций

@note
Дональд Кнут называл процедуры частным случаем корутин.
@end

---

@category Корутины
# Функция vs Корутина

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">Обычная функция:</span></div>
<pre style="font-size:1.1em;margin-top:12px">
  Вызывающий          Функция
      │                  │
      │── call() ───────→│
      │                  │ выполнение...
      │                  │ выполнение...
      │←── return ───────│
      │                  ✕ (уничтожена)
</pre>
<div style="margin-top:24px"><span class="label">Корутина:</span></div>
<pre style="font-size:1.1em;margin-top:12px">
  Вызывающий          Корутина
      │                  │
      │── call() ───────→│
      │                  │ выполнение...
      │←── <span class="hl3">co_yield</span> ─────│  <span class="dim">← приостановка</span>
      │                  │  <span class="dim">(состояние сохранено)</span>
      │── <span class="hl2">resume()</span> ─────→│
      │                  │ выполнение...
      │←── <span class="hl3">co_yield</span> ─────│  <span class="dim">← приостановка</span>
      │── <span class="hl2">resume()</span> ─────→│
      │                  │ выполнение...
      │←── <span class="hl4">co_return</span> ────│
      │                  ✕
</pre>
</div>
@end

---

@category Корутины
@subtitle co_await, co_yield, co_return
# Три ключевых слова

Функция становится корутиной, если использует одно из трёх ключевых слов:

@table
| Ключевое слово | Назначение | Аналогия |
| :--- | :--- | :--- |
| `co_await expr` | Приостановить до готовности `expr` | Ожидание результата |
| `co_yield value` | Вернуть значение и приостановиться | Генератор / поток |
| `co_return value` | Завершить и вернуть значение | Аналог `return` |
@end

- `co_await` — неблокирующее ожидание (ресурсо-экономное)
- `co_yield` — основа генераторов и бесконечных потоков
- `co_return` — финальное завершение корутины

---

@category Корутины
# Ограничения корутин

Не каждая функция может быть корутиной. C++20 накладывает ряд ограничений:

- Корутины **не могут** содержать обычный `return` (только `co_return`)
- Нельзя использовать `auto` в качестве возвращаемого типа
- `constexpr` функции **не могут** быть корутинами
- **Конструкторы** и **деструкторы** не могут быть корутинами
- Функция `main()` **не может** быть корутиной
- Variadic arguments (`...`) не поддерживаются

@note
Корутина должна возвращать тип, содержащий вложенный promise_type.
@end

---

@section Генераторы
@subtitle Ленивые вычисления через co_yield
@icon 🔄

---

@category Корутины
# Жадный vs Ленивый генератор

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">Жадный генератор (обычная функция):</span></div>
<pre style="font-size:1em;margin-top:12px">
  getNumbers(-10, 11)
  → <span class="hl4">сразу</span> создаёт vector из <span class="hl4">21 элемента</span>
  → хранит <span class="hl4">ВСЁ</span> в памяти
  → даже если нужны только первые 5
</pre>
<div style="margin-top:24px"><span class="label">Ленивый генератор (корутина):</span></div>
<pre style="font-size:1em;margin-top:12px">
  generatorForNumbers(-10)
  → создаёт <span class="hl3">0 элементов</span> сразу
  → по запросу: <span class="hl3">co_yield</span> возвращает <span class="hl3">1 элемент</span>
  → корутина <span class="hl2">приостановлена</span> между запросами
  → может генерировать <span class="hl3">бесконечный</span> поток!
</pre>
</div>
@end

---

@category Корутины
# Жадный генератор — код

@code cpp
std::vector<int> getNumbers(int begin, int end,
                                int inc = 1)
{
    std::vector<int> numbers;  // ← аллокация
    for (int i = begin; i < end; i += inc)
        numbers.push_back(i);  // ← копирование
    return numbers;  // ← весь вектор
}

// Использование
const auto numbers = getNumbers(-10, 11);
for (auto n : numbers)
    std::cout << n << " ";
@end

@note
Проблема: весь набор данных хранится в памяти, даже если нужны только первые несколько элементов.
@end

---

@category Корутины
# Ленивый генератор — корутина

@code cpp
Generator<int> generatorForNumbers(int begin,
                                      int inc = 1)
{
    for (int i = begin; ; i += inc) { // бесконечный!
        co_yield i;  // вернуть значение и замереть
    }
}

// Использование
auto gen = generatorForNumbers(-10);
for (int i = 0; i <= 20; ++i) {
    gen.next();
    std::cout << gen.getValue() << " ";
}
// -10 -9 -8 -7 -6 -5 ... 10
@end

@note
Цикл бесконечный — но это не ошибка! Корутина генерирует значения по запросу.
@end

---

@section Фреймворк корутин
@subtitle promise_type, coroutine_handle, coroutine frame
@icon 🏗️

---

@category Корутины
# Три компонента корутины

Фреймворк корутин C++20 состоит из трёх ключевых частей:

@table
| Компонент | Описание | Расположение |
| :--- | :--- | :--- |
| **Promise object** | Управляет результатом корутины изнутри | Внутри frame |
| **Coroutine handle** | Не-владеющий handle для resume/destroy | У вызывающего |
| **Coroutine frame** | Состояние: promise, параметры, локалы | Куча (heap) |
@end

@note
Компилятор может оптимизировать аллокацию frame, если время жизни корутины вложено во время жизни вызывающего.
@end

---

@category Корутины
# Архитектура корутины

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Структура корутины</span></div>
<pre style="font-size:1em;margin-top:16px">
  Вызывающий код              Куча (heap)
 ┌──────────────┐           ┌───────────────────────┐
  │              │           │  <span class="hl2">Coroutine Frame</span>       │
  │  <span class="hl">coroutine</span>   │           │ ┌───────────────────┐ │
  │  <span class="hl">_handle</span> ────┼──────────→│ │ <span class="hl3">Promise object</span>    │ │
  │              │           │ │  initial_suspend  │ │
  │  .resume()   │           │ │  yield_value      │ │
  │  .destroy()  │           │ │  return_value     │ │
  │  .done()     │           │ │  final_suspend    │ │
  │              │           │ ├───────────────────┤ │
  └──────────────┘           │ │ Копии параметров  │ │
                             │ │ Локальные перемен. │ │
                             │ │ Точка приостановки│ │
                             │ └───────────────────┘ │
                             └───────────────────────┘
</pre>
</div>
@end

---

@category Корутины
# promise_type — интерфейс

Тип возврата корутины должен содержать вложенный `promise_type` с обязательными методами:

@table
| Метод | Назначение |
| :--- | :--- |
| `get_return_object()` | Создаёт объект, возвращаемый вызывающему |
| `initial_suspend()` | Приостановить в начале? (lazy vs eager) |
| `final_suspend()` | Приостановить в конце? (noexcept!) |
| `yield_value(v)` | Обработка `co_yield v` |
| `return_void()` | Обработка `co_return` без значения |
| `return_value(v)` | Обработка `co_return v` |
| `unhandled_exception()` | Обработка исключения в корутине |
@end

---

@category Корутины
# Жизненный цикл корутины

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Упрощённый workflow</span></div>
<pre style="font-size:0.95em;margin-top:12px">
<span class="hl2">1.</span> Аллокация coroutine frame
<span class="hl2">2.</span> Создание Promise promise
<span class="hl2">3.</span> auto result = promise.<span class="hl3">get_return_object()</span>
<span class="hl2">4.</span> co_await promise.<span class="hl3">initial_suspend()</span>
       │
       ▼
   ┌────────────────────────────┐
   │  <span class="hl">Тело корутины</span>              │
   │                            │
   │  co_yield val              │
   │    → promise.yield_value() │
   │    → <span class="hl3">suspend</span>              │
   │                            │
   │  co_return val             │
   │    → promise.return_value()│
   └────────────────────────────┘
       │
       ▼
<span class="hl2">5.</span> co_await promise.<span class="hl4">final_suspend()</span>
<span class="hl2">6.</span> Уничтожение frame
</pre>
</div>
@end

---

@category Корутины
@subtitle suspend_always и suspend_never
# Стандартные Awaitables

@code cpp
// Всегда приостанавливает (для lazy корутин)
struct suspend_always {
    bool await_ready() const noexcept {
        return false;  // не готов → приостановить
    }
    void await_suspend(coroutine_handle<>) const noexcept {}
    void await_resume() const noexcept {}
};

// Никогда не приостанавливает (для eager корутин)
struct suspend_never {
    bool await_ready() const noexcept {
        return true;   // готов → продолжить
    }
    void await_suspend(coroutine_handle<>) const noexcept {}
    void await_resume() const noexcept {}
};
@end

@note
initial_suspend() → suspend_always = ленивая корутина, suspend_never = немедленное выполнение.
@end

---

@section Реализация генератора
@subtitle Полный пример Generator<T>
@icon ⚙️

---

@category Корутины
# Generator — promise_type

@code cpp
template <typename T>
struct Generator {
  struct promise_type {
    T current_value;

    auto get_return_object() {
      return Generator{
        handle_type::from_promise(*this)};
    }
    auto initial_suspend() {
      return std::suspend_always{};  // lazy
    }
    auto final_suspend() noexcept {
      return std::suspend_always{};
    }
    auto yield_value(T value) {
      current_value = value;
      return std::suspend_always{};  // pause
    }
    void return_void() {}
    void unhandled_exception() { std::exit(1); }
  };
@end

---

@category Корутины
# Generator — handle и API

@code cpp
  // продолжение struct Generator:
  using handle_type =
      std::coroutine_handle<promise_type>;
  handle_type coro;

  Generator(handle_type h) : coro(h) {}
  ~Generator() { if (coro) coro.destroy(); }

  // Move-only (нельзя копировать корутину)
  Generator(Generator&& o) : coro(o.coro) {
      o.coro = nullptr;
  }
  Generator(const Generator&) = delete;

  T getValue() {
      return coro.promise().current_value;
  }
  bool next() {
      coro.resume();       // возобновить
      return !coro.done(); // ещё есть данные?
  }
};
@end

---

@category Корутины
# Generator — использование

@code cpp
Generator<int> getNext(int start = 0,
                          int step = 1) {
    auto value = start;
    for (int i = 0; ; ++i) {
        co_yield value;    // вернуть и замереть
        value += step;
    }
}

int main() {
    auto gen = getNext();
    for (int i = 0; i <= 10; ++i) {
        gen.next();
        std::cout << gen.getValue() << " ";
    }
    // 0 1 2 3 4 5 6 7 8 9 10

    auto gen2 = getNext(100, -10);
    for (int i = 0; i <= 10; ++i) {
        gen2.next();
        std::cout << gen2.getValue() << " ";
    }
    // 100 90 80 70 60 50 40 30 20 10 0
}
@end

---

@category Корутины
# Generator — поток выполнения

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Последовательность вызовов:</span></div>
<pre style="font-size:0.95em;margin-top:12px">
<span class="hl2">① auto gen = getNext();</span>
   → Создание promise (promise_type)
   → get_return_object() → Generator{handle}
   → initial_suspend() → <span class="hl3">ПРИОСТАНОВКА</span>

<span class="hl2">② gen.next();</span>  <span class="dim">// первый вызов</span>
   → coro.resume()
   → выполняется тело: co_yield 0
   → yield_value(0) → current_value = 0
   → <span class="hl3">ПРИОСТАНОВКА</span>

<span class="hl2">③ gen.getValue();</span>  → <span class="hl">0</span>

<span class="hl2">④ gen.next();</span>  <span class="dim">// второй вызов</span>
   → coro.resume()
   → value += step → co_yield 1
   → <span class="hl3">ПРИОСТАНОВКА</span>

<span class="hl2">⑤ gen.getValue();</span>  → <span class="hl">1</span>
   ... и так далее
</pre>
</div>
@end

---

@section co_await и синхронизация
@subtitle Неблокирующее ожидание и Event-driven архитектура
@icon ⏳

---

@category Корутины
@subtitle Три метода ожидания
# Awaitable — интерфейс

Выражение в `co_await expr` должно быть **Awaitable** — реализовывать три метода:

@table
| Метод | Назначение | Возврат |
| :--- | :--- | :--- |
| `await_ready()` | Результат уже готов? | `bool` |
| `await_suspend(handle)` | Что делать при приостановке? | `void/bool` |
| `await_resume()` | Что вернуть при возобновлении? | Значение |
@end

@diagram
<div style="text-align:left;line-height:2">
<pre style="font-size:1em;margin-top:8px">
co_await expr:
  <span class="hl2">await_ready()</span> ──→ true? ──→ <span class="hl3">await_resume()</span>
        │                          (не приостанавливать)
       false
        │
        ▼
  <span class="hl4">await_suspend(handle)</span>
  → приостановить корутину
  → ... ожидание события ...
  → handle.resume()
        │
        ▼
  <span class="hl3">await_resume()</span> → результат
</pre>
</div>
@end

---

@category Корутины
# Блокирующий vs Ожидающий сервер

@diagram
<div style="text-align:left;line-height:2.2">
<div><span class="label">Блокирующий сервер (без корутин):</span></div>
<pre style="font-size:1em;margin-top:8px">
Acceptor acceptor{443};
while (true) {
    Socket socket = acceptor.accept();    <span class="hl4">// blocking</span>
    auto request = socket.read();         <span class="hl4">// blocking</span>
    auto response = handleRequest(request);
    socket.write(response);               <span class="hl4">// blocking</span>
}
</pre>
<div style="margin-top:24px"><span class="label">Ожидающий сервер (с корутинами):</span></div>
<pre style="font-size:1em;margin-top:8px">
Acceptor acceptor{443};
while (true) {
    Socket s = <span class="hl3">co_await</span> acceptor.accept();  <span class="hl3">// async</span>
    auto req = <span class="hl3">co_await</span> socket.read();      <span class="hl3">// async</span>
    auto resp = handleRequest(req);
    <span class="hl3">co_await</span> socket.write(resp);            <span class="hl3">// async</span>
}
</pre>
<div style="margin-top:8px;font-size:0.85em;color:var(--text-muted)">
Тот же код, но вместо блокировки — экономное ожидание!
</div>
</div>
@end

---

@category Корутины
@subtitle Паттерн Sender-Receiver через co_await
# Event — синхронизация потоков

Класс **Event** реализует синхронизацию потоков через корутины — один поток отправляет (`notify`), другой ожидает (`co_await`).

- `suspendedWaiter` — атомарный указатель на ожидающую корутину
- `notified` — атомарный флаг: событие произошло?
- `operator co_await()` — возвращает Awaiter
- `notify()` — устанавливает флаг и возобновляет корутину

@note
В отличие от condition_variable, нет рисков spurious wakeup и lost wakeup!
@end

---

@category Корутины
# Event::Awaiter — реализация

@code cpp
class Event::Awaiter {
    const Event& event;
    std::coroutine_handle<> coroutineHandle;
public:
    Awaiter(const Event& e) : event(e) {}

    bool await_ready() const {
        // true → корутина НЕ приостанавливается
        return event.notified;
    }

    bool await_suspend(std::coroutine_handle<> ch) {
        coroutineHandle = ch;
        if (event.notified) return false;
        // сохранить для последующего notify
        event.suspendedWaiter.store(this);
        return true;  // приостановить
    }

    void await_resume() {}
};
@end

---

@category Корутины
# Event::notify — возобновление

@code cpp
void Event::notify() {
    notified = true;
    // загрузить ожидающую корутину
    auto* waiter = static_cast<Awaiter*>(
        suspendedWaiter.load());
    if (waiter != nullptr) {
        // возобновить корутину!
        waiter->coroutineHandle.resume();
    }
}

// Использование:
Task receiver(Event& event) {
    auto start = high_resolution_clock::now();
    co_await event;  // ← ожидание notify()
    std::cout << "Got the notification!";
    auto elapsed = high_resolution_clock::now() - start;
    std::cout << "Waited " << elapsed << " sec.";
}
@end

---

@category Корутины
# Sender-Receiver — поток выполнения

@diagram
<div style="text-align:left;line-height:2">
<div><span class="label">Сценарий 1: notify ДО co_await</span></div>
<pre style="font-size:0.95em;margin-top:8px">
  sender: event.notify()  → notified = <span class="hl3">true</span>
  receiver: co_await event
    → await_ready() → notified == <span class="hl3">true</span>
    → <span class="hl3">НЕ приостанавливать</span>, продолжить
    → Waited ~0 seconds
</pre>
<div style="margin-top:20px"><span class="label">Сценарий 2: notify ПОСЛЕ co_await</span></div>
<pre style="font-size:0.95em;margin-top:8px">
  receiver: co_await event
    → await_ready() → notified == <span class="hl4">false</span>
    → await_suspend() → <span class="hl4">ПРИОСТАНОВКА</span>
    → сохранить waiter
         ... ожидание 2 секунды ...
  sender: event.notify()
    → notified = true
    → waiter→coroutineHandle.<span class="hl3">resume()</span>
    → Waited ~2 seconds
</pre>
</div>
@end

---

@category Корутины
# Типичные сценарии использования

Корутины — универсальный инструмент для множества задач:

- **Генераторы** — бесконечные потоки данных, ленивые вычисления
- **Асинхронный I/O** — серверы, сетевое программирование
- **Событийные системы** — игры, симуляторы, UI
- **Кооперативная многозадачность** — каждая задача работает столько, сколько нужно
- **Пайплайны обработки** — цепочки преобразований данных

@table
| Свойство | Корутины | Потоки (threads) |
| :--- | :--- | :--- |
| Создание | <span style="color:var(--accent-green)">Легковесные</span> | Тяжёлые (1-2 MB стек) |
| Переключение | <span style="color:var(--accent-green)">Без ядра</span> | Через ядро ОС |
| Масштабируемость | <span style="color:var(--accent-green)">Миллиарды</span> | Тысячи |
| Многозадачность | Кооперативная | Вытесняющая |
@end

---

@category Корутины
# Generator с range-based for

@code cpp
template<std::integral T>
Generator<T> range(T first, const T last) {
    while (first < last)
        co_yield first++;
}

int main() {
    // Генератор символов A..Z
    for (const char i : range(65, 91))
        std::cout << i << ' ';
    // A B C D E F G H I J K L M N O P
    // Q R S T U V W X Y Z
}

// Генератор Фибоначчи
Generator<long long> fibonacci() {
    long long a = 0, b = 1;
    while (true) {
        co_yield a;
        auto tmp = a;
        a = b;
        b += tmp;
    }
}
@end

---

@title Итоги: Корутины C++20
@subtitle Новый уровень абстракции для асинхронности и ленивых вычислений
@badge Резюме
@items
- co_yield — генераторы
- co_await — асинхронность
- co_return — завершение
- promise_type — настройка
- coroutine_handle — управление
- suspend_always / never
- Awaitable интерфейс
@end
