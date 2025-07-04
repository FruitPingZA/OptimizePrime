async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Maintain aspect ratio unless dimensions are overridden
  const scale = Math.min(
    maxWidth / img.width || 1,
    maxHeight / img.height || 1,
    1
  );
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.95;
  let blob;

  // Keep compressing until it's below target size or minimum quality hit
  do {
    blob = await new Promise((res) =>
      canvas.toBlob(res, `image/${format}`, quality)
    );
    quality -= 0.03;
  } while (blob.size > targetSize && quality > 0.6);

  const previewURL = URL.createObjectURL(blob);
  return { blob, previewURL, name: file.name };
}

function loadImageFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
