import React from 'react';
import { ImageNode as ImageNodeType } from '../../parser/types';
import { useImageRegistry } from '../../context/ImageRegistryContext';
import styles from './ImageNode.module.css';

type Props = { node: ImageNodeType };

export const ImageNode: React.FC<Props> = ({ node }) => {
  const { getUrl } = useImageRegistry();
  const src = getUrl(node.src) ?? node.src;

  return (
    <div className={styles.wrapper}>
      <img
        className={styles.image}
        src={src}
        alt=""
        width={node.width}
        height={node.height}
      />
    </div>
  );
};
