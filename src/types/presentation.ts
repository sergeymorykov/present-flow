export type CodeBlockConfig = {
  id: string;
  language: string;
  code: string;
  runnable: boolean;
};

export type SlideNode = {
  id: string;
  content: string;
  children: SlideNode[];
};

export type CompileResult = {
  output: string;
  error: string | null;
  /** 'compiler' = Wandbox compiler_error, 'runtime' = program_error */
  errorKind?: 'compiler' | 'runtime';
};

export type CompilePayload = {
  code: string;
  language: string;
};
