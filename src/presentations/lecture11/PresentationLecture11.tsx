import React, { useMemo } from 'react';
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import { resolvePresentationAssets } from '@/features/presentation/utils/resolvePresentationAssets';
import markdownContent from './presentation.md?raw';

export const PresentationLecture11: React.FC = () => {
  const slides = useMemo(() => parsePresentation(resolvePresentationAssets(markdownContent)), []);

  return <SlideRenderer slides={slides} />;
};
