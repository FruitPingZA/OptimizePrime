let processedBlobs = [];
let filesToProcess = [];

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const textToSVGBtn = document.getElementById("textToSVGBtn");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
const widthInput = document.getElementById("maxWidth");
const heightInput = document.getElementById("maxHeight");
const formatInput = document.getElementById("format");
const targetSizeInput = document.getElementById("targetSize");
const svgEditorSection = document.getElementById("svgEditorSection");

fileInput.addEventListener("change", handleFiles);
processBtn.addEventListener("click", processImages);
downloadAllBtn.addEventListener("click", downloadAll);

textToSVGBtn.addEventListener("click", () => {
  if (svgEditorSection.style.display === "none" || !svgEditorSection.style.display) {
    svgEditorSection.style.display = "block";
    setupSVGEditor();
  } else {
    svgEditorSection.style.display = "none";
  }
});

dropArea.addEventListener("dragover", e => {
  e.preventDefault();
});

dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});

dropArea.addEventListener("click", () => {
  fileInput.click();
});

function handleFiles(event) {
  const newFiles = Array.from(event.target.files);
  if (processedBlobs.length > 0 && !confirm("Start a new batch? This will clear current images.")) return;

  filesToProcess = newFiles;
  processedBlobs = [];
  preview.innerHTML = "";

  filesToProcess.forEach(file => {
    const fileLabel = document.createElement("div");
    fileLabel.className = "preview-placeholder";
    fileLabel.textContent = file.name;
    preview.appendChild(fileLabel);
  });
}

async function processImages() {
  const width = parseInt(widthInput.value) || null;
  const height = parseInt(heightInput.value) || null;
  const format = formatInput.value;
  const targetSize = parseInt(targetSizeInput.value) * 1024;

  processedBlobs = [];
  preview.innerHTML = "";

  for (const file of filesToProcess) {
    const { blob, previewURL, name } = await compressImage(file, format, width, height, targetSize);
    if (!blob) continue;

    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";

    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = name;
    img.className = "preview-img";

    const label = document.createElement("p");
    label.textContent = name;

    imgContainer.appendChild(img);
    imgContainer.appendChild(label);
    preview.appendChild(imgContainer);

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
      const ext = name.split(".").pop();
      const base = name.replace(/\.[^/.]+$/, "");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${base}.${ext}`;
      link.click();
    });
  }
}
