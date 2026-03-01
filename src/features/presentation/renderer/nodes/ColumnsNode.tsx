import React from 'react';
import { ColumnsNode as ColumnsNodeType, SlideNode } from '../../parser/types';
import { NodeRenderer } from '../NodeRenderer';
import { FragmentNode } from './FragmentNode';
import { StyledBlock } from './StyledBlock';
import { NoteNodeComponent } from './NoteNode';
import { blockStyleToCss } from './blockStyleToCss';
import styles from './ColumnsNode.module.css';

type FragmentCounter = { current: number };

type Props = {
  node: ColumnsNodeType;
  visibleFragments: number;
  fragmentCounter: FragmentCounter;
};

const renderColumnNode = (
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
  if (child.type === 'columns') {
    return (
      <ColumnsNode
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

export const ColumnsNode: React.FC<Props> = ({
  node,
  visibleFragments,
  fragmentCounter,
}) => {
  const blockStyle = blockStyleToCss(node.style);
  const columnStyles = node.columnStyles ?? [];
  return (
    <div
      className={styles.columns}
      style={Object.keys(blockStyle).length > 0 ? blockStyle : undefined}
    >
      {node.columns.map((columnNodes, i) => {
        const colStyle = columnStyles[i];
        const colCss: React.CSSProperties = colStyle ? blockStyleToCss(colStyle) : {};
        if (colStyle?.width) {
          colCss.flex = 'none';
        }
        return (
          <div
            key={i}
            className={styles.column}
            style={Object.keys(colCss).length > 0 ? colCss : undefined}
          >
            {columnNodes.map((colNode, j) =>
              renderColumnNode(colNode, j, visibleFragments, fragmentCounter)
            )}
          </div>
        );
      })}
    </div>
  );
};
