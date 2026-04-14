import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TableNode as TableNodeType } from '../../parser/types';
import styles from './TableNode.module.css';

const blockStyleToCss = (s: TableNodeType['style']): React.CSSProperties => {
  if (!s) return {};
  return {
    ...(s.marginTop && { marginTop: s.marginTop }),
    ...(s.marginRight && { marginRight: s.marginRight }),
    ...(s.marginBottom && { marginBottom: s.marginBottom }),
    ...(s.marginLeft && { marginLeft: s.marginLeft }),
    ...(s.fontSize && { fontSize: s.fontSize }),
    ...(s.width && { width: s.width }),
    ...(s.height && { height: s.height }),
  };
};

type Props = { node: TableNodeType };

export const TableNode: React.FC<Props> = ({ node }) => {
  const [headerRow, ...bodyRows] = node.rows;

  const tableClass = node.borderless
    ? `${styles.table} ${styles.noBorder}`
    : styles.table;

  const wrapperStyle = blockStyleToCss(node.style);

  return (
    <div
      className={styles.wrapper}
      style={Object.keys(wrapperStyle).length > 0 ? wrapperStyle : undefined}
    >
      <table className={tableClass}>
        {headerRow && (
          <thead>
            <tr>
              {headerRow.map((cell, i) => (
                <th key={i}><ReactMarkdown>{cell}</ReactMarkdown></th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}><ReactMarkdown>{cell}</ReactMarkdown></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
