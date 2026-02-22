import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { editor as MonacoEditorNS } from 'monaco-editor';
import { Editor } from '@/monaco/Editor';
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import { Slide } from '@/features/presentation/parser/types';
import { ImageRegistryProvider, useImageRegistry } from '@/features/presentation/context/ImageRegistryContext';
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

const EditorPageContent: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [slides, setSlides] = useState<Slide[]>(() =>
    parsePresentation(DEFAULT_MARKDOWN)
  );
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const { setImageEntry, setImageRegistry, imageRegistry } = useImageRegistry();

  const supportsFolderApi = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handleEditorMount = useCallback((editor: MonacoEditorNS.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

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

  const insertImageMarkdown = useCallback(
    (path: string) => {
      const editor = editorRef.current;
      const current = editor?.getModel()?.getValue() ?? markdown;
      let newValue: string;
      if (editor) {
        const model = editor.getModel();
        const selection = editor.getSelection();
        const offset =
          model && selection
            ? model.getOffsetAt(selection.getStartPosition())
            : current.length;
        newValue = current.slice(0, offset) + `![](${path})` + current.slice(offset);
      } else {
        newValue = markdown + `\n![](${path})\n`;
      }
      setMarkdown(newValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setSlides(parsePresentation(newValue)), DEBOUNCE_MS);
    },
    [markdown]
  );

  const handleImageFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const path = `assets/${file.name}`;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === 'string') {
          setImageEntry(path, dataUrl);
          insertImageMarkdown(path);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [setImageEntry, insertImageMarkdown]
  );

  const handleInsertImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOpenFolder = useCallback(async () => {
    if (!supportsFolderApi || !window.showDirectoryPicker) {
      alert('Открытие папки поддерживается только в современных браузерах (Chrome, Edge).');
      return;
    }
    try {
      const dir = await window.showDirectoryPicker!();
      folderHandleRef.current = dir;

      let mdContent = '';
      try {
        const mdHandle = await dir.getFileHandle('presentation.md');
        const file = await mdHandle.getFile();
        mdContent = await file.text();
      } catch {
        for await (const [, handle] of dir.entries()) {
          if (handle.kind === 'file' && handle.name.endsWith('.md')) {
            const file = await handle.getFile();
            mdContent = await file.text();
            break;
          }
        }
      }
      if (mdContent) {
        setMarkdown(mdContent);
        setSlides(parsePresentation(mdContent));
      }

      const nextRegistry: Record<string, string> = {};
      try {
        const assetsHandle = await dir.getDirectoryHandle('assets');
        for await (const [name, handle] of assetsHandle.entries()) {
          if (handle.kind === 'file' && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name)) {
            const file = await (handle as FileSystemFileHandle).getFile();
            const dataUrl = await new Promise<string>((res, rej) => {
              const r = new FileReader();
              r.onload = () => res(r.result as string);
              r.onerror = rej;
              r.readAsDataURL(file);
            });
            nextRegistry[`assets/${name}`] = dataUrl;
          }
        }
      } catch {
        // no assets folder
      }
      setImageRegistry(nextRegistry);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        alert('Ошибка открытия папки: ' + err.message);
      }
    }
  }, [supportsFolderApi, setImageRegistry]);

  const handleSaveFolder = useCallback(async () => {
    if (!supportsFolderApi || !window.showDirectoryPicker) {
      alert('Сохранение в папку поддерживается только в современных браузерах (Chrome, Edge).');
      return;
    }
    let targetDir = folderHandleRef.current;
    try {
      if (!targetDir) {
        targetDir = await window.showDirectoryPicker!();
        folderHandleRef.current = targetDir;
      }

      const mdHandle = await targetDir.getFileHandle('presentation.md', { create: true });
      const writable = await mdHandle.createWritable();
      await writable.write(editorRef.current?.getModel()?.getValue() ?? markdown);
      await writable.close();

      const assetsHandle = await targetDir.getDirectoryHandle('assets', { create: true });
      for (const [path, dataUrl] of Object.entries(imageRegistry)) {
        if (!path.startsWith('assets/')) continue;
        const name = path.slice(7);
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const fileHandle = await assetsHandle.getFileHandle(name, { create: true });
        const w = await fileHandle.createWritable();
        await w.write(blob);
        await w.close();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        alert('Ошибка сохранения: ' + err.message);
      }
    }
  }, [supportsFolderApi, markdown, imageRegistry]);

  return (
    <div className={styles.page}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        aria-label="Выбор файла изображения"
        onChange={handleImageFileSelect}
      />
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>
          Слайдов: {slides.length}
        </span>

        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleInsertImageClick}
          aria-label="Вставить изображение"
        >
          Вставить изображение
        </button>

        {supportsFolderApi && (
          <>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={handleOpenFolder}
              aria-label="Открыть папку"
            >
              Открыть папку
            </button>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={handleSaveFolder}
              aria-label="Сохранить в папку"
            >
              Сохранить в папку
            </button>
          </>
        )}

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
              value={markdown}
              language="markdown"
              onChange={handleMarkdownChange}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                fontSize: 14,
                scrollBeyondLastLine: false,
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
            value={markdown}
            language="markdown"
            onChange={handleMarkdownChange}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              fontSize: 14,
              scrollBeyondLastLine: false,
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

export const EditorPage: React.FC = () => (
  <ImageRegistryProvider>
    <EditorPageContent />
  </ImageRegistryProvider>
);