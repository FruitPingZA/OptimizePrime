import initAvif from '../codecs/avif/avif_enc.js';
import initWebP from '../codecs/webp/webp_enc.js';
import initMozJpeg from '../codecs/mozjpeg/mozjpeg_enc.js';
import initQuant from '../codecs/imagequant/imagequant.js';

let avifEnc, webpEnc, mozjpegEnc, imageQuantEnc;

async function ensureCodecsLoaded() {
  if (!avifEnc) avifEnc = await initAvif();
  if (!webpEnc) webpEnc = await initWebP();
  if (!mozjpegEnc) mozjpegEnc = await initMozJpeg();
  if (!imageQuantEnc) imageQuantEnc = await initQuant();
}

export async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  await ensureCodecsLoaded();
  const img = await loadImageFromFile(file);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const newWidth = Math.round(img.width * scale);
  const newHeight = Math.round(img.height * scale);

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
  let binary, mimeType;

  try {
    switch (format) {
      case 'avif':
        binary = avifEnc.encode(imageData, { cqLevel: 33, effort: 4 });
        mimeType = 'image/avif';
        break;
      case 'webp':
        const quantized = imageQuantEnc.quantize(imageData);
        binary = webpEnc.encode(quantized, { quality: 75 });
        mimeType = 'image/webp';
        break;
      case 'jpeg':
      case 'jpg':
        binary = mozjpegEnc.encode(imageData, { quality: 75 });
        mimeType = 'image/jpeg';
        break;
      case 'png':
        return await compressWithCanvasFallback(canvas, 'image/png', file.name, targetSize);
      default:
        throw new Error('Unsupported format: ' + format);
    }

    const blob = new Blob([binary], { type: mimeType });
    const previewURL = URL.createObjectURL(blob);
    const name = file.name.replace(/\.[^/.]+$/, `.${format}`);

    return { blob, previewURL, name };

  } catch (err) {
    console.error(`Error compressing ${file.name}:`, err);
    return await compressWithCanvasFallback(canvas, `image/${format}`, file.name, targetSize);
  }
}

async function compressWithCanvasFallback(canvas, mimeType, originalName, targetSize) {
  let quality = 0.95;
  let blob;
  do {
    blob = await new Promise(res => canvas.toBlob(res, mimeType, quality));
    quality -= 0.05;
  } while (blob && blob.size > targetSize && quality > 0.05);

  const previewURL = URL.createObjectURL(blob);
  const name = originalName.replace(/\.[^/.]+$/, `.${mimeType.split('/')[1]}`);

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
