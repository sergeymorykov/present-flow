import React from 'react';
import { SectionSlide as SectionSlideType } from '../../parser/types';
import styles from './SectionSlide.module.css';

type Props = { slide: SectionSlideType };

export const SectionSlide: React.FC<Props> = ({ slide }) => (
  <div className={styles.slide}>
    <h2 className={styles.title}>{slide.title}</h2>
  </div>
);
