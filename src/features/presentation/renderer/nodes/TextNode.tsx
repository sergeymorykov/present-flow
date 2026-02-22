import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { TextNode as TextNodeType } from '../../parser/types';
import styles from './TextNode.module.css';

type Props = { node: TextNodeType };

export const TextNode: React.FC<Props> = ({ node }) => (
  <div className={styles.text}>
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {node.content}
    </ReactMarkdown>
  </div>
);
