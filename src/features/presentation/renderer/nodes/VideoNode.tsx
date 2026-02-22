import React from 'react';
import { VideoNode as VideoNodeType } from '../../parser/types';
import { useImageRegistry } from '../../context/ImageRegistryContext';
import styles from './VideoNode.module.css';

type Props = { node: VideoNodeType };

export const VideoNode: React.FC<Props> = ({ node }) => {
  const { getUrl } = useImageRegistry();
  const src = getUrl(node.src) ?? node.src;

  if (node.fullSlide) {
    return (
      <div className={styles.fullSlideWrapper}>
        <video
          className={styles.videoFullSlide}
          src={src}
          autoPlay={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <video
        className={styles.video}
        src={src}
        autoPlay={true}
      />
    </div>
  );
};
