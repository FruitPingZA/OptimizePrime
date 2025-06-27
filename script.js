// Ensure FileSaver.js and JSZip are loaded before this file
let processedBlobs = [];

// Elements
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const textToSVGBtn = document.getElementById("textToSVGBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

textToSVGBtn.addEventListener("click", () => {
  const text = prompt("Enter text to convert to SVG:");
  if (!text) return;
  const svgData = textToSVG(text);
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  saveAs(blob, "label.svg");
});

dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.style.backgroundColor = "#222";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.style.backgroundColor = "";
});

dropArea.addEventListener("drop", e => {
  e.preventDefault();
  dropArea.style.backgroundColor = "";
  const files = e.dataTransfer.files;
  handleFiles({ target: { files } });
});

dropArea.addEventListener("click", () => {
  fileInput.click();
});

let filesToProcess = [];

function handleFiles(event) {
  filesToProcess = Array.from(event.target.files);
  preview.innerHTML = "";
}

async function processImages() {
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;
  preview.innerHTML = "";
  processedBlobs = [];

  for (const file of filesToProcess) {
    const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);
    if (!blob) continue;

    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = name;
    img.className = "preview-img";
    preview.appendChild(img);
    processedBlobs.push({ blob, name });
  }
}

function downloadAll() {
  if (!processedBlobs.length) {
    alert("No processed images to download.");
    return;
  }
  const zip = new JSZip();
  processedBlobs.forEach(({ blob, name }) => {
    const baseName = name.replace(/\.[^/.]+$/, "");
    const extension = blob.type.split("/").pop();
    zip.file(`${baseName}.${extension}`, blob);
  });
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "optimizeprime_images.zip");
  });
}
