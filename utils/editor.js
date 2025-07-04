// editor.js

const fontSelector = document.getElementById("fontSelector");
const colorPicker = document.getElementById("colorPicker");
const svgTextInput = document.getElementById("svgText");
const cssEditor = document.getElementById("customCSS");
const svgPreview = document.getElementById("svgPreview");
const downloadSVGBtn = document.getElementById("downloadSVGBtn");

const defaultFonts = [
  "Arial", "Verdana", "Times New Roman", "Georgia", "Courier New", "Comic Sans MS",
  "Tahoma", "Impact", "Trebuchet MS", "Lucida Console"
];

function populateFontSelector() {
  fontSelector.innerHTML = "";
  defaultFonts.forEach(font => {
    const option = document.createElement("option");
    option.value = font;
    option.textContent = font;
    fontSelector.appendChild(option);
  });
}

function renderSVG() {
  const text = svgTextInput.value;
  const font = fontSelector.value;
  const color = colorPicker.value;
  const css = cssEditor.value;

  const svgContent = `
<svg xmlns='http://www.w3.org/2000/svg' width='500' height='200'>
  <style>
    text { font-family: ${font}; fill: ${color}; font-size: 32px; }
    ${css}
  </style>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>${text}</text>
</svg>`;

  svgPreview.innerHTML = svgContent;
  return svgContent;
}

svgTextInput.addEventListener("input", renderSVG);
fontSelector.addEventListener("change", renderSVG);
colorPicker.addEventListener("change", renderSVG);
cssEditor.addEventListener("input", renderSVG);
downloadSVGBtn.addEventListener("click", () => {
  const svg = renderSVG();
  const blob = new Blob([svg], { type: "image/svg+xml" });
  saveAs(blob, "label.svg");
});

// Populate fonts and render on load
populateFontSelector();
renderSVG();
