import { encode as encodeAvif } from '../codecs/avif/avif_enc.js';
import { encode as encodeWebp } from '../codecs/webp/webp_enc.js';

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
  if (format === "avif") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const encoded = encodeAvif(imageData.data, newWidth, newHeight, 75); // quality 75
    blob = new Blob([encoded], { type: "image/avif" });
  } else if (format === "webp") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const encoded = encodeWebp(imageData.data, newWidth, newHeight, 75); // quality 75
    blob = new Blob([encoded], { type: "image/webp" });
  } else {
    let quality = 0.95;
    do {
      blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
      quality -= 0.05;
    } while (blob && blob.size > targetSize && quality > 0.05);
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
