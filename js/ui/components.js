// ============================================================================
// COMPONENTS — tiny DOM-builder helpers so every view constructs markup the
// same way. Kept framework-free (vanilla ES modules) per the spec's stack.
// ============================================================================

import { iconGlyph } from '../data/icons.js';

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

export function icon(key, extraClass = '') {
  return el('span', { class: `icon icon--${key} ${extraClass}`.trim() }, iconGlyph(key));
}

export function card(title, contentNodes, extraClass = '') {
  return el('div', { class: `panel-card ${extraClass}`.trim() }, [
    title ? el('h3', { class: 'panel-card__title' }, title) : null,
    el('div', { class: 'panel-card__body' }, contentNodes),
  ]);
}

export function statBar(label, current, max, kind) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
  return el('div', { class: `stat-bar stat-bar--${kind}` }, [
    el('div', { class: 'stat-bar__label' }, [icon(kind), el('span', {}, label)]),
    el('div', { class: 'stat-bar__track' }, [
      el('div', { class: 'stat-bar__fill', style: `width:${pct}%` }),
    ]),
    el('div', { class: 'stat-bar__value' }, `${Math.round(current)} / ${Math.round(max)}`),
  ]);
}

export function button(label, onClick, { variant = 'primary', disabled = false } = {}) {
  return el('button', {
    class: `btn btn--${variant}${disabled ? ' btn--disabled' : ''}`,
    onClick: disabled ? null : onClick,
    disabled: disabled ? 'true' : null,
  }, label);
}

export function emptyState(message) {
  return el('div', { class: 'empty-state' }, message);
}

export function loadingState(message) {
  return el('div', { class: 'loading-state' }, [
    el('div', { class: 'spinner' }),
    el('span', {}, message),
  ]);
}
