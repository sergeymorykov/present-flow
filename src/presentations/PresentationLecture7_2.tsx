import React, { useMemo } from 'react';
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import markdownContent from './lecture7_2.md?raw';

import vftableImg from './assets/lecture7/vftable.jpg';
import layoutPointImg from './assets/lecture7/layout_point.jpg';
import layoutPaddingImg from './assets/lecture7/layout_padding.jpg';
import layoutPadding2Img from './assets/lecture7/layout_padding_2.jpg';
import layoutPadding3Img from './assets/lecture7/layout_padding_3.jpg';
import layoutInheritanceImg from './assets/lecture7/layout_inheritance.jpg';
import layoutMultipleImg from './assets/lecture7/layout_multiple_inheritance.jpg';
import layoutVtable3Img from './assets/lecture7/layout_vtable_3.jpg';

const IMAGE_MAP: Record<string, string> = {
  'assets/lecture7/vftable.jpg': vftableImg,
  'assets/lecture7/layout_point.jpg': layoutPointImg,
  'assets/lecture7/layout_padding.jpg': layoutPaddingImg,
  'assets/lecture7/layout_padding_2.jpg': layoutPadding2Img,
  'assets/lecture7/layout_padding_3.jpg': layoutPadding3Img,
  'assets/lecture7/layout_inheritance.jpg': layoutInheritanceImg,
  'assets/lecture7/layout_multiple_inheritance.jpg': layoutMultipleImg,
  'assets/lecture7/layout_vtable_3.jpg': layoutVtable3Img,
};

const resolveImages = (md: string): string => {
  let result = md;
  for (const [path, url] of Object.entries(IMAGE_MAP)) {
    result = result.split(path).join(url);
  }
  return result;
};

export const PresentationLecture7_2: React.FC = () => {
  const slides = useMemo(
    () => parsePresentation(resolveImages(markdownContent)),
    []
  );

  return <SlideRenderer slides={slides} />;
};
