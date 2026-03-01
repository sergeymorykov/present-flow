import React, { useCallback, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import styles from './SyntaxWikiPanel.module.css';

type SyntaxWikiPanelProps = {
  content: string;
  onClose: () => void;
};

type DemoBlockProps = {
  initialSource: string;
};

const DEMO_LANGUAGE = 'presentation-demo';

const trimTrailingNewline = (value: string): string => value.replace(/\n$/, '');

const DemoBlock: React.FC<DemoBlockProps> = ({ initialSource }) => {
  const [source, setSource] = useState<string>(trimTrailingNewline(initialSource));
  const slides = useMemo(() => parsePresentation(source), [source]);

  const handleSourceChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSource(event.target.value);
  }, []);

  return (
    <div className={styles.demoBlock}>
      <label className={styles.demoLabel}>
        Редактор примера
        <textarea
          className={styles.demoInput}
          value={source}
          onChange={handleSourceChange}
          spellCheck={false}
          aria-label="Редактируемый пример синтаксиса презентации"
        />
      </label>
      <div className={styles.demoPreview} aria-label="Live-preview примера синтаксиса">
        <SlideRenderer slides={slides} />
      </div>
    </div>
  );
};

export const SyntaxWikiPanel: React.FC<SyntaxWikiPanelProps> = ({ content, onClose }) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const markdownComponents = useMemo<Components>(
    () => ({
      code(props) {
        const { className, children, ...rest } = props;
        const match = /language-(\S+)/.exec(className ?? '');
        const language = match?.[1];
        const rawCode = String(children ?? '');

        if (language === DEMO_LANGUAGE) {
          return <DemoBlock initialSource={rawCode} />;
        }

        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      },
    }),
    []
  );

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wiki-title"
      tabIndex={-1}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 id="wiki-title" className={styles.title}>
            Справка: теги и опции
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть справку"
          >
            Закрыть
          </button>
        </div>
        <div className={styles.content}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
