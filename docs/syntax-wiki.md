# Синтаксис Markdown презентаций

Слайды разделяются строками `---`. Таблицы ниже генерируются автоматически из parser-driven реестра.

## Слайды

| Тег | Синтаксис | Описание |
|-----|----------|----------|
| `@title` | `@title` | Титульный слайд. |
| `@section` | `@section Заголовок` | Слайд-разделитель. |
| `@yesScroll` | `@yesScroll` | Включает скролл на контентном слайде. |

По умолчанию (без `@yesScroll`) скролл выключен — это поведение, которое раньше обозначалось как `@noScroll`.

## Блоки контента (закрываются через `@end`)

| Тег | Синтаксис | Описание |
|-----|----------|----------|
| `@style` | `@style ... @end` | Стилизованный контейнер для дочернего контента. |
| `@fragment` | `@fragment ... @end` | Фрагмент, который появляется по шагам. |
| `@columns/@column` | `@columns ... @column ... @column ... @end` | Макет из колонок с индивидуальными стилями. |
| `@code` | `@code [language] [editable\|readonly] [width=...] [height=...] [run=lang] [highlight=lineNum:color,] ... [@step ...] @end` | Блок кода с опциональными шагами раскрытия (разделяются `@step`). |
| `@table` | `@table [noborder] [width=...] [height=...] ... @end` | Markdown-таблица с опциональными рамками и размерами. |
| `@note/@warning/@important` | `@note [label] ... @end` | Блоки заметок с вариантами note/warning/important. |
| `@tip` | `@tip [label] ... @end` | Блок подсказки с акцентом на практические рекомендации. |

## Однострочные и префиксы

| Тег | Синтаксис | Описание |
|-----|----------|----------|
| `@image` | `@image путь [width=N] [height=N]` | Вставка изображения. |
| `@video` | `@video путь [fullSlide]` | Вставка видео. |
| `@divider` | `@divider [color]` | Горизонтальный разделитель. |
| `\list` | `\list style` | Задает стиль списка для следующего текстового блока. |

## Команды оформления

| Команда | Описание |
|---------|----------|
| `\align` | Выравнивание текста |
| `\margin` | Отступы в порядке top/right/bottom/left |
| `\marginTop\|\marginRight\|\marginBottom\|\marginLeft` | Отступ одной стороны |
| `\fontSize` | Размер текста |
| `\width` | Ширина блока |
| `\height` | Высота блока |
| `\bg` | Фон блока |
| `\color` | Цвет текста |
| `\padding` | Внутренний отступ |
| `\borderLeft` | Левая граница |
| `\borderRadius` | Скругление углов |
| `\gap` | Расстояние между элементами |
| `\border` | Граница блока |

## Стили списка

Команда `\list` поддерживает стили: `disc`, `circle`, `square`, `decimal`, `decimal-leading-zero`, `lower-alpha`, `upper-alpha`.

## Live-демо

В блоках ниже можно менять пример и сразу видеть результат.

### @title

```presentation-demo
@title
\align center
\fontSize 2.2rem
Present Flow
Синтаксис и live demo
Автор
Команда
\date{2026}
```

### @section

```presentation-demo
@section Раздел 1
\align center
\fontSize 2rem
```

### @yesScroll

```presentation-demo
@yesScroll
# Длинный контент
- Строка 1
- Строка 2
- Строка 3
- Строка 4
- Строка 5
- Строка 6
- Строка 7
- Строка 8
- Строка 9
- Строка 10
```

### @style

```presentation-demo
@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\margin 0.5rem 0 0.5rem 0
\borderLeft 4px solid #38bdf8
\border 1px solid #334155
\borderRadius 8px
Текст внутри блока @style
@end
```

### @fragment

```presentation-demo
@fragment
\marginTop 0.5rem
\fontSize 1.1rem
- Шаг 1
- Шаг 2
@end
```

### @columns/@column

```presentation-demo
@columns
\gap 1rem
@column
\width 45%
\align left
Левая колонка
@column
\width 55%
\align right
Правая колонка
@end
```

### @code

```presentation-demo
@code js editable run=js height=180px
const sum = (a, b) => a + b;
console.log('2 + 3 =', sum(2, 3));
@end
```

### @code с @step (пошаговое раскрытие)

```presentation-demo
@code cpp readonly
#include <iostream>
@step
#include <iostream>

int main() {

}
@step
#include <iostream>

int main() {
  std::cout << "Hello, world!" << std::endl;
}
@end
```

### @table

```presentation-demo
@table noborder width=100% height=220px
| Опция | Значение |
| --- | --- |
| border | off |
| width | 100% |
| height | 220px |
@end
```

### @note/@warning/@important

```presentation-demo
@note Примечание
\padding 0.75rem
Этот блок подходит для дополнительной информации.
@end
```

```presentation-demo
@warning Внимание
\padding 0.75rem
Этот блок подходит для важных ограничений и рисков.
@end
```

```presentation-demo
@important Важно
\padding 0.75rem
Этот блок подходит для важных ограничений и рисков.
@end
```

### @tip

```presentation-demo
@tip Полезно
\padding 0.75rem
Используйте @tip, когда нужен акцент на рекомендации.
@end
```

```presentation-demo
@tip Быстрый совет
\bg rgba(34, 197, 94, 0.15)
\borderLeft 4px solid #22c55e
\padding 1rem
Проверяйте команды run=js прямо в live-preview.
@end
```

```presentation-demo
@columns
@column
\width 52%
@tip В колонке
\fontSize 1rem
- Сжимайте блоки
- Давайте короткие советы
@end
@column
\width 48%
Текст рядом с подсказкой.
@end
```

### @image

```presentation-demo
@image https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80 width=420 height=240
```

### @video

```presentation-demo
@video https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4
```

### @divider

```presentation-demo
Текст до разделителя
@divider #22c55e
Текст после разделителя
```

### \list

```presentation-demo
\list upper-alpha
- Первый пункт
- Второй пункт
- Третий пункт
```
