import { encode as encodeAvif } from '../codecs/avif/avif_wrapper.js';
import { encode as encodeWebp } from '../codecs/webp/webp_wrapper.js';

export async function compressImage(file, format, maxWidth, maxHeight, targetSize, quality = 80) {
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
  if (format === "avif") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const avifOptions = {
      quality: quality,
      speed: 6,
      qualityAlpha: quality,
      tileRowsLog2: 0,
      tileColsLog2: 0,
      subsample: 1,
      sharpness: 0,
      chromaDeltaQ: 0,
      tune: 0,
      denoiseLevel: 0,
      enableSharpYUV: false, // <--- Required!
      // Add any new fields here if new errors appear
    };
    const encoded = await encodeAvif(imageData.data, newWidth, newHeight, avifOptions);
    blob = new Blob([encoded.buffer], { type: "image/avif" });
  } else if (format === "webp") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const webpOptions = {
      quality: quality,
      lossless: false,
      qualityAlpha: quality,
      method: 4,
      image_hint: 0,
      target_size: 0,
      target_PSNR: 0,
      segments: 4,
      sns_strength: 50,
      filter_strength: 20,
      filter_sharpness: 0,
      filter_type: 0,
      autofilter: false,
      alpha_compression: 1,
      alpha_filtering: 1,
      alpha_quality: 100,
      pass: 1,
      show_compressed: 0,
      preprocessing: 0,
      partitions: 0,
      partition_limit: 0,
      emulate_jpeg_size: false,
      thread_level: 0,
      low_memory: false,
      near_lossless: 100,
      exact: false,
      use_delta_palette: false,
      use_sharp_yuv: false
      // Add new fields here if new errors appear
    };
    const encoded = await encodeWebp(imageData.data, newWidth, newHeight, webpOptions);
    blob = new Blob([encoded.buffer], { type: "image/webp" });
  } else {
    let q = quality / 100;
    do {
      blob = await new Promise(res => canvas.toBlob(res, `image/${format}`, q));
      q -= 0.05;
    } while (blob && blob.size > targetSize && q > 0.05);
  }

  if (!blob || blob.size === 0) {
    throw new Error('Compression failed: No output blob');
  }

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
