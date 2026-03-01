import React, { useMemo } from 'react';
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import markdownContent from './lecture7_1.md';

import vftableImg from './assets/lecture7/vftable.jpg';
import classesDiagramCatImg from './assets/lecture7/classes_diagram_cat.png';
import stdIostreamImg from './assets/lecture7/std-basic_iostream-inheritance.png';

const IMAGE_MAP: Record<string, string> = {
  'assets/lecture7/vftable.jpg': vftableImg,
  'assets/lecture7/classes_diagram_cat.png': classesDiagramCatImg,
  'assets/lecture7/std-basic_iostream-inheritance.png': stdIostreamImg,
};

const resolveImages = (md: string): string => {
  let result = md;
  for (const [path, url] of Object.entries(IMAGE_MAP)) {
    result = result.split(path).join(url);
  }
  return result;
};

export const PresentationLecture7_1: React.FC = () => {
  const slides = useMemo(
    () => parsePresentation(resolveImages(markdownContent)),
    []
  );

  return <SlideRenderer slides={slides} />;
};
