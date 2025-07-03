// script.js
import { compressImage } from "./utils/imageProcessor.js";

let processedBlobs = [];
let filesToProcess = [];
const preview = document.getElementById("preview");
const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const formatInput = document.getElementById("format");
const widthInput = document.getElementById("maxWidth");
const heightInput = document.getElementById("maxHeight");
const targetSizeInput = document.getElementById("targetSize");
const aspectRatioToggle = document.getElementById("keepAspectRatio"); // You must add this input in HTML

fileInput.addEventListener("change", handleFiles);
dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});

processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadImages);

function handleFiles(event) {
  filesToProcess = Array.from(event.target.files);
  preview.innerHTML = "";
  filesToProcess.forEach(file => displayOriginal(file));
}

function displayOriginal(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;
    img.className = "original-preview";

    const wrapper = document.createElement("div");
    wrapper.className = "image-wrapper";
    wrapper.appendChild(img);
    preview.appendChild(wrapper);
  };
  reader.readAsDataURL(file);
}

async function processImages() {
  const maxWidth = parseInt(widthInput.value);
  const maxHeight = parseInt(heightInput.value);
  const targetSize = parseInt(targetSizeInput.value) * 1024;
  const format = formatInput.value;
  const keepAspect = aspectRatioToggle?.checked ?? true;

  processedBlobs = [];
  preview.innerHTML = "";

  for (const file of filesToProcess) {
    const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize, keepAspect);
    processedBlobs.push({ blob, name });

    const compressedImg = new Image();
    compressedImg.src = previewURL;
    compressedImg.className = "preview-img";
    preview.appendChild(compressedImg);
  }
}

function downloadImages() {
  if (processedBlobs.length === 0) return alert("Nothing to download");

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      const ext = name.split(".").pop();
      const base = name.replace(/\.[^/.]+$/, "");
      zip.file(`${base}.${ext}`, blob);
    });
    zip.generateAsync({ type: "blob" }).then(content => saveAs(content, "optimizeprime_images.zip"));
  } else {
    processedBlobs.forEach(({ blob, name }) => {
      saveAs(blob, name);
    });
  }
}
