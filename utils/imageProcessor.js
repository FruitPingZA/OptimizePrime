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
  let previewURL;
  let quality = 0.95;

  if (format === "avif" && typeof window.avifEncode === "function") {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let encoded;
    do {
      encoded = await window.avifEncode(imageData, { cqLevel: Math.round((1 - quality) * 63) });
      blob = new Blob([encoded.buffer], { type: "image/avif" });
      quality -= 0.05;
    } while (blob.size > targetSize && quality > 0.05);

    previewURL = URL.createObjectURL(blob);
    return { blob, previewURL, name: replaceExtension(file.name, "avif") };
  }

  // Standard compression using toBlob for other formats
  do {
    blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
    quality -= 0.05;
  } while (blob && blob.size > targetSize && quality > 0.05);

  previewURL = URL.createObjectURL(blob);
  return { blob, previewURL, name: replaceExtension(file.name, format) };
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

function replaceExtension(filename, newExt) {
  return filename.replace(/\.[^/.]+$/, "") + "." + newExt;
}
