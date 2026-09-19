// ============================================================================
// NAVIGATION — renders both the desktop header nav and the mobile bottom
// nav from one shared tab list, so they can never drift out of sync.
// ============================================================================

import { el, icon } from './components.js';
import { navigate } from '../core/router.js';
import { bus, getState } from '../core/state.js';

export const TABS = [
  { id: 'home',       label: 'Home',       icon: 'kingdom' },
  { id: 'adventure',  label: 'Adventure',  icon: 'war' },
  { id: 'craft',      label: 'Craft',      icon: 'craft' },
  { id: 'market',     label: 'Market',     icon: 'market' },
  { id: 'pvp',        label: 'Arena',      icon: 'pvp' },
  { id: 'kingdom',    label: 'Kingdom',    icon: 'kingdom' },
  { id: 'territory',  label: 'World',      icon: 'territory' },
  { id: 'leaderboard',label: 'Ranks',      icon: 'leaderboard' },
  { id: 'profile',    label: 'Profile',    icon: 'settings' },
];

function tabButton(tab, activeTab) {
  return el('button', {
    class: `nav-tab${tab.id === activeTab ? ' nav-tab--active' : ''}`,
    onClick: () => navigate(tab.id),
    'aria-current': tab.id === activeTab ? 'page' : null,
  }, [icon(tab.icon, 'nav-tab__icon'), el('span', { class: 'nav-tab__label' }, tab.label)]);
}

export function renderHeaderNav(container) {
  const activeTab = getState().ui.activeTab;
  container.innerHTML = '';
  container.appendChild(el('div', { class: 'brand' }, [
    el('span', { class: 'brand__mark' }, '⚜'),
    el('span', { class: 'brand__name' }, 'ARCADIA'),
  ]));
  const nav = el('nav', { class: 'header-nav' }, TABS.map(t => tabButton(t, activeTab)));
  container.appendChild(nav);
  container.appendChild(el('button', { class: 'notif-bell', 'aria-label': 'Notifications' }, [icon('notification')]));
}

export function renderBottomNav(container) {
  const activeTab = getState().ui.activeTab;
  container.innerHTML = '';
  const primaryTabs = TABS.filter(t => ['home', 'adventure', 'market', 'kingdom', 'profile'].includes(t.id));
  container.appendChild(el('nav', { class: 'bottom-nav' }, primaryTabs.map(t => tabButton(t, activeTab))));
}

export function mountNavigation(headerEl, bottomEl) {
  renderHeaderNav(headerEl);
  renderBottomNav(bottomEl);
  bus.on('route:changed', () => {
    renderHeaderNav(headerEl);
    renderBottomNav(bottomEl);
  });
}
