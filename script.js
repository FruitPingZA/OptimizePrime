import { compressImage } from './utils/imageProcessor.js';

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("preview");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");

let imageFiles = [];
let compressedImages = [];

fileInput.addEventListener("change", e => {
  handleFiles(e.target.files);
});

dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.classList.add("highlight");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("highlight");
});

dropArea.addEventListener("drop", e => {
  e.preventDefault();
  dropArea.classList.remove("highlight");
  handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
  [...files].forEach(file => {
    if (file.type.startsWith("image/")) {
      imageFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement("img");
        img.src = reader.result;
        img.className = "preview-thumb";
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
}

processBtn.addEventListener("click", async () => {
  if (!imageFiles.length) return alert("No images selected.");

  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value.toLowerCase();
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  compressedImages = [];

  previewContainer.innerHTML = '';

  for (let file of imageFiles) {
    try {
      const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);
      compressedImages.push({ blob, name });

      const img = document.createElement("img");
      img.src = previewURL;
      img.className = "preview-thumb";
      previewContainer.appendChild(img);
    } catch (err) {
      console.error(`Error compressing ${file.name}:`, err);
    }
  }

  if (compressedImages.length) {
    showClearButton();
  }
});

function showClearButton() {
  if (!document.getElementById("clearBtn")) {
    const clearBtn = document.createElement("button");
    clearBtn.id = "clearBtn";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", () => {
      previewContainer.innerHTML = '';
      imageFiles = [];
      compressedImages = [];
      const btn = document.getElementById("clearBtn");
      if (btn) btn.remove();
    });
    document.querySelector(".controls").appendChild(clearBtn);
  }
}

downloadAllBtn.addEventListener("click", () => {
  if (!compressedImages.length) return alert("No images to download.");

  if (compressedImages.length > 10) {
    // ZIP
    const zip = new JSZip();
    compressedImages.forEach(({ blob, name }) => {
      zip.file(name, blob);
    });

    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      saveAs(zipBlob, "compressed_images.zip");
      showClearButton();
    });
  } else {
    // Individual
    compressedImages.forEach(({ blob, name }) => {
      saveAs(blob, name);
    });
    showClearButton();
  }
});
