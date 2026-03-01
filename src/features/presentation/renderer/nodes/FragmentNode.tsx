import React from 'react';
import { FragmentNode as FragmentNodeType } from '../../parser/types';
import { TextNode } from './TextNode';
import { blockStyleToCss } from './blockStyleToCss';
import styles from './FragmentNode.module.css';

type Props = { node: FragmentNodeType; visible: boolean };

export const FragmentNode: React.FC<Props> = ({ node, visible }) => {
  const style = blockStyleToCss(node.style);
  const inner = (
    <div className={styles.contentWrapper}>
      <div className={visible ? styles.visible : styles.hidden}>
        <TextNode node={{ type: 'text', content: node.content }} compactLists />
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
