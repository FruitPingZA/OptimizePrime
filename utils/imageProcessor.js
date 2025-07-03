// utils/imageProcessor.js

async function compressImage(file, format, maxWidth, maxHeight, targetSize, keepAspectRatio = true, qualityOverride = null) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let targetW = maxWidth;
  let targetH = maxHeight;

  if (keepAspectRatio) {
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
    targetW = Math.round(img.width * scale);
    targetH = Math.round(img.height * scale);
  }

  canvas.width = targetW;
  canvas.height = targetH;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  let quality = qualityOverride ?? 0.95;
  let blob;

  // Loop to compress until under size or min quality
  do {
    blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
    if (!blob) {
      alert(`Your browser may not support the ${format.toUpperCase()} format.`);
      return { blob: null, previewURL: "", name: file.name };
    }
    quality -= 0.05;
  } while (blob.size > targetSize && quality > 0.05);

  const previewURL = URL.createObjectURL(blob);
  return { blob, previewURL, name: file.name, original: img };
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

export { compressImage };
