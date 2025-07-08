// script.js

let processedBlobs = [];
let originalPreviews = [];

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => {
  fileInput.click();
  fileInput.value = ""; // allow reselecting same files
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
    const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

    const compressedImg = new Image();
    compressedImg.src = previewURL;
    compressedImg.className = "preview-img compressed";

    element.appendChild(compressedImg);
    processedBlobs.push({ blob, name });
  }
}

async function downloadAll() {
  if (!processedBlobs.length) {
    alert("No images to download.");
    return;
  }

  const isZip = processedBlobs.length > 10;

  try {
    if (isZip) {
      const zip = new JSZip();
      processedBlobs.forEach(({ blob, name }) => {
        zip.file(name, blob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "optimizeprime_images.zip");
    } else {
      for (const { blob, name } of processedBlobs) {
        await new Promise(resolve => {
          saveAs(blob, name);
          setTimeout(resolve, 300);
        });
      }
    }

    setTimeout(() => {
      preview.innerHTML = "";
      processedBlobs = [];
      originalPreviews = [];
      filesToProcess = [];
    }, 800);

  } catch (err) {
    alert("Download failed: " + err.message);
  }
}
