import React from 'react';
import { BadgeRowNode as BadgeRowNodeType } from '../../../parser/types';
import { blockStyleToCss } from './blockStyleToCss';
import styles from './BadgeRowNode.module.css';

interface Props {
  node: BadgeRowNodeType;
}

export const BadgeRowNode: React.FC<Props> = ({ node }) => {
  const style = blockStyleToCss(node.style);

  return (
    <div className={styles.row} style={style}>
      {node.items.map((item, idx) => (
        <span
          key={idx}
          className={styles.badge}
          style={{ backgroundColor: item.color || '#3b82f6' }}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
};
