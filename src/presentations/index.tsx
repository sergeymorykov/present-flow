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
  },
  {
    id: 'lecture6-algorithms-containers',
    title: 'Лекция 6: Алгоритмы и контейнеры STL',
    description: 'Практика по std::algorithm и контейнерам STL с runnable C++ примерами.',
    component: lazy(() =>
      import('./lecture8/PresentationLecture8').then((m) => ({
        default: m.PresentationLecture8,
      }))
    ),
  },
  {
    id: 'lecture7-iteratirs',
    title: 'Лекция 7: Итераторы',
    description: 'Шаблоны (продолжение) и итераторы в C++',
    component: lazy(() =>
      import('./lecture7/PresentationLecture7').then((m) => ({
        default: m.PresentationLecture7,
      }))
    ),
  },
  {
    id: 'lecture9-smart-pointers',
    title: 'Лекция 9: Умные указатели',
    description: 'Современное управление памятью в C++',
    component: lazy(() =>
      import('./lecture9/PresentationLecture9').then((m) => ({
        default: m.PresentationLecture9,
      }))
    ),
  },
  {
    id: 'lecture11-exceptions',
    title: 'Лекция 11: Исключения',
    description: 'Обработка ошибок',
    component: lazy(() =>
      import('./lecture11/PresentationLecture11').then((m) => ({
        default: m.PresentationLecture11,
      }))
    ),
  },
  {
    id: 'lecture13-multithreading',
    title: 'Лекция 13: Многопоточность',
    description: 'Процессы, потоки, std::thread',
    component: lazy(() =>
      import('./lecture13/PresentationLecture13').then((m) => ({
        default: m.PresentationLecture13,
      }))
    ),
  },
  {
    id: 'lecture15-multithreading-part-2',
    title: 'Лекция 15: Многопоточность',
    description: 'Race condition, std::mutex и т.п.',
    component: lazy(() =>
      import('./lecture15/PresentationLecture15').then((m) => ({
        default: m.PresentationLecture15,
      }))
    ),
  },
  {
    id: 'lecture17-concepts',
    title: 'Лекция 17: Концепты',
    description: 'Концепты, requires и requires',
    component: lazy(() =>
      import('./lecture17/PresentationLecture17').then((m) => ({
        default: m.PresentationLecture17,
      }))
    ),
  }
];

export const presentations: PresentationConfig[] = [
  ...lecture7Presentations
];