// Ensure FileSaver.js and JSZip are loaded before this file
let processedBlobs = [];
let filesToProcess = [];
let globalSettings = {};

// Elements
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const textToSVGBtn = document.getElementById("textToSVGBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
const svgPanel = document.getElementById("svgOptions");
const cssInput = document.getElementById("cssInput");
const svgOutput = document.getElementById("svgOutput");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", () => processImages(filesToProcess));
downloadAllBtn.addEventListener("click", downloadAll);
textToSVGBtn.addEventListener("click", toggleSvgOptions);

function toggleSvgOptions() {
  svgPanel.classList.toggle("visible");
  if (svgPanel.classList.contains("visible")) {
    const text = document.getElementById("svgTextInput").value || "Your Text";
    const color = document.getElementById("svgColorInput").value || "#ffffff";
    const font = document.getElementById("svgFontInput").value || "Arial";
    const svg = textToSVG(text, color, font);
    svgOutput.innerHTML = svg;
  } else {
    svgOutput.innerHTML = "";
  }
}

cssInput.addEventListener("input", () => {
  const style = `<style>${cssInput.value}</style>`;
  const rawSVG = svgOutput.querySelector("svg");
  if (rawSVG) rawSVG.innerHTML += style;
});

svgPanel.querySelector("button").addEventListener("click", () => {
  const blob = new Blob([svgOutput.innerHTML], { type: "image/svg+xml" });
  saveAs(blob, "custom.svg");
});

dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.classList.add("hover");
});

dropArea.addEventListener("dragleave", () => dropArea.classList.remove("hover"));

dropArea.addEventListener("drop", e => {
  e.preventDefault();
  dropArea.classList.remove("hover");
  handleFiles({ target: { files: e.dataTransfer.files } });
});

dropArea.addEventListener("click", () => fileInput.click());

function handleFiles(event) {
  const newFiles = Array.from(event.target.files);
  if (filesToProcess.length) {
    const confirmAdd = confirm("Add to current batch or start new?");
    if (!confirmAdd) filesToProcess = [];
  }
  filesToProcess = [...filesToProcess, ...newFiles];
  displayPreview(filesToProcess);
}

function displayPreview(files) {
  preview.innerHTML = "";
  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      img.className = "preview-img";
      img.addEventListener("click", () => editImageSettings(index));
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function editImageSettings(index) {
  const settings = prompt("Custom width,height,quality (e.g. 800,600,90):");
  if (!settings) return;
  const [w, h, q] = settings.split(",").map(v => parseInt(v.trim()));
  filesToProcess[index].custom = { w, h, q };
}

async function processImages(files) {
  processedBlobs = [];
  const defaultW = parseInt(document.getElementById("maxWidth").value);
  const defaultH = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;

  preview.innerHTML = "";
  for (const file of files) {
    const w = file.custom?.w || defaultW;
    const h = file.custom?.h || defaultH;
    const q = file.custom?.q || 95;
    const { blob, previewURL, name } = await compressImage(file, format, w, h, targetSize);
    const img = document.createElement("img");
    img.src = previewURL;
    img.className = "preview-img";
    preview.appendChild(img);
    processedBlobs.push({ blob, name });
  }
}

function downloadAll() {
  if (!processedBlobs.length) return alert("No processed images to download.");
  if (processedBlobs.length > 10) {
    const zip = new JSZip();
    processedBlobs.forEach(({ blob, name }) => {
      const ext = name.split(".").pop();
      const base = name.replace(/\.[^/.]+$/, "");
      zip.file(`${base}.${ext}`, blob);
    });
    zip.generateAsync({ type: "blob" }).then(content => saveAs(content, "optimizeprime_images.zip"));
  } else {
    processedBlobs.forEach(({ blob, name }) => saveAs(blob, name));
  }
}
