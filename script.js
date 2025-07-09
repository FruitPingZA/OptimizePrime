import { compressImage } from "./utils/imageProcessor.js";

let filesToProcess = [];
let processedBlobs = [];
let originalPreviews = [];

const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadAllBtn");
const preview = document.getElementById("preview");

dropArea.addEventListener("dragover", (e) => e.preventDefault());
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
});
dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => handleFiles(fileInput.files));
processBtn.addEventListener("click", processImages);
downloadBtn.addEventListener("click", handleDownload);

function handleFiles(fileList) {
  filesToProcess = Array.from(fileList);
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];

  filesToProcess.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
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

      originalPreviews.push({ file, element: container });
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
      console.error(`Error compressing ${file.name}:`, err);
    }
  }

  addClearButtonOnce();
}

function addClearButtonOnce() {
  if (!document.getElementById("clearBtn")) {
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear All";
    clearBtn.id = "clearBtn";
    clearBtn.style.marginTop = "20px";
    clearBtn.style.background = "#ff5cad";
    clearBtn.style.color = "#fff";
    clearBtn.style.border = "none";
    clearBtn.style.padding = "10px 20px";
    clearBtn.style.borderRadius = "5px";
    clearBtn.style.cursor = "pointer";
    clearBtn.addEventListener("click", clearAll);
    preview.appendChild(clearBtn);
  }
}

function clearAll() {
  preview.innerHTML = "";
  filesToProcess = [];
  processedBlobs = [];
  originalPreviews = [];
}

function handleDownload() {
  if (!processedBlobs.length) {
    alert("No compressed images to download.");
    return;
  }

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      zip.file(name, blob);
    });

    zip.generateAsync({ type: "blob" }).then((zipBlob) => {
      saveAs(zipBlob, "optimizeprime_images.zip");
    });
  } else {
    processedBlobs.forEach(({ blob, name }) => {
      saveAs(blob, name);
    });
  }

  // Only show clear button, do NOT clear automatically
  addClearButtonOnce();
}
