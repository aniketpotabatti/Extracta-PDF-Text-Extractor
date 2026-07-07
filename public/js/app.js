/**
 * app.js — Entry point for Extracta frontend.
 *
 * Responsibilities:
 *   - Collect all DOM references
 *   - Hold shared mutable state
 *   - Define cross-cutting helpers (showError, hideError, setProgress)
 *   - Initialise all feature modules
 */

import { initFileHandler } from './fileHandler.js';
import { initExtractor }   from './extractor.js';
import { initRenderer }    from './renderer.js';

// ── DOM References ─────────────────────────────────────────────────────────
const dom = {
  dropzone:       document.getElementById('dropzone'),
  fileInput:      document.getElementById('fileInput'),
  fileInfo:       document.getElementById('fileInfo'),
  fileNameEl:     document.getElementById('fileName'),
  fileSizeEl:     document.getElementById('fileSize'),
  fileClearBtn:   document.getElementById('fileClearBtn'),
  extractBtn:     document.getElementById('extractBtn'),
  progressWrap:   document.getElementById('progressWrap'),
  progressBar:    document.getElementById('progressBar'),
  progressLabel:  document.getElementById('progressLabel'),
  resultsSection: document.getElementById('resultsSection'),
  metaGrid:       document.getElementById('metaGrid'),
  statPills:      document.getElementById('statPills'),
  copyBtn:        document.getElementById('copyBtn'),
  downloadBtn:    document.getElementById('downloadBtn'),
  viewByPage:     document.getElementById('viewByPage'),
  viewFull:       document.getElementById('viewFull'),
  pageView:       document.getElementById('pageView'),
  fullView:       document.getElementById('fullView'),
  pagesAccordion: document.getElementById('pagesAccordion'),
  fullTextArea:   document.getElementById('fullTextArea'),
  resetBtn:       document.getElementById('resetBtn'),
  errorToast:     document.getElementById('errorToast'),
  errorMsg:       document.getElementById('errorMsg'),
  errorClose:     document.getElementById('errorClose'),
};

// ── Shared State ───────────────────────────────────────────────────────────
const state = {
  selectedFile:  null,
  extractedData: null,
};

// ── Cross-Cutting Helpers ──────────────────────────────────────────────────

function showError(message) {
  dom.errorMsg.textContent = message;
  dom.errorToast.hidden    = false;
  dom.errorToast.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  dom.errorToast.hidden = true;
}

function setProgress(pct, label) {
  dom.progressBar.style.width    = `${pct}%`;
  dom.progressLabel.textContent  = label;
}

dom.errorClose.addEventListener('click', hideError);

// ── Initialise Modules ─────────────────────────────────────────────────────
// Order matters: renderer must be initialised before extractor
// so renderResults is available to pass to initExtractor.

const { clearFile }     = initFileHandler(dom, state, { showError, hideError });
const { renderResults } = initRenderer(dom, state, { clearFile, showError });
initExtractor(dom, state, { showError, hideError, setProgress, renderResults });
