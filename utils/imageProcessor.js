async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
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
  let quality = 0.95;
  const minQuality = 0.05;

  if (format === 'avif') {
    do {
      blob = await window.encodeAvifFromCanvas(canvas, quality * 100);
      quality -= 0.1;
    } while (blob.size > targetSize && quality > minQuality);
  } else {
    do {
      blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
      quality -= 0.05;
    } while (blob.size > targetSize && quality > minQuality);
  }

  const extension = format.toLowerCase();
  const name = file.name.replace(/\.[^/.]+$/, '.' + extension);
  const previewURL = URL.createObjectURL(blob);

  return { blob, previewURL, name };
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

// Make available globally
window.compressImage = compressImage;
window.loadImageFromFile = loadImageFromFile;
