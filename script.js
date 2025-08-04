import { downloadImages } from './utils/downloadHelper.js';
import { compressImage } from './utils/imageProcessor.js';

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileElem");
const imageList = document.getElementById("image-list");
const compressBtn = document.getElementById("compress-btn");

let imageQueue = [];

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("highlight");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("highlight");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("highlight");
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);
});

function handleFiles(files) {
  [...files].forEach(file => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.classList.add("preview-img");

      const container = document.createElement("div");
      container.classList.add("image-container");
      container.appendChild(img);

      imageList.appendChild(container);

      imageQueue.push({
        file,
        originalUrl: e.target.result,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  });
}

compressBtn.addEventListener("click", async () => {
  if (imageQueue.length === 0) {
    alert("Add some images first!");
    return;
  }

  compressBtn.disabled = true;
  compressBtn.textContent = "Compressing...";

  const compressedImages = [];

  for (let i = 0; i < imageQueue.length; i++) {
    const { file, fileName } = imageQueue[i];
    try {
      const result = await compressImage(file);
      compressedImages.push({
        blob: result.blob,
        fileName: fileName.replace(/\.\w+$/, '') + "." + result.type,
        type: result.type
      });
    } catch (err) {
      console.error("Compression failed for", fileName, err);
    }
  }

  await downloadImages(compressedImages);

  compressBtn.disabled = false;
  compressBtn.textContent = "Compress & Download";
});
