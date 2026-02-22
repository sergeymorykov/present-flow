import { lazy } from 'react';

export interface PresentationConfig {
  id: string;
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.FC>;
}

export const presentations: PresentationConfig[] = [
  {
    id: 'presentation-polymorphism',
    title: 'Полиморфизм в C++',
    description: 'Презентация о полиморфизме в языке C++ с примерами и объяснениями.',
    component: lazy(() => import('./PresentationPolymorphism')),
  },
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