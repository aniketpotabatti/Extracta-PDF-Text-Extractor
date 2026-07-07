/**
 * extractor.js — Handles the PDF extraction request lifecycle:
 * button state, fetch, progress simulation, and result handoff.
 *
 * @param {object} dom          - Relevant DOM element references
 * @param {object} state        - Shared mutable state ({ selectedFile, extractedData })
 * @param {object} helpers      - { showError, hideError, setProgress, renderResults }
 */

export function initExtractor(dom, state, { showError, hideError, setProgress, renderResults }) {
  const { extractBtn, progressWrap } = dom;

  function simulateProgress() {
    let current = 15;
    return setInterval(() => {
      if (current < 85) {
        current += Math.random() * 8;
        setProgress(Math.min(current, 85), 'Extracting text…');
      }
    }, 300);
  }

  extractBtn.addEventListener('click', async () => {
    if (!state.selectedFile) return;

    hideError();
    extractBtn.disabled = true;
    extractBtn.classList.add('loading');
    extractBtn.querySelector('.btn-text').textContent = 'Extracting';

    progressWrap.hidden = false;
    setProgress(15, 'Uploading PDF…');

    const formData = new FormData();
    formData.append('pdf', state.selectedFile);

    const progressIntervalId = simulateProgress();

    try {
      const response = await fetch('/api/pdf/extract', { method: 'POST', body: formData });

      clearInterval(progressIntervalId);
      setProgress(95, 'Processing…');

      const data = await response.json();
      setProgress(100, 'Done!');
      await new Promise((r) => setTimeout(r, 400));

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      state.extractedData = data;
      renderResults(data);
    } catch (err) {
      showError(err.message || 'Something went wrong. Please try again.');
      extractBtn.disabled = false;
      extractBtn.classList.remove('loading');
      extractBtn.querySelector('.btn-text').textContent = 'Extract Text';
    } finally {
      progressWrap.hidden = true;
      setProgress(0, '');
    }
  });
}
