async function compressImage(file, format, maxWidth, maxHeight, targetSize, keepAspect = true) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let width = maxWidth;
  let height = maxHeight;

  if (keepAspect) {
    const ratio = img.width / img.height;
    if (img.width > img.height) {
      width = Math.min(maxWidth, img.width);
      height = Math.round(width / ratio);
    } else {
      height = Math.min(maxHeight, img.height);
      width = Math.round(height * ratio);
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.95;
  let blob;

  do {
    blob = await new Promise((res) => {
      canvas.toBlob(res, `image/${format}`, quality);
    });

    if (!blob) {
      alert(`Your browser does not support the "${format}" format for compression.`);
      return { blob: null, previewURL: "", name: file.name };
    }

    quality -= 0.05;
  } while (blob.size > targetSize && quality > 0.05);

  const previewURL = URL.createObjectURL(blob);
  return { blob, previewURL, name: file.name, originalWidth: img.width, originalHeight: img.height, compressedWidth: width, compressedHeight: height };
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
