import { compressImage } from './utils/imageProcessor.js';
import saveAs from './lib/saveFile.js'; // NEW

let processedBlobs = [];
let originalPreviews = [];

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);
clearAllBtn.addEventListener("click", clearPreview);

dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => fileInput.click());

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

  fileInput.value = "";
}

async function processImages() {
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;
  processedBlobs = [];

  for (const { file, element } of originalPreviews) {
    try {
      const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

      const compressedImg = new Image();
      compressedImg.src = previewURL;
      compressedImg.className = "preview-img compressed";

      element.appendChild(compressedImg);
      processedBlobs.push({ blob, name });
    } catch (err) {
      console.error("Compression failed for", file.name, err);
    }
  }

  if (processedBlobs.length) {
    clearAllBtn.style.display = "inline-block";
  }
}

function downloadAll() {
  if (!processedBlobs.length) {
    alert("No images to download.");
    return;
  }

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      zip.file(name, blob);
    });

    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      saveAs(zipBlob, "optimizeprime_images.zip");
    });
  } else {
    processedBlobs.forEach(({ blob, name }) => {
      saveAs(blob, name);
    });
  }

  // Show clear button after download
  clearAllBtn.style.display = "inline-block";
}

function clearPreview() {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
  filesToProcess = [];
  clearAllBtn.style.display = "none";
}
