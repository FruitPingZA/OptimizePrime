// editor.js - Handles individual image editing before compression

export function showImageEditor(imageIndex, imageData, onSave) {
  const editorOverlay = document.createElement("div");
  editorOverlay.className = "editor-overlay";
  editorOverlay.innerHTML = `
    <div class="editor-modal">
      <h3>Edit Image Settings</h3>
      <label>Max Width:
        <input type="number" id="editWidth" value="${imageData.maxWidth || 800}">
      </label>
      <label>Max Height:
        <input type="number" id="editHeight" value="${imageData.maxHeight || 800}">
      </label>
      <label>Target Size (KB):
        <input type="number" id="editTargetSize" value="${imageData.targetSize || 200}">
      </label>
      <label>Format:
        <select id="editFormat">
          <option value="webp" ${imageData.format === 'webp' ? 'selected' : ''}>WebP</option>
          <option value="avif" ${imageData.format === 'avif' ? 'selected' : ''}>AVIF</option>
        </select>
      </label>
      <div class="editor-buttons">
        <button id="saveImageEdit">Save</button>
        <button id="cancelImageEdit">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(editorOverlay);

  document.getElementById("cancelImageEdit").onclick = () => {
    document.body.removeChild(editorOverlay);
  };

  document.getElementById("saveImageEdit").onclick = () => {
    const newData = {
      maxWidth: parseInt(document.getElementById("editWidth").value),
      maxHeight: parseInt(document.getElementById("editHeight").value),
      targetSize: parseInt(document.getElementById("editTargetSize").value),
      format: document.getElementById("editFormat").value
    };
    onSave(imageIndex, newData);
    document.body.removeChild(editorOverlay);
  };
}
