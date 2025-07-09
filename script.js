import { compressImage } from './utils/imageProcessor.js';

let processedBlobs = [];
let originalPreviews = [];
let filesToProcess = [];

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", handleDownloadOrClear);

// Drag-and-drop
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => fileInput.click());

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
      if (!blob || !(blob instanceof Blob)) {
        console.error(`Compression returned invalid blob for ${file.name}`);
        continue;
      }

      const compressedImg = new Image();
      compressedImg.src = previewURL;
      compressedImg.className = "preview-img compressed";

      element.appendChild(compressedImg);
      processedBlobs.push({ blob, name });
    } catch (err) {
      console.error(`Compression failed for ${file.name}`, err);
    }
  }

  if (processedBlobs.length === 0) {
    alert("No images were successfully compressed.");
  }
}

async function handleDownloadOrClear() {
  const isClearMode = downloadAllBtn.dataset.mode === "clear";

  if (isClearMode) {
    clearPreview();
    return;
  }

  if (!processedBlobs.length) {
    alert("No images to download.");
    return;
  }

  try {
    if (processedBlobs.length > 10) {
      const zip = new JSZip();
      processedBlobs.forEach(({ blob, name }) => {
        zip.file(name, blob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "optimizeprime_images.zip");
    } else {
      for (const { blob, name } of processedBlobs) {
        saveAs(blob, name);
      }
    }

    // After successful download, allow clear
    downloadAllBtn.textContent = "Clear";
    downloadAllBtn.dataset.mode = "clear";

  } catch (err) {
    console.error("Download failed:", err);
    alert("Something went wrong during download.");
  }
}

function clearPreview() {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
  filesToProcess = [];

  downloadAllBtn.textContent = "Download";
  downloadAllBtn.dataset.mode = "download";
}
