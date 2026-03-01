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
- markdown-контент (`*.md`);
- React-компонент `Presentation*.tsx`, который парсит markdown и рендерит слайды.

Рекомендуемая структура: отдельная папка на каждую презентацию, где рядом лежат `tsx`, `md` и `assets`.

Пример:

`src/presentations/lecture8_1/`
- `PresentationLecture8_1.tsx`
- `lecture8_1.md`
- `assets/lecture8_1/...`

### 1) Создайте папку презентации и markdown

- Создайте папку: `src/presentations/lecture8_1/`
- Добавьте файл: `src/presentations/lecture8_1/lecture8_1.md`
- Ассеты (картинки/видео) кладите в `src/presentations/lecture8_1/assets/lecture8_1/...`

В markdown используйте пути вида:
- `@image assets/lecture8_1/example.png width=480`
- `@video assets/lecture8_1/demo.webm`
- `@video assets/lecture8_1/demo.mp4 fullSlide`

### 2) Создайте компонент презентации

Создайте `src/presentations/lecture8_1/PresentationLecture8_1.tsx` по текущему шаблону:
- импорт `markdown` как raw: `import markdownContent from './lecture8_1.md?raw';`
- обработка markdown через `resolvePresentationAssets(markdownContent)` из `src/features/presentation/utils/resolvePresentationAssets`
- парсинг через `parsePresentation`
- рендер через `SlideRenderer`

Важно: ручные `import` картинок/видео и `IMAGE_MAP` больше не нужны — локальные ассеты автоматически резолвятся из `src/presentations/**/assets/**/*` (включая `png/jpg/jpeg/gif/svg/webm/mp4`).

### 3) Зарегистрируйте презентацию в реестре

Откройте `src/presentations/index.tsx` и добавьте запись:
- `id` — уникальный идентификатор (используется в URL `/presentation/:id`);
- `title` — название карточки;
- `description` — краткое описание;
- `component` — lazy-импорт компонента презентации.

### 4) Проверьте запуск

- Запустите проект: `yarn dev` (или `npm run dev` / `pnpm dev`).
- Убедитесь, что карточка появилась на главной.
- Проверьте открытие по URL: `/presentation/<ваш-id>`.
