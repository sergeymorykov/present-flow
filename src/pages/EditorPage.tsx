import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import { Slide } from '@/features/presentation/parser/types';
import styles from './EditorPage.module.css';

const DEBOUNCE_MS = 500;

const DEFAULT_MARKDOWN = `@title
# Present Flow
Ваше имя
\\date{2026}

---

@section Начало работы

---

# Первый слайд

Напишите здесь **markdown** с поддержкой $LaTeX$ формул.

@fragment
Этот текст появится анимированно
@end

---

# Колонки

@columns
@column
**Левая колонка**

Любой контент

@column
**Правая колонка**

Включая формулы: $E=mc^2$
@end

---

# Живой код

@code cpp editable run=cpp
#include <iostream>
#include <string>

class Animal {
public:
    virtual void makeSound() {
        std::cout << "Some sound" << std::endl;
    }
    virtual ~Animal() {}
};

class Dog : public Animal {
public:
    void makeSound() override {
        std::cout << "Woof!" << std::endl;
    }
};

class Cat : public Animal {
public:
    void makeSound() override {
        std::cout << "Meow!" << std::endl;
    }
};

int main() {
    Animal* animals[2];
    animals[0] = new Dog();
    animals[1] = new Cat();
    
    for(int i = 0; i < 2; i++) {
        animals[i]->makeSound();
    }
    
    delete animals[0];
    delete animals[1];
    return 0;
}
@end
`;

type ViewMode = 'split' | 'editor' | 'preview';

export const EditorPage: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [slides, setSlides] = useState<Slide[]>(() =>
    parsePresentation(DEFAULT_MARKDOWN)
  );
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMarkdownChange = useCallback((value?: string) => {
    const newValue = value ?? '';

    setMarkdown(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setSlides(parsePresentation(newValue));
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleModeToggle = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>
          Слайдов: {slides.length}
        </span>

        <button
          className={`${styles.toggleButton} ${viewMode === 'editor' ? styles.toggleButtonActive : ''}`}
          onClick={() => handleModeToggle('editor')}
          aria-label="Только редактор"
        >
          Редактор
        </button>

        <button
          className={`${styles.toggleButton} ${viewMode === 'split' ? styles.toggleButtonActive : ''}`}
          onClick={() => handleModeToggle('split')}
          aria-label="Разделённый вид"
        >
          Разделить
        </button>

        <button
          className={`${styles.toggleButton} ${viewMode === 'preview' ? styles.toggleButtonActive : ''}`}
          onClick={() => handleModeToggle('preview')}
          aria-label="Только презентация"
        >
          Презентация
        </button>
      </div>

      {viewMode === 'split' && (
        <div className={styles.splitLayout}>
          <div className={styles.editorPanel}>
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={markdown}
              onChange={handleMarkdownChange}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                fontSize: 14,
                scrollBeyondLastLine: false
              }}
            />
          </div>

          <div className={styles.previewPanel}>
            <SlideRenderer slides={slides} />
          </div>
        </div>
      )}

      {viewMode === 'editor' && (
        <div className={styles.editorOnly}>
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={markdown}
            onChange={handleMarkdownChange}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              fontSize: 14,
              scrollBeyondLastLine: false
            }}
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div className={styles.fullPreview}>
          <SlideRenderer slides={slides} />
        </div>
      )}
    </div>
  );
};