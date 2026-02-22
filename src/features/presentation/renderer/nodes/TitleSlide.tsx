import React from 'react';
import { TitleSlide as TitleSlideType } from '../../parser/types';
import styles from './TitleSlide.module.css';

type Props = { slide: TitleSlideType };

export const TitleSlide: React.FC<Props> = ({ slide }) => (
  <div className={styles.slide}>
    <h1 className={styles.title}>{slide.title}</h1>
    {slide.subtitle && <p className={styles.subtitle}>{slide.subtitle}</p>}
    {slide.author && <p className={styles.author}>{slide.author}</p>}
    {slide.affiliation && <p className={styles.affiliation}>{slide.affiliation}</p>}
    {slide.date && <p className={styles.date}>{slide.date}</p>}
  </div>
);
