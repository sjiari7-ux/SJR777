// ============================================================================
// ROUTER — lightweight hash-based router for the main tab navigation.
// Tabs are UI-only state (never synced to Firestore) so this stays purely
// client-side. Each route maps to a render function registered by ui/*.
// ============================================================================

import { produce, bus } from './state.js';

const routes = new Map();

export function registerRoute(tabId, renderFn) {
  routes.set(tabId, renderFn);
}

export function navigate(tabId) {
  if (!routes.has(tabId)) {
    console.warn(`[router] unknown tab "${tabId}"`);
    return;
  }
  produce('ui', ui => ({ ...ui, activeTab: tabId, openModal: null }));
  window.location.hash = tabId;
  render(tabId);
}

function render(tabId) {
  const fn = routes.get(tabId);
  const outlet = document.getElementById('view-outlet');
  if (!fn || !outlet) return;
  outlet.innerHTML = '';
  fn(outlet);
  bus.emit('route:changed', tabId);
}

export function rerenderCurrent() {
  const current = window.location.hash.replace('#', '');
  render(routes.has(current) ? current : [...routes.keys()][0]);
}

export function initRouter(defaultTab = 'home') {
  const fromHash = window.location.hash.replace('#', '');
  const startTab = routes.has(fromHash) ? fromHash : defaultTab;
  window.addEventListener('hashchange', () => {
    const tab = window.location.hash.replace('#', '');
    if (routes.has(tab)) {
      produce('ui', ui => ({ ...ui, activeTab: tab, openModal: null }));
      render(tab);
    }
  });
  navigate(startTab);
}
