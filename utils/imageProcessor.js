// utils/imageProcessor.js

import { encode as encodeAvif } from '../codecs/avif/avif_enc.js';

export async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const newWidth = Math.round(img.width * scale);
  const newHeight = Math.round(img.height * scale);

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  if (format === 'avif') {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    let cqLevel = 30;
    let avifData;

    while (cqLevel <= 63) {
      try {
        avifData = await encodeAvif(imageData.data, newWidth, newHeight, {
          cqLevel,
          effort: 8,
          subsample: 1,
        });
      } catch (err) {
        console.error("AVIF encode error:", err);
        break;
      }

      if (avifData.byteLength <= targetSize) break;
      cqLevel += 3;
    }

    if (!avifData) throw new Error("Failed to encode AVIF.");

    const blob = new Blob([avifData], { type: 'image/avif' });
    const previewURL = URL.createObjectURL(blob);
    return {
      blob,
      previewURL,
      name: file.name.replace(/\.[^/.]+$/, '.avif')
    };
  }

  // fallback for other formats
  let quality = 0.95;
  let blob;

  do {
    blob = await new Promise((res) => canvas.toBlob(res, `image/${format}`, quality));
    quality -= 0.05;
  } while (blob && blob.size > targetSize && quality > 0.05);

  if (!blob) throw new Error("Failed to compress image.");

  const previewURL = URL.createObjectURL(blob);
  return {
    blob,
    previewURL,
    name: file.name.replace(/\.[^/.]+$/, `.${format}`)
  };
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image failed to load."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
