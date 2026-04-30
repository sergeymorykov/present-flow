import React from 'react';
import { BadgeRowNode as BadgeRowNodeType } from '../../parser/types';
import { blockStyleToCss } from './blockStyleToCss';
import styles from './BadgeRowNode.module.css';

interface Props {
  node: BadgeRowNodeType;
}

const DARK_PALETTE: Record<string, string> = {
  blue: '#3b82f6',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  green: '#22c55e',
  lime: '#84cc16',
  yellow: '#eab308',
  amber: '#f59e0b',
  orange: '#f97316',
  red: '#ef4444',
  pink: '#ec4899',
  purple: '#a855f7',
  violet: '#8b5cf6',
  indigo: '#6366f1',
  gray: '#475569',
  grey: '#475569',
  slate: '#475569',
};

const resolveColor = (raw?: string): string => {
  if (!raw) return DARK_PALETTE.blue;
  const key = raw.trim().toLowerCase();
  return DARK_PALETTE[key] ?? raw;
};

export const BadgeRowNode: React.FC<Props> = ({ node }) => {
  const style = blockStyleToCss(node.style);

  return (
    <div className={styles.row} style={style}>
      {node.items.map((item, idx) => (
        <span
          key={idx}
          className={styles.badge}
          style={{ backgroundColor: resolveColor(item.color) }}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
};
