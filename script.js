// script.js

// Globals
let processedBlobs = [];
let originalPreviews = [];

// Elements
const fileInput       = document.getElementById("fileInput");
const processBtn      = document.getElementById("processBtn");
const downloadAllBtn  = document.getElementById("downloadAllBtn");
const dropArea        = document.getElementById("dropArea");
const previewContainer= document.getElementById("preview");

// Event Listeners
fileInput.addEventListener("change", e => handleFiles(e.target.files));
dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
});
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

// Handle new files (either from <input> or drop)
function handleFiles(fileList) {
  if (!fileList || fileList.length === 0) return;

  // Clone FileList → Array
  const files = Array.from(fileList);

  // Reset state & UI
  previewContainer.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];

  // Show previews
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      // Container
      const wrapper = document.createElement("div");
      wrapper.className = "image-container";

      // Label
      const label = document.createElement("p");
      label.textContent = file.name;

      // Original preview
      const img = document.createElement("img");
      img.src = reader.result;
      img.className = "preview-img";

      wrapper.append(label, img);
      previewContainer.appendChild(wrapper);

      originalPreviews.push({ file, wrapper });
    };
    reader.readAsDataURL(file);
  });

  // Reset file input so same files can be re-picked
  fileInput.value = "";
}

async function processImages() {
  const maxW      = +document.getElementById("maxWidth").value;
  const maxH      = +document.getElementById("maxHeight").value;
  const fmt       = document.getElementById("format").value.toLowerCase();
  const tgtSize   = +document.getElementById("targetSize").value * 1024;

  // Compress each
  for (const { file, wrapper } of originalPreviews) {
    const { blob, previewURL } = await compressImage(file, fmt, maxW, maxH, tgtSize);

    // Show compressed below original
    const img2 = document.createElement("img");
    img2.src = previewURL;
    img2.className = "preview-img compressed";
    wrapper.appendChild(img2);

    // Store for download
    const base = file.name.replace(/\.[^/.]+$/, "");
    processedBlobs.push({ blob, name: `${base}.${fmt}` });
  }
}

function downloadAll() {
  if (processedBlobs.length === 0) {
    return alert("No images to download.");
  }

  // >10 → ZIP
  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => zip.file(name, blob));

    zip.generateAsync({ type: "blob" }).then(zb => {
      saveAs(zb, "optimizeprime_images.zip");
      // Clear after a short pause
      setTimeout(clearPreview, 1000);
    });
  } else {
    // ≤10 → individual
    processedBlobs.forEach(({ blob, name }, i) => {
      // stagger by 200ms ensures each click registers
      setTimeout(() => {
        saveAs(blob, name);
        if (i === processedBlobs.length - 1) {
          setTimeout(clearPreview, 1000);
        }
      }, i * 200);
    });
  }
}

function clearPreview() {
  previewContainer.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
}
