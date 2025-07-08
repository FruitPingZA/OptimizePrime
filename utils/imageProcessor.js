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

  const ext = format.toLowerCase();
  const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  if (ext === "avif" && typeof window.avifEncode === "function") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const encodedBuffer = await window.avifEncode(imageData, { quality: 75 });
    blob = new Blob([encodedBuffer], { type: "image/avif" });
  } else {
    let quality = 0.95;
    do {
      blob = await new Promise(res => canvas.toBlob(res, mimeType, quality));
      quality -= 0.05;
    } while (blob && blob.size > targetSize && quality > 0.05);
  }

  if (!blob || blob.size === 0) {
    throw new Error(`Compression failed for format: ${format}`);
  }

  previewURL = URL.createObjectURL(blob);
  name = replaceExtension(file.name, ext);

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

// Expose functions globally for script.js
window.compressImage = compressImage;
window.loadImageFromFile = loadImageFromFile;
window.replaceExtension = replaceExtension;
