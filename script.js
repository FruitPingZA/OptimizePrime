import { compressImage } from "./utils/imageProcessor.js";

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");

let filesToProcess = [];
let processedBlobs = [];
let originalPreviews = [];

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

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

      const compressedImg = new Image();
      compressedImg.src = previewURL;
      compressedImg.className = "preview-img compressed";

      element.appendChild(compressedImg);
      processedBlobs.push({ blob, name });
    } catch (err) {
      console.error("Compression error:", err);
    }
  }
}

async function downloadAll() {
  if (!processedBlobs.length) {
    alert("No images to download.");
    return;
  }

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      zip.file(name, blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "optimizeprime_images.zip");
  } else {
    for (const { blob, name } of processedBlobs) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      await new Promise(res => setTimeout(res, 300));
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  showClearButton();
}

function showClearButton() {
  if (!document.getElementById("clearBtn")) {
    const clearBtn = document.createElement("button");
    clearBtn.id = "clearBtn";
    clearBtn.textContent = "Clear";
    clearBtn.style.marginTop = "10px";
    clearBtn.style.background = "#ff5cad"; // match other pink buttons
    clearBtn.style.border = "none";
    clearBtn.style.padding = "10px 20px";
    clearBtn.style.color = "#fff";
    clearBtn.style.fontWeight = "bold";
    clearBtn.style.borderRadius = "6px";
    clearBtn.style.cursor = "pointer";
    clearBtn.addEventListener("click", clearAll);

    document.querySelector(".controls").appendChild(clearBtn);
  }
}

function clearAll() {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
  filesToProcess = [];

  const clearBtn = document.getElementById("clearBtn");
  if (clearBtn) clearBtn.remove();
}
