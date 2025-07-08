// Ensure FileSaver.js and JSZip are loaded before this file
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

// Drag-and-drop setup
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  if (e.dataTransfer.files.length) {
    handleFiles({ target: { files: e.dataTransfer.files } });
  }
});
dropArea.addEventListener("click", () => fileInput.click());

let filesToProcess = [];

function handleFiles(event) {
  const fileList = event.target.files;
  if (!fileList || fileList.length === 0) return;

  // ✅ Reset input early to allow same file selection again
  fileInput.value = "";

  filesToProcess = Array.from(fileList);
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
  const format = document.getElementById("format").value.toLowerCase();
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;
  processedBlobs = [];

  for (const { file, element } of originalPreviews) {
    const { blob, previewURL } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

    const compressedImg = new Image();
    compressedImg.src = previewURL;
    compressedImg.className = "preview-img compressed";

    element.appendChild(compressedImg);

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    processedBlobs.push({ blob, name: `${baseName}.${format}` });
  }
}

function downloadAll() {
  if (!processedBlobs.length) {
    alert("No images to download.");
    return;
  }

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      zip.file(name, blob);
    });

    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      saveAs(zipBlob, "optimizeprime_images.zip");

      // ✅ Delay clearing to allow ZIP download to begin
      setTimeout(() => {
        clearPreview();
      }, 1500);
    });
  } else {
    let completed = 0;

    processedBlobs.forEach(({ blob, name }, index) => {
      setTimeout(() => {
        try {
          saveAs(blob, name);
        } catch (err) {
          console.error("Download failed:", err);
        }

        completed++;
        if (completed === processedBlobs.length) {
          // ✅ Delay clear after final download is triggered
          setTimeout(() => clearPreview(), 1500);
        }
      }, index * 200); // Slight stagger between downloads
    });
  }
}

function clearPreview() {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
  filesToProcess = [];
}
