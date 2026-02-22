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
};

export type TitleSlide = {
  type: 'title';
  title: string;
  subtitle?: string;
  author?: string;
  affiliation?: string;
  date?: string;
  style?: BlockStyle;
};

export type SectionSlide = {
  type: 'section';
  title: string;
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
};

export type CodeNode = {
  type: 'code';
  language: string;
  editable: boolean;
  runnable: boolean;
  runtimeLanguage?: string;
  code: string;
};

export type TableNode = {
  type: 'table';
  borderless: boolean;
  rows: string[][];
};

export type FragmentNode = {
  type: 'fragment';
  content: string;
  style?: BlockStyle;
};

export type ColumnsNode = {
  type: 'columns';
  columns: string[];
  style?: BlockStyle;
  columnStyles?: (BlockStyle | undefined)[];
};

export type ContentSlide = {
  type: 'content';
  nodes: SlideNode[];
  /** Включить скролл (по умолчанию контент обрезается без скролла) */
  scroll?: boolean;
};

export type StyledBlockNode = {
  type: 'styled';
  style?: BlockStyle;
  children: SlideNode[];
};

export type SlideNode =
  | TextNode
  | ImageNode
  | VideoNode
  | CodeNode
  | TableNode
  | FragmentNode
  | ColumnsNode
  | StyledBlockNode;

export type ErrorSlide = {
  type: 'error';
  message: string;
};

export type Slide = TitleSlide | SectionSlide | ContentSlide | ErrorSlide;
