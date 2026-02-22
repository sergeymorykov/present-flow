import React from 'react';
import { ContentSlide as ContentSlideType } from '../../parser/types';
import { NodeRenderer } from '../NodeRenderer';
import { FragmentNode } from './FragmentNode';
import styles from './ContentSlide.module.css';

type Props = {
  slide: ContentSlideType;
  visibleFragments: number;
};

export const ContentSlide: React.FC<Props> = ({ slide, visibleFragments }) => {
  let fragmentsSeen = 0;

  return (
    <div className={styles.slide}>
      {slide.nodes.map((node, i) => {
        if (node.type === 'fragment') {
          const isVisible = fragmentsSeen < visibleFragments;
          fragmentsSeen += 1;
          return <FragmentNode key={i} node={node} visible={isVisible} />;
        }
        return <NodeRenderer key={i} node={node} />;
      })}
    </div>
  );
};
