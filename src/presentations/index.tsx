import { lazy } from 'react';

export interface PresentationConfig {
  id: string;
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.FC>;
}

const lecture7Presentations: PresentationConfig[] = [
  {
    id: 'lecture7-1-virtual-polymorphism',
    title: 'Лекция 7.1: Виртуальные функции и полиморфизм',
    description: 'Повторение, сокрытие, виртуальные функции, vtable, деструкторы, абстрактные классы, множественное и ромбовидное наследование.',
    component: lazy(() =>
      import('./lecture7_1/PresentationLecture7_1').then((m) => ({
        default: m.PresentationLecture7_1,
      }))
    ),
  },
  {
    id: 'lecture7-2-layout-design',
    title: 'Лекция 7.2: Layout памяти и дизайн классов',
    description: 'Layout памяти, padding, операторы, const/mutable, static, принципы проектирования классов.',
    component: lazy(() =>
      import('./lecture7_2/PresentationLecture7_2').then((m) => ({
        default: m.PresentationLecture7_2,
      }))
    ),
  },
];

export const presentations: PresentationConfig[] = [
  ...lecture7Presentations
];