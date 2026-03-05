import React from 'react';
import { VideoNode as VideoNodeType } from '../../parser/types';
import { useImageRegistry } from '../../context/ImageRegistryContext';
import styles from './VideoNode.module.css';

type Props = { node: VideoNodeType };

const getVideoMimeType = (src: string): string | undefined => {
  const clearSrc = src.split('?')[0].split('#')[0].toLowerCase();
  if (clearSrc.endsWith('.mp4')) {
    return 'video/mp4';
  }
  if (clearSrc.endsWith('.webm')) {
    return 'video/webm';
  }
  return undefined;
};

export const VideoNode: React.FC<Props> = ({ node }) => {
  const { getUrl } = useImageRegistry();
  const src = getUrl(node.src) ?? node.src;
  const mimeType = getVideoMimeType(src);

  if (node.fullSlide) {
    return (
      <div className={styles.fullSlideWrapper}>
        <video
          className={styles.videoFullSlide}
          autoPlay={true}
          muted={true}
          loop={true}
          playsInline={true}
          controls={true}
          preload="metadata"
        >
          <source src={src} type={mimeType} />
        </video>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <video
        className={styles.video}
        autoPlay={true}
        muted={true}
        loop={true}
        playsInline={true}
        controls={true}
        preload="metadata"
      >
        <source src={src} type={mimeType} />
      </video>
    </div>
  );
};
