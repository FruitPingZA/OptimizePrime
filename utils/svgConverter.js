// svgConverter.js

// Creates an SVG string from user input
function generateSVG(text, font, color) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
  <style>
    .text { font: 40px ${font}; fill: ${color}; }
  </style>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="text">${text}</text>
</svg>`;
}

// Updates the SVG preview and output window
function updateSVGPreview() {
  const text = document.getElementById("svgTextInput").value || "Sample";
  const font = document.getElementById("svgFontSelect").value;
  const color = document.getElementById("svgColorInput").value;
  const css = document.getElementById("svgCustomCSS").value;

  let svg = generateSVG(text, font, color);

  // If custom CSS exists, inject it
  if (css.trim()) {
    svg = svg.replace(
      /<\/style>/,
      `${css.replace(/<\/?style>/g, "")}</style>`
    );
  }

  document.getElementById("svgOutput").value = svg;
  document.getElementById("svgLivePreview").innerHTML = svg;
}

// Triggers download of SVG as file
function downloadSVG() {
  const svg = document.getElementById("svgOutput").value;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  saveAs(blob, "generated.svg");
}

// Hooks
document.addEventListener("DOMContentLoaded", () => {
  const previewElements = ["svgTextInput", "svgFontSelect", "svgColorInput", "svgCustomCSS"];
  previewElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateSVGPreview);
  });

  const downloadBtn = document.getElementById("downloadSVGBtn");
  if (downloadBtn) downloadBtn.addEventListener("click", downloadSVG);

  // Initial preview
  updateSVGPreview();
});
