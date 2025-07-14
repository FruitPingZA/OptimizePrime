import { encode as encodeAvif } from '../codecs/avif/avif_wrapper.js';
import { encode as encodeWebp } from '../codecs/webp/webp_wrapper.js';

/**
 * Compresses an image file to the desired format and options.
 * 
 * @param {File} file - The image file to compress.
 * @param {string} format - Target format ('avif', 'webp', 'jpeg', etc).
 * @param {number} maxWidth - Maximum width of output image.
 * @param {number} maxHeight - Maximum height of output image.
 * @param {number} targetSize - Target file size in bytes.
 * @param {number} quality - Quality (1-100), higher is better quality.
 * @returns {Promise<{blob: Blob, previewURL: string, name: string}>}
 */
export async function compressImage(file, format, maxWidth, maxHeight, targetSize, quality = 80) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const newWidth = Math.round(img.width * scale);
  const newHeight = Math.round(img.height * scale);

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  let blob;
  if (format === "avif") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    // Squoosh AVIF expects { quality, speed, qualityAlpha }
    const avifOptions = {
      quality: quality,
      speed: 6,
      qualityAlpha: quality
    };
    const encoded = await encodeAvif(imageData.data, newWidth, newHeight, avifOptions);
    blob = new Blob([encoded.buffer], { type: "image/avif" });
  } else if (format === "webp") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    // Squoosh WebP expects { quality, lossless, qualityAlpha, method, image_hint, target_size }
    const webpOptions = {
      quality: quality,
      lossless: false,
      qualityAlpha: quality,
      method: 4,
      image_hint: 0,
      target_size: 0 // 0 disables, or you can set targetSize/1024 for KB
    };
    const encoded = await encodeWebp(imageData.data, newWidth, newHeight, webpOptions);
    blob = new Blob([encoded.buffer], { type: "image/webp" });
  } else {
    // jpeg/png fallback, try to fit into targetSize
    let q = quality / 100;
    do {
      blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, q));
      q -= 0.05;
    } while (blob && blob.size > targetSize && q > 0.05);
  }

  const previewURL = URL.createObjectURL(blob);
  return {
    blob,
    previewURL,
    name: file.name.replace(/\.[^/.]+$/, `.${format}`)
  };
}

function loadImageFromFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
