# present-flow
Приложение для создания web презентаций.

## Синтаксис Markdown презентаций

Слайды разделяются строками `---`. Поддерживаются следующие теги и команды.

### Слайды

| Тег | Описание |
|-----|----------|
| `@title` | Титульный слайд. Следующие строки: заголовок, подзаголовок, автор, организация. Поддерживает команды оформления и `\date{...}`. |
| `@section Заголовок` | Слайд-разделитель с заголовком. После заголовка можно указать команды оформления. |
| `@noScroll` | Первая строка контентного слайда — без полосы прокрутки (значение по умолчанию). Контент обрезается по области слайда. |
| `@yesScroll` | Первая строка контентного слайда — включает полосу прокрутки, если контент не помещается. |

### Блоки контента (закрываются через `@end`)

| Тег | Описание |
|-----|----------|
| `@style` | Блок с оформлением. После тега — команды `\align`, `\margin`, `\fontSize`, затем любой контент (текст, изображения, код и т.д.) до `@end`. |
| `@fragment` | Появляющийся по шагу фрагмент. В начале блока — опциональные команды оформления: `\align`, `\margin`, `\marginTop` / `\marginRight` / `\marginBottom` / `\marginLeft`, `\fontSize`, далее текст (markdown). Списки внутри фрагмента имеют уменьшенный отступ. |
| `@columns` | Несколько колонок. После тега — общие команды оформления, затем секции `@column` (в каждой — свои команды и контент). Для колонок поддерживаются `\width` и `\height`. |
| `@column` | Разделитель колонок внутри `@columns`. После него — команды оформления колонки (в т.ч. `\width`, `\height`), затем контент до следующего `@column` или `@end`. |
| `@code [язык] [editable] [readonly] [width=...] [height=...] [run=язык]` | Блок кода. Язык (cpp, js, python, powershell, bash и т.д.). `readonly` — подсветка без редактирования. `editable` — редактируемый блок. `width=...` и `height=...` — размеры (например `width=600px height=100px`). `run=js` или `run=cpp` — кнопка «Запуск». Код до `@end`. Блоки кода можно размещать внутри `@columns` / `@column`. |
| `@table` / `@table noborder` | Таблица. Строки в формате markdown-таблиц (`\| A \| B \|`) до `@end`. С `noborder` — без рамок. |
| `@image путь [width=N] [height=N]` | Вставка изображения. Путь (например `assets/pic.png`), опционально ширина и высота в пикселях. |
| `@video путь [fullSlide]` | Вставка видео. Путь (URL или `assets/video.mp4`). С опцией `fullSlide` — растягивается на весь слайд (object-fit: cover). |

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

**Слайд со скроллом (по умолчанию — без скролла, контент обрезается):**
```text
---
@yesScroll
# Заголовок
Длинный контент с полосой прокрутки
---
```

**Блок кода PowerShell (только подсветка, фиксированные размеры):**
```text
@code powershell readonly width=600px height=200px
PS C:\>git clone https://github.com/microsoft/vcpkg C:\vcpkg
PS C:\>cd C:\vcpkg
PS C:\>.\bootstrap-vcpkg.bat
@end
```

**Блок кода shell (bash):**
```text
@code bash
# Установка Qt через vcpkg
./vcpkg install qtbase:x64-windows
@end
```

**Фрагмент с отступами и размером шрифта:**
```text
@fragment
\marginTop 0.5rem
\fontSize 1.1rem
- Пункт один
- Пункт два
@end
```

**Колонки с кодом и текстом:**
```text
@columns
@column
@code py readonly
print("Hello")
@end
@column
Текст рядом с кодом
@end
@end
```

## Running your presentation

- Run `yarn install` (or `npm install` or `pnpm install`) to install dependencies.
- Run `yarn start` (or `npm start` or `pnpm start`) to start the presentation.
- Edit `index.tsx` to add your presentation content.

## Building you presentation

To build your presentation for a production deploy, run `yarn build` (or `npm build` or `pnpm build`).

The build artifacts will be placed in the `dist` directory. If you'd like to change this location, edit `output.path` in `webpack.config.js`.