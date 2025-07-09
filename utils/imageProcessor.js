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

  let blob;
  let quality = 0.95;
  const mimeType = getMimeType(format);

  if (format === "avif") {
    try {
      const avifModule = await import("../codecs/avif/avif_enc.js");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const encoded = avifModule.encode(imageData.data, canvas.width, canvas.height, { quality: 50 });
      blob = new Blob([encoded.buffer], { type: mimeType });
    } catch (e) {
      console.error("AVIF compression failed:", e);
      throw e;
    }
  } else {
    do {
      blob = await new Promise((res) =>
        canvas.toBlob(res, mimeType, quality)
      );
      quality -= 0.05;
    } while (blob && blob.size > targetSize && quality > 0.05);
  }

  if (!blob) throw new Error("Compression failed, no blob generated.");

  const previewURL = URL.createObjectURL(blob);
  const name = file.name.replace(/\.[^/.]+$/, `.${format}`);
  return { blob, previewURL, name };
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

function getMimeType(format) {
  switch (format.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    default:
      return "image/png";
  }
}
