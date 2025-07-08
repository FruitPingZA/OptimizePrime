import { ImagePool } from 'https://unpkg.com/@squoosh/lib@0.4.0/dist/squoosh.min.mjs';

window.compressImageWithSquoosh = async function (file, format, maxWidth, maxHeight, targetSize) {
  const pool = new ImagePool(1); // Limit to 1 thread for compatibility
  const arrayBuffer = await file.arrayBuffer();
  const image = pool.ingestImage(new Uint8Array(arrayBuffer));

  await image.decoded;

  const scale = Math.min(maxWidth / image.bitmap.width, maxHeight / image.bitmap.height, 1);
  const newWidth = Math.round(image.bitmap.width * scale);
  const newHeight = Math.round(image.bitmap.height * scale);

  if (scale < 1) {
    await image.preprocess({
      resize: {
        width: newWidth,
        height: newHeight,
      },
    });
  }

  await image.encode({
    [format]: {
      quality: 75,
      effort: 4,
    },
  });

  const { binary } = image.encodedWith[format];
  const blob = new Blob([binary], { type: `image/${format}` });
  const previewURL = URL.createObjectURL(blob);

  await pool.close();
  return {
    blob,
    previewURL,
    name: file.name.replace(/\.[^/.]+$/, "") + "." + format,
  };
};
