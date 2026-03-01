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
