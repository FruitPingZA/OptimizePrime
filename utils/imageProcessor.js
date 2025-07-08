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

  let quality = 0.95;
  let blob = null;

  while (quality > 0.05) {
    blob = await new Promise(resolve => {
      canvas.toBlob(
        b => resolve(b),
        `image/${format}`,
        quality
      );
    });

    if (blob && blob.size <= targetSize) break;
    quality -= 0.05;
  }

  // If AVIF fails and returns null, force fallback to WebP (optional)
  if (!blob && format === "avif") {
    console.warn("AVIF failed, falling back to WebP.");
    return compressImage(file, "webp", maxWidth, maxHeight, targetSize);
  }

  // If all else fails, fallback to PNG
  if (!blob) {
    blob = await new Promise(resolve => {
      canvas.toBlob(b => resolve(b), "image/png", 0.9);
    });
  }

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
