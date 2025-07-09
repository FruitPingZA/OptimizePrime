let avifEnc, webpEnc, mozjpegEnc, imageQuantEnc;
let codecsLoaded = false;

async function loadCodecs() {
  if (codecsLoaded) return;

  const [avif, webp, mozjpeg, imagequant] = await Promise.all([
    import('../codecs/avif/avif_enc.js'),
    import('../codecs/webp/webp_enc.js'),
    import('../codecs/mozjpeg/mozjpeg_enc.js'),
    import('../codecs/imagequant/imagequant.js')
  ]);

  avifEnc = await avif.default();
  webpEnc = await webp.default();
  mozjpegEnc = await mozjpeg.default();
  imageQuantEnc = await imagequant.default();

  codecsLoaded = true;
}

export async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  await loadCodecs();

  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const newWidth = Math.round(img.width * scale);
  const newHeight = Math.round(img.height * scale);

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let encoded;
  let ext = format.toLowerCase();

  try {
    if (ext === 'avif') {
      encoded = avifEnc.encode(imageData, {
        quality: 50, // lower = smaller size
        speed: 8,
      });
    } else if (ext === 'webp') {
      const quantized = imageQuantEnc.quantize(imageData);
      encoded = webpEnc.encode(quantized, { quality: 75 });
    } else if (ext === 'jpeg' || ext === 'jpg') {
      encoded = mozjpegEnc.encode(imageData, { quality: 75 });
    } else if (ext === 'png') {
      // Optional: fallback to browser encoder for PNG
      encoded = await new Promise((res) => canvas.toBlob(res, "image/png"));
      const previewURL = URL.createObjectURL(encoded);
      return { blob: encoded, previewURL, name: file.name.replace(/\.[^/.]+$/, `.png`) };
    } else {
      throw new Error("Unsupported format");
    }
  } catch (err) {
    console.error(`Error compressing ${file.name}:`, err);
    alert(`Compression failed for ${file.name}`);
    return null;
  }

  const blob = new Blob([encoded.binary], { type: encoded.mimeType });
  const previewURL = URL.createObjectURL(blob);
  const name = file.name.replace(/\.[^/.]+$/, `.${ext}`);

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
