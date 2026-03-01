const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const registryPath = path.join(
  repoRoot,
  'src',
  'features',
  'presentation',
  'parser',
  'syntax-registry.json'
);

const docsOutputPath = path.join(repoRoot, 'docs', 'syntax-wiki.md');
const appOutputPath = path.join(repoRoot, 'src', 'content', 'syntax-wiki.md');

const readRegistry = () => {
  const raw = fs.readFileSync(registryPath, 'utf8');
  return JSON.parse(raw);
};

const formatInlineCode = (value) => `\`${value}\``;

const escapeMarkdownTableCell = (value) => {
  const normalized = String(value ?? '').replace(/\r?\n/g, '<br>');
  return normalized.replace(/\|/g, '\\|');
};

const formatInlineCodeCell = (value) => formatInlineCode(escapeMarkdownTableCell(value));

const renderEntriesTable = (entries) => {
  const header = ['| Тег | Синтаксис | Описание |', '|-----|----------|----------|'];
  const rows = entries.map((entry) => {
    return `| ${formatInlineCodeCell(entry.tag)} | ${formatInlineCodeCell(entry.syntax)} | ${escapeMarkdownTableCell(entry.description)} |`;
  });
  return [...header, ...rows].join('\n');
};

const renderStyleCommandsTable = (commands) => {
  const header = ['| Команда | Описание |', '|---------|----------|'];
  const rows = commands.map((entry) => {
    return `| ${formatInlineCodeCell(entry.command)} | ${escapeMarkdownTableCell(entry.description)} |`;
  });
  return [...header, ...rows].join('\n');
};

const collectEntryDemos = (entry) => {
  if (Array.isArray(entry.demos)) {
    return entry.demos.filter((demo) => typeof demo === 'string' && demo.trim().length > 0);
  }

  if (typeof entry.demo === 'string' && entry.demo.trim().length > 0) {
    return [entry.demo];
  }

  return [];
};

const renderDemoSection = (entries) => {
  const demoEntries = entries
    .map((entry) => ({ entry, demos: collectEntryDemos(entry) }))
    .filter(({ demos }) => demos.length > 0);
  if (demoEntries.length === 0) {
    return '';
  }

  const lines = ['## Live-демо', '', 'В блоках ниже можно менять пример и сразу видеть результат.', ''];
  for (const { entry, demos } of demoEntries) {
    lines.push(`### ${entry.tag}`);
    lines.push('');
    for (const demo of demos) {
      lines.push('```presentation-demo');
      lines.push(demo.trimEnd());
      lines.push('```');
      lines.push('');
    }
  }
  return lines.join('\n');
};

const buildMarkdown = (registry) => {
  const slideEntries = registry.entries.filter((entry) => entry.kind === 'slide');
  const blockEntries = registry.entries.filter((entry) => entry.kind === 'block');
  const inlineEntries = registry.entries.filter((entry) => entry.kind === 'inline');

  const markdownParts = [
    '# Синтаксис Markdown презентаций',
    '',
    'Слайды разделяются строками `---`. Таблицы ниже генерируются автоматически из parser-driven реестра.',
    '',
    '## Слайды',
    '',
    renderEntriesTable(slideEntries),
    '',
    `По умолчанию (без ${formatInlineCode(registry.slideDirectives.yesScroll)}) скролл выключен — это поведение, которое раньше обозначалось как ${formatInlineCode(registry.slideDirectives.noScroll)}.`,
    '',
    '## Блоки контента (закрываются через `@end`)',
    '',
    renderEntriesTable(blockEntries),
    '',
    '## Однострочные и префиксы',
    '',
    renderEntriesTable(inlineEntries),
    '',
    '## Команды оформления',
    '',
    renderStyleCommandsTable(registry.styleCommands),
    '',
    '## Стили списка',
    '',
    `Команда ${formatInlineCode(registry.listDirective.command)} поддерживает стили: ${registry.listDirective.styles.map(formatInlineCode).join(', ')}.`,
    '',
    renderDemoSection(registry.entries),
  ];

  return markdownParts.join('\n').trimEnd() + '\n';
};

const writeIfChanged = (targetPath, nextContent) => {
  const prev = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';
  if (prev === nextContent) {
    return false;
  }
  fs.writeFileSync(targetPath, nextContent, 'utf8');
  return true;
};

const main = () => {
  const registry = readRegistry();
  const markdown = buildMarkdown(registry);

  const docsChanged = writeIfChanged(docsOutputPath, markdown);
  const appChanged = writeIfChanged(appOutputPath, markdown);

  const changedTargets = [docsChanged ? docsOutputPath : null, appChanged ? appOutputPath : null].filter(Boolean);
  if (changedTargets.length === 0) {
    console.log('syntax wiki is already up to date');
    return;
  }

  for (const filePath of changedTargets) {
    console.log(`updated: ${path.relative(repoRoot, filePath)}`);
  }
};

main();
