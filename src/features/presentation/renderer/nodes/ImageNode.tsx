import React from 'react';
import { ImageNode as ImageNodeType } from '../../parser/types';
import styles from './ImageNode.module.css';

type Props = { node: ImageNodeType };

export const ImageNode: React.FC<Props> = ({ node }) => (
  <div className={styles.wrapper}>
    <img
      className={styles.image}
      src={node.src}
      alt=""
      width={node.width}
      height={node.height}
    />
  </div>
);
