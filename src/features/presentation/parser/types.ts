export type BadgeRowItem = {
  text: string;
  color?: string;
};

export type BadgeRowNode = {
  type: 'badge-row';
  items: BadgeRowItem[];
  style?: BlockStyle;
};

export type DiagramNode = {
  type: 'diagram';
  value: string;
  style?: BlockStyle;
};

export type BlockStyle = {
  textAlign?: 'left' | 'center' | 'right';
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  fontSize?: string;
  /** Для колонок: ширина (например 50%, 200px) */
  width?: string;
  /** Для колонок: высота (например 200px, 10rem) */
  height?: string;
  backgroundColor?: string;
  color?: string;
  padding?: string;
  borderLeft?: string;
  borderRadius?: string;
  gap?: string;
  border?: string;
};

export type TitleSlide = {
  type: 'title';
  title: string;
  subtitle?: string;
  author?: string;
  affiliation?: string;
  date?: string;
  badge?: string;
  items?: string[];
  style?: BlockStyle;
};

export type SectionSlide = {
  type: 'section';
  title: string;
  subtitle?: string;
  icon?: string;
  style?: BlockStyle;
};

export type TextNode = {
  type: 'text';
  content: string;
  /** Класс для списков: disc | circle | square | decimal | decimal-leading-zero | lower-alpha | upper-alpha */
  listClass?: string;
};

export type ImageNode = {
  type: 'image';
  src: string;
  width?: number;
  height?: number;
};

export type VideoNode = {
  type: 'video';
  src: string;
  /** Растянуть видео на весь слайд (object-fit: cover) */
  fullSlide?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playbackRate?: number;
  width?: number;
  height?: number;
};

export type CodeNode = {
  type: 'code';
  language: string;
  editable: boolean;
  /** Подсветка кода без редактирования (Monaco readOnly) */
  readonly?: boolean;
  runnable: boolean;
  runtimeLanguage?: string;
  steps: { code: string; highlight?: { lineNumber: number; color: string }[] }[];
  style?: BlockStyle;
  showLines?: boolean;
};

export type TableNode = {
  type: 'table';
  borderless: boolean;
  rows: string[][];
  style?: BlockStyle;
};

export type FragmentNode = {
  type: 'fragment';
  children: SlideNode[];
  style?: BlockStyle;
};

export type ColumnsNode = {
  type: 'columns';
  /** Каждая колонка — массив узлов (текст, код, изображения и т.д.) */
  columns: SlideNode[][];
  style?: BlockStyle;
  columnStyles?: (BlockStyle | undefined)[];
};

export type ContentSlide = {
  type: 'content';
  nodes: SlideNode[];
  category?: string;
  /** Включить скролл (по умолчанию контент обрезается без скролла) */
  scroll?: boolean;
};

export type StyledBlockNode = {
  type: 'styled';
  style?: BlockStyle;
  children: SlideNode[];
};

export type NoteVariant = 'note' | 'warning' | 'tip' | 'important';

export type NoteNode = {
  type: 'note';
  variant: NoteVariant;
  label?: string;
  children: SlideNode[];
  style?: BlockStyle;
};

export type DividerNode = {
  type: 'divider';
  color?: string;
};

export type SlideNode =
  | TextNode
  | ImageNode
  | VideoNode
  | CodeNode
  | TableNode
  | FragmentNode
  | ColumnsNode
  | StyledBlockNode
  | NoteNode
  | DividerNode
  | BadgeRowNode
  | DiagramNode;

export type ErrorSlide = {
  type: 'error';
  message: string;
};

export type Slide = TitleSlide | SectionSlide | ContentSlide | ErrorSlide;
