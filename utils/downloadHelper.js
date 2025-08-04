import JSZip from '../lib/jszip.min.js';
import { saveAs } from '../lib/FileSaver.min.js';

export async function downloadImages(images) {
  if (!images || images.length === 0) {
    alert("No images to download.");
    return;
  }

  if (images.length < 10) {
    // Download each image individually
    images.forEach((img, index) => {
      const link = document.createElement('a');
      link.href = img.blobUrl || URL.createObjectURL(img.blob);
      link.download = img.fileName || `image_${index + 1}.${img.type || 'webp'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } else {
    // ZIP download
    const zip = new JSZip();
    const folder = zip.folder("OptimizePrime_Images");

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const blob = img.blob || await fetch(img.blobUrl).then(res => res.blob());
      const name = img.fileName || `image_${i + 1}.${img.type || 'webp'}`;
      folder.file(name, blob);
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, 'OptimizePrime_Images.zip');
    });
  }
}
