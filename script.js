// FINAL script.js — Fixed download behavior

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
  fileInput.value = ""; // allow reselection
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
    try {
      const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);
      const compressedImg = new Image();
      compressedImg.src = previewURL;
      compressedImg.className = "preview-img compressed";
      element.appendChild(compressedImg);
      processedBlobs.push({ blob, name });
    } catch (err) {
      const errorLabel = document.createElement("p");
      errorLabel.innerText = `Error compressing ${file.name}: ${err.message}`;
      element.appendChild(errorLabel);
    }
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
        if (!blob || blob.size === 0) {
          console.warn("Skipping invalid blob for", name);
          continue;
        }
        saveAs(blob, name);
        await new Promise(res => setTimeout(res, 400));
      }
    }
    showClearButton();
  } catch (err) {
    alert("Download failed: " + err.message);
  }
}

function showClearButton() {
  if (document.getElementById("clearBtn")) return;

  const clearBtn = document.createElement("button");
  clearBtn.id = "clearBtn";
  clearBtn.textContent = "Clear All";
  clearBtn.style.background = "#ff5cad";
  clearBtn.style.marginTop = "15px";
  clearBtn.onclick = () => {
    preview.innerHTML = "";
    processedBlobs = [];
    originalPreviews = [];
    filesToProcess = [];
    clearBtn.remove();
  };
  preview.appendChild(clearBtn);
}
