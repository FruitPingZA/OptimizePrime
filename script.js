import { compressImage } from './utils/imageProcessor.js';

const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const maxWidth = document.getElementById('maxWidth');
const maxHeight = document.getElementById('maxHeight');
const formatSelect = document.getElementById('format');
const targetSize = document.getElementById('targetSize');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadAllBtn');
const preview = document.getElementById('preview');

let compressedImages = [];

function addFiles(files) {
  [...files].forEach(file => {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'img-container';
    imgContainer.textContent = `Added: ${file.name}`;
    preview.appendChild(imgContainer);
    compressedImages.push({ file, container: imgContainer });
  });
}

dropArea.addEventListener('click', () => fileInput.click());

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('drag-over');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('drag-over');
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('drag-over');
  addFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  addFiles(fileInput.files);
});

processBtn.addEventListener('click', async () => {
  const width = parseInt(maxWidth.value);
  const height = parseInt(maxHeight.value);
  const format = formatSelect.value;
  const size = parseInt(targetSize.value) * 1024;

  const promises = compressedImages.map(async (item) => {
    try {
      const result = await compressImage(item.file, format, width, height, size);
      item.blob = result.blob;
      item.previewURL = result.previewURL;
      item.name = result.name;

      const img = new Image();
      img.src = result.previewURL;
      img.title = result.name;

      item.container.innerHTML = '';
      item.container.appendChild(img);
    } catch (err) {
      console.error(`Error compressing ${item.file.name}:`, err);
      item.container.textContent = `Error compressing ${item.file.name}`;
    }
  });

  await Promise.all(promises);

  if (!document.getElementById('clearBtn')) {
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearBtn';
    clearBtn.textContent = 'Clear';
    clearBtn.classList.add('pink-btn');
    clearBtn.addEventListener('click', () => {
      compressedImages = [];
      preview.innerHTML = '';
      clearBtn.remove();
    });
    downloadBtn.insertAdjacentElement('afterend', clearBtn);
  }
});

downloadBtn.addEventListener('click', () => {
  if (compressedImages.length === 0) {
    alert("No images to download.");
    return;
  }

  if (compressedImages.length > 10) {
    const zip = new JSZip();
    compressedImages.forEach(img => {
      zip.file(img.name, img.blob);
    });
    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, 'compressed_images.zip');
    });
  } else {
    compressedImages.forEach(img => {
      saveAs(img.blob, img.name);
    });
  }
});
