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

  const qualityStart = 0.95;
  const qualityStep = 0.05;
  let quality = qualityStart;
  let blob = null;

  // Get RGBA pixel data
  const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
  const rgba = imageData.data;

  const tryEncode = async () => {
    if (format === "avif" && window.avifEncoder?.encode) {
      const result = window.avifEncoder.encode(rgba, newWidth, newHeight, quality);
      return new Blob([result.buffer], { type: "image/avif" });
    }

    if (format === "webp" && window.webpEncoder?.encode) {
      const result = window.webpEncoder.encode(rgba, newWidth, newHeight, quality);
      return new Blob([result.buffer], { type: "image/webp" });
    }

    if ((format === "jpeg" || format === "jpg") && window.mozjpegEncoder?.encode) {
      const result = window.mozjpegEncoder.encode(rgba, newWidth, newHeight, quality * 100); // quality in %
      return new Blob([result.buffer], { type: "image/jpeg" });
    }

    // Fallback to canvas.toBlob for other formats
    return await new Promise(resolve =>
      canvas.toBlob(resolve, `image/${format}`, quality)
    );
  };

  do {
    blob = await tryEncode();
    quality -= qualityStep;
  } while (blob && blob.size > targetSize && quality > 0.05);

  const previewURL = URL.createObjectURL(blob);
  const finalName = file.name.replace(/\.[^/.]+$/, `.${format}`);
  return { blob, previewURL, name: finalName };
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
