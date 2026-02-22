import React from 'react';
import { ColumnsNode as ColumnsNodeType } from '../../parser/types';
import { TextNode } from './TextNode';
import styles from './ColumnsNode.module.css';

type Props = { node: ColumnsNodeType };

export const ColumnsNode: React.FC<Props> = ({ node }) => (
  <div className={styles.columns}>
    {node.columns.map((content, i) => (
      <div key={i} className={styles.column}>
        <TextNode node={{ type: 'text', content }} />
      </div>
    ))}
  </div>
);
