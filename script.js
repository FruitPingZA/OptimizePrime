import { compressImage } from './utils/imageProcessor.js';

const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const preview = document.getElementById('preview');

let compressedImages = [];

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('hover');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('hover');
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('hover');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  [...files].forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const imgElement = document.createElement('img');
          imgElement.src = reader.result;
          imgElement.className = 'preview-img';
          preview.appendChild(imgElement);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });
  fileInput.value = '';
}

processBtn.addEventListener('click', async () => {
  const files = fileInput.files.length ? fileInput.files : dropArea.files;
  if (!files || !files.length) {
    alert('Please add images first.');
    return;
  }

  compressedImages = []; // Reset before new compression
  preview.innerHTML = '';

  const format = document.getElementById('format').value;
  const maxWidth = parseInt(document.getElementById('maxWidth').value, 10);
  const maxHeight = parseInt(document.getElementById('maxHeight').value, 10);
  const targetSize = parseInt(document.getElementById('targetSize').value, 10) * 1024;

  for (const file of files) {
    try {
      const result = await compressImage(file, format, maxWidth, maxHeight, targetSize);
      const imgElement = document.createElement('img');
      imgElement.src = result.previewURL;
      imgElement.className = 'preview-img';
      preview.appendChild(imgElement);
      compressedImages.push(result);
    } catch (err) {
      console.error('Error compressing', file.name, err);
    }
  }
});

downloadAllBtn.addEventListener('click', async () => {
  if (!compressedImages.length) {
    alert('No images to download');
    return;
  }

  const zip = new JSZip();
  const isZip = compressedImages.length >= 10;

  for (const { blob, name } of compressedImages) {
    if (isZip) {
      zip.file(name, blob);
    } else {
      saveAs(blob, name);
    }
  }

  if (isZip) {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'compressed_images.zip');
  }

  // Show "Clear" button after download attempt
  showClearButton();
});

function showClearButton() {
  let existingClearBtn = document.getElementById('clearBtn');
  if (existingClearBtn) return;

  const clearBtn = document.createElement('button');
  clearBtn.id = 'clearBtn';
  clearBtn.textContent = 'Clear';
  clearBtn.style.marginLeft = '10px';
  clearBtn.style.background = '#ff5cad';
  clearBtn.onclick = () => {
    preview.innerHTML = '';
    compressedImages = [];
    clearBtn.remove();
  };
  document.querySelector('.controls').appendChild(clearBtn);
}
