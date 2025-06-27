let processedBlobs = [];

document.getElementById("fileInput").addEventListener("change", handleFiles);
document.getElementById("processBtn").addEventListener("click", processImages);
document.getElementById("downloadAllBtn").addEventListener("click", downloadAll);
document.getElementById("textToSVGBtn").addEventListener("click", () => {
  const text = prompt("Enter text to convert to SVG:");
  if (!text) return;

  const svgData = textToSVG(text);
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  saveAs(blob, "label.svg");
});

const dropArea = document.getElementById("dropArea");

dropArea.addEventListener("dragover", e => {
  e.preventDefault();
});
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  document.getElementById("fileInput").files = e.dataTransfer.files;
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

let filesToProcess = [];

function handleFiles(event) {
  filesToProcess = Array.from(event.target.files);
  document.getElementById("preview").innerHTML = "";
}

async function processImages() {
  const maxWidth = parseInt(document.getElementById("maxWidth").value);
  const maxHeight = parseInt(document.getElementById("maxHeight").value);
  const format = document.getElementById("format").value;
  const targetSize = parseInt(document.getElementById("targetSize").value) * 1024;
  const preview = document.getElementById("preview");
  preview.innerHTML = "";
  processedBlobs = [];

  for (const file of filesToProcess) {
    const { blob, previewURL, name } = await compressImage(file, format, maxWidth, maxHeight, targetSize);
    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = name;
    preview.appendChild(img);
    processedBlobs.push({ blob, name });
  }
}

function downloadAll() {
  const zip = new JSZip();
  processedBlobs.forEach(({ blob, name }) => {
    zip.file(name.replace(/\.[^/.]+$/, "") + "." + name.split('.').pop(), blob);
  });
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "optimizeprime_images.zip");
  });
}
