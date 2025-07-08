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
  if (e.dataTransfer.files.length) loadFiles(e.dataTransfer.files);
});
dropArea.addEventListener("click", () => fileInput.click());

// File Input
fileInput.addEventListener("change", e => {
  if (e.target.files.length) {
    loadFiles(e.target.files);
    fileInput.value = "";
  }
});

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

processBtn.addEventListener("click", async () => {
  if (!originalPreviews.length) return;

  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value.toLowerCase();
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  processedBlobs = [];

  for (const { file, container } of originalPreviews) {
    const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

    const compressedImg = new Image();
    compressedImg.src = previewURL;
    compressedImg.className = "preview-img compressed";

    container.appendChild(compressedImg);
    processedBlobs.push({ blob, name });
  }
});

downloadBtn.addEventListener("click", () => {
  if (!processedBlobs.length) {
    alert("No images to download.");
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.textContent = "Downloading...";

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "✅ Done downloading - Clear images";
  confirmBtn.className = "download-confirm-button";
  confirmBtn.addEventListener("click", () => {
    clearPreview();
    confirmBtn.remove();
    downloadBtn.disabled = false;
    downloadBtn.textContent = "Download";
  });

  preview.appendChild(confirmBtn);

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => zip.file(name, blob));
    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = "optimizeprime_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } else {
    processedBlobs.forEach(({ blob, name }, index) => {
      setTimeout(() => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, index * 200);
    });
  }
});

function clearPreview() {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
}
