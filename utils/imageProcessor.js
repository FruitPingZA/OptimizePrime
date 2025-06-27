async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  adjustBrightness(ctx, canvas.width, canvas.height, 1.1);

  let quality = 0.95;
  let blob;

  do {
    blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
    quality -= 0.05;
  } while (blob.size > targetSize && quality > 0.05);

  const previewURL = URL.createObjectURL(blob);
  return { blob, previewURL, name: file.name };
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
