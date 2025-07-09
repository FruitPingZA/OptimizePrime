import { compressImage } from './utils/imageProcessor.js';

const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const preview = document.getElementById('preview');
const formatSelector = document.getElementById('format');
const maxWidth = document.getElementById('maxWidth');
const maxHeight = document.getElementById('maxHeight');
const targetSize = document.getElementById('targetSize');

let compressedImages = [];

dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFiles);
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('hover');
});
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('hover'));
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('hover');
  handleFiles({ target: { files: e.dataTransfer.files } });
});

processBtn.addEventListener('click', processImages);
downloadAllBtn.addEventListener('click', triggerDownloadAll);

function handleFiles(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('preview-img');
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  // Save raw files for processing
  dropArea.dataset.files = JSON.stringify(files.map(file => ({
    name: file.name,
    type: file.type
  })));
  dropArea.files = files;
}

async function processImages() {
  const files = dropArea.files;
  if (!files || files.length === 0) return;

  compressedImages = [];

  for (let file of files) {
    try {
      const result = await compressImage(
        file,
        formatSelector.value,
        parseInt(maxWidth.value),
        parseInt(maxHeight.value),
        parseInt(targetSize.value) * 1024
      );

      compressedImages.push(result);

      const img = document.createElement('img');
      img.src = result.previewURL;
      img.classList.add('preview-img');
      preview.appendChild(img);
    } catch (error) {
      console.error('Compression failed for', file.name, error);
    }
  }

  if (!document.getElementById('clearBtn')) {
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearBtn';
    clearBtn.textContent = 'Clear';
    clearBtn.style.marginTop = '10px';
    clearBtn.addEventListener('click', () => {
      preview.innerHTML = '';
      compressedImages = [];
      const btn = document.getElementById('clearBtn');
      if (btn) btn.remove();
    });
    preview.appendChild(clearBtn);
  }
}

async function triggerDownloadAll() {
  if (compressedImages.length === 0) {
    alert('No images to download.');
    return;
  }

  if (compressedImages.length > 10) {
    const zip = new JSZip();
    compressedImages.forEach(({ blob, name }) => {
      zip.file(name, blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'compressed-images.zip');
  } else {
    compressedImages.forEach(({ blob, name }) => {
      saveAs(blob, name);
    });
  }

  // DO NOT clear here — only user can press 'Clear' manually
}
