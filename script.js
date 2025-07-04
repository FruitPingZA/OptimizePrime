// Ensure FileSaver.js and JSZip are loaded before this file
let processedBlobs = [];
let originalPreviews = [];

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
const svgBtn = document.getElementById("svgToggleBtn");
const svgSection = document.getElementById("svgSection");
const svgInput = document.getElementById("svgTextInput");
const svgPreview = document.getElementById("svgPreview");
const svgCSS = document.getElementById("svgCSS");
const svgDownloadBtn = document.getElementById("svgDownloadBtn");
const fontSelect = document.getElementById("fontSelect");
const colorPicker = document.getElementById("svgColor");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);
svgBtn.addEventListener("click", () => {
  svgSection.classList.toggle("hidden");
  updateSVG();
});

// Prevent default browser behavior for drag and drop
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => fileInput.click());

svgInput.addEventListener("input", updateSVG);
fontSelect.addEventListener("change", updateSVG);
colorPicker.addEventListener("input", updateSVG);
svgCSS.addEventListener("input", updateSVG);

svgDownloadBtn.addEventListener("click", () => {
  const blob = new Blob([svgPreview.innerHTML], { type: "image/svg+xml" });
  saveAs(blob, "label.svg");
});

let filesToProcess = [];

function handleFiles(event) {
  filesToProcess = Array.from(event.target.files);
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];

  filesToProcess.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = e => {
      const container = document.createElement("div");
      container.className = "image-container";

      const originalImg = new Image();
      originalImg.src = e.target.result;
      originalImg.className = "preview-img";

      const label = document.createElement("p");
      label.innerText = file.name;

      container.appendChild(label);
      container.appendChild(originalImg);
      preview.appendChild(container);

      originalPreviews.push({ index, file, element: container });
    };
    reader.readAsDataURL(file);
  });
}

async function processImages() {
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;
  processedBlobs = [];

  for (const { file, element } of originalPreviews) {
    const { blob, previewURL } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

    const compressedImg = new Image();
    compressedImg.src = previewURL;
    compressedImg.className = "preview-img compressed";

    element.appendChild(compressedImg);
    processedBlobs.push({ blob, name: file.name });
  }
}

function downloadAll() {
  if (!processedBlobs.length) return alert("No images to download.");

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      const ext = name.split(".").pop();
      const base = name.replace(/\.[^/.]+$/, "");
      zip.file(`${base}.${ext}`, blob);
    });
    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      saveAs(zipBlob, "optimizeprime_images.zip");
    });
  } else {
    processedBlobs.forEach(({ blob, name }) => {
      saveAs(blob, name);
    });
  }
}

function updateSVG() {
  const text = svgInput.value || "Sample Text";
  const font = fontSelect.value;
  const color = colorPicker.value;
  const css = svgCSS.value;

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <style>
        text {
          font-family: ${font};
          fill: ${color};
        }
        ${css}
      </style>
      <text x="10" y="50" font-size="40">${text}</text>
    </svg>
  `;

  svgPreview.innerHTML = svgContent;
}
