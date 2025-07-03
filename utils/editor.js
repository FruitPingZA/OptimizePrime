// utils/editor.js

import { textToSVG, applyCustomCSSToSVG } from "./svgConverter.js";

export function setupSVGEditor() {
  const editorSection = document.getElementById("svgEditorSection");
  const svgOutput = document.getElementById("svgOutput");
  const cssInput = document.getElementById("svgCSSInput");
  const fontInput = document.getElementById("svgFontInput");
  const colorInput = document.getElementById("svgColorInput");
  const textInput = document.getElementById("svgTextInput");
  const downloadBtn = document.getElementById("svgDownloadBtn");

  if (!editorSection) return;

  function updateSVGPreview() {
    const text = textInput.value;
    const font = fontInput.value;
    const color = colorInput.value;
    const css = cssInput.value;

    let svgContent = textToSVG(text, font, color);
    svgContent = applyCustomCSSToSVG(svgContent, css);
    svgOutput.innerHTML = svgContent;
  }

  // Update SVG preview on any input
  [textInput, fontInput, colorInput, cssInput].forEach(input => {
    input.addEventListener("input", updateSVGPreview);
  });

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([svgOutput.innerHTML], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "custom.svg";
    link.click();
  });

  // Initial preview
  updateSVGPreview();
}
