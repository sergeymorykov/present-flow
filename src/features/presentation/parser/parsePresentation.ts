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
  BlockStyle,
  StyledBlockNode,
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

const STYLE_ALIGN = /^\\align\s+(left|center|right)\s*$/i;
const STYLE_MARGIN = /^\\margin\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s*$/;
const STYLE_MARGIN_ONE = /^\\margin(Left|Right|Top|Bottom)\s+([^\s]+)\s*$/i;
const STYLE_FONT_SIZE = /^\\fontSize\s+(.+)$/i;

const parseBlockStyle = (lines: string[]): BlockStyle | undefined => {
  const style: BlockStyle = {};
  for (const line of lines) {
    const t = line.trim();
    const alignMatch = t.match(STYLE_ALIGN);
    if (alignMatch) {
      const a = alignMatch[1].toLowerCase();
      if (a === 'left' || a === 'center' || a === 'right') style.textAlign = a;
      continue;
    }
    const marginMatch = t.match(STYLE_MARGIN);
    if (marginMatch) {
      style.marginTop = marginMatch[1];
      style.marginRight = marginMatch[2];
      style.marginBottom = marginMatch[3];
      style.marginLeft = marginMatch[4];
      continue;
    }
    const marginOneMatch = t.match(STYLE_MARGIN_ONE);
    if (marginOneMatch) {
      const part = marginOneMatch[1];
      const key = 'margin' + part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      (style as Record<string, string>)[key] = marginOneMatch[2];
      continue;
    }
    const fontSizeMatch = t.match(STYLE_FONT_SIZE);
    if (fontSizeMatch) {
      style.fontSize = fontSizeMatch[1].trim();
      continue;
    }
  }
  return Object.keys(style).length > 0 ? style : undefined;
};

const parseTitleBlock = (lines: string[]): TitleSlide => {
  const collected: string[] = [];
  const styleLines: string[] = [];
  let date: string | undefined;

  for (const line of lines) {
    const t = line.trim();
    if (line.startsWith('\\date{')) {
      date = line.match(/\\date\{([^}]*)\}/)?.[1];
    } else if (/^\\align\s/i.test(t) || /^\\margin/i.test(t) || /^\\fontSize\s/i.test(t)) {
      styleLines.push(t);
    } else if (t) {
      collected.push(line.startsWith('#') ? line.replace(/^#+\s*/, '').trim() : t);
    }
  }

  const title = collected[0] ?? '';
  const len = collected.length;
  const subtitle = len >= 3 ? collected[1] : undefined;
  const author = len >= 2 ? collected[len >= 3 ? 2 : 1] : undefined;
  const affiliation = len >= 4 ? collected[3] : undefined;
  const style = parseBlockStyle(styleLines);

  return {
    type: 'title',
    title,
    subtitle,
    author,
    affiliation,
    date,
    style,
  };
};

const LIST_DIRECTIVE = /^\\list\s+(\S+)\s*$/;

const flushTextBuffer = (
  buffer: string[],
  nodes: SlideNode[],
  listClass?: string
): void => {
  const content = buffer.join('\n').trim();
  if (content) {
    const node: TextNode = { type: 'text', content, ...(listClass && { listClass }) };
    nodes.push(node);
  }
  buffer.length = 0;
};

const parseSlideContent = (lines: string[]): SlideNode[] => {
  const nodes: SlideNode[] = [];
  const textBuffer: string[] = [];
  let nextListStyle: string | undefined;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const listMatch = line.match(LIST_DIRECTIVE);
    if (listMatch) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = listMatch[1];
      i++;
      continue;
    }

    if (line.startsWith('@image ')) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      nodes.push(parseImageDirective(line));
      i++;
      continue;
    }

    if (line.startsWith('@table')) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
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
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
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
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
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

    if (line.trim() === '@style') {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      const styleLines: string[] = [];
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        const t = lines[i].trim();
        if (/^\\align\s/i.test(t) || /^\\margin/i.test(t) || /^\\fontSize\s/i.test(t)) {
          styleLines.push(t);
        } else {
          contentLines.push(lines[i]);
        }
        i++;
      }
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const style = parseBlockStyle(styleLines);
      const children = parseSlideContent(contentLines);
      const node: StyledBlockNode = { type: 'styled', style, children };
      nodes.push(node);
      continue;
    }

    if (line.startsWith('@columns')) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
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

  flushTextBuffer(textBuffer, nodes, nextListStyle);
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
        const styleLines = group.slice(1).map((l) => l.trim()).filter(Boolean);
        const style = parseBlockStyle(styleLines);
        const node: SectionSlide = { type: 'section', title, style };
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
