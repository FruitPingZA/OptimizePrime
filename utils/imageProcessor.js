async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let scale = 1;
  if (maxWidth && maxHeight) {
    scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  } else if (maxWidth) {
    scale = Math.min(maxWidth / img.width, 1);
  } else if (maxHeight) {
    scale = Math.min(maxHeight / img.height, 1);
  }

  const scaledWidth = Math.round(img.width * scale);
  const scaledHeight = Math.round(img.height * scale);

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

  let quality = 0.95;
  let blob;

  const mimeType = format === "avif" ? "image/avif" : `image/${format}`;

  do {
    blob = await new Promise(res => {
      canvas.toBlob(res, mimeType, quality);
    });

    if (!blob) {
      alert(`Your browser does not support the "${format}" format for compression.`);
      return { blob: null, previewURL: "", name: file.name };
    }

    quality -= 0.05;
  } while (blob.size > targetSize && quality > 0.1);

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
