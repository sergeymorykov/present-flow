import React from 'react';
import { DiagramNode as DiagramNodeType } from '../../../parser/types';
import { blockStyleToCss } from './blockStyleToCss';
import styles from './DiagramNode.module.css';

interface Props {
  node: DiagramNodeType;
}

export const DiagramNode: React.FC<Props> = ({ node }) => {
  const style = blockStyleToCss(node.style);

  return (
    <div 
      className={styles.diagram} 
      style={style}
      dangerouslySetInnerHTML={{ __html: node.value }}
    />
  );
};
