import React from 'react';
import { StyledBlockNode as StyledBlockNodeType, SlideNode } from '../../parser/types';
import { NodeRenderer } from '../NodeRenderer';
import { FragmentNode } from './FragmentNode';
import { NoteNodeComponent } from './NoteNode';
import styles from './StyledBlock.module.css';
import { blockStyleToCss } from './blockStyleToCss';

type FragmentCounter = { current: number };

type Props = {
  node: StyledBlockNodeType;
  visibleFragments: number;
  fragmentCounter: FragmentCounter;
};

const renderStyledChild = (
  child: SlideNode,
  index: number,
  visibleFragments: number,
  fragmentCounter: FragmentCounter
): React.ReactNode => {
  if (child.type === 'fragment') {
    const visible = fragmentCounter.current < visibleFragments;
    fragmentCounter.current += 1;
    return <FragmentNode key={index} node={child} visible={visible} />;
  }
  if (child.type === 'styled') {
    return (
      <StyledBlock
        key={index}
        node={child}
        visibleFragments={visibleFragments}
        fragmentCounter={fragmentCounter}
      />
    );
  }
  if (child.type === 'note') {
    return (
      <NoteNodeComponent
        key={index}
        node={child}
        visibleFragments={visibleFragments}
        fragmentCounter={fragmentCounter}
      />
    );
  }
  return <NodeRenderer key={index} node={child} />;
};

export const StyledBlock: React.FC<Props> = ({
  node,
  visibleFragments,
  fragmentCounter,
}) => {
  const style = blockStyleToCss(node.style);
  const hasStyle = Object.keys(style).length > 0;

  return (
    <div
      className={styles.wrapper}
      style={hasStyle ? style : undefined}
    >
      {node.children.map((child, i) =>
        renderStyledChild(child, i, visibleFragments, fragmentCounter)
      )}
    </div>
  );
};
