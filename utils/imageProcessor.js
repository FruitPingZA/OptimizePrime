async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Maintain aspect ratio
  const aspectRatio = img.width / img.height;
  let scaledWidth = maxWidth;
  let scaledHeight = maxHeight;

  if (img.width > img.height) {
    scaledHeight = Math.min(maxHeight, Math.round(maxWidth / aspectRatio));
  } else {
    scaledWidth = Math.min(maxWidth, Math.round(maxHeight * aspectRatio));
  }

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

  let quality = 0.95;
  let blob;

  do {
    blob = await new Promise(res => {
      canvas.toBlob(res, `image/${format}`, quality);
    });

    if (!blob) {
      alert(`Your browser does not support the "${format}" format for compression.`);
      return { blob: null, previewURL: "", name: file.name };
    }

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
