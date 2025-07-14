import { encode as encodeAvif } from '../codecs/avif/avif_wrapper.js';
import { encode as encodeWebp } from '../codecs/webp/webp_wrapper.js';

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
    const avifOptions = {
      quality: quality,
      speed: 6,
      qualityAlpha: quality,
      tileRowsLog2: 0 // <--- required field!
    };
    const encoded = await encodeAvif(imageData.data, newWidth, newHeight, avifOptions);
    blob = new Blob([encoded.buffer], { type: "image/avif" });
  } else if (format === "webp") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const webpOptions = {
      quality: quality,
      lossless: false,
      qualityAlpha: quality,
      method: 4,
      image_hint: 0,
      target_size: 0 // <--- required field!
    };
    const encoded = await encodeWebp(imageData.data, newWidth, newHeight, webpOptions);
    blob = new Blob([encoded.buffer], { type: "image/webp" });
  } else {
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
