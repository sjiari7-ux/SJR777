// ============================================================================
// ARCADIA — CENTRAL CONSTANTS
// Single source of truth for every tunable number in the game.
// Balance changes happen HERE, never scattered across systems/UI files.
// ============================================================================

export const STATE_VERSION = 1;

export const CHARACTER_DEFAULTS = Object.freeze({
  gold: 150,
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  mana: 20,
  maxMana: 20,
  storage: 500,
  level: 1,
  xp: 0,
});

export const REGEN = Object.freeze({
  energyIntervalMs: 5 * 60 * 1000,   // 5 minutes
  healthIntervalMs: 30 * 1000,       // 30 seconds
  manaIntervalMs: 60 * 1000,         // 1 minute (mana ticks with health-like cadence)
});

export function xpForLevel(level) {
  return Math.round(35 * Math.pow(level, 1.4));
}

export const CLASS_SKILL = Object.freeze({
  maxLevel: 10,
  // cost to go from level N-1 -> N, index 0 = cost of level 1
  pointCosts: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
});

export const GENERAL_SKILLS = Object.freeze({
  health:   { perLevel: 20,   maxLevel: 20, label: 'Health',   unit: 'max HP' },
  damage:   { perLevel: 2,    maxLevel: 20, label: 'Damage',   unit: 'combat damage' },
  defense:  { perLevel: 0.05, maxLevel: 15, label: 'Defense',  unit: 'damage reduction' },
  stamina:  { perLevel: 5,    maxLevel: 20, label: 'Stamina',  unit: 'max energy' },
  storage:  { perLevel: 50,   maxLevel: 20, label: 'Storage',  unit: 'capacity' },
  profit:   { perLevel: 0.02, maxLevel: 20, label: 'Profit',   unit: 'sell multiplier' },
  adventurer:{ perLevel: 1,   maxLevel: 20, label: 'Adventurer', unit: 'gathered resource' },
});

export const COMBAT = Object.freeze({
  maxSingleHitDamage: 10000,
});

export const ADVENTURE_ZONES = Object.freeze([
  { id: 'plains',    name: 'Plains',    minLevel: 1,  maxLevel: 10,  energyCost: 10 },
  { id: 'forest',     name: 'Forest',    minLevel: 10, maxLevel: 25,  energyCost: 12 },
  { id: 'mountain',   name: 'Mountain',  minLevel: 25, maxLevel: 40,  energyCost: 14 },
  { id: 'cave',       name: 'Cave',      minLevel: 40, maxLevel: 55,  energyCost: 16 },
  { id: 'swamp',      name: 'Swamp',     minLevel: 55, maxLevel: 70,  energyCost: 18 },
  { id: 'darkzone',   name: 'Dark Zone', minLevel: 70, maxLevel: 999, energyCost: 20 },
]);

export const COMPANIES = Object.freeze({
  maxCompanies: 9,
  changeProductionCost: 500, // gold
  productionPerHourByLevel: [10, 15, 22, 32, 45, 60, 80, 105, 135, 170],
  // cost (in Concrete) to go from level N -> N+1, index 0 = cost of 1->2
  upgradeCost: [5, 10, 20, 35, 55, 80, 110, 150, 200],
});

export const GEAR = Object.freeze({
  bagCapacity: 40,
  slots: ['weapon', 'armor', 'helmet', 'boots', 'accessory', 'gloves'],
  slotStats: {
    weapon:    ['damage', 'stamina'],
    armor:     ['health', 'defense'],
    helmet:    ['defense', 'health'],
    boots:     ['stamina', 'defense'],
    accessory: ['profit', 'storage', 'health'],
    gloves:    ['damage', 'profit'],
  },
  tiers: {
    common:    { label: 'Common',    power: 1.00, minLevel: 1,  maxUpgrade: 0, statCount: 1, rollRange: [0.90, 1.30] },
    uncommon:  { label: 'Uncommon',  power: 1.25, minLevel: 10, maxUpgrade: 1, statCount: 2, rollRange: [0.90, 1.40] },
    rare:      { label: 'Rare',      power: 1.50, minLevel: 25, maxUpgrade: 2, statCount: 3, rollRange: [0.90, 1.50] },
    epic:      { label: 'Epic',      power: 2.00, minLevel: 40, maxUpgrade: 3, statCount: 4, rollRange: [1.00, 1.60] },
    legendary: { label: 'Legendary', power: 3.00, minLevel: 55, maxUpgrade: 5, statCount: 5, rollRange: [1.00, 1.80] },
    mythic:    { label: 'Mythic',    power: 4.00, minLevel: 70, maxUpgrade: 7, statCount: 6, rollRange: [1.10, 2.00] },
  },
});

export const MARKET = Object.freeze({
  priceHistoryLength: 12,
  priceUpdateIntervalMs: 15 * 1000,
  resourceListingsMaxPerQuery: 40,
  gearListingsMaxBrowse: 60,
});

export const PVP = Object.freeze({
  minLevel: 1,
  energyCost: 15,
  maxRounds: 25,
  opponentLevelSpread: 4,
  opponentLevelPercent: 0.20,
  opponentCount: 12,
  opponentRefreshCooldownMs: 30 * 1000,
  protectionMs: 5 * 60 * 1000,
  goldStealMin: 0.04,
  goldStealMax: 0.10,
  ratingDefault: 1000,
  ratingFloor: 100,
  eloK: 32,
  leaderboardTop: 100,
});

export const KINGDOM = Object.freeze({
  joinCooldownMs: 24 * 60 * 60 * 1000,
  roles: ['recruit', 'member', 'officer', 'coleader', 'leader'],
  roleRank: { recruit: 0, member: 1, officer: 2, coleader: 3, leader: 4 },
  inactivity: {
    daysThreshold: 7,
    activityThresholdPercent: 0.10,
  },
  donatableResources: ['gold', 'wood', 'stone', 'iron', 'food', 'herbs', 'gemstones', 'magic_stones'],
});

export const WAR = Object.freeze({
  roundDurationMs: 6 * 60 * 60 * 1000,
  roundsToWin: 2,
  warCooldownMs: 12 * 60 * 60 * 1000,
  attackEnergyCost: 8,
  baseDefense: 60,
  captureDefense: 90,
  reinforcement: { costGold: 200, defenseGain: 40 },
  declareWarCostGold: 0,
});

export const CORE = Object.freeze({
  routeIndices: [2, 3, 4], // territory indices in a zone that form the protected route
  cooldownMs: 12 * 60 * 60 * 1000,
  dividendBaseGold: 150,
  dividendBaseMagicStones: 8,
  dividendDecayMs: 72 * 60 * 60 * 1000,
  dividendFloorPercent: 0.40,
  dividendTickIntervalMs: 30 * 60 * 1000,
});

export const SEASON = Object.freeze({
  lengthDays: 30,
  historyKept: 20,
  rewards: { gold: 5000, magicStones: 200 },
  points: {
    coreDividendTick: 5,
    territoryCapture: 3,
    coreSiegeVictory: 40,
  },
});

export const ELECTION = Object.freeze({
  termDays: 7,
  votingWindowHours: 24,
  recruitCanRun: false,
});

export const PRESTIGE = Object.freeze({
  unlockLevel: 20,
  name: 'Spiritual Renewal',
});

export const MISSIONS = Object.freeze({
  periods: ['daily', 'weekly', 'monthly'],
});
