

function generateSVG(text, font, color) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="100">
      <style>
        .label-text {
          font-family: '${font}';
          fill: ${color};
          font-size: 48px;
        }
      </style>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="label-text">${text}</text>
    </svg>
  `;
}

function updateSVGPreview() {
  const text = document.getElementById("svgText").value;
  const font = document.getElementById("svgFont").value;
  const color = document.getElementById("svgColor").value;
  const svgDisplay = document.getElementById("svgDisplay");
  const css = document.getElementById("customCSS").value;

  const svg = generateSVG(text, font, color);
  const combinedSVG = svg.replace("</style>", `${css}</style>`);
  svgDisplay.innerHTML = combinedSVG;
}

function downloadSVG() {
  const text = document.getElementById("svgText").value;
  const font = document.getElementById("svgFont").value;
  const color = document.getElementById("svgColor").value;
  const css = document.getElementById("customCSS").value;

  const baseSVG = generateSVG(text, font, color);
  const finalSVG = baseSVG.replace("</style>", `${css}</style>`);
  const blob = new Blob([finalSVG], { type: "image/svg+xml" });
  saveAs(blob, "label.svg");
}

// Hook listeners
document.getElementById("svgText").addEventListener("input", updateSVGPreview);
document.getElementById("svgFont").addEventListener("change", updateSVGPreview);
document.getElementById("svgColor").addEventListener("input", updateSVGPreview);
document.getElementById("customCSS").addEventListener("input", updateSVGPreview);
document.getElementById("downloadSVGBtn").addEventListener("click", downloadSVG);
