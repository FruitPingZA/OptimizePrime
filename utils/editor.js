function adjustBrightness(ctx, width, height, value = 1.0) {
  const imageData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] *= value;
    imageData.data[i + 1] *= value;
    imageData.data[i + 2] *= value;
  }
  ctx.putImageData(imageData, 0, 0);
}

function cropToSquare(ctx, canvas, originalWidth, originalHeight) {
  const size = Math.min(originalWidth, originalHeight);
  const offsetX = (originalWidth - size) / 2;
  const offsetY = (originalHeight - size) / 2;
  const cropped = ctx.getImageData(offsetX, offsetY, size, size);
  canvas.width = size;
  canvas.height = size;
  ctx.putImageData(cropped, 0, 0);
}
