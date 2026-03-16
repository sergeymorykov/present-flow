import React from 'react';
import { FragmentNode as FragmentNodeType, SlideNode } from '../../parser/types';
import { NodeRenderer } from '../NodeRenderer';
import { NoteNodeComponent } from './NoteNode';
import { StyledBlock } from './StyledBlock';
import { ColumnsNode } from './ColumnsNode';
import { blockStyleToCss } from './blockStyleToCss';
import styles from './FragmentNode.module.css';

type Props = { node: FragmentNodeType; visible: boolean };

/** All nested fragments/code-steps inside a fragment are always visible. */
const ALWAYS_VISIBLE = Infinity;
const noopCounter = () => ({ current: 0 });

const renderChild = (child: SlideNode, index: number): React.ReactNode => {
  if (child.type === 'note') {
    return (
      <NoteNodeComponent
        key={index}
        node={child}
        visibleFragments={ALWAYS_VISIBLE}
        fragmentCounter={noopCounter()}
      />
    );
  }
  if (child.type === 'styled') {
    return (
      <StyledBlock
        key={index}
        node={child}
        visibleFragments={ALWAYS_VISIBLE}
        fragmentCounter={noopCounter()}
      />
    );
  }
  if (child.type === 'columns') {
    return (
      <ColumnsNode
        key={index}
        node={child}
        visibleFragments={ALWAYS_VISIBLE}
        fragmentCounter={noopCounter()}
      />
    );
  }
  return <NodeRenderer key={index} node={child} />;
};

export const FragmentNode: React.FC<Props> = ({ node, visible }) => {
  const style = blockStyleToCss(node.style);
  const inner = (
    <div className={styles.contentWrapper}>
      <div className={visible ? styles.visible : styles.hidden}>
        {node.children.map((child, i) => renderChild(child, i))}
      </div>
    </div>
  );
  if (Object.keys(style).length === 0) return inner;
  return (
    <div className={styles.styledWrapper} style={style}>
      {inner}
    </div>
  );
};
