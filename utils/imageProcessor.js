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

  if (!blob && format === "avif") {
    console.warn("AVIF encoding failed. Falling back to WebP.");
    return compressImage(file, "webp", maxWidth, maxHeight, targetSize);
  }

  if (!blob) {
    console.warn("Fallback to PNG due to unsupported format.");
    blob = await new Promise(resolve =>
      canvas.toBlob(b => resolve(b), "image/png", 0.95)
    );
  }

  const previewURL = URL.createObjectURL(blob);
  return { blob, previewURL, name: file.name };
}
