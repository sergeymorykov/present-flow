import React, { useMemo } from 'react';
import { SlideRenderer } from '@/features/presentation/renderer/SlideRenderer';
import { parsePresentation } from '@/features/presentation/parser/parsePresentation';
import markdownContent from './lecture3.md?raw';

import aqtReleasesImg from './assets/aqt_releases.png';
import introVid from './assets/intro.mp4';

const IMAGE_MAP: Record<string, string> = {
  'assets/aqt_releases.png': aqtReleasesImg,
  'assets/intro.mp4': introVid,
};

const resolveImages = (md: string): string => {
  let result = md;
  for (const [path, url] of Object.entries(IMAGE_MAP)) {
    result = result.split(path).join(url);
  }
  return result;
};

export const PresentationLecture3: React.FC = () => {
  const slides = useMemo(
    () => parsePresentation(resolveImages(markdownContent)),
    []
  );

  return <SlideRenderer slides={slides} />;
};
