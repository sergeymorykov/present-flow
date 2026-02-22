import React from 'react';
import { TitleSlide as TitleSlideType } from '../../parser/types';
import styles from './TitleSlide.module.css';

type Props = { slide: TitleSlideType };

export const TitleSlide: React.FC<Props> = ({ slide }) => {
  const s = slide.style;
  const slideStyle: React.CSSProperties = {
    ...(s?.textAlign && { textAlign: s.textAlign }),
    ...(s?.marginTop && { marginTop: s.marginTop }),
    ...(s?.marginRight && { marginRight: s.marginRight }),
    ...(s?.marginBottom && { marginBottom: s.marginBottom }),
    ...(s?.marginLeft && { marginLeft: s.marginLeft }),
  };
  const titleStyle = s?.fontSize ? { fontSize: s.fontSize } : undefined;
  return (
    <div className={styles.slide} style={slideStyle}>
      <h1 className={styles.title} style={titleStyle}>{slide.title}</h1>
      {slide.subtitle && <p className={styles.subtitle}>{slide.subtitle}</p>}
      {slide.author && <p className={styles.author}>{slide.author}</p>}
      {slide.affiliation && <p className={styles.affiliation}>{slide.affiliation}</p>}
      {slide.date && <p className={styles.date}>{slide.date}</p>}
    </div>
  );
};
