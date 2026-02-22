import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Slide } from '../parser/types';
import { TitleSlide } from '../renderer/nodes/TitleSlide';
import { SectionSlide } from '../renderer/nodes/SectionSlide';
import { ContentSlide } from '../renderer/nodes/ContentSlide';
import { ErrorSlide } from '../renderer/nodes/ErrorSlide';
import styles from './PresentationViewer.module.css';

type Props = { slides: Slide[] };

const countFragments = (slide: Slide): number => {
  if (slide.type !== 'content') return 0;
  return slide.nodes.filter((n) => n.type === 'fragment').length;
};

const renderSlide = (slide: Slide, visibleFragments: number): React.ReactElement => {
  if (slide.type === 'title') return <TitleSlide slide={slide} />;
  if (slide.type === 'section') return <SectionSlide slide={slide} />;
  if (slide.type === 'content') return <ContentSlide slide={slide} visibleFragments={visibleFragments} />;
  if (slide.type === 'error') return <ErrorSlide slide={slide} />;
  return <></>;
};

export const PresentationViewer: React.FC<Props> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visibleFragments, setVisibleFragments] = useState<number>(0);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Reset to first slide when slide list changes significantly
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, slides.length - 1)));
    setVisibleFragments(0);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];
  const totalFragments = currentSlide ? countFragments(currentSlide) : 0;
  const isFirst = currentIndex === 0 && visibleFragments === 0;
  const isLast = currentIndex === slides.length - 1 && visibleFragments >= totalFragments;

  const goNext = useCallback(() => {
    if (visibleFragments < totalFragments) {
      setVisibleFragments((v) => v + 1);
      return;
    }
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((i) => i + 1);
      setVisibleFragments(0);
    }
  }, [visibleFragments, totalFragments, currentIndex, slides.length]);

  const goPrev = useCallback(() => {
    if (visibleFragments > 0) {
      setVisibleFragments((v) => v - 1);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setVisibleFragments(0);
    }
  }, [visibleFragments, currentIndex]);

  // Keyboard navigation — only when the viewer div has focus
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    },
    [goNext, goPrev]
  );

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const progressPct = useMemo(
    () => (slides.length > 1 ? (currentIndex / (slides.length - 1)) * 100 : 100),
    [currentIndex, slides.length]
  );

  useEffect(() => {
    progressRef.current?.style.setProperty('--progress', `${progressPct.toFixed(1)}%`);
  }, [progressPct]);

  if (slides.length === 0) {
    return (
      <div className={styles.viewer}>
        <div className={styles.emptyState}>Нет слайдов для отображения</div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className={styles.viewer}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Просмотр презентации"
    >
      <div className={styles.progressBar}>
        <div ref={progressRef} className={styles.progressFill} />
      </div>

      <div className={styles.slideArea}>
        {/* key forces remount + CSS animation on every slide change */}
        <div key={currentIndex} className={styles.slide}>
          {renderSlide(currentSlide, visibleFragments)}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.navButton}
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Предыдущий слайд"
        >
          ←
        </button>

        <span className={styles.counter}>
          {currentIndex + 1} / {slides.length}
        </span>

        <button
          className={styles.navButton}
          onClick={goNext}
          disabled={isLast}
          aria-label="Следующий слайд"
        >
          →
        </button>

        <button
          className={styles.navButton}
          onClick={handleFullscreen}
          aria-label="На весь экран"
        >
          ⛶
        </button>
      </div>
    </div>
  );
};
