import React, { useState, useRef, useCallback } from 'react';
import { CodeNode as CodeNodeType } from '../../parser/types';
import { Editor } from '@/monaco/Editor';
import { runCode } from '@/features/presentation/codeRunner';
import styles from './CodeNode.module.css';

const IDLE_MESSAGE = 'Нажмите "Запустить" для выполнения кода';

type JsConsole = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

const executeJs = (code: string): string => {
  const lines: string[] = [];
  const mockConsole: JsConsole = {
    log: (...args) => lines.push(args.map(String).join(' ')),
    error: (...args) => lines.push('[error] ' + args.map(String).join(' ')),
    warn: (...args) => lines.push('[warn] ' + args.map(String).join(' ')),
  };

  try {
    const fn = new Function('console', code);
    fn(mockConsole);
  } catch (err) {
    return `Ошибка: ${err instanceof Error ? err.message : String(err)}`;
  }

  return lines.join('\n') || '(нет вывода)';
};

type Props = { node: CodeNodeType };

export const CodeNode: React.FC<Props> = ({ node }) => {
  // useRef ensures handleRun always reads the latest code without stale closures
  const codeRef = useRef<string>(node.code);
  const [output, setOutput] = useState<string>(IDLE_MESSAGE);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = useCallback((value: string) => {
    codeRef.current = value;
  }, []);

  const handleRun = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    const code = codeRef.current;
    const lang = node.runtimeLanguage ?? node.language;

    if (lang === 'js' || lang === 'javascript' || lang === 'ts' || lang === 'typescript') {
      setOutput('Выполняется...');
      const result = executeJs(code);
      setOutput(result);
      setIsError(result.startsWith('Ошибка:'));
      setIsLoading(false);
      return;
    }

    // C/C++ — тот же UX, что и в PresentationPolymorphism (Wandbox)
    setOutput('🔄 Компиляция...');
    const result = await runCode(lang, code);

    if (result.error) {
      const prefix =
        result.errorKind === 'compiler'
          ? '❌ Ошибка компиляции:\n'
          : result.errorKind === 'runtime'
            ? '❌ Ошибка выполнения:\n'
            : '❌ Ошибка:\n';
      setOutput(prefix + result.error);
      setIsError(true);
    } else if (result.output) {
      setOutput('✅ Результат:\n' + result.output);
      setIsError(false);
    } else {
      setOutput('⚠️ Код выполнен без вывода');
      setIsError(false);
    }
    setIsLoading(false);
  }, [node.language, node.runtimeLanguage]);

  if (!node.editable) {
    return (
      <pre className={styles.staticCode}>
        <code>{node.code}</code>
      </pre>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.editorContainer}>
        <Editor
          defaultValue={node.code}
          language={node.language}
          onChange={handleChange}
        />
      </div>

      {node.runnable && (
        <>
          <button
            className={styles.runButton}
            onClick={handleRun}
            disabled={isLoading}
            aria-label="Запустить код"
          >
            {isLoading ? 'Выполняется...' : '▶ Запустить'}
          </button>

          <div className={styles.console}>
            <div className={styles.consoleLabel}>Вывод</div>
            <pre
              className={`${styles.consoleOutput} ${isError ? styles.consoleError : ''}`}
            >
              {output}
            </pre>
          </div>
        </>
      )}
    </div>
  );
};
