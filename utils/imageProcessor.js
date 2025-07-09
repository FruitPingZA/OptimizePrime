export async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const newWidth = Math.round(img.width * scale);
  const newHeight = Math.round(img.height * scale);

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  if (format === 'avif') {
    const avifEncoder = await import('../codecs/avif/avif_enc.js');
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const rgba = imageData.data;

    // Try compressing with increasing quality until below targetSize
    let quality = 30;
    let blob = null;

    while (quality <= 70) {
      const avifData = avifEncoder.encode(rgba, newWidth, newHeight, { cqLevel: quality, effort: 6 });
      blob = new Blob([avifData], { type: 'image/avif' });

      if (blob.size <= targetSize) break;
      quality += 5;
    }

    const previewURL = URL.createObjectURL(blob);
    return {
      blob,
      previewURL,
      name: file.name.replace(/\.[^/.]+$/, '.avif')
    };
  }

  // fallback for other formats (webp, jpeg, png)
  let quality = 0.95;
  let blob;

  do {
    blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, quality));
    quality -= 0.05;
  } while (blob && blob.size > targetSize && quality > 0.05);

  const previewURL = URL.createObjectURL(blob);
  return {
    blob,
    previewURL,
    name: file.name.replace(/\.[^/.]+$/, `.${format}`)
  };
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
