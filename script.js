import { compressImage } from "./utils/imageProcessor.js";

const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");

let originalFiles = [];
let processedBlobs = [];

dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

function handleFiles(fileList) {
  preview.innerHTML = "";
  processedBlobs = [];
  originalFiles = Array.from(fileList);

  originalFiles.forEach(file => {
    const container = document.createElement("div");
    container.className = "image-container";

    const reader = new FileReader();
    reader.onload = e => {
      const originalImg = new Image();
      originalImg.className = "preview-img";
      originalImg.src = e.target.result;

      const label = document.createElement("p");
      label.innerText = file.name;

      container.appendChild(label);
      container.appendChild(originalImg);
      preview.appendChild(container);
    };
    reader.readAsDataURL(file);
  });

  fileInput.value = "";
}

processBtn.addEventListener("click", async () => {
  const format = document.getElementById("format").value;
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  processedBlobs = [];

  const containers = Array.from(preview.querySelectorAll(".image-container"));
  for (let i = 0; i < originalFiles.length; i++) {
    const file = originalFiles[i];
    const container = containers[i];

    try {
      const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

      const compressedImg = new Image();
      compressedImg.className = "preview-img compressed";
      compressedImg.src = previewURL;

      container.appendChild(compressedImg);
      processedBlobs.push({ blob, name });
    } catch (err) {
      console.error(`Error compressing ${file.name}:`, err);
    }
  }
});

downloadAllBtn.addEventListener("click", async () => {
  if (!processedBlobs.length) return alert("No images to download.");

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      zip.file(name, blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "optimizeprime.zip");
  } else {
    for (const { blob, name } of processedBlobs) {
      saveAs(blob, name);
      await new Promise(res => setTimeout(res, 100)); // ensure download triggers
    }
  }

  setTimeout(() => {
    preview.innerHTML = "";
    processedBlobs = [];
    originalFiles = [];
  }, 1000);
});
