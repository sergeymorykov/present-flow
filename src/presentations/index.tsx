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
  // Добавляйте новые презентации сюда
];