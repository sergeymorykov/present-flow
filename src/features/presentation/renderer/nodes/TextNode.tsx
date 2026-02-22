import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { TextNode as TextNodeType } from '../../parser/types';
import { useImageRegistry } from '../../context/ImageRegistryContext';
import styles from './TextNode.module.css';

type Props = { node: TextNodeType };

export const TextNode: React.FC<Props> = ({ node }) => {
  const { getUrl } = useImageRegistry();

  const components = useMemo(
    () => ({
      img: ({ src, alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img src={src ? (getUrl(src) ?? src) : undefined} alt={alt ?? ''} {...rest} />
      ),
    }),
    [getUrl]
  );

  return (
    <div className={styles.text} data-list-style={node.listClass ?? undefined}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {node.content}
      </ReactMarkdown>
    </div>
  );
};
