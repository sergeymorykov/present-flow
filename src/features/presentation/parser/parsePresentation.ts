import {
  Slide,
  TitleSlide,
  SectionSlide,
  ContentSlide,
  SlideNode,
  TextNode,
  ImageNode,
  VideoNode,
  CodeNode,
  TableNode,
  FragmentNode,
  ColumnsNode,
  ErrorSlide,
  BlockStyle,
  StyledBlockNode,
  NoteNode,
  NoteVariant,
  DividerNode,
} from './types';
import {
  SYNTAX_REGISTRY,
  NOTE_VARIANTS_REGEX_PART,
  LIST_DIRECTIVE_REGEX,
  STYLE_COMMANDS,
  STYLE_COMMAND_PREFIXES,
} from './syntaxRegistry';

const SLIDE_SEPARATOR = /^\s*---\s*$/;
const BLOCK_END = new RegExp(`^\\s*${SYNTAX_REGISTRY.blockDirectives.end}\\s*$`);

const parseImageDirective = (line: string): ImageNode => {
  const parts = line.slice(SYNTAX_REGISTRY.blockDirectives.imagePrefix.trim().length).trim().split(/\s+/);
  const src = parts[0] ?? '';
  const node: ImageNode = { type: 'image', src };

  for (let i = 1; i < parts.length; i++) {
    const [key, value] = parts[i].split('=');
    if (key === 'width' && value) node.width = parseInt(value, 10);
    if (key === 'height' && value) node.height = parseInt(value, 10);
  }

  return node;
};

const parseVideoDirective = (line: string): VideoNode => {
  const parts = line.slice(SYNTAX_REGISTRY.blockDirectives.videoPrefix.trim().length).trim().split(/\s+/);
  const src = parts[0] ?? '';
  const fullSlide = parts.slice(1).some((p) => p.toLowerCase() === 'fullslide');
  return { type: 'video', src, ...(fullSlide && { fullSlide: true }) };
};

const RESERVED_CODE_TOKENS = new Set(['editable', 'readonly']);

const parseHighlight = (parts: string[]) => {
  const highlightPart = parts.find((p) => p.startsWith('highlight='));
  return highlightPart?.split('=')[1].split(',').map(item => {
    const [lineNum, color] = item.split(':');
    return { lineNumber: +lineNum, color };
  });
};

const parseCodeDirective = (line: string): Omit<CodeNode, 'steps'> & { _highlight: ReturnType<typeof parseHighlight> } => {
  const raw = line.slice(SYNTAX_REGISTRY.blockDirectives.code.length).trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  const readonly = parts.includes('readonly');
  const editable = parts.includes('editable') && !readonly;

  const runPart = parts.find((p) => p.startsWith('run='));
  const runnable = Boolean(runPart);
  const runtimeLanguage = runPart ? runPart.slice(4) : undefined;

  const showLines = parts.includes('showLines');

  const langToken = parts.find(
    (p) =>
      !RESERVED_CODE_TOKENS.has(p) &&
      !p.startsWith('run=') &&
      !p.startsWith('width=') &&
      !p.startsWith('height=')
  );
  const language = langToken ?? runtimeLanguage ?? 'text';

  const style: BlockStyle | undefined = (() => {
    const widthPart = parts.find((p) => p.startsWith('width='));
    const heightPart = parts.find((p) => p.startsWith('height='));
    const w = widthPart?.slice(6);
    const h = heightPart?.slice(7);
    if (w || h) return { ...(w && { width: w }), ...(h && { height: h }) };
    return undefined;
  })();

  return {
    type: 'code',
    language,
    editable,
    ...(readonly && { readonly: true }),
    runnable,
    runtimeLanguage,
    ...(style && { style }),
    _highlight: parseHighlight(parts),
    showLines,
  };
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

const styleRegexByName = new Map(STYLE_COMMANDS.map((entry) => [entry.name, entry.compiledRegex]));

const STYLE_ALIGN = styleRegexByName.get('align')!;
const STYLE_MARGIN = styleRegexByName.get('margin')!;
const STYLE_MARGIN_ONE = styleRegexByName.get('marginOne')!;
const STYLE_FONT_SIZE = styleRegexByName.get('fontSize')!;
const STYLE_WIDTH = styleRegexByName.get('width')!;
const STYLE_HEIGHT = styleRegexByName.get('height')!;
const STYLE_BG = styleRegexByName.get('bg')!;
const STYLE_COLOR = styleRegexByName.get('color')!;
const STYLE_PADDING = styleRegexByName.get('padding')!;
const STYLE_BORDER_LEFT = styleRegexByName.get('borderLeft')!;
const STYLE_BORDER_RADIUS = styleRegexByName.get('borderRadius')!;
const STYLE_GAP = styleRegexByName.get('gap')!;
const STYLE_BORDER = styleRegexByName.get('border')!;

const isStyleLine = (t: string): boolean =>
  STYLE_COMMAND_PREFIXES.some((prefix) => t.toLowerCase().startsWith(`\\${prefix.toLowerCase()}`));

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
    const widthMatch = t.match(STYLE_WIDTH);
    if (widthMatch) {
      style.width = widthMatch[1].trim();
      continue;
    }
    const heightMatch = t.match(STYLE_HEIGHT);
    if (heightMatch) {
      style.height = heightMatch[1].trim();
      continue;
    }
    const bgMatch = t.match(STYLE_BG);
    if (bgMatch) {
      style.backgroundColor = bgMatch[1].trim();
      continue;
    }
    const colorMatch = t.match(STYLE_COLOR);
    if (colorMatch) {
      style.color = colorMatch[1].trim();
      continue;
    }
    const paddingMatch = t.match(STYLE_PADDING);
    if (paddingMatch) {
      style.padding = paddingMatch[1].trim();
      continue;
    }
    const borderLeftMatch = t.match(STYLE_BORDER_LEFT);
    if (borderLeftMatch) {
      style.borderLeft = borderLeftMatch[1].trim();
      continue;
    }
    const borderRadiusMatch = t.match(STYLE_BORDER_RADIUS);
    if (borderRadiusMatch) {
      style.borderRadius = borderRadiusMatch[1].trim();
      continue;
    }
    const gapMatch = t.match(STYLE_GAP);
    if (gapMatch) {
      style.gap = gapMatch[1].trim();
      continue;
    }
    const borderMatch = t.match(STYLE_BORDER);
    if (borderMatch) {
      style.border = borderMatch[1].trim();
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
    } else if (isStyleLine(t)) {
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

const LIST_DIRECTIVE = LIST_DIRECTIVE_REGEX;
const NOTE_DIRECTIVE = new RegExp(`^@(${NOTE_VARIANTS_REGEX_PART})(?:\\s+(.*))?$`);

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

    if (line.startsWith(SYNTAX_REGISTRY.blockDirectives.imagePrefix)) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      nodes.push(parseImageDirective(line));
      i++;
      continue;
    }

    if (line.startsWith(SYNTAX_REGISTRY.blockDirectives.videoPrefix)) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      nodes.push(parseVideoDirective(line));
      i++;
      continue;
    }

    if (line.startsWith(SYNTAX_REGISTRY.blockDirectives.table)) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      const borderless = line.includes('noborder');
      const tableParts = line
        .slice(SYNTAX_REGISTRY.blockDirectives.table.length)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const widthPart = tableParts.find((p) => p.startsWith('width='));
      const heightPart = tableParts.find((p) => p.startsWith('height='));
      const tableStyle: BlockStyle | undefined =
        widthPart || heightPart
          ? {
              ...(widthPart && { width: widthPart.slice(6) }),
              ...(heightPart && { height: heightPart.slice(7) }),
            }
          : undefined;
      const tableLines: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const rows = parseTableRows(tableLines);
      const node: TableNode = {
        type: 'table',
        borderless,
        rows,
        ...(tableStyle && { style: tableStyle }),
      };
      nodes.push(node);
      continue;
    }

    if (line.startsWith(SYNTAX_REGISTRY.blockDirectives.code)) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      const { _highlight, ...attrs } = parseCodeDirective(line);
      type StepAccum = { lines: string[]; highlight: ReturnType<typeof parseHighlight> };
      const codeSteps: StepAccum[] = [{ lines: [], highlight: _highlight }];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        const raw = lines[i];
        if (raw.trimStart().startsWith(SYNTAX_REGISTRY.blockDirectives.step)) {
          const stepParts = raw.trim().split(/\s+/).slice(1);
          codeSteps.push({ lines: [], highlight: parseHighlight(stepParts) });
        } else {
          codeSteps[codeSteps.length - 1].lines.push(raw);
        }
        i++;
      }
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const node: CodeNode = {
        ...attrs,
        steps: codeSteps.map((s) => ({ code: s.lines.join('\n'), highlight: s.highlight })),
      };
      nodes.push(node);
      continue;
    }

    if (line.startsWith(SYNTAX_REGISTRY.blockDirectives.fragment)) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      const fragmentLines: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        fragmentLines.push(lines[i]);
        i++;
      }
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const styleLinesFrag = fragmentLines.map((l) => l.trim()).filter(isStyleLine);
      const contentLinesFrag = fragmentLines.filter((l) => !isStyleLine(l.trim()));
      const styleFrag = parseBlockStyle(styleLinesFrag);
      const node: FragmentNode = {
        type: 'fragment',
        content: contentLinesFrag.join('\n').trim(),
        style: styleFrag,
      };
      nodes.push(node);
      continue;
    }

    if (
      line.trim() === SYNTAX_REGISTRY.blockDirectives.divider ||
      line.trim().startsWith(`${SYNTAX_REGISTRY.blockDirectives.divider} `)
    ) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      const colorPart = line.trim().slice(SYNTAX_REGISTRY.blockDirectives.divider.length).trim();
      const node: DividerNode = { type: 'divider', ...(colorPart && { color: colorPart }) };
      nodes.push(node);
      i++;
      continue;
    }

    const noteMatch = line.trim().match(NOTE_DIRECTIVE);
    if (noteMatch) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      const variant = noteMatch[1] as NoteVariant;
      const label = noteMatch[2]?.trim() || undefined;
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        blockLines.push(lines[i]);
        i++;
      }
      if (BLOCK_END.test(lines[i] ?? '')) i++;
      const styleLinesFrag = blockLines.map((l) => l.trim()).filter(isStyleLine);
      const contentLinesFrag = blockLines.filter((l) => !isStyleLine(l.trim()));
      const styleFrag = parseBlockStyle(styleLinesFrag);
      const children = parseSlideContent(contentLinesFrag);
      const node: NoteNode = { type: 'note', variant, label, children, style: styleFrag };
      nodes.push(node);
      continue;
    }

    if (line.trim() === SYNTAX_REGISTRY.blockDirectives.style) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      const styleLines: string[] = [];
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !BLOCK_END.test(lines[i])) {
        const t = lines[i].trim();
        if (isStyleLine(t)) {
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

    if (line.startsWith(SYNTAX_REGISTRY.blockDirectives.columns)) {
      flushTextBuffer(textBuffer, nodes, nextListStyle);
      nextListStyle = undefined;
      const blockLines: string[] = [];
      i++;
      let nest = 1;
      const isBlockStart = (l: string) => {
        const t = l.trim();
        return (
          t.startsWith(SYNTAX_REGISTRY.blockDirectives.code) ||
          t.startsWith(SYNTAX_REGISTRY.blockDirectives.table) ||
          t.startsWith(SYNTAX_REGISTRY.blockDirectives.fragment) ||
          t === SYNTAX_REGISTRY.blockDirectives.style ||
          t === SYNTAX_REGISTRY.blockDirectives.columns ||
          NOTE_DIRECTIVE.test(t)
        );
      };
      while (i < lines.length) {
        const currentLine = lines[i];
        if (BLOCK_END.test(currentLine)) {
          nest--;
          i++;
          if (nest === 0) break;
          blockLines.push(currentLine);
          continue;
        }
        blockLines.push(currentLine);
        i++;
        if (isBlockStart(currentLine)) nest++;
      }
      const firstColIdx = blockLines.findIndex((l) => l.trim() === SYNTAX_REGISTRY.blockDirectives.column);
      const blockStyle =
        firstColIdx >= 0
          ? parseBlockStyle(blockLines.slice(0, firstColIdx).map((l) => l.trim()).filter(isStyleLine))
          : undefined;
      const restLines = firstColIdx >= 0 ? blockLines.slice(firstColIdx + 1) : [];
      const columns: SlideNode[][] = [];
      const columnStyles: (BlockStyle | undefined)[] = [];
      let currentStart = 0;
      for (let k = 0; k <= restLines.length; k++) {
        if (k === restLines.length || restLines[k].trim() === SYNTAX_REGISTRY.blockDirectives.column) {
          const segment = restLines.slice(currentStart, k);
          const segStyleLines = segment.map((l) => l.trim()).filter(isStyleLine);
          const segContentLines = segment.filter((l) => !isStyleLine(l.trim()));
          columns.push(parseSlideContent(segContentLines));
          columnStyles.push(parseBlockStyle(segStyleLines));
          currentStart = k + 1;
        }
      }
      const node: ColumnsNode = {
        type: 'columns',
        columns,
        style: blockStyle,
        columnStyles: columnStyles.length > 0 ? columnStyles : undefined,
      };
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

      if (firstLine === SYNTAX_REGISTRY.slideDirectives.title) {
        const bodyLines = group.slice(
          group.findIndex((l) => l.trim() === SYNTAX_REGISTRY.slideDirectives.title) + 1
        );
        slides.push(parseTitleBlock(bodyLines));
        continue;
      }

      if (firstLine.startsWith(SYNTAX_REGISTRY.slideDirectives.sectionPrefix)) {
        const title = firstLine.slice(SYNTAX_REGISTRY.slideDirectives.sectionPrefix.length).trim();
        const styleLines = group.slice(1).map((l) => l.trim()).filter(Boolean);
        const style = parseBlockStyle(styleLines);
        const node: SectionSlide = { type: 'section', title, style };
        slides.push(node);
        continue;
      }

      let contentGroup = group;
      let scroll = false;
      const firstTrimmed = contentGroup.find((l) => l.trim())?.trim();
      if (firstTrimmed === SYNTAX_REGISTRY.slideDirectives.yesScroll) {
        scroll = true;
        contentGroup = contentGroup.slice(
          contentGroup.findIndex((l) => l.trim() === SYNTAX_REGISTRY.slideDirectives.yesScroll) + 1
        );
      }
      const nodes = parseSlideContent(contentGroup);
      if (nodes.length > 0) {
        const slide: ContentSlide = { type: 'content', nodes, ...(scroll && { scroll: true }) };
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
