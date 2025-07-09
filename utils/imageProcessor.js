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
  let previewURL;

  if (format === 'avif') {
    // Use custom AVIF encoder from WASM
    blob = await encodeAvifFromCanvas(canvas, targetSize);
  } else {
    let quality = 0.95;
    do {
      blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
      quality -= 0.05;
    } while (blob && blob.size > targetSize && quality > 0.05);
  }

  previewURL = URL.createObjectURL(blob);

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

async function encodeAvifFromCanvas(canvas, targetSize) {
  const avifModule = await import('../codecs/avif/avif_enc.js');
  const module = await avifModule.default();

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let quality = 60; // AVIF uses 0–100
  let result;

  do {
    result = module.encode(imageData.data, canvas.width, canvas.height, quality);
    quality -= 5;
  } while (result && result.length > targetSize && quality > 10);

  return new Blob([result], { type: 'image/avif' });
}
