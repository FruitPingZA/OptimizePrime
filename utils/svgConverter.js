export function textToSVG(text, font = "Arial", color = "#000000") {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
  <style>
    text { font-family: '${font}'; fill: ${color}; font-size: 32px; }
  </style>
  <text x="10" y="50">${text}</text>
</svg>
`.trim();
}

export function applyCustomCSSToSVG(svgContent, customCSS) {
  const insertIndex = svgContent.indexOf("</style>");
  if (insertIndex !== -1) {
    const updatedSVG =
      svgContent.slice(0, insertIndex) +
      `\n${customCSS}\n` +
      svgContent.slice(insertIndex);
    return updatedSVG;
  }
  return svgContent;
}
