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

  let blob, previewURL, name;

  if (format === "avif" && typeof window.avifEncode === "function") {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const avifBuffer = await window.avifEncode(imageData, { quality: 75 });
    blob = new Blob([avifBuffer], { type: "image/avif" });
    previewURL = URL.createObjectURL(blob);
    name = replaceExtension(file.name, "avif");

  } else {
    let quality = 0.95;
    const mime = `image/${format === "jpg" ? "jpeg" : format}`;

    do {
      blob = await new Promise(res => canvas.toBlob(res, mime, quality));
      quality -= 0.05;
    } while (blob.size > targetSize && quality > 0.05);

    previewURL = URL.createObjectURL(blob);
    name = replaceExtension(file.name, format);
  }

  return { blob, previewURL, name };
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
