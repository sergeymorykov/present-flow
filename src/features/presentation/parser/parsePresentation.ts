import {
  Slide,
  TitleSlide,
  SectionSlide,
  ContentSlide,
  SlideNode,
  TextNode,
  ImageNode,
  CodeNode,
  TableNode,
  FragmentNode,
  ColumnsNode,
  ErrorSlide,
} from './types';

const SLIDE_SEPARATOR = /^\s*---\s*$/;
const BLOCK_END = /^\s*@end\s*$/;

const parseImageDirective = (line: string): ImageNode => {
  const parts = line.slice('@image'.length).trim().split(/\s+/);
  const src = parts[0] ?? '';
  const node: ImageNode = { type: 'image', src };

  for (let i = 1; i < parts.length; i++) {
    const [key, value] = parts[i].split('=');
    if (key === 'width' && value) node.width = parseInt(value, 10);
    if (key === 'height' && value) node.height = parseInt(value, 10);
  }

  return node;
};

const RESERVED_CODE_TOKENS = new Set(['editable']);

const parseCodeDirective = (line: string): Omit<CodeNode, 'code'> => {
  const raw = line.slice('@code'.length).trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  const editable = parts.includes('editable');

  const runPart = parts.find((p) => p.startsWith('run='));
  const runnable = Boolean(runPart);
  const runtimeLanguage = runPart ? runPart.slice(4) : undefined;

  const langToken = parts.find(
    (p) => !RESERVED_CODE_TOKENS.has(p) && !p.startsWith('run=')
  );
  const language = langToken ?? runtimeLanguage ?? 'text';

  return { type: 'code', language, editable, runnable, runtimeLanguage };
};

const parseTableRows = (lines: string[]): string[][] => {
  return lines
    .filter((l) => l.trim().startsWith('|'))
    .filter((l) => !/^\s*\|[-|\s]+\|\s*$/.test(l))
    .map((l) =>
      l
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
    );
};

const parseTitleBlock = (lines: string[]): TitleSlide => {
  const collected: string[] = [];
  let date: string | undefined;

  for (const line of lines) {
    if (line.startsWith('\\date{')) {
      date = line.match(/\\date\{([^}]*)\}/)?.[1];
    } else if (line.trim()) {
      collected.push(line.startsWith('#') ? line.replace(/^#+\s*/, '').trim() : line.trim());
    }
  }

  const title = collected[0] ?? '';
  const len = collected.length;
  const subtitle = len >= 3 ? collected[1] : undefined;
  const author = len >= 2 ? collected[len >= 3 ? 2 : 1] : undefined;
  const affiliation = len >= 4 ? collected[3] : undefined;

  return {
    type: 'title',
    title,
    subtitle,
    author,
    affiliation,
    date,
  };
};

const flushTextBuffer = (buffer: string[], nodes: SlideNode[]): void => {
  const content = buffer.join('\n').trim();
  if (content) {
    const node: TextNode = { type: 'text', content };
    nodes.push(node);
  }
  buffer.length = 0;
};

const parseSlideContent = (lines: string[]): SlideNode[] => {
  const nodes: SlideNode[] = [];
  const textBuffer: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('@image ')) {
      flushTextBuffer(textBuffer, nodes);
      nodes.push(parseImageDirective(line));
      i++;
      continue;
    }

    if (line.startsWith('@table')) {
      flushTextBuffer(textBuffer, nodes);
      const borderless = line.includes('noborder');
      const tableLines: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const rows = parseTableRows(tableLines);
      const node: TableNode = { type: 'table', borderless, rows };
      nodes.push(node);
      continue;
    }

    if (line.startsWith('@code')) {
      flushTextBuffer(textBuffer, nodes);
      const attrs = parseCodeDirective(line);
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const node: CodeNode = { ...attrs, code: codeLines.join('\n') };
      nodes.push(node);
      continue;
    }

    if (line.startsWith('@fragment')) {
      flushTextBuffer(textBuffer, nodes);
      const fragmentLines: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        fragmentLines.push(lines[i]);
        i++;
      }
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const node: FragmentNode = {
        type: 'fragment',
        content: fragmentLines.join('\n'),
      };
      nodes.push(node);
      continue;
    }

    if (line.startsWith('@columns')) {
      flushTextBuffer(textBuffer, nodes);
      const columns: string[] = [];
      let currentCol: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        if (lines[i].trim() === '@column') {
          if (currentCol.length) columns.push(currentCol.join('\n'));
          currentCol = [];
        } else {
          currentCol.push(lines[i]);
        }
        i++;
      }
      if (currentCol.length) columns.push(currentCol.join('\n'));
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const node: ColumnsNode = { type: 'columns', columns };
      nodes.push(node);
      continue;
    }

    textBuffer.push(line);
    i++;
  }

  flushTextBuffer(textBuffer, nodes);
  return nodes;
};

export const parsePresentation = (markdown: string): Slide[] => {
  try {
    const lines = markdown.split('\n');
    const slides: Slide[] = [];
    const groups: string[][] = [[]];

    for (const line of lines) {
      if (SLIDE_SEPARATOR.test(line)) {
        groups.push([]);
      } else {
        groups[groups.length - 1].push(line);
      }
    }

    for (const group of groups) {
      const trimmed = group.map((l) => l).join('\n').trim();
      if (!trimmed) continue;

      const firstLine = group.find((l) => l.trim())?.trim() ?? '';

      if (firstLine === '@title') {
        const bodyLines = group.slice(group.findIndex((l) => l.trim() === '@title') + 1);
        slides.push(parseTitleBlock(bodyLines));
        continue;
      }

      if (firstLine.startsWith('@section ')) {
        const title = firstLine.slice('@section '.length).trim();
        const node: SectionSlide = { type: 'section', title };
        slides.push(node);
        continue;
      }

      const nodes = parseSlideContent(group);
      if (nodes.length > 0) {
        const slide: ContentSlide = { type: 'content', nodes };
        slides.push(slide);
      }
    }

    return slides;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка парсинга';
    const errorSlide: ErrorSlide = { type: 'error', message };
    return [errorSlide];
  }
};
