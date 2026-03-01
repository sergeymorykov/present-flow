# present-flow
Приложение для создания web презентаций.

Описание тегов и опций синтаксиса: в приложении — кнопка **Справка** в редакторе; в репозитории — [docs/syntax-wiki.md](docs/syntax-wiki.md).

## Запуск

- Установка: `yarn install` (или `npm install` / `pnpm install`).
- Запуск: `yarn dev` (или `npm run dev` / `pnpm dev`).

## Сборка

Для production: `yarn build` (или `npm run build` / `pnpm build`). Результат в каталоге `dist`.

## Скрипты

- `dev` — запуск dev-сервера Vite.
- `build` — типизация TypeScript (`tsc`) и production-сборка Vite.
- `preview` — локальный предпросмотр собранного `dist`.
- `docs:syntax` — генерация wiki синтаксиса из parser-driven реестра в:
  - `docs/syntax-wiki.md`
  - `src/content/syntax-wiki.md`
- `docs:syntax:check` — проверка, что wiki уже актуальна (если нет — команда завершится с ошибкой).
- `docs:syntax:integrity` — проверка целостности синхронизации: соответствие реестра, парсера и wiki.
- `docs:syntax:verify` — полная проверка документации (`docs:syntax:check` + `docs:syntax:integrity`).

## Как добавить новую презентацию

Презентации лежат в `src/presentations/` и состоят из двух частей:
- markdown-контент со слайдами (`*.md`);
- React-компонент-обертка (`Presentation*.tsx`), который парсит markdown и рендерит слайды.

Рекомендуемая структура: отдельная папка на каждую презентацию, где рядом лежат `tsx`, `md` и `assets`.

Пример:

`src/presentations/lecture8_1/`
- `PresentationLecture8_1.tsx`
- `lecture8_1.md`
- `assets/...`

### 1) Создайте папку-блок презентации и добавьте markdown

Создайте папку, например:
- `src/presentations/lecture8_1/`

И внутри неё markdown-файл:
- `src/presentations/lecture8_1/lecture8_1.md`

Если используете картинки, храните их внутри папки презентации (например, `src/presentations/lecture8_1/assets/...`) и указывайте в markdown путь вида:
- `assets/lecture8/example.png`

### 2) Создайте компонент презентации в этой же папке

Создайте файл, например `src/presentations/lecture8_1/PresentationLecture8_1.tsx`:
- импортируйте markdown как raw: `import markdownContent from './lecture8_1.md?raw';`
- при необходимости импортируйте изображения и добавьте их в `IMAGE_MAP`;
- распарсьте markdown через `parsePresentation`;
- отрисуйте через `SlideRenderer`.

По аналогии можно смотреть:
- `src/presentations/polymorphism/PresentationMarkdown.tsx` — простой случай без картинок;
- `src/presentations/lecture7_1/PresentationLecture7_1.tsx` — случай с подменой путей изображений.

### 3) Зарегистрируйте презентацию в реестре

Откройте `src/presentations/index.tsx` и добавьте новую запись в нужный тематический блок:
- `basePresentations` — базовые/общие презентации;
- `lecture7Presentations` — лекции блока 7.

Для новой записи заполните:
- `id` — уникальный идентификатор (используется в URL `/presentation/:id`);
- `title` — название карточки на главной;
- `description` — краткое описание;
- `component` — lazy-импорт нужного компонента из папки-блока.

### 4) Проверьте запуск

- Запустите проект: `yarn dev`.
- Откройте главную страницу и убедитесь, что появилась карточка новой презентации.
- Проверьте открытие по URL: `/presentation/<ваш-id>`.
