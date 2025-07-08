async function compressImage(file, format, maxWidth, maxHeight, targetSize) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const newWidth = Math.round(img.width * scale);
  const newHeight = Math.round(img.height * scale);

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  if (format === "avif") {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const avifBuffer = await window.avifEncode(imageData, {
      quality: 60,
    });
    const blob = new Blob([avifBuffer], { type: "image/avif" });
    const previewURL = URL.createObjectURL(blob);
    return {
      blob,
      previewURL,
      name: file.name.replace(/\.[^/.]+$/, ".avif"),
    };
  }

  return new Promise((resolve) => {
    let quality = 0.95;
    function tryCompress() {
      canvas.toBlob(
        (blob) => {
          if (blob.size > targetSize && quality > 0.1) {
            quality -= 0.05;
            tryCompress();
          } else {
            const previewURL = URL.createObjectURL(blob);
            resolve({
              blob,
              previewURL,
              name: file.name.replace(/\.[^/.]+$/, "." + format),
            });
          }
        },
        "image/" + format,
        quality
      );
    }
    tryCompress();
  });
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
