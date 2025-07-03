import { compressImage } from "./utils/imageProcessor.js";
import { textToSVG, applyCustomCSSToSVG } from "./utils/svgConverter.js";
import { setupSVGEditor } from "./utils/editor.js";

let processedBlobs = [];
let filesToProcess = [];

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const textToSVGBtn = document.getElementById("textToSVGBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
const svgEditorSection = document.getElementById("svgEditorSection");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});

dropArea.addEventListener("click", () => fileInput.click());

textToSVGBtn.addEventListener("click", () => {
  if (svgEditorSection.style.display === "none") {
    svgEditorSection.style.display = "block";
    setupSVGEditor();
  } else {
    svgEditorSection.style.display = "none";
  }
});

function handleFiles(event) {
  const newFiles = Array.from(event.target.files);
  if (processedBlobs.length > 0) {
    if (!confirm("Start a new batch? This will clear current images.")) return;
    processedBlobs = [];
    preview.innerHTML = "";
  }

  filesToProcess = newFiles;
  filesToProcess.forEach(file => {
    const img = document.createElement("p");
    img.textContent = `Ready: ${file.name}`;
    img.className = "preview-placeholder";
    preview.appendChild(img);
  });
}

async function processImages() {
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  processedBlobs = [];
  preview.innerHTML = "";

  for (const file of filesToProcess) {
    const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);
    if (!blob) continue;

    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = name;
    img.className = "preview-img";
    preview.appendChild(img);

    processedBlobs.push({ blob, name });
  }
}

function downloadAll() {
  if (processedBlobs.length === 0) {
    alert("No processed images to download.");
    return;
  }

  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      const ext = name.split(".").pop();
      const base = name.replace(/\.[^/.]+$/, "");
      zip.file(`${base}.${ext}`, blob);
    });

    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, "optimizeprime_images.zip");
    });
  } else {
    processedBlobs.forEach(({ blob, name }) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name.replace(/\.[^/.]+$/, "") + ".webp";
      link.click();
    });
  }
}
