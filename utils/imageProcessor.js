import { encode as avifEncode } from '../codecs/avif/avif_enc.js';
import { encode as webpEncode } from '../codecs/webp/webp_enc.js';
import { encode as mozjpegEncode } from '../codecs/mozjpeg/mozjpeg_enc.js';
import { encode as imageQuant } from '../codecs/imagequant/imagequant.js';

export async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
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
  let buffer;
  let quality = 75;

  if (format === "avif") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    buffer = avifEncode(imageData.data, newWidth, newHeight, { quality });
    blob = new Blob([buffer], { type: 'image/avif' });

  } else if (format === "webp") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    buffer = webpEncode(imageData.data, newWidth, newHeight, { quality });
    blob = new Blob([buffer], { type: 'image/webp' });

  } else if (format === "jpeg" || format === "jpg") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    buffer = mozjpegEncode(imageData.data, newWidth, newHeight, { quality });
    blob = new Blob([buffer], { type: 'image/jpeg' });

  } else if (format === "png") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const quant = imageQuant(imageData.data, newWidth, newHeight);
    blob = new Blob([quant.buffer], { type: 'image/png' });

  } else {
    // fallback to canvas.toBlob if format is unsupported
    blob = await new Promise(res => canvas.toBlob(res, `image/${format}`));
  }

  const previewURL = URL.createObjectURL(blob);
  const ext = format === "jpg" ? "jpeg" : format;

  return {
    blob,
    previewURL,
    name: file.name.replace(/\.[^/.]+$/, `.${ext}`)
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
