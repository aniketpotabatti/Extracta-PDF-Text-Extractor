/**
 * utils.js — Pure utility functions (no DOM, no state dependencies).
 */

/** Format a byte count as a human-readable string (e.g. "1.4 MB"). */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k     = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

/** Format a number with locale-aware thousands separators. */
export function formatNumber(n) {
  return n.toLocaleString();
}

/**
 * Creates a DOM element with optional attributes and children.
 * Uses native DOM APIs — never innerHTML — so no user data can cause XSS.
 *
 * @param {string} tag
 * @param {Record<string, string|object>} [attrs]
 * @param {Array<Node|string|number>} [children]
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') {
      node.className = val;
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(node.style, val);
    } else if (key === 'textContent') {
      node.textContent = val;
    } else {
      node.setAttribute(key, val);
    }
  }
  for (const child of children) {
    node.appendChild(
      child instanceof Node
        ? child
        : document.createTextNode(String(child)),
    );
  }
  return node;
}
