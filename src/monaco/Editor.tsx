import React, { useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { editor as MonacoEditorNS } from 'monaco-editor';
import styles from './Editor.module.css';

const EDITOR_OPTIONS = {
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  lineNumbers: 'on' as const,
  padding: { top: 12 },
  fontFamily: 'Consolas, Monaco, monospace',
  lineHeight: 1.6,
  wordWrap: 'on' as const,
};

type EditorProps = {
  language?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  onMount?: (editor: MonacoEditorNS.IStandaloneCodeEditor) => void;
  options?: Record<string, unknown>;
} & (
  | { value: string; defaultValue?: never }
  | { defaultValue: string; value?: never }
);

export const Editor: React.FC<EditorProps> = ({
  value,
  defaultValue,
  language = 'markdown',
  onChange,
  readOnly = false,
  onMount,
  options: optionsOverride,
}) => {
  const handleChange = useCallback(
    (val?: string) => {
      onChange(val ?? '');
    },
    [onChange]
  );

  const options = { ...EDITOR_OPTIONS, ...optionsOverride, readOnly };

  return (
    <div className={styles.container}>
      <MonacoEditor
        height="100%"
        width="100%"
        language={language}
        theme="vs-dark"
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onMount={onMount}
        options={options}
      />
    </div>
  );
};
