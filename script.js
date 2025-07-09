import { compressImage } from "./utils/imageProcessor.js";

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadAllBtn");
const preview = document.getElementById("preview");

let compressedImages = [];

dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFiles);
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

processBtn.addEventListener("click", async () => {
  const format = document.getElementById("format").value;
  const maxWidth = parseInt(document.getElementById("maxWidth").value, 10);
  const maxHeight = parseInt(document.getElementById("maxHeight").value, 10);
  const targetSize = parseInt(document.getElementById("targetSize").value, 10) * 1024;

  if (!compressedImages.length) {
    alert("Please add images before compressing.");
    return;
  }

  preview.innerHTML = "";
  const newCompressed = [];

  for (const image of compressedImages) {
    try {
      const result = await compressImage(image.file, format, maxWidth, maxHeight, targetSize);
      newCompressed.push(result);

      const imgEl = document.createElement("img");
      imgEl.src = result.previewURL;
      imgEl.alt = result.name;
      preview.appendChild(imgEl);
    } catch (err) {
      console.error(`Error compressing ${image.file.name}:`, err);
    }
  }

  compressedImages = newCompressed;
});

downloadBtn.addEventListener("click", () => {
  if (!compressedImages.length) {
    alert("No images to download.");
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder("OptimizePrime");

  compressedImages.forEach((image, i) => {
    folder.file(image.name, image.blob);
  });

  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "optimized_images.zip");

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.className = "clear-button";
    clearBtn.style.marginTop = "10px";
    clearBtn.onclick = () => {
      compressedImages = [];
      preview.innerHTML = "";
      clearBtn.remove();
    };
    preview.appendChild(clearBtn);
  });
});

function handleFiles(e) {
  const files = Array.from(e.target.files).filter(file => file.type.startsWith("image/"));
  if (!files.length) return;
  compressedImages = files.map(file => ({ file }));
  preview.innerHTML = "";
  const note = document.createElement("p");
  note.textContent = "Images ready for compression.";
  preview.appendChild(note);
}
