export async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.95;
  let blob;

  if (format === "avif") {
    do {
      blob = await window.encodeAvifFromCanvas(canvas, quality * 100);
      quality -= 0.05;
    } while (blob.size > targetSize && quality > 0.05);
  } else {
    do {
      blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
      quality -= 0.05;
    } while (blob.size > targetSize && quality > 0.05);
  }

  return {
    blob,
    previewURL: URL.createObjectURL(blob),
    name: file.name.replace(/\.[^/.]+$/, `.${format}`)
  };
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
