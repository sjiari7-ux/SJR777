// ============================================================================
// UTILS — small, pure helper functions shared across the codebase.
// Nothing here touches gameState or the DOM directly.
// ============================================================================

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return '0';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.round(n).toLocaleString();
}

export function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m && !d) parts.push(`${m}m`);
  if (sec && !d && !h) parts.push(`${sec}s`);
  return parts.length ? parts.join(' ') : '0s';
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function nowMs() {
  return Date.now();
}

// Simple event bus so systems/UI don't need to import each other directly.
export function createEventBus() {
  const listeners = new Map();
  return {
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return () => listeners.get(event)?.delete(fn);
    },
    emit(event, payload) {
      listeners.get(event)?.forEach(fn => {
        try { fn(payload); } catch (err) { console.error(`[eventBus] listener for "${event}" threw`, err); }
      });
    },
  };
}

// Guards against double-submit exploits (double-click buy, repeated form
// submission) on any async action. Wrap the handler: onClick={guard(fn)}.
export function createActionGuard() {
  const inFlight = new Set();
  return function guard(key, fn) {
    return async (...args) => {
      if (inFlight.has(key)) return;
      inFlight.add(key);
      try {
        return await fn(...args);
      } finally {
        inFlight.delete(key);
      }
    };
  };
}
