// ============================================================================
// MAIN — application entry point. Kept thin: wire modules together, then
// hand off to the router.
// ============================================================================

import { mountNavigation } from './ui/navigation.js';
import { registerAllRoutes } from './ui/renderer.js';
import { initRouter, rerenderCurrent } from './core/router.js';
import { setState, getState, bus } from './core/state.js';
import { watchAuthState, isGuestUser } from './services/auth.js';
import { getPlayerDoc, subscribePlayerDoc } from './services/firestore.js';
import { toast } from './ui/toast.js';

let unsubscribePlayer = null;

function wireAuth() {
  watchAuthState(async (user) => {
    // Tear down any previous player subscription before switching accounts.
    if (unsubscribePlayer) { unsubscribePlayer(); unsubscribePlayer = null; }

    if (!user) {
      setState({ auth: { uid: null, isGuest: false, ready: true }, player: null });
      return;
    }

    setState({ auth: { uid: user.uid, isGuest: isGuestUser(user), ready: true } });

    try {
      const existing = await getPlayerDoc(user.uid);
      setState({ player: existing });
    } catch (err) {
      toast.error('Could not load your character. Check your connection.');
      console.error('[main] getPlayerDoc failed', err);
    }

    unsubscribePlayer = subscribePlayerDoc(user.uid, (player) => {
      setState({ player });
    });
  });
}

function main() {
  const header = document.getElementById('app-header');
  const bottomNav = document.getElementById('app-bottom-nav');

  mountNavigation(header, bottomNav);
  registerAllRoutes();

  bus.on('state:auth', () => rerenderCurrent());
  bus.on('state:player', () => rerenderCurrent());

  wireAuth();
  initRouter('home');
}

document.addEventListener('DOMContentLoaded', main);
