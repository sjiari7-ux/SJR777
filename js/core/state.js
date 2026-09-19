// ============================================================================
// STATE — the single source of truth for client-side game state.
// No other file should declare its own top-level mutable globals; read
// gameState via getState() and mutate only via setState()/produce().
// Persistent gameplay fields are the server's responsibility to validate —
// this file just holds whatever the server/Firestore last told us is true,
// plus purely local UI state (see LOCAL_UI_KEYS).
// ============================================================================

import { STATE_VERSION, CHARACTER_DEFAULTS } from './constants.js';
import { createEventBus, deepClone } from './utils.js';

export const bus = createEventBus();

// Local-only UI state — never synced to Firestore, safe to keep in memory
// (and optionally localStorage) only.
const initialLocalUI = {
  activeTab: 'home',
  openModal: null,
  searchText: '',
  filters: {},
  map: { zoom: 1, pan: { x: 0, y: 0 }, selectedTerritory: null },
  toasts: [],
};

// Authoritative-ish gameplay state mirror. Real writes to gold/xp/level/etc.
// happen server-side (Cloud Functions); the client applies the resulting
// snapshot here. Shape matches section 65/66 of the design spec.
function freshState() {
  return {
    version: STATE_VERSION,
    auth: { uid: null, isGuest: false, ready: false },
    player: null,          // profile fields (section 6) once loaded
    inventory: {},         // resourceId/itemId -> quantity
    equipment: {},         // slot -> gearId
    gearBag: [],           // owned unequipped gear instances
    combat: null,          // active battle state, or null
    market: { resourceListings: [], gearListings: [], watched: [] },
    companies: [],
    kingdom: null,
    territory: { selected: null, wars: [], core: null },
    pvp: { opponents: [], protectionUntil: 0 },
    season: null,
    election: null,
    notifications: [],
    ui: deepClone(initialLocalUI),
  };
}

let gameState = freshState();

export function getState() {
  return gameState;
}

// Shallow-merge patch into gameState, then notify listeners of the paths
// that changed so UI modules can re-render only what's needed.
export function setState(patch, { silent = false } = {}) {
  gameState = { ...gameState, ...patch };
  if (!silent) {
    for (const key of Object.keys(patch)) {
      bus.emit(`state:${key}`, gameState[key]);
    }
    bus.emit('state:*', gameState);
  }
  return gameState;
}

// Convenience for nested updates, e.g. produce('ui', ui => ({...ui, activeTab: 'market'}))
export function produce(key, updater) {
  const next = updater(gameState[key]);
  setState({ [key]: next });
  return next;
}

export function resetState() {
  gameState = freshState();
  bus.emit('state:*', gameState);
}

// ----------------------------------------------------------------------
// Migration support (section 79). Add a new function to MIGRATIONS keyed
// by the version it upgrades *to* whenever STATE_VERSION is bumped.
// ----------------------------------------------------------------------
const MIGRATIONS = {
  // 2: (state) => { ...state, someNewField: defaultValue },
};

export function migrate(rawState) {
  let state = rawState;
  let fromVersion = state.version || 1;
  while (fromVersion < STATE_VERSION) {
    fromVersion += 1;
    const step = MIGRATIONS[fromVersion];
    if (step) state = step(state);
    state.version = fromVersion;
  }
  return state;
}

export function newPlayerDefaults(uid, username, classId) {
  return {
    uid,
    username,
    avatar: null,
    bio: '',
    level: CHARACTER_DEFAULTS.level,
    xp: CHARACTER_DEFAULTS.xp,
    gold: CHARACTER_DEFAULTS.gold,
    energy: CHARACTER_DEFAULTS.energy,
    maxEnergy: CHARACTER_DEFAULTS.maxEnergy,
    health: CHARACTER_DEFAULTS.health,
    maxHealth: CHARACTER_DEFAULTS.maxHealth,
    mana: CHARACTER_DEFAULTS.mana,
    maxMana: CHARACTER_DEFAULTS.maxMana,
    storageCapacity: CHARACTER_DEFAULTS.storage,
    class: classId,
    classSkills: {},
    classSkillPoints: 0,
    classResets: 0,
    lastClassReset: null,
    generalSkills: {},
    skillPoints: 0,
    kingdom: null,
    kingdomRole: null,
    pvpRating: 1000,
    pvpWins: 0,
    pvpLosses: 0,
    prestige: { points: 0, gatherBonus: 0, sellBonus: 0, energyBonus: 0, storageBonus: 0 },
    stats: {},
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
}
