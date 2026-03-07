import React, { useMemo } from 'react';
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import markdownContent from './lecture8.md?raw';

export const PresentationLecture8: React.FC = () => {
  const slides = useMemo(() => parsePresentation(markdownContent), []);

  return <SlideRenderer slides={slides} />;
};
