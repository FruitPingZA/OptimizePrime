// Ensure FileSaver.js and JSZip are loaded before this file
let processedBlobs = [];
let filesToProcess = [];
let svgPanelOpen = false;

// Elements
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const textToSVGBtn = document.getElementById("textToSVGBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
const svgPanel = document.getElementById("svgPanel");
const svgOutput = document.getElementById("svgOutput");
const svgCSSInput = document.getElementById("svgCSS");
const svgTextInput = document.getElementById("svgText");
const svgFontInput = document.getElementById("svgFont");
const svgColorInput = document.getElementById("svgColor");
const svgDownloadBtn = document.getElementById("svgDownloadBtn");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  handleNewFiles(files);
});

dropArea.addEventListener("click", () => fileInput.click());

textToSVGBtn.addEventListener("click", () => {
  svgPanelOpen = !svgPanelOpen;
  svgPanel.style.display = svgPanelOpen ? "block" : "none";
});

svgCSSInput.addEventListener("input", updateSVGPreview);
svgTextInput.addEventListener("input", updateSVGPreview);
svgFontInput.addEventListener("input", updateSVGPreview);
svgColorInput.addEventListener("input", updateSVGPreview);

svgDownloadBtn.addEventListener("click", () => {
  const svgData = textToSVG(
    svgTextInput.value,
    svgFontInput.value,
    svgColorInput.value,
    svgCSSInput.value
  );
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  saveAs(blob, "label.svg");
});

function updateSVGPreview() {
  const svgData = textToSVG(
    svgTextInput.value,
    svgFontInput.value,
    svgColorInput.value,
    svgCSSInput.value
  );
  svgOutput.innerHTML = svgData;
}

function handleFiles(event) {
  handleNewFiles(Array.from(event.target.files));
}

function handleNewFiles(newFiles) {
  if (filesToProcess.length > 0) {
    const addMore = confirm("Start a new batch or add to existing?");
    if (!addMore) return;
  }
  filesToProcess = [...filesToProcess, ...newFiles];
  preview.innerHTML = "";
  filesToProcess.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      img.className = "preview-img";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

async function processImages() {
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;
  processedBlobs = [];

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
  if (!processedBlobs.length) {
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
      saveAs(blob, name);
    });
  }
}
