import React from 'react';
import { TableNode as TableNodeType } from '../../parser/types';
import styles from './TableNode.module.css';

type Props = { node: TableNodeType };

export const TableNode: React.FC<Props> = ({ node }) => {
  const [headerRow, ...bodyRows] = node.rows;

  const tableClass = node.borderless
    ? `${styles.table} ${styles.noBorder}`
    : styles.table;

  return (
    <div className={styles.wrapper}>
      <table className={tableClass}>
        {headerRow && (
          <thead>
            <tr>
              {headerRow.map((cell, i) => (
                <th key={i}>{cell}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
