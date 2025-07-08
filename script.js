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

dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => fileInput.click());

let filesToProcess = [];

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

  // Reset file input so same files can be selected again
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
      const { blob, previewURL } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

      const compressedImg = new Image();
      compressedImg.src = previewURL;
      compressedImg.className = "preview-img compressed";

      element.appendChild(compressedImg);
      processedBlobs.push({ blob, name: file.name, format });
    } catch (err) {
      console.error("Error compressing", file.name + ":", err);
    }
  }
}

async function downloadAll() {
  if (!processedBlobs.length) {
    alert("No images to download.");
    return;
  }

  const button = downloadAllBtn;
  button.disabled = true;
  button.textContent = "Downloading...";

  try {
    if (processedBlobs.length > 10) {
      const zip = new JSZip();
      processedBlobs.forEach(({ blob, name, format }) => {
        const base = name.replace(/\.[^/.]+$/, "");
        zip.file(`${base}.${format}`, blob);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "optimizeprime_images.zip");
    } else {
      for (const { blob, name, format } of processedBlobs) {
        const base = name.replace(/\.[^/.]+$/, "");
        const extName = `${base}.${format}`;
        saveAs(blob, extName);
        await new Promise(res => setTimeout(res, 150)); // Give browser time to trigger download
      }
    }
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download images.");
  }

  button.textContent = "Clear";
  button.disabled = false;
  button.onclick = clearPreview;
}

function clearPreview() {
  preview.innerHTML = "";
  processedBlobs = [];
  originalPreviews = [];
  filesToProcess = [];
  downloadAllBtn.textContent = "Download";
  downloadAllBtn.onclick = downloadAll;
}
