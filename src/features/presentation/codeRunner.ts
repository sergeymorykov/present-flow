import type { CompileResult } from '@/types/presentation';

type WandboxCompiler = 'gcc-head' | 'clang-head';

type WandboxPayload = {
  code: string;
  compiler: WandboxCompiler;
  options: string;
};

type WandboxResponse = {
  compiler_error?: string;
  program_error?: string;
  program_output?: string;
};

const LANGUAGE_TO_COMPILER: Record<string, WandboxCompiler> = {
  cpp: 'gcc-head',
  c: 'gcc-head',
};

const LANGUAGE_TO_OPTIONS: Record<string, string> = {
  cpp: 'warning-all,std=c++17',
  c: 'warning-all',
};

export const runCode = async (
  language: string,
  code: string
): Promise<CompileResult> => {
  const compilerUrl = process.env.CPP_COMPILER_URL;

  if (!compilerUrl) {
    return { output: '', error: 'CPP_COMPILER_URL не задан в .env' };
  }

  const compiler = LANGUAGE_TO_COMPILER[language];
  if (!compiler) {
    return { output: '', error: `Язык "${language}" не поддерживается` };
  }

  const payload: WandboxPayload = {
    code,
    compiler,
    options: LANGUAGE_TO_OPTIONS[language] ?? '',
  };

  try {
    const response = await fetch(compilerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const text = await response.text();

    if (!response.ok) {
      return { output: '', error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
    }

    const result: WandboxResponse = JSON.parse(text);

    if (result.compiler_error) {
      return { output: '', error: result.compiler_error, errorKind: 'compiler' };
    }

    if (result.program_error) {
      return { output: '', error: result.program_error, errorKind: 'runtime' };
    }

    return { output: result.program_output ?? '', error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    return { output: '', error: message };
  }
};
