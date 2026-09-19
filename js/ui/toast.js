// ============================================================================
// TOAST — consistent feedback for every important action (section 68).
// Usage: toast.error('Not enough energy'); toast.success('Item crafted');
// ============================================================================

let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-stack';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

function show(message, type = 'info', duration = 3200) {
  const root = ensureContainer();
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast--visible'));
  setTimeout(() => {
    el.classList.remove('toast--visible');
    setTimeout(() => el.remove(), 220);
  }, duration);
}

export const toast = {
  info: (msg) => show(msg, 'info'),
  success: (msg) => show(msg, 'success'),
  error: (msg) => show(msg, 'error'),
  warn: (msg) => show(msg, 'warn'),
};
