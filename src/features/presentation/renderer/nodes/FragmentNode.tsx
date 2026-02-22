import React from 'react';
import { FragmentNode as FragmentNodeType } from '../../parser/types';
import { TextNode } from './TextNode';
import styles from './FragmentNode.module.css';

type Props = { node: FragmentNodeType; visible: boolean };

const blockStyleToCss = (s: FragmentNodeType['style']): React.CSSProperties => {
  if (!s) return {};
  return {
    ...(s.textAlign && { textAlign: s.textAlign, ['--block-text-align' as string]: s.textAlign }),
    ...(s.marginTop && { marginTop: s.marginTop }),
    ...(s.marginRight && { marginRight: s.marginRight }),
    ...(s.marginBottom && { marginBottom: s.marginBottom }),
    ...(s.marginLeft && { marginLeft: s.marginLeft }),
    ...(s.fontSize && { fontSize: s.fontSize }),
  };
};

export const FragmentNode: React.FC<Props> = ({ node, visible }) => {
  const style = blockStyleToCss(node.style);
  const inner = (
    <div className={visible ? styles.visible : styles.hidden}>
      <TextNode node={{ type: 'text', content: node.content }} />
    </div>
  );
  if (Object.keys(style).length === 0) return inner;
  return (
    <div className={styles.styledWrapper} style={style}>
      {inner}
    </div>
  );
};
