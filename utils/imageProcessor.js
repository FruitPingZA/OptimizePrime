export async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const newWidth = Math.round(img.width * scale);
  const newHeight = Math.round(img.height * scale);

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
  const rgba = new Uint8Array(imageData.data.buffer);
  let quality = 0.95;
  let blob;

  try {
    if (format === "avif" && window.avifEncoder?.encode) {
      const encoded = window.avifEncoder.encode(rgba, newWidth, newHeight, Math.round(quality * 100));
      blob = new Blob([encoded.buffer], { type: "image/avif" });
    } else if (format === "webp" && window.webpEncoder?.encode) {
      const encoded = window.webpEncoder.encode(rgba, newWidth, newHeight, Math.round(quality * 100));
      blob = new Blob([encoded.buffer], { type: "image/webp" });
    } else if ((format === "jpeg" || format === "jpg") && window.mozjpegEncoder?.encode) {
      const encoded = window.mozjpegEncoder.encode(rgba, newWidth, newHeight, Math.round(quality * 100));
      blob = new Blob([encoded.buffer], { type: "image/jpeg" });
    } else {
      // fallback using toBlob
      do {
        blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
        quality -= 0.05;
      } while (blob && blob.size > targetSize && quality > 0.05);
    }

    const previewURL = URL.createObjectURL(blob);
    return {
      blob,
      previewURL,
      name: file.name.replace(/\.[^/.]+$/, `.${format}`)
    };

  } catch (err) {
    console.error(`Error compressing ${file.name}:`, err);
    throw err;
  }
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
