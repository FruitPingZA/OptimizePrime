export async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await new Promise(res => {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => res(i);
      i.src = r.result;
    };
    r.readAsDataURL(file);
  });

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  let quality = 0.95;
  let blob;
  const mime = format === "jpg" ? "jpeg" : format;

  if (format === "avif" && window.encodeAvifFromCanvas) {
    blob = await window.encodeAvifFromCanvas(canvas, targetSize);
  } else {
    do {
      blob = await canvas.convertToBlob({ type: `image/${mime}`, quality });
      quality -= 0.05;
    } while (blob.size > targetSize && quality > 0.05);
  }

  return {
    blob,
    previewURL: URL.createObjectURL(blob),
    name: file.name.replace(/\.\w+$/, `.${format}`)
  };
}
