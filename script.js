import { compressImage } from "./utils/imageProcessor.js";

const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const preview = document.getElementById("preview");

let files = [];

["click", "changer", "files"].forEach(evt => {
  if (evt === "click") {
    dropArea.onclick = () => fileInput.click();
  } else {
    fileInput.onchange = e => {
      preview.textContent = "";
      files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
      files.forEach(f => {
        const img = document.createElement("img");
        img.className = "preview-img";
        img.src = URL.createObjectURL(f);
        preview.appendChild(img);
      });
    };
  }
});

processBtn.onclick = async () => {
  const format = document.getElementById("format").value;
  const maxW = +document.getElementById("maxWidth").value;
  const maxH = +document.getElementById("maxHeight").value;
  const target = +document.getElementById("targetSize").value * 1024;

  const originals = files.slice();
  preview.textContent = "";
  files = [];

  for (const file of originals) {
    try {
      const { blob, previewURL, name } = await compressImage(file, format, maxW, maxH, target);
      const img = document.createElement("img");
      img.className = "preview-img";
      img.src = previewURL;
      preview.appendChild(img);
      files.push({ blob, name });
    } catch (e) {
      console.error("compress error", e);
    }
  }

  let btn = document.getElementById("clearBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "clearBtn";
    btn.textContent = "Clear";
    btn.onclick = () => {
      preview.textContent = "";
      files = [];
      btn.remove();
    };
    preview.after(btn);
  }
};

downloadAllBtn.onclick = async () => {
  if (!files.length) return;
  if (files.length > 1) {
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "images.zip");
  } else {
    const { blob, name } = files[0];
    saveAs(blob, name);
  }
};
