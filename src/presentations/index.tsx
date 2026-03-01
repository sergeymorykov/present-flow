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
  {
    id: 'lecture7-1-virtual-polymorphism',
    title: 'Лекция 7.1: Виртуальные функции и полиморфизм',
    description: 'Повторение, сокрытие, виртуальные функции, vtable, деструкторы, абстрактные классы, множественное и ромбовидное наследование.',
    component: lazy(() =>
      import('./PresentationLecture7_1').then((m) => ({
        default: m.PresentationLecture7_1,
      }))
    ),
  },
  {
    id: 'lecture7-2-layout-design',
    title: 'Лекция 7.2: Layout памяти и дизайн классов',
    description: 'Layout памяти, padding, операторы, const/mutable, static, принципы проектирования классов.',
    component: lazy(() =>
      import('./PresentationLecture7_2').then((m) => ({
        default: m.PresentationLecture7_2,
      }))
    ),
  },
];