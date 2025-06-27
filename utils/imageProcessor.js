async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Scale image to max width/height while preserving aspect ratio
  let scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const scaledWidth = Math.round(img.width * scale);
  const scaledHeight = Math.round(img.height * scale);

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

  let quality = 0.95;
  let blob;

  // Try compressing repeatedly until under target size or minimum quality
  do {
    blob = await new Promise(res => {
      canvas.toBlob(res, `image/${format}`, quality);
    });

    if (!blob) {
      alert(`Your browser does not support the "${format}" format for compression.`);
      return { blob: null, previewURL: "", name: file.name };
    }

    quality -= 0.05;
  } while (blob.size > targetSize && quality > 0.05);

  const previewURL = URL.createObjectURL(blob);
  return { blob, previewURL, name: file.name };
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

function downloadAll(processedBlobs) {
  if (!processedBlobs.length) {
    alert("No processed images to download.");
    return;
  }

  const zip = new JSZip();

  processedBlobs.forEach(({ blob, name }) => {
    if (!blob) return;
    const extension = name.split(".").pop();
    const baseName = name.replace(/\.[^/.]+$/, "");
    zip.file(`${baseName}.${extension}`, blob);
  });

  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "optimizeprime_images.zip");
  });
}
