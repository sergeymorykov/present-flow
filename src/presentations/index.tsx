import { lazy } from 'react';

export interface PresentationConfig {
  id: string;
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.FC>;
}

export const presentations: PresentationConfig[] = [
  {
    id: 'polymorphism-markdown',
    title: 'Полиморфизм в C++ (Markdown)',
    description: 'Reveal.js презентация из markdown-файла с вертикальными слайдами, LaTeX и Live Code.',
    component: lazy(() =>
      import('./PresentationMarkdown').then((m) => ({
        default: m.PresentationMarkdown,
      }))
    ),
  },
];