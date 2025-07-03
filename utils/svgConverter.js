// utils/svgConverter.js

export function textToSVG(text, font = "Arial", color = "#000", css = "") {
  const escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="100">
  <style>
    text {
      font-family: '${font}';
      fill: ${color};
    }
    ${css}
  </style>
  <text x="10" y="50" font-size="40">${escapedText}</text>
</svg>`;
  return svg.trim();
}
