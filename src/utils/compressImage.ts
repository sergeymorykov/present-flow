const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.85;

/**
 * Сжимает data URL изображения через canvas (ресайз + JPEG) для хранения в IndexedDB.
 */
export const compressImageDataUrl = (dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const scale = w > MAX_WIDTH ? MAX_WIDTH / w : 1;
        const cw = Math.round(w * scale);
        const ch = Math.round(h * scale);
        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, cw, ch);
        const compressed = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}
