import { lazy } from 'react';

export interface PresentationConfig {
  id: string;
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.FC>;
}

const lecture7Presentations: PresentationConfig[] = [
  {
    id: 'lecture2-virtual-polymorphism',
    title: 'Лекция 2: Виртуальные функции и полиморфизм',
    description: 'Повторение, сокрытие, виртуальные функции, vtable, деструкторы, абстрактные классы, множественное и ромбовидное наследование.',
    component: lazy(() =>
      import('./lecture2/PresentationLecture2').then((m) => ({
        default: m.PresentationLecture2,
      }))
    ),
  },
  {
    id: 'lecture-3-qt-framework',
    title: 'Лекция 3: Разработка приложений с помощью Qt',
    description: 'Установка Qt Framework на Windows и его архитектура.',
    component: lazy(() =>
      import('./lecture3/PresentationLecture3').then((m) => ({
        default: m.PresentationLecture3,
      }))
    ),
  },
  {
    id: 'lecture4-layout-design',
    title: 'Лекция 4: Layout памяти и дизайн классов',
    description: 'Layout памяти, padding, операторы, const/mutable, static, принципы проектирования классов.',
    component: lazy(() =>
      import('./lecture4/PresentationLecture4').then((m) => ({
        default: m.PresentationLecture4,
      }))
    ),
  },
  {
    id: 'lecture5-templates',
    title: 'Лекция 5: Шаблоны в C++',
    description: 'Шаблоны, псевдонимы, статическое определение типов',
    component: lazy(() =>
      import('./lecture5/PresentationLecture5').then((m) => ({
        default: m.PresentationLecture5,
      }))
    ),
  }
];

export const presentations: PresentationConfig[] = [
  ...lecture7Presentations
];