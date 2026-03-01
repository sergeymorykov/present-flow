import React from 'react';
import { ContentSlide as ContentSlideType } from '../../parser/types';
import { NodeRenderer } from '../NodeRenderer';
import { ColumnsNode } from './ColumnsNode';
import { FragmentNode } from './FragmentNode';
import { StyledBlock } from './StyledBlock';
import { NoteNodeComponent } from './NoteNode';
import styles from './ContentSlide.module.css';

type Props = {
  slide: ContentSlideType;
  visibleFragments: number;
};

export const ContentSlide: React.FC<Props> = ({ slide, visibleFragments }) => {
  const fragmentCounter = { current: 0 };

  return (
    <div
      className={
        slide.scroll ? styles.slide : `${styles.slide} ${styles.slideNoScroll}`
      }
    >
      {slide.nodes.map((node, i) => {
        if (node.type === 'fragment') {
          const isVisible = fragmentCounter.current < visibleFragments;
          fragmentCounter.current += 1;
          return <FragmentNode key={i} node={node} visible={isVisible} />;
        }
        if (node.type === 'styled') {
          return (
            <StyledBlock
              key={i}
              node={node}
              visibleFragments={visibleFragments}
              fragmentCounter={fragmentCounter}
            />
          );
        }
        if (node.type === 'columns') {
          return (
            <ColumnsNode
              key={i}
              node={node}
              visibleFragments={visibleFragments}
              fragmentCounter={fragmentCounter}
            />
          );
        }
        if (node.type === 'note') {
          return (
            <NoteNodeComponent
              key={i}
              node={node}
              visibleFragments={visibleFragments}
              fragmentCounter={fragmentCounter}
            />
          );
        }
        return <NodeRenderer key={i} node={node} />;
      })}
    </div>
  );
};
