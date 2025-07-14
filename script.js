import { compressImage } from './utils/imageProcessor.js';
import { triggerDownload } from './utils/downloadHelper.js';

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const preview = document.getElementById("preview");

let processedImages = [];

// UI events
dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", e => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  [...files].forEach(file => {
    processedImages.push({ original: file });
  });
  renderPreviews();
}

processBtn.addEventListener("click", async () => {
  const format = document.getElementById("format").value;
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;
  const quality = parseInt(document.getElementById("quality").value);

  for (let imgObj of processedImages) {
    try {
      const result = await compressImage(imgObj.original, format, maxWidth, maxHeight, targetSize, quality);
      imgObj.blob = result.blob;
      imgObj.previewURL = result.previewURL;
      imgObj.name = result.name;
    } catch (e) {
      console.error("Error compressing", imgObj.original.name, e);
      alert(`Error compressing ${imgObj.original.name}: ${e.message}`);
    }
  }

  renderPreviews(true);
});

function renderPreviews(showCompressed = false) {
  preview.innerHTML = "";
  processedImages.forEach(({ blob, original, previewURL, name }) => {
    const img = document.createElement("img");
    img.src = showCompressed && previewURL ? previewURL : URL.createObjectURL(original);
    img.title = name || original.name;
    img.style.display = "inline-block";
    img.style.margin = "8px";
    img.style.maxWidth = "150px";
    img.style.maxHeight = "150px";
    preview.appendChild(img);
  });
}

downloadAllBtn.addEventListener("click", () => {
  const readyImages = processedImages.filter(img => img.blob && img.name);
  if (readyImages.length === 0) {
    alert("No images to download. Make sure you've compressed them first.");
    return;
  }

  if (readyImages.length > 10) {
    // Download as ZIP
    const zip = new JSZip();
    readyImages.forEach(({ blob, name }) => {
      zip.file(name, blob);
    });

    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, "optimized_images.zip");
    });
  } else {
    // Download each image individually
    readyImages.forEach(({ blob, name }, idx) => {
      // Stagger downloads to avoid browser blocking (especially Chrome)
      setTimeout(() => {
        triggerDownload(blob, name);
      }, idx * 150); // 150ms apart
    });
  }
});
