import React from 'react';
import { Slide } from '../parser/types';
import { PresentationViewer } from '../viewer/PresentationViewer';

type Props = { slides: Slide[] };

export const SlideRenderer: React.FC<Props> = ({ slides }) => (
  <PresentationViewer slides={slides} />
);
