import { textToSVG } from "./utils/svgConverter.js";

let processedBlobs = [];
let filesToProcess = [];

// Elements
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const textToSVGBtn = document.getElementById("textToSVGBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");

// SVG Controls
const svgEditor = document.getElementById("svgEditor");
const svgTextInput = document.getElementById("svgText");
const svgFont = document.getElementById("svgFont");
const svgColor = document.getElementById("svgColor");
const svgCSS = document.getElementById("svgCSS");
const svgPreviewContainer = document.getElementById("svgPreviewContainer");
const applySVGStyleBtn = document.getElementById("applySVGStyleBtn");
const downloadSVG = document.getElementById("downloadSVG");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => fileInput.click());

textToSVGBtn.addEventListener("click", () => {
  svgEditor.style.display = "block";
  updateSVGPreview();
});

applySVGStyleBtn.addEventListener("click", updateSVGPreview);

downloadSVG.addEventListener("click", () => {
  const svgData = textToSVG(svgTextInput.value, svgFont.value, svgColor.value, svgCSS.value);
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  saveAs(blob, "label.svg");
});

function handleFiles(event) {
  filesToProcess = Array.from(event.target.files);
  preview.innerHTML = "";
  filesToProcess.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "preview-img";
      img.title = file.name;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

async function processImages() {
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const keepAspectRatio = document.getElementById("keepAspectRatio").checked;
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  processedBlobs = [];
  preview.innerHTML = "";

  for (const file of filesToProcess) {
    const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize, keepAspectRatio);
    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = name;
    img.className = "preview-img";
    preview.appendChild(img);
    processedBlobs.push({ blob, name });
  }
}

function downloadAll() {
  if (!processedBlobs.length) return alert("No images processed.");

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      const ext = name.split(".").pop();
      const base = name.replace(/\.[^/.]+$/, "");
      zip.file(`${base}.${ext}`, blob);
    });
    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, "optimizeprime_images.zip");
    });
  } else {
    processedBlobs.forEach(({ blob, name }) => {
      saveAs(blob, name);
    });
  }
}

function updateSVGPreview() {
  const svgData = textToSVG(svgTextInput.value, svgFont.value, svgColor.value, svgCSS.value);
  svgPreviewContainer.innerHTML = svgData;
}
