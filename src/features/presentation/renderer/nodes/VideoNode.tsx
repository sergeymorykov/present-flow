import React, { useEffect, useRef } from 'react';
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
  const autoPlay = node.autoplay !== false;
  const muted = node.muted !== false;
  const loop = node.loop !== false;
  const controls = node.controls !== false;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && node.playbackRate !== undefined) {
      videoRef.current.playbackRate = node.playbackRate;
    }
  }, [node.playbackRate]);

  if (node.fullSlide) {
    return (
      <div className={styles.fullSlideWrapper}>
        <video
          ref={videoRef}
          className={styles.videoFullSlide}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={true}
          controls={controls}
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
        ref={videoRef}
        className={styles.video}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={true}
        controls={controls}
        preload="metadata"
      >
        <source src={src} type={mimeType} />
      </video>
    </div>
  );
};
