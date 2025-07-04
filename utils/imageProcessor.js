async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const scaledWidth = Math.round(img.width * scale);
  const scaledHeight = Math.round(img.height * scale);

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

  let quality = 0.95;
  let blob;

  do {
    blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
    quality -= 0.05;
  } while (blob.size > targetSize && quality > 0.1);

  const previewURL = URL.createObjectURL(blob);
  return { blob, previewURL };
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
