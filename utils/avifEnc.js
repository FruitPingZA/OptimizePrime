import { AvifEncoder } from 'https://cdn.jsdelivr.net/npm/@jsquash/avif@0.4.2/+esm';

export async function encodeAvifFromCanvas(canvas, quality = 70) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const encoder = new AvifEncoder();
  encoder.configure({ cqLevel: Math.floor((100 - quality) * 0.63), tileRowsLog2: 0, tileColsLog2: 0 });
  encoder.encode(imageData);

  const avifBuffer = encoder.flush();
  encoder.close();

  return new Blob([avifBuffer], { type: 'image/avif' });
}
