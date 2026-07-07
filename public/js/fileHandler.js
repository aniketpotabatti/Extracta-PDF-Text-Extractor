/**
 * fileHandler.js — File selection, validation, drag-drop, and clear logic.
 *
 * @param {object} dom    - Relevant DOM element references
 * @param {object} state  - Shared mutable state ({ selectedFile })
 * @param {object} helpers - { showError, hideError, formatBytes }
 * @returns {{ clearFile: Function }}
 */

import { formatBytes } from './utils.js';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export function initFileHandler(dom, state, { showError, hideError }) {
  const { dropzone, fileInput, fileInfo, fileNameEl, fileSizeEl, fileClearBtn, extractBtn } = dom;

  // ── File Selection ───────────────────────────────────────────────
  function selectFile(file) {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError('Please upload a valid PDF file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showError('File is too large. Maximum allowed size is 50 MB.');
      return;
    }

    hideError();
    state.selectedFile = file;

    dropzone.querySelector('.dropzone-inner').hidden = true;
    fileInfo.hidden        = false;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatBytes(file.size);
    dropzone.classList.add('has-file');
    extractBtn.disabled    = false;
  }

  function clearFile() {
    state.selectedFile  = null;
    fileInput.value     = '';
    dropzone.querySelector('.dropzone-inner').hidden = false;
    fileInfo.hidden     = true;
    dropzone.classList.remove('has-file');
    extractBtn.disabled = true;
    hideError();
  }

  // ── Drag & Drop ──────────────────────────────────────────────────
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragging');
  });

  ['dragleave', 'dragend'].forEach((evt) =>
    dropzone.addEventListener(evt, () => dropzone.classList.remove('dragging')),
  );

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragging');
    const file = e.dataTransfer?.files?.[0];
    if (file) selectFile(file);
  });

  dropzone.addEventListener('click', (e) => {
    if (e.target === fileClearBtn || fileClearBtn.contains(e.target)) return;
    fileInput.click();
  });

  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) selectFile(fileInput.files[0]);
  });

  fileClearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearFile();
  });

  // Expose clearFile so the reset handler (renderer.js) can call it.
  return { clearFile };
}
