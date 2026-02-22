import React from 'react';
import { ErrorSlide as ErrorSlideType } from '../../parser/types';
import styles from './ErrorSlide.module.css';

type Props = { slide: ErrorSlideType };

export const ErrorSlide: React.FC<Props> = ({ slide }) => (
  <div className={styles.slide}>
    <h2 className={styles.title}>Ошибка парсинга</h2>
    <pre className={styles.message}>{slide.message}</pre>
  </div>
);
