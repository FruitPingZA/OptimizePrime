import { compressImage } from './utils/imageProcessor.js';

const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const maxWidthInput = document.getElementById('maxWidth');
const maxHeightInput = document.getElementById('maxHeight');
const formatInput = document.getElementById('format');
const targetSizeInput = document.getElementById('targetSize');
const processBtn = document.getElementById('processBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const preview = document.getElementById('preview');

let images = [];
let compressedImages = [];

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);
dropArea.addEventListener('dragover', e => {
  e.preventDefault();
  dropArea.classList.add('hover');
});
dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('hover');
});
dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.classList.remove('hover');
  handleFiles({ target: { files: e.dataTransfer.files } });
});

function handleFiles(event) {
  const files = Array.from(event.target.files);
  images = images.concat(files);
  displayPreviews();
}

function displayPreviews() {
  preview.innerHTML = '';
  images.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      img.classList.add('preview-img');
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

processBtn.addEventListener('click', async () => {
  const maxWidth = parseInt(maxWidthInput.value, 10);
  const maxHeight = parseInt(maxHeightInput.value, 10);
  const format = formatInput.value;
  const targetSize = parseInt(targetSizeInput.value, 10) * 1024;

  compressedImages = [];

  for (const file of images) {
    try {
      const result = await compressImage(file, format, maxWidth, maxHeight, targetSize);
      compressedImages.push(result);

      const img = document.createElement('img');
      img.src = result.previewURL;
      img.classList.add('preview-img');
      preview.appendChild(img);
    } catch (err) {
      console.error(`Error compressing ${file.name}:`, err);
    }
  }

  if (compressedImages.length > 0) {
    showClearButton();
  }
});

function showClearButton() {
  if (!document.getElementById('clearBtn')) {
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearBtn';
    clearBtn.textContent = 'Clear';
    clearBtn.classList.add('clear-btn');
    clearBtn.addEventListener('click', () => {
      images = [];
      compressedImages = [];
      preview.innerHTML = '';
      clearBtn.remove();
    });
    document.querySelector('.controls').appendChild(clearBtn);
  }
}
