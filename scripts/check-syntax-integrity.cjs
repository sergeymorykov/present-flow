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
const parserPath = path.join(
  repoRoot,
  'src',
  'features',
  'presentation',
  'parser',
  'parsePresentation.ts'
);
const wikiPath = path.join(repoRoot, 'src', 'content', 'syntax-wiki.md');

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const parserContent = fs.readFileSync(parserPath, 'utf8');
const wikiContent = fs.readFileSync(wikiPath, 'utf8');

const failed = [];

const normalizeForWikiTableCell = (value) => String(value ?? '').replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');

const mustContainInParser = [
  'SYNTAX_REGISTRY.blockDirectives.imagePrefix',
  'SYNTAX_REGISTRY.blockDirectives.videoPrefix',
  'SYNTAX_REGISTRY.blockDirectives.table',
  'SYNTAX_REGISTRY.blockDirectives.code',
  'SYNTAX_REGISTRY.blockDirectives.fragment',
  'SYNTAX_REGISTRY.blockDirectives.style',
  'SYNTAX_REGISTRY.blockDirectives.columns',
  'SYNTAX_REGISTRY.blockDirectives.column',
  'SYNTAX_REGISTRY.blockDirectives.divider',
  'SYNTAX_REGISTRY.slideDirectives.title',
  'SYNTAX_REGISTRY.slideDirectives.sectionPrefix',
  'SYNTAX_REGISTRY.slideDirectives.yesScroll',
  'NOTE_VARIANTS_REGEX_PART',
  'LIST_DIRECTIVE_REGEX',
  'STYLE_COMMAND_PREFIXES',
];

for (const token of mustContainInParser) {
  if (!parserContent.includes(token)) {
    failed.push(`parser does not reference required registry token: ${token}`);
  }
}

for (const entry of registry.entries) {
  const tagMarker = `\`${entry.tag}\``;
  if (!wikiContent.includes(tagMarker)) {
    failed.push(`wiki is missing documented tag: ${entry.tag}`);
  }

  if (entry.demo) {
    const demoFence = `### ${entry.tag}\n\n\`\`\`presentation-demo`;
    if (!wikiContent.includes(demoFence)) {
      failed.push(`wiki is missing live-demo section for tag: ${entry.tag}`);
    }
  }
}

for (const command of registry.styleCommands) {
  const expectedMarker = `\`${normalizeForWikiTableCell(command.command)}\``;
  if (!wikiContent.includes(expectedMarker)) {
    failed.push(`wiki is missing style command: ${command.command}`);
  }
}

for (const listStyle of registry.listDirective.styles) {
  if (!wikiContent.includes(`\`${listStyle}\``)) {
    failed.push(`wiki is missing list style: ${listStyle}`);
  }
}

if (failed.length > 0) {
  console.error('syntax integrity checks failed:');
  for (const message of failed) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('syntax integrity checks passed');
