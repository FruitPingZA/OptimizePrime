function textToSVG(text, font = "Arial", size = 48, color = "#ffffff") {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="100">
      <text x="0" y="${size}" font-family="${font}" font-size="${size}" fill="${color}">${text}</text>
    </svg>
  `.trim();
}

function canvasToSVG(canvas) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <image href="${canvas.toDataURL("image/png")}" width="${canvas.width}" height="${canvas.height}" />
    </svg>
  `.trim();
  return svg;
}

// Expose to global scope for script.js
window.textToSVG = textToSVG;
