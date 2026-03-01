import React from 'react';
import { DividerNode as DividerNodeType } from '../../parser/types';
import styles from './DividerNode.module.css';

type Props = {
  node: DividerNodeType;
};

export const DividerNodeComponent: React.FC<Props> = ({ node }) => {
  const style: React.CSSProperties = node.color
    ? {
        background: `linear-gradient(90deg, transparent 0%, ${node.color} 20%, ${node.color} 80%, transparent 100%)`,
      }
    : {};

  return (
    <hr
      className={styles.divider}
      style={Object.keys(style).length > 0 ? style : undefined}
    />
  );
};
