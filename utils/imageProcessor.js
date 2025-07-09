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
  let previewURL;
  let name;

  if (format === "avif") {
    const { encode } = await import('../codecs/avif/avif_enc.js');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = encode(imageData.data, canvas.width, canvas.height, {
      quality: 85,
      speed: 6
    });
    blob = new Blob([result.buffer], { type: 'image/avif' });
  } else if (format === "webp") {
    const { encode } = await import('../codecs/webp/webp_enc.js');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = encode(imageData.data, canvas.width, canvas.height, {
      quality: 85
    });
    blob = new Blob([result.buffer], { type: 'image/webp' });
  } else if (["jpeg", "jpg", "png"].includes(format)) {
    let quality = 0.95;
    do {
      blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
      quality -= 0.05;
    } while (blob && blob.size > targetSize && quality > 0.05);
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  previewURL = URL.createObjectURL(blob);
  name = file.name.replace(/\.[^/.]+$/, `.${format}`);

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
