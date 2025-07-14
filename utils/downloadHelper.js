export function triggerDownload(blob, filename) {
  if (!blob || blob.size === 0) {
    alert('Compression failed: Output file is empty.');
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
