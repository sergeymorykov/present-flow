import React, { useMemo } from 'react';
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import markdownContent from './presentation.md?raw';

export const PresentationLecture6: React.FC = () => {
  const slides = useMemo(() => parsePresentation(markdownContent), []);

  return <SlideRenderer slides={slides} />;
};
