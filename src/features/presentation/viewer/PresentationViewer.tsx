import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Slide, SlideNode } from '../parser/types';
import { TitleSlide } from '../renderer/nodes/TitleSlide';
import { SectionSlide } from '../renderer/nodes/SectionSlide';
import { ContentSlide } from '../renderer/nodes/ContentSlide';
import { ErrorSlide } from '../renderer/nodes/ErrorSlide';
import styles from './PresentationViewer.module.css';

type Props = { slides: Slide[] };

const countFragmentsInNodes = (nodes: SlideNode[]): number =>
  nodes.reduce((sum, n) => {
    if (n.type === 'fragment') return sum + 1;
    if (n.type === 'styled') return sum + countFragmentsInNodes(n.children);
    return sum;
  }, 0);

const countFragments = (slide: Slide): number => {
  if (slide.type !== 'content') return 0;
  return countFragmentsInNodes(slide.nodes);
};

const renderSlide = (slide: Slide, visibleFragments: number): React.ReactElement => {
  if (slide.type === 'title') return <TitleSlide slide={slide} />;
  if (slide.type === 'section') return <SectionSlide slide={slide} />;
  if (slide.type === 'content') return <ContentSlide slide={slide} visibleFragments={visibleFragments} />;
  if (slide.type === 'error') return <ErrorSlide slide={slide} />;
  return <></>;
};

const DESIGN_WIDTH = 960;
const DESIGN_HEIGHT = 540;

export const PresentationViewer: React.FC<Props> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visibleFragments, setVisibleFragments] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const slideAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, slides.length - 1)));
    setVisibleFragments(0);
  }, [slides.length]);

  useEffect(() => {
    const el = slideAreaRef.current;
    if (!el) return;
    const updateScale = (): void => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setScale(Math.min(w / DESIGN_WIDTH, h / DESIGN_HEIGHT, 2) || 1);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

      <div ref={slideAreaRef} className={styles.slideArea} style={{ ['--scale' as string]: scale }}>
        <div className={styles.slideScaled}>
          <div key={currentIndex} className={styles.slide}>
            {renderSlide(currentSlide, visibleFragments)}
          </div>
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
