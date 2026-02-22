import React from 'react';
import { SectionSlide as SectionSlideType } from '../../parser/types';
import styles from './SectionSlide.module.css';

type Props = { slide: SectionSlideType };

export const SectionSlide: React.FC<Props> = ({ slide }) => {
  const s = slide.style;
  const slideStyle: React.CSSProperties = {
    ...(s?.textAlign && { textAlign: s.textAlign }),
    ...(s?.marginTop && { marginTop: s.marginTop }),
    ...(s?.marginRight && { marginRight: s.marginRight }),
    ...(s?.marginBottom && { marginBottom: s.marginBottom }),
    ...(s?.marginLeft && { marginLeft: s.marginLeft }),
    ...(s?.fontSize && { fontSize: s.fontSize }),
  };
  return (
    <div className={styles.slide} style={slideStyle}>
      <h2 className={styles.title}>{slide.title}</h2>
    </div>
  );
};
