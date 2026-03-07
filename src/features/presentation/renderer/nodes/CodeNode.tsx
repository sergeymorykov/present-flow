import React, { useState, useRef, useCallback } from 'react';
import { CodeNode as CodeNodeType } from '../../parser/types';
import { Editor } from '@/monaco/Editor';
import { Range } from 'monaco-editor';
import { runCode } from '@/features/presentation/codeRunner';
import styles from './CodeNode.module.css';

const LINE_HEIGHT_EM = 1.6;

const codeBlockStyleToCss = (s: CodeNodeType['style']): React.CSSProperties => {
  if (!s) return {};
  return {
    ...(s.marginTop && { marginTop: s.marginTop }),
    ...(s.marginRight && { marginRight: s.marginRight }),
    ...(s.marginBottom && { marginBottom: s.marginBottom }),
    ...(s.marginLeft && { marginLeft: s.marginLeft }),
    ...(s.fontSize && { fontSize: s.fontSize }),
    ...(s.width && { width: s.width }),
    ...(s.height && { height: s.height }),
  };
};

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

  const lineCount = Math.max(1, node.code.split('\n').length);
  const minHeightEm = lineCount * LINE_HEIGHT_EM;
  const wrapperStyle = codeBlockStyleToCss(node.style);
  const hasExplicitHeight = Boolean(node.style?.height);
  const isRunnableEditable = Boolean(node.editable && node.runnable);
  const useFixedWrapperHeight = hasExplicitHeight && !isRunnableEditable;
  const normalizedWrapperStyle: React.CSSProperties = { ...wrapperStyle };
  if (isRunnableEditable && hasExplicitHeight) {
    // For runnable editors, height should limit editor viewport only.
    // The wrapper must grow to include the run button + console and avoid overlap.
    delete normalizedWrapperStyle.height;
  }
  const wrapperClass = useFixedWrapperHeight
    ? `${styles.wrapper} ${styles.wrapperFixedHeight}`
    : styles.wrapper;
  const readOnlyWrapperClass = useFixedWrapperHeight
    ? `${styles.codeBlockWrapper} ${styles.wrapperFixedHeight}`
    : styles.codeBlockWrapper;

  if (!node.editable) {
    return (
      <div
        className={readOnlyWrapperClass}
        style={Object.keys(normalizedWrapperStyle).length > 0 ? normalizedWrapperStyle : undefined}
      >
        <div
          className={styles.readOnlyEditorContainer}
          style={{
            height: hasExplicitHeight ? undefined : `${minHeightEm}em`,
            flex: hasExplicitHeight ? undefined : 'none',
            overflow: hasExplicitHeight ? 'auto' : undefined,
          }}
        >
          <Editor
            defaultValue={node.code}
            language={node.language}
            readOnly
            onChange={() => {}}
            options={{
              lineNumbers: node.showLines ? "on" : "off"
            }}
            onMount={(editor) => {
              // Create the collection
              const decorations = editor.createDecorationsCollection(
                node.highlight?.map(h => ({
                  range: new Range(h.lineNumber, 1, h.lineNumber, 1),
                  options: {
                    isWholeLine: true,
                    className: `line-highlight-${h.color}`,
                  },
                })) ?? []
              );
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={wrapperClass}
      style={Object.keys(normalizedWrapperStyle).length > 0 ? normalizedWrapperStyle : undefined}
    >
      <div
        className={styles.editorContainer}
        style={{
          flex: hasExplicitHeight ? 'none' : undefined,
          minHeight: hasExplicitHeight ? undefined : `${minHeightEm}em`,
          ...(isRunnableEditable && hasExplicitHeight && { height: node.style?.height }),
          overflow: hasExplicitHeight ? 'auto' : undefined,
        }}
      >
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
