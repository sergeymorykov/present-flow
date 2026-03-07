@title
\align center
Алгоритмы и контейнеры STL
Лекция 6. Практика по `std::algorithm` и контейнерам
Разработка приложений на C++
\date{2026}

---

@section План лекции
\align center

---

# План

@columns
@column
\width 50%
**Часть 1 — Algorithms**

- `accumulate`, `partial_sum`
- `any_of`, `all_of`, `none_of`
- `find`, `binary_search`, `lower_bound`
- `sort`, `nth_element`, `partition`
- `copy`, `transform`, `remove`, `rotate`, `heap`
@column
\width 50%
**Часть 2 — Containers**

- Последовательные: `array`, `vector`, `deque`, `list`, `forward_list`
- Ассоциативные: `set`, `multiset`, `map`, `unordered_set`
- Адаптеры: `queue`, `stack`
- Инвалидация итераторов и выбор контейнера под задачу
@end

---

@section Algorithms
\align center

---
@yesScroll
# `accumulate`

@columns
@column
\width 58%
@code cpp editable run=cpp height=280px
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> values{1, 2, 3, 4, 5};
    double sum = std::accumulate(values.begin(), values.end(), 0.0);
    std::cout << "sum = " << sum << "\n";
}
@end
@column
\width 42%
@style
\bg rgba(59, 130, 246, 0.08)
\borderLeft 4px solid #3b82f6
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

`0 + 1 + 2 + 3 + 4 + 5 = 15`

Шаги:
- acc = 0
- acc = 1
- acc = 3
- acc = 6
- acc = 10
- acc = 15
@end
@end


@note tip
`accumulate` делает левую свертку по диапазону за \(O(n)\).
@end

---

# `partial_sum`

@columns
@column
\width 58%
@code cpp editable run=cpp height=260px
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> values{1, 2, 3, 4, 5};
    std::partial_sum(values.begin(), values.end(), values.begin());
    for (int v : values) std::cout << v << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(16, 185, 129, 0.08)
\borderLeft 4px solid #10b981
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

Вход: `1 2 3 4 5`

Выход:
- `1`
- `1+2 = 3`
- `1+2+3 = 6`
- `1+2+3+4 = 10`
- `1+2+3+4+5 = 15`
@end
@end

---

# `any_of`

@columns
@column
\width 58%
@code cpp editable run=cpp height=220px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{30, 42, 64, 73, 91};
    bool hasSmall = std::any_of(values.begin(), values.end(), [](int x) { return x < 20; });
    std::cout << std::boolalpha << hasSmall << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(168, 85, 247, 0.08)
\borderLeft 4px solid #a855f7
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

Проверка предиката `< 20`:

`30(false) -> 42(false) -> 64(false) -> 73(false) -> 91(false)`

Итог: `false`
@end
@end

---

# `all_of`

@columns
@column
\width 58%
@code cpp editable run=cpp height=220px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{2, 4, 6, 8, 10};
    bool allEven = std::all_of(values.begin(), values.end(), [](int x) { return x % 2 == 0; });
    std::cout << std::boolalpha << allEven << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(234, 179, 8, 0.10)
\borderLeft 4px solid #eab308
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

`2(true) -> 4(true) -> 6(true) -> 8(true) -> 10(true)`

Все элементы подходят.

Итог: `true`
@end
@end

---

# `none_of`

@columns
@column
\width 58%
@code cpp editable run=cpp height=220px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{15, 42, 64, 73, 91};
    bool noneNegative = std::none_of(values.begin(), values.end(), [](int x) { return x < 0; });
    std::cout << std::boolalpha << noneNegative << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(34, 197, 94, 0.10)
\borderLeft 4px solid #22c55e
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

Проверяем условие `< 0`:

`15(false), 42(false), 64(false), 73(false), 91(false)`

Ни один не подходит.

Итог: `true`
@end
@end

---
@yesScroll
# `binary_search`

@columns
@column
\width 58%
@code cpp editable run=cpp height=260px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> sorted{1, 3, 4, 7, 9, 11, 15, 20};
    bool found = std::binary_search(sorted.begin(), sorted.end(), 9);
    std::cout << std::boolalpha << found << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(239, 68, 68, 0.08)
\borderLeft 4px solid #ef4444
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация (по шагам):**

Диапазон: `[1 3 4 7 9 11 15 20]`

- mid = `7` -> идем вправо
- mid = `11` -> идем влево
- mid = `9` -> найдено
@end
@end

@warning
Обязательное условие: диапазон отсортирован.
@end

---

# `find`

@columns
@column
\width 58%
@code cpp editable run=cpp height=280px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{10, 20, 30, 40, 50};
    auto it = std::find(values.begin(), values.end(), 30);
    if (it != values.end()) {
        std::cout << "index: " << std::distance(values.begin(), it) << '\n';
    }
}
@end
@column
\width 42%
@style
\bg rgba(14, 165, 233, 0.10)
\borderLeft 4px solid #0ea5e9
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

Линейный проход:

`10 -> 20 -> 30(found) -> stop`

Сложность:
- лучший случай: `O(1)`
- худший случай: `O(n)`
@end
@end

---

# `lower_bound`

@columns
@column
\width 58%
@code cpp editable run=cpp height=250px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{1, 2, 3, 3, 3, 4, 5, 6};
    auto lo = std::lower_bound(values.begin(), values.end(), 3);
    std::cout << "first 3 index: " << std::distance(values.begin(), lo) << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(99, 102, 241, 0.10)
\borderLeft 4px solid #6366f1
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

`1 2 [3 3 3] 4 5 6`

`lower_bound(3)` указывает на
самый левый `3`.
@end
@end

---

# `upper_bound`

@columns
@column
\width 58%
@code cpp editable run=cpp height=250px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{1, 2, 3, 3, 3, 4, 5, 6};
    auto hi = std::upper_bound(values.begin(), values.end(), 3);
    std::cout << "after last 3 index: " << std::distance(values.begin(), hi) << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(6, 182, 212, 0.10)
\borderLeft 4px solid #06b6d4
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

`1 2 [3 3 3] 4 5 6`

`upper_bound(3)` указывает
на первый элемент `> 3`,
то есть на `4`.
@end
@end

---

# `sort`

@columns
@column
\width 58%
@code cpp editable run=cpp height=250px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{9, 7, 2, 6, 5, 1, 8, 4, 3, 0};
    std::sort(values.begin(), values.end());
    for (int x : values) std::cout << x << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(59, 130, 246, 0.08)
\borderLeft 4px solid #3b82f6
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

До:
`9 7 2 6 5 1 8 4 3 0`

После:
`0 1 2 3 4 5 6 7 8 9`
@end
@end

---

# `partial_sort`

@columns
@column
\width 58%
@code cpp editable run=cpp height=250px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{9, 7, 2, 6, 5, 1, 8, 4, 3, 0};
    std::partial_sort(values.begin(), values.begin() + 3, values.end());
    for (int x : values) std::cout << x << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(16, 185, 129, 0.08)
\borderLeft 4px solid #10b981
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

`[0 1 2]` - гарантированно на своих местах.

Остальной хвост:
`? ? ? ? ? ? ?`

Не полностью отсортирован.
@end
@end

---

# `nth_element`

@columns
@column
\width 58%
@code cpp editable run=cpp height=260px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{9, 7, 2, 6, 5, 1, 8, 4, 3, 0};
    const std::size_t mid = values.size() / 2;
    std::nth_element(values.begin(), values.begin() + mid, values.end());
    std::cout << "median candidate: " << values[mid] << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(168, 85, 247, 0.08)
\borderLeft 4px solid #a855f7
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

После `nth_element(mid)`:

- слева все `<= values[mid]`
- справа все `>= values[mid]`
- порядок внутри половин не гарантирован
@end
@end

---

# `partition`

@columns
@column
\width 58%
@code cpp editable run=cpp height=280px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{50, 11, 72, 8, 67, 42, 3, 91, 27};
    auto middle = std::partition(values.begin(), values.end(), [](int x) { return x < 50; });
    std::cout << "middle index: " << std::distance(values.begin(), middle) << "\n";
    for (int x : values) std::cout << x << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(234, 179, 8, 0.10)
\borderLeft 4px solid #eab308
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

`[ < 50 | >= 50 ]`

Пример выхода:
`11 8 42 3 27 | 50 72 67 91`

Граница возвращается итератором `middle`.
@end
@end

---

# `transform`

@columns
@column
\width 58%
@code cpp editable run=cpp height=250px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{0, 1, 2, 3, 4};
    std::transform(values.begin(), values.end(), values.begin(), [](int x) { return x * x; });
    for (int x : values) std::cout << x << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(34, 197, 94, 0.10)
\borderLeft 4px solid #22c55e
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

`0 1 2 3 4`

`x -> x*x`

`0 1 4 9 16`
@end
@end

---
@yesScroll
# `remove` + `erase`

@columns
@column
\width 58%
@code cpp editable run=cpp height=250px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{0, 1, 2, 5, 3, 5, 4, 5};
    values.erase(std::remove(values.begin(), values.end(), 5), values.end());
    for (int x : values) std::cout << x << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(239, 68, 68, 0.08)
\borderLeft 4px solid #ef4444
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

1) `remove(5)` сдвигает "полезные" элементы в начало  
2) Хвост остается "мусором"  
3) `erase(...)` реально укорачивает `vector`
@end
@end

@warning
`std::remove` сам по себе не удаляет элементы из контейнера.
@end

---

# `rotate`

@columns
@column
\width 58%
@code cpp editable run=cpp height=220px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{0, 1, 2, 3, 4, 5, 6};
    std::rotate(values.begin(), values.begin() + 3, values.end());
    for (int x : values) std::cout << x << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(14, 165, 233, 0.10)
\borderLeft 4px solid #0ea5e9
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

До:
`0 1 2 3 4 5 6`

`rotate(begin + 3)`

После:
`3 4 5 6 0 1 2`
@end
@end

---

# `copy_if`

@columns
@column
\width 58%
@code cpp editable run=cpp height=260px
#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> src{0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    std::vector<int> dst;
    std::copy_if(src.begin(), src.end(), std::back_inserter(dst), [](int x) { return x > 5; });
    for (int x : dst) std::cout << x << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(16, 185, 129, 0.08)
\borderLeft 4px solid #10b981
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

Вход:
`0 1 2 3 4 5 6 7 8 9`

Фильтр: `x > 5`

Выход:
`6 7 8 9`
@end
@end

---

# `make_heap`

@columns
@column
\width 58%
@code cpp editable run=cpp height=250px
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> data{3, 1, 8, 5, 2, 9, 4};
    std::make_heap(data.begin(), data.end());
    std::cout << std::boolalpha << std::is_heap(data.begin(), data.end()) << '\n';
    for (int x : data) std::cout << x << ' ';
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(99, 102, 241, 0.10)
\borderLeft 4px solid #6366f1
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация max-heap:**

```
      9
    /   \
   5     8
  / \   / \
 3   2 1   4
```
@end
@end

---

# `priority_queue`

@columns
@column
\width 58%
@code cpp editable run=cpp height=250px
#include <iostream>
#include <queue>

int main() {
    std::priority_queue<int> q;
    for (int x : {3, 1, 8, 5, 2, 9, 4}) q.push(x);
    while (!q.empty()) {
        std::cout << q.top() << ' ';
        q.pop();
    }
    std::cout << '\n';
}
@end
@column
\width 42%
@style
\bg rgba(99, 102, 241, 0.10)
\borderLeft 4px solid #6366f1
\padding 0.6rem 0.8rem
\borderRadius 8px
**Визуализация:**

Каждый `pop()` возвращает
максимальный элемент:

`9 -> 8 -> 5 -> 4 -> 3 -> 2 -> 1`
@end
@end

---

@section Containers
\align center

---
@yesScroll
# `array`
@columns
@column
\width 58%
@code cpp editable run=cpp height=300px
#include <array>
#include <iostream>
#include <iterator>

int main() {
    std::array<int, 6> values = {10, 20, 30, 40, 50, 60};
    auto it = std::next(values.begin(), 2);

    std::cout << "size = " << values.size() << "\n";
    std::cout << "third = " << *it << "\n";
    std::cout << "data ptr = " << values.data() << "\n";
}
@end
@column
\width 42%
@style
\bg rgba(59, 130, 246, 0.08)
\borderLeft 4px solid #3b82f6
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Создаем `std::array` фиксированного размера.  
2) Получаем итератор через `std::next`.  
3) Читаем элемент и метаданные (`size`, `data`).

@end
@end

---
@yesScroll
# `vector`
@columns
@column
\width 58%
@code cpp editable run=cpp height=320px
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values;
    auto capacity = values.capacity();
    std::cout << "initial capacity = " << capacity << "\n";

    for (int i = 0; i < 20; ++i) {
        values.push_back(i);
        if (values.capacity() != capacity) {
            capacity = values.capacity();
            std::cout << "grow at i=" << i << ", capacity=" << capacity << "\n";
        }
    }
}
@end
@column
\width 42%
@style
\bg rgba(16, 185, 129, 0.10)
\borderLeft 4px solid #10b981
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Начинаем с пустого `vector`.  
2) На каждом `push_back` проверяем `capacity`.  
3) Фиксируем моменты realocation.

рост емкости и риск инвалидации итераторов.
@end
@end

---
@yesScroll
# `deque`
@columns
@column
\width 58%
@code cpp editable run=cpp height=320px
#include <deque>
#include <iostream>

int main() {
    std::deque<int> values = {0, 1, 2, 3, 4};
    auto prev = &values[0];

    for (int i = 5; i < 100; ++i) {
        values.push_back(i);
        auto cur = &values.back();
        if (cur - prev > 1) {
            std::cout << "bucket switch near value " << i << "\n";
            break;
        }
        prev = cur;
    }
}
@end
@column
\width 42%
@style
\bg rgba(14, 165, 233, 0.10)
\borderLeft 4px solid #0ea5e9
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Наполняем `deque`.  
2) Сравниваем адреса соседних добавлений.  
3) Ловим переход между сегментами (bucket).

 хранение блоками, а не одним сплошным массивом.
@end
@end

---
@yesScroll
# `list`
@columns
@column
\width 58%
@code cpp editable run=cpp height=290px
#include <iostream>
#include <list>

int main() {
    std::list<int> values = {0, 1, 2, 3, 4, 5};
    auto it = std::next(values.begin(), 2);

    values.push_front(42);
    values.push_back(99);

    std::cout << "iterator still points to: " << *it << "\n";
}
@end
@column
\width 42%
@style
\bg rgba(234, 179, 8, 0.10)
\borderLeft 4px solid #eab308
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Берем итератор в середину списка.  
2) Добавляем узлы в начало и конец.  
3) Проверяем, что старый итератор валиден.

стабильные итераторы для узлового контейнера.
@end
@end

---
@yesScroll
# `forward_list`
@columns
@column
\width 58%
@code cpp editable run=cpp height=300px
#include <forward_list>
#include <iostream>
#include <iterator>

int main() {
    std::forward_list<int> values = {1, 2, 3, 4, 5};
    auto it = std::next(values.begin(), 2);

    values.push_front(0);
    values.insert_after(values.begin(), 42);

    std::advance(it, 1);
    std::cout << "advanced value = " << *it << "\n";
}
@end
@column
\width 42%
@style
\bg rgba(168, 85, 247, 0.10)
\borderLeft 4px solid #a855f7
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Работаем только через forward-итераторы.  
2) Вставка выполняется `insert_after`.  
3) Перемещение — через `std::advance`.

односвязный список и минимальный overhead.
@end
@end

---
@yesScroll
# `set`
@columns
@column
\width 58%
@code cpp editable run=cpp height=300px
#include <iostream>
#include <set>

int main() {
    std::set<int> values;
    auto r1 = values.insert(42);
    auto r2 = values.insert(42);
    for (int x : {7, 2, 9, 1}) values.insert(x);

    std::cout << "first insert: " << r1.second << "\n";
    std::cout << "second insert: " << r2.second << "\n";
    for (int v : values) std::cout << v << ' ';
    std::cout << "\n";
}
@end
@column
\width 42%
@style
\bg rgba(239, 68, 68, 0.08)
\borderLeft 4px solid #ef4444
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Вставляем значение дважды.  
2) Проверяем флаг `inserted`.  
3) Выводим контейнер в отсортированном порядке.

уникальные ключи + упорядоченность.
@end
@end

---
@yesScroll
# `multiset`
@columns
@column
\width 58%
@code cpp editable run=cpp height=260px
#include <iostream>
#include <set>

int main() {
    std::multiset<int> values;
    values.insert(42);
    values.insert(42);
    values.insert(42);

    std::cout << "count(42) = " << values.count(42) << "\n";
}
@end
@column
\width 42%
@style
\bg rgba(6, 182, 212, 0.10)
\borderLeft 4px solid #06b6d4
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Несколько раз вставляем один и тот же ключ.  
2) Подсчитываем количество через `count`.

дубликаты разрешены.
@end
@end

---
@yesScroll
# `map`
@columns
@column
\width 58%
@code cpp editable run=cpp height=320px
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<int, std::string> users;
    auto a = users.insert({42, "Petia"});
    auto b = users.insert({42, "Vasia"});

    std::cout << "insert second? " << b.second << "\n";
    std::cout << "value by key 42: " << users[42] << "\n";
}
@end
@column
\width 42%
@style
\bg rgba(99, 102, 241, 0.10)
\borderLeft 4px solid #6366f1
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Добавляем пару ключ-значение.  
2) Пытаемся вставить тот же ключ снова.  
3) Считываем сохраненное значение.

уникальность ключей и ассоциированный доступ.
@end
@end

---
@yesScroll
# `unordered_set`
@columns
@column
\width 58%
@code cpp editable run=cpp height=300px
#include <iostream>
#include <string>
#include <unordered_set>

int main() {
    std::unordered_set<std::string> values;
    values.insert("42");
    values.insert("42");
    for (int i = 0; i < 5; ++i) values.insert(std::to_string(i));

    std::cout << "size = " << values.size() << "\n";
    for (const auto& v : values) std::cout << v << ' ';
    std::cout << "\n";
}
@end
@column
\width 42%
@style
\bg rgba(34, 197, 94, 0.10)
\borderLeft 4px solid #22c55e
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Храним ключи в hash-таблице.  
2) Проверяем уникальность при вставке.  
3) Смотрим произвольный порядок обхода.

быстрый доступ в среднем, порядок не гарантирован.
@end
@end

---
@yesScroll
# `queue`
@columns
@column
\width 58%
@code cpp editable run=cpp height=300px
#include <iostream>
#include <queue>

int main() {
    std::queue<int> q;
    for (int i = 1; i <= 5; ++i) q.push(i);

    while (!q.empty()) {
        std::cout << "front=" << q.front() << " back=" << q.back() << "\n";
        q.pop();
    }
}
@end
@column
\width 42%
@style
\bg rgba(14, 165, 233, 0.10)
\borderLeft 4px solid #0ea5e9
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Добавляем элементы в хвост (`push`).  
2) Читаем голову (`front`).  
3) Удаляем из головы (`pop`).

FIFO-поведение.
@end
@end

---
@yesScroll
# `stack`
@columns
@column
\width 58%
@code cpp editable run=cpp height=300px
#include <iostream>
#include <stack>

int main() {
    std::stack<int> s;
    for (int i = 1; i <= 5; ++i) s.push(i);

    while (!s.empty()) {
        std::cout << "top=" << s.top() << "\n";
        s.pop();
    }
}
@end
@column
\width 42%
@style
\bg rgba(168, 85, 247, 0.10)
\borderLeft 4px solid #a855f7
\padding 0.6rem 0.8rem
\borderRadius 8px
**Алгоритм работы:**

1) Добавляем элементы в вершину (`push`).  
2) Читаем вершину (`top`).  
3) Удаляем из вершины (`pop`).

LIFO-поведение.
@end
@end

---

# Как выбрать контейнер/алгоритм

@columns
@column
\width 50%
**Если важен порядок и уникальность ключей:**
- `std::set`, `std::map`

**Если важна скорость в среднем:**
- `std::unordered_set`

**Если нужен динамический массив:**
- `std::vector` (+ `reserve`)
@column
\width 50%
**Если много вставок в середину по итератору:**
- `std::list`

**Если нужна двусторонняя очередь:**
- `std::deque`

**Для top-k и приоритетов:**
- `std::priority_queue` + heap-алгоритмы
@end

---

# Типичные ошибки

@warning
1) Вызывать `binary_search` на неотсортированном диапазоне.  
2) Забывать remove-erase idiom после `std::remove`.  
3) Использовать старые итераторы после realocation у `vector`.  
4) Ожидать порядок от `unordered_set`.  
5) Пытаться итерироваться по `queue`/`stack` напрямую.
@end

---

# Итоги

- Алгоритмы STL дают переиспользуемые шаблоны обработки диапазонов.
- Большинство задач решается комбинацией: **контейнер + алгоритм + лямбда**.
- Для корректности важны предусловия (сортировка, валидность итераторов).
- Для производительности важен осознанный выбор структуры данных.
