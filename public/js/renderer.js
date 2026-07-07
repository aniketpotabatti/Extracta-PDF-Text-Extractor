/**
 * renderer.js — Renders extraction results, manages the accordion,
 * view toggle, copy, download, and reset actions.
 *
 * @param {object} dom     - Relevant DOM element references
 * @param {object} state   - Shared mutable state ({ extractedData })
 * @param {object} helpers - { clearFile, showError }
 * @returns {{ renderResults: Function }}
 */

import { formatBytes, formatNumber, el } from './utils.js';

export function initRenderer(dom, state, { clearFile, showError }) {
  const {
    metaGrid, statPills, pagesAccordion, fullTextArea,
    resultsSection, dropzone, extractBtn,
    viewByPage, viewFull, pageView, fullView,
    copyBtn, downloadBtn, resetBtn,
  } = dom;

  // ── View Toggle ────────────────────────────────────────────────────

  /** @param {'page'|'full'} view */
  function setView(view) {
    const showPage = view === 'page';
    viewByPage.classList.toggle('active', showPage);
    viewByPage.setAttribute('aria-selected', String(showPage));
    viewFull.classList.toggle('active', !showPage);
    viewFull.setAttribute('aria-selected', String(!showPage));
    pageView.hidden = !showPage;
    fullView.hidden =  showPage;
  }

  viewByPage.addEventListener('click', () => setView('page'));
  viewFull.addEventListener('click',   () => setView('full'));

  // ── Accordion ──────────────────────────────────────────────────────

  function toggleAccordion(item, header) {
    const isOpen = item.classList.contains('open');
    item.classList.toggle('open', !isOpen);
    header.setAttribute('aria-expanded', String(!isOpen));
  }

  /** Builds a single page accordion item from a page data object. */
  function buildPageItem(page) {
    const badge    = el('span', { className: 'page-num-badge', textContent: String(page.pageNumber) });
    const titleDiv = el('div',  { className: 'page-item-title' }, [badge, ` Page ${page.pageNumber}`]);

    const metaLabel = page.text ? `${formatNumber(page.charCount)} chars` : 'Empty';
    const metaDiv   = el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
      el('span', { className: 'page-item-meta', textContent: metaLabel }),
      el('span', { className: 'page-chevron',   style: { display: 'inline-block' }, textContent: '▶' }),
    ]);

    const header = el('div', {
      className:       'page-item-header',
      role:            'button',
      'aria-expanded': 'false',
      tabindex:        '0',
    }, [titleDiv, metaDiv]);

    const bodyContent = page.text?.trim()
      ? el('pre', { className: 'page-text',  textContent: page.text })
      : el('p',   { className: 'page-empty', textContent: 'No text found on this page (may be image-based).' });

    const item = el('div', { className: 'page-item' }, [
      header,
      el('div', { className: 'page-item-body' }, [bodyContent]),
    ]);

    header.addEventListener('click',   ()  => toggleAccordion(item, header));
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion(item, header);
      }
    });

    return item;
  }

  // ── Render Results ─────────────────────────────────────────────────

  function renderResults(data) {
    const { metadata, pages, fullText, totalCharacters, totalWords, extractionTime } = data;

    // Stat pills
    statPills.innerHTML = '';
    [
      `${metadata.pageCount} pages`,
      `${formatNumber(totalWords)} words`,
      `${formatNumber(totalCharacters)} chars`,
      `${extractionTime}ms`,
    ].forEach((label) => {
      statPills.appendChild(el('span', { className: 'stat-pill', textContent: label }));
    });

    // Metadata grid — built entirely via el() (no innerHTML with user data)
    metaGrid.innerHTML = '';
    [
      ['File',     metadata.fileName],
      ['Size',     formatBytes(metadata.fileSize)],
      ['Pages',    String(metadata.pageCount)],
      ['Title',    metadata.title    || '—'],
      ['Author',   metadata.author   || '—'],
      ['Subject',  metadata.subject  || '—'],
      ['Creator',  metadata.creator  || '—'],
      ['Producer', metadata.producer || '—'],
    ].forEach(([label, value]) => {
      metaGrid.appendChild(
        el('div', { className: 'meta-item' }, [
          el('dt', { textContent: label }),
          el('dd', { textContent: value }),
        ]),
      );
    });

    // Pages accordion
    pagesAccordion.innerHTML = '';
    pages.forEach((page) => pagesAccordion.appendChild(buildPageItem(page)));

    // Auto-open first page
    const firstItem = pagesAccordion.querySelector('.page-item');
    if (firstItem) {
      toggleAccordion(firstItem, firstItem.querySelector('.page-item-header'));
    }

    fullTextArea.value = fullText;

    // Show results, hide upload section
    dropzone.closest('.upload-section').hidden = true;
    if (extractBtn.parentElement) extractBtn.hidden = true;
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Copy ───────────────────────────────────────────────────────────

  copyBtn.addEventListener('click', async () => {
    if (!state.extractedData) return;
    try {
      await navigator.clipboard.writeText(state.extractedData.fullText);
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<span aria-hidden="true">✓</span> Copied!';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<span aria-hidden="true">⎘</span> Copy All';
      }, 2000);
    } catch {
      showError('Failed to copy to clipboard. Please select and copy manually.');
    }
  });

  // ── Download ───────────────────────────────────────────────────────

  downloadBtn.addEventListener('click', () => {
    if (!state.extractedData) return;
    const blob  = new Blob([state.extractedData.fullText], { type: 'text/plain;charset=utf-8' });
    const url   = URL.createObjectURL(blob);
    const a     = el('a', {
      href:     url,
      download: `${state.extractedData.metadata.fileName.replace(/\.pdf$/i, '')}_extracted.txt`,
    });
    a.click();
    URL.revokeObjectURL(url);
  });

  // ── Reset ──────────────────────────────────────────────────────────

  resetBtn.addEventListener('click', () => {
    state.extractedData = null;
    clearFile();

    resultsSection.hidden = true;
    document.querySelector('.upload-section').hidden = false;
    extractBtn.hidden   = false;
    extractBtn.disabled = true;
    extractBtn.classList.remove('loading');
    extractBtn.querySelector('.btn-text').textContent = 'Extract Text';

    setView('page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  return { renderResults };
}
