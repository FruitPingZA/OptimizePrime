let processedBlobs = [];
let originalPreviews = [];

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadAllBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");

// Allow drag & drop
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  if (e.dataTransfer.files.length) {
    loadFiles(e.dataTransfer.files);
  }
});
dropArea.addEventListener("click", () => fileInput.click());

// Handle browse input
fileInput.addEventListener("change", e => {
  if (e.target.files.length) {
    loadFiles(e.target.files);
    fileInput.value = ""; // Reset so selecting same files again works
  }
});

// Load and preview selected files
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

      const original = new Image();
      original.src = reader.result;
      original.className = "preview-img";

      const label = document.createElement("p");
      label.textContent = file.name;

      container.appendChild(label);
      container.appendChild(original);
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
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  processedBlobs = [];

  for (const { file, container } of originalPreviews) {
    const { blob, previewURL } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

    const compressed = new Image();
    compressed.src = previewURL;
    compressed.className = "preview-img compressed";
    container.appendChild(compressed);

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

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => zip.file(name, blob));

    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      saveAs(zipBlob, "optimizeprime_images.zip");
      setTimeout(clearPreview, 1500);
    });
  } else {
    processedBlobs.forEach(({ blob, name }, index) => {
      setTimeout(() => {
        saveAs(blob, name);
        if (index === processedBlobs.length - 1) {
          setTimeout(clearPreview, 1000);
        }
      }, index * 150);
    });
  }
});

function clearPreview() {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
}
