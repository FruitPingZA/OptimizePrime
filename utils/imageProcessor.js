import { compressImage } from './utils/imageProcessor.js';

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const preview = document.getElementById("preview");

let compressedImages = [];

dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFiles);
dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.classList.add("hover");
});
dropArea.addEventListener("dragleave", () => dropArea.classList.remove("hover"));
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  dropArea.classList.remove("hover");
  handleFiles({ target: { files: e.dataTransfer.files } });
});

processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", handleDownload);

function handleFiles(event) {
  const files = event.target.files;
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.className = "preview-img";
      img.src = URL.createObjectURL(file);
      preview.appendChild(img);
    }
  }
  compressedImages = Array.from(files).filter(f => f.type.startsWith("image/"));
}

async function processImages() {
  const format = document.getElementById("format").value;
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  preview.innerHTML = "";
  const newImages = [];

  for (const file of compressedImages) {
    try {
      const result = await compressImage(file, format, maxWidth, maxHeight, targetSize);
      const img = document.createElement("img");
      img.className = "preview-img";
      img.src = result.previewURL;
      preview.appendChild(img);
      newImages.push(result);
    } catch (err) {
      console.error(`Error compressing ${file.name}:`, err);
    }
  }

  compressedImages = newImages;
  if (!document.getElementById("clearBtn")) {
    const clearBtn = document.createElement("button");
    clearBtn.id = "clearBtn";
    clearBtn.innerText = "Clear";
    clearBtn.style.marginTop = "10px";
    clearBtn.style.background = "#ff5cad";
    clearBtn.onclick = () => {
      preview.innerHTML = "";
      compressedImages = [];
      clearBtn.remove();
    };
    preview.parentElement.appendChild(clearBtn);
  }
}

async function handleDownload() {
  if (compressedImages.length === 0) return;

  if (compressedImages.length > 10) {
    const zip = new JSZip();
    for (const img of compressedImages) {
      zip.file(img.name, img.blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "compressed_images.zip");
  } else {
    for (const img of compressedImages) {
      saveAs(img.blob, img.name);
    }
  }
}
