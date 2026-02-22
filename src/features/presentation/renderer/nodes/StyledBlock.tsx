import React from 'react';
import { StyledBlockNode as StyledBlockNodeType, SlideNode } from '../../parser/types';
import { NodeRenderer } from '../NodeRenderer';
import { FragmentNode } from './FragmentNode';
import styles from './StyledBlock.module.css';

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
  return <NodeRenderer key={index} node={child} />;
};

export const StyledBlock: React.FC<Props> = ({
  node,
  visibleFragments,
  fragmentCounter,
}) => {
  const s = node.style;
  const style: React.CSSProperties = {
    ...(s?.textAlign && { textAlign: s.textAlign }),
    ...(s?.marginTop && { marginTop: s.marginTop }),
    ...(s?.marginRight && { marginRight: s.marginRight }),
    ...(s?.marginBottom && { marginBottom: s.marginBottom }),
    ...(s?.marginLeft && { marginLeft: s.marginLeft }),
    ...(s?.fontSize && { fontSize: s.fontSize }),
  };

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
