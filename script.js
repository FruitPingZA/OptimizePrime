let processedBlobs = [];
let originalPreviews = [];

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadAllBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");

// Drag & Drop
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  if (e.dataTransfer.files.length) {
    loadFiles(e.dataTransfer.files);
  }
});
dropArea.addEventListener("click", () => fileInput.click());

// File Input
fileInput.addEventListener("change", e => {
  if (e.target.files.length) {
    loadFiles(e.target.files);
    fileInput.value = ""; // allow same file re-selection
  }
});

// Load images and show preview
function loadFiles(fileList) {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];

  const files = Array.from(fileList);

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const container = document.createElement("div");
      container.className = "image-container";

      const label = document.createElement("p");
      label.textContent = file.name;

      const img = document.createElement("img");
      img.src = reader.result;
      img.className = "preview-img";

      container.append(label, img);
      preview.appendChild(container);

      originalPreviews.push({ file, container });
    };
    reader.readAsDataURL(file);
  });
}

// Compress button
processBtn.addEventListener("click", async () => {
  if (!originalPreviews.length) return;

  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value.toLowerCase();
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  processedBlobs = [];

  for (const { file, container } of originalPreviews) {
    const { blob, previewURL } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

    const compressedImg = new Image();
    compressedImg.src = previewURL;
    compressedImg.className = "preview-img compressed";

    container.appendChild(compressedImg);

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    processedBlobs.push({ blob, name: `${baseName}.${format}` });
  }
});

// Download button
downloadBtn.addEventListener("click", () => {
  if (!processedBlobs.length) {
    alert("No images to download.");
    return;
  }

  // More than 10 → ZIP
  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => zip.file(name, blob));

    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      saveAs(zipBlob, "optimizeprime_images.zip");

      // Wait before clearing to ensure ZIP triggers download
      setTimeout(clearPreview, 2000);
    });
  } else {
    // <= 10 → individual downloads with delay between
    const delay = 300;

    processedBlobs.forEach(({ blob, name }, index) => {
      setTimeout(() => {
        try {
          saveAs(blob, name);
        } catch (err) {
          console.error("Download error:", err);
        }

        if (index === processedBlobs.length - 1) {
          // Clear after final file has had time to trigger
          setTimeout(clearPreview, delay + 1000);
        }
      }, index * delay);
    });
  }
});

function clearPreview() {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
}
