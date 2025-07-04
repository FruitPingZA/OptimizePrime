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

// Drag and drop events
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => fileInput.click());

function handleFiles(event) {
  const files = Array.from(event.target.files);
  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = e => {
      const container = document.createElement("div");
      container.className = "image-container";

      const img = new Image();
      img.src = e.target.result;
      img.className = "preview-img";

      const label = document.createElement("p");
      label.textContent = file.name;

      container.appendChild(label);
      container.appendChild(img);
      preview.appendChild(container);

      originalPreviews.push({ file, container });
    };
    reader.readAsDataURL(file);
  });
}

async function processImages() {
  processedBlobs = [];

  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  for (const { file, container } of originalPreviews) {
    const { blob, previewURL } = await compressImage(file, format, maxWidth, maxHeight, targetSize);

    const img = new Image();
    img.src = previewURL;
    img.className = "preview-img";
    container.appendChild(img);

    processedBlobs.push({ blob, name: file.name });
  }
}

function downloadAll() {
  if (!processedBlobs.length) return alert("No images to download.");

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      const ext = name.split(".").pop();
      const base = name.replace(/\.[^/.]+$/, "");
      zip.file(`${base}.${ext}`, blob);
    });
    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      saveAs(zipBlob, "optimizeprime_images.zip");
      preview.innerHTML = "";
      processedBlobs = [];
    });
  } else {
    processedBlobs.forEach(({ blob, name }) => {
      saveAs(blob, name);
    });
    preview.innerHTML = "";
    processedBlobs = [];
  }
}
