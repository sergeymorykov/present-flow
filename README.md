# present-flow
Приложение для создания web презентаций.

## Синтаксис Markdown презентаций

Слайды разделяются строками `---`. Поддерживаются следующие теги и команды.

### Слайды

| Тег | Описание |
|-----|----------|
| `@title` | Титульный слайд. Следующие строки: заголовок, подзаголовок, автор, организация. Поддерживает команды оформления и `\date{...}`. |
| `@section Заголовок` | Слайд-разделитель с заголовком. После заголовка можно указать команды оформления. |
| `@yesScroll` | Первая строка контентного слайда — включает скролл (по умолчанию контент обрезается по области слайда без полосы прокрутки). |

### Блоки контента (закрываются через `@end`)

| Тег | Описание |
|-----|----------|
| `@style` | Блок с оформлением. После тега — команды `\align`, `\margin`, `\fontSize`, затем любой контент (текст, изображения, код и т.д.) до `@end`. |
| `@fragment` | Появляющийся по шагу фрагмент. В начале блока — опциональные команды оформления, далее текст (markdown). |
| `@columns` | Несколько колонок. После тега — общие команды оформления, затем секции `@column` (в каждой — свои команды и контент). Для колонок поддерживаются `\width` и `\height`. |
| `@column` | Разделитель колонок внутри `@columns`. После него — команды оформления колонки (в т.ч. `\width`, `\height`), затем контент до следующего `@column` или `@end`. |
| `@code [язык] [editable] [run=язык]` | Блок кода. Язык (cpp, js, python и т.д.), `editable` — редактируемый блок, `run=js` или `run=cpp` — кнопка «Запуск». Код до `@end`. |
| `@table` / `@table noborder` | Таблица. Строки в формате markdown-таблиц (`\| A \| B \|`) до `@end`. С `noborder` — без рамок. |
| `@image путь [width=N] [height=N]` | Вставка изображения. Путь (например `assets/pic.png`), опционально ширина и высота в пикселях. |

### Однострочные и префиксы

| Тег / команда | Описание |
|--------------|----------|
| `\list стиль` | Стиль маркера для следующего текстового блока. Стили: `disc`, `circle`, `square` (маркированные), `decimal`, `decimal-leading-zero`, `lower-alpha`, `upper-alpha` (нумерованные). |

### Команды оформления

Используются после `@title`, `@section`, внутри `@style`, в начале `@fragment` и перед/внутри колонок `@column`.

| Команда | Описание | Пример |
|---------|----------|--------|
| `\align left` \| `center` \| `right` | Выравнивание текста. | `\align center` |
| `\fontSize значение` | Размер шрифта (CSS). | `\fontSize 1.2rem` |
| `\margin T R B L` | Отступы: верх, право, низ, лево (четыре значения). | `\margin 1rem 2rem 1rem 2rem` |
| `\marginTop`, `\marginRight`, `\marginBottom`, `\marginLeft` | Отступ с одной стороны. | `\marginLeft 2rem` |
| `\width значение` | Ширина (для колонок). | `\width 50%` |
| `\height значение` | Высота (для колонок). | `\height 200px` |

### Примеры

**Титульный слайд с оформлением:**
```text
@title
\align center
\fontSize 2.5rem
Название доклада
Подзаголовок
Автор
Организация
\date{2026}
```

**Колонки с шириной и стилями:**
```text
@columns
\align center
@column
\width 40%
\align left
Левая колонка
@column
\width 60%
\align right
Правая колонка
@end
```

**Слайд со скроллом (по умолчанию скролл отключён):**
```text
---
@yesScroll
# Заголовок
Длинный контент с полосой прокрутки
---
```

## Running your presentation

- Run `yarn install` (or `npm install` or `pnpm install`) to install dependencies.
- Run `yarn start` (or `npm start` or `pnpm start`) to start the presentation.
- Edit `index.tsx` to add your presentation content.

## Building you presentation

To build your presentation for a production deploy, run `yarn build` (or `npm build` or `pnpm build`).

The build artifacts will be placed in the `dist` directory. If you'd like to change this location, edit `output.path` in `webpack.config.js`.