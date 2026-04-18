import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadZip(photos, selectedIndices) {
  const zip = new JSZip();

  for (const idx of selectedIndices) {
    const file = photos[idx];
    const arrayBuffer = await file.arrayBuffer();
    zip.file(file.name, arrayBuffer);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'filtered-photos.zip');
}