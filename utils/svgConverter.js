// svgConverter.js

let svgVisible = false;

function textToSVG(text, fontFamily = "Arial", color = "black") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="100">
  <text x="10" y="50" font-family="${fontFamily}" font-size="40" fill="${color}">${text}</text>
</svg>`;
}

function toggleSVGEditor() {
  const svgSection = document.getElementById("svgSection");
  svgVisible = !svgVisible;
  svgSection.style.display = svgVisible ? "block" : "none";
}

function updateSVGPreview() {
  const text = document.getElementById("svgText").value;
  const font = document.getElementById("svgFont").value;
  const color = document.getElementById("svgColor").value;
  const customCSS = document.getElementById("svgCSS").value;

  const svgContent = textToSVG(text, font, color);
  const styleBlock = `<style>${customCSS}</style>`;
  const combined = svgContent.replace('</svg>', `${styleBlock}</svg>`);

  const svgPreview = document.getElementById("svgPreview");
  svgPreview.innerHTML = combined;
}

function downloadSVG() {
  const svg = document.getElementById("svgPreview").innerHTML;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  saveAs(blob, "generated.svg");
}

document.addEventListener("DOMContentLoaded", () => {
  const fontDropdown = document.getElementById("svgFont");
  const fonts = ["Arial", "Verdana", "Helvetica", "Georgia", "Courier New", "Times New Roman"];

  fonts.forEach(f => {
    const option = document.createElement("option");
    option.value = f;
    option.textContent = f;
    fontDropdown.appendChild(option);
  });

  document.getElementById("svgText").addEventListener("input", updateSVGPreview);
  document.getElementById("svgFont").addEventListener("change", updateSVGPreview);
  document.getElementById("svgColor").addEventListener("input", updateSVGPreview);
  document.getElementById("svgCSS").addEventListener("input", updateSVGPreview);

  document.getElementById("svgDownloadBtn").addEventListener("click", downloadSVG);
  document.getElementById("svgToggleBtn").addEventListener("click", toggleSVGEditor);

  updateSVGPreview();
});
