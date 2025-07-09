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

  let quality = 0.95;
  let blob;

  do {
    blob = await new Promise(res =>
      canvas.toBlob(res, `image/${format}`, quality)
    );
    quality -= 0.05;
  } while (blob && blob.size > targetSize && quality > 0.05);

  if (!blob) throw new Error("Compression failed: unable to generate blob");

  const previewURL = URL.createObjectURL(blob);
  const name = file.name.replace(/\.[^/.]+$/, `.${format}`);
  return { blob, previewURL, name };
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = err => reject(err);
      img.src = reader.result;
    };
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}
