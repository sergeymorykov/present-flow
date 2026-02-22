import React from 'react';
import { ColumnsNode as ColumnsNodeType } from '../../parser/types';
import { TextNode } from './TextNode';
import styles from './ColumnsNode.module.css';

type Props = { node: ColumnsNodeType };

const blockStyleToCss = (s: ColumnsNodeType['style']): React.CSSProperties => {
  if (!s) return {};
  return {
    ...(s.textAlign && { textAlign: s.textAlign, ['--block-text-align' as string]: s.textAlign }),
    ...(s.marginTop && { marginTop: s.marginTop }),
    ...(s.marginRight && { marginRight: s.marginRight }),
    ...(s.marginBottom && { marginBottom: s.marginBottom }),
    ...(s.marginLeft && { marginLeft: s.marginLeft }),
    ...(s.fontSize && { fontSize: s.fontSize }),
    ...(s.width && { width: s.width }),
    ...(s.height && { height: s.height }),
  };
};

export const ColumnsNode: React.FC<Props> = ({ node }) => {
  const blockStyle = blockStyleToCss(node.style);
  const columnStyles = node.columnStyles ?? [];
  return (
    <div className={styles.columns} style={Object.keys(blockStyle).length > 0 ? blockStyle : undefined}>
      {node.columns.map((content, i) => {
        const colStyle = columnStyles[i];
        const colCss = colStyle ? blockStyleToCss(colStyle) : {};
        return (
          <div
            key={i}
            className={styles.column}
            style={Object.keys(colCss).length > 0 ? colCss : undefined}
          >
            <TextNode node={{ type: 'text', content }} />
          </div>
        );
      })}
    </div>
  );
};
