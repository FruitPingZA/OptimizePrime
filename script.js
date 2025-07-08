import { compressImage } from './utils/imageProcessor.js';

const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
let processed = [];

dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", e => e.preventDefault());
dropArea.addEventListener("drop", e => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
fileInput.addEventListener("change", e => handleFiles(e.target.files));

document.getElementById("processBtn").addEventListener("click", async () => {
  const format = document.getElementById("format").value;
  const maxW = +document.getElementById("maxWidth").value;
  const maxH = +document.getElementById("maxHeight").value;
  const tgt = +document.getElementById("targetSize").value * 1024;

  processed = [];
  for (let container of document.querySelectorAll(".image-container")) {
    const file = container.file;
    try {
      const blob = await compressImage(file, format, maxW, maxH, tgt);
      container.querySelector(".compressed")?.remove();
      const img = document.createElement("img");
      img.className = "preview-img compressed";
      img.src = URL.createObjectURL(blob);
      container.appendChild(img);
      processed.push({ blob, name: file.name.replace(/\.\w+$/, `.${format}`) });
    } catch (err) {
      console.error("Compression error:", err);
    }
  }
});

document.getElementById("downloadAllBtn").addEventListener("click", async () => {
  if (!processed.length) return alert("No images to download.");

  const zip = new JSZip();
  processed.forEach(({ blob, name }) => zip.file(name, blob));
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "optimizeprime.zip");
  preview.innerHTML = '';
  processed = [];
});

function handleFiles(files) {
  preview.innerHTML = '';
  Array.from(files).forEach(file => {
    const ctr = document.createElement("div");
    ctr.className = "image-container";
    ctr.file = file;

    const img = document.createElement("img");
    img.className = "preview-img";
    img.src = URL.createObjectURL(file);

    const lbl = document.createElement("p");
    lbl.innerText = file.name;

    ctr.append(lbl, img);
    preview.appendChild(ctr);
  });
}
