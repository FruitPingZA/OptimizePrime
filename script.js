// Ensure FileSaver.js and JSZip are loaded before this file
let processedBlobs = [];
let filesToProcess = [];
let currentBatchId = Date.now();

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
const maxWidthInput = document.getElementById("maxWidth");
const maxHeightInput = document.getElementById("maxHeight");
const formatInput = document.getElementById("format");
const targetSizeInput = document.getElementById("targetSize");
const maintainAspectRatio = document.getElementById("maintainAspectRatio");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

// Prevent default drag behaviors
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});

dropArea.addEventListener("click", () => fileInput.click());

function handleFiles(event) {
  const newFiles = Array.from(event.target.files);
  const confirmAppend = filesToProcess.length > 0 && confirm("Add to existing batch?");
  if (!confirmAppend) {
    filesToProcess = [];
    preview.innerHTML = "";
    currentBatchId = Date.now();
  }
  filesToProcess.push(...newFiles);
  renderThumbnails();
}

function renderThumbnails() {
  preview.innerHTML = "";
  filesToProcess.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "preview-img";
      img.title = `Click to edit settings`;
      img.addEventListener("click", () => openEditDialog(file, index));
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function openEditDialog(file, index) {
  const userTargetKB = prompt("Enter target size for this image (in KB):", targetSizeInput.value);
  const newSize = parseInt(userTargetKB);
  if (!isNaN(newSize)) filesToProcess[index].customTargetSize = newSize * 1024;
}

async function processImages() {
  processedBlobs = [];
  preview.innerHTML = "";

  for (const file of filesToProcess) {
    const maxWidth = parseInt(maxWidthInput.value);
    const maxHeight = parseInt(maxHeightInput.value);
    const format = formatInput.value;
    const maintain = maintainAspectRatio.checked;
    const targetSize = file.customTargetSize || parseInt(targetSizeInput.value) * 1024;

    const { blob, previewURL, originalURL, name } = await compressImage(
      file,
      format,
      maxWidth,
      maxHeight,
      targetSize,
      maintain
    );

    const container = document.createElement("div");
    container.className = "ab-container";

    const originalImg = document.createElement("img");
    originalImg.src = originalURL;
    originalImg.className = "preview-img";

    const compressedImg = document.createElement("img");
    compressedImg.src = previewURL;
    compressedImg.className = "preview-img";

    container.appendChild(originalImg);
    container.appendChild(compressedImg);
    preview.appendChild(container);

    processedBlobs.push({ blob, name });
  }
}

function downloadAll() {
  if (!processedBlobs.length) {
    alert("No processed images to download.");
    return;
  }

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      const ext = name.split(".").pop();
      const base = name.replace(/\.[^/.]+$/, "");
      zip.file(`${base}.${ext}`, blob);
    });
    zip.generateAsync({ type: "blob" }).then(content => saveAs(content, "optimizeprime_images.zip"));
  } else {
    processedBlobs.forEach(({ blob, name }) => saveAs(blob, name));
  }
}
