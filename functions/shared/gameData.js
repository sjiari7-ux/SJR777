// ============================================================================
// SHARED GAME DATA (Cloud Functions) — the ONE place server-side numbers are
// mirrored from the client's source of truth. Every Cloud Function file
// requires its constants from here instead of redefining its own copies.
//
// Source of truth (keep these numerically in sync when rebalancing):
//   js/core/constants.js   -> REGEN, GENERAL_SKILLS, CLASS_SKILL, ADVENTURE_ZONES, COMBAT, xpForLevel
//   js/data/classes.js     -> CLASSES (multipliers, skills)
//   js/data/monsters.js    -> MONSTERS
// ============================================================================

const REGEN = {
  energyIntervalMs: 5 * 60 * 1000,
  healthIntervalMs: 30 * 1000,
  manaIntervalMs: 60 * 1000,
};
const REGEN_AMOUNT_PER_TICK = { energy: 1, health: 1, mana: 1 };

const GENERAL_SKILLS = {
  health:     { perLevel: 20,   maxLevel: 20 },
  damage:     { perLevel: 2,    maxLevel: 20 },
  defense:    { perLevel: 0.05, maxLevel: 15 },
  stamina:    { perLevel: 5,    maxLevel: 20 },
  storage:    { perLevel: 50,   maxLevel: 20 },
  profit:     { perLevel: 0.02, maxLevel: 20 },
  adventurer: { perLevel: 1,    maxLevel: 20 },
};

const CLASS_SKILL_MAX_LEVEL = 10;
const CLASS_SKILL_POINT_COSTS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
const SKILL_POINTS_PER_LEVEL = 1;
const CLASS_SKILL_POINTS_PER_LEVEL = 1;

const COMBAT = { maxSingleHitDamage: 10000 };

const ADVENTURE_ZONES = {
  plains:   { minLevel: 1,  maxLevel: 10,  energyCost: 10 },
  forest:   { minLevel: 10, maxLevel: 25,  energyCost: 12 },
  mountain: { minLevel: 25, maxLevel: 40,  energyCost: 14 },
  cave:     { minLevel: 40, maxLevel: 55,  energyCost: 16 },
  swamp:    { minLevel: 55, maxLevel: 70,  energyCost: 18 },
  darkzone: { minLevel: 70, maxLevel: 999, energyCost: 20 },
};

// multipliers + first (primary) class skill only — full skill trees stay
// client-side display data; combat only needs the numeric multipliers here.
const CLASSES = {
  warrior:   { multipliers: { hp: 1.60, atk: 1.20, def: 1.40, spd: 0.85, dodge: 0.75, crit: 0.85 }, skillIds: ['powerStrike', 'ironArmor', 'warriorSpirit'] },
  archer:    { multipliers: { hp: 0.85, atk: 1.45, def: 0.75, spd: 1.50, dodge: 1.35, crit: 1.45 }, skillIds: ['keenEye', 'swiftness', 'efficientAim'] },
  mage:      { multipliers: { hp: 0.65, atk: 1.65, def: 0.65, spd: 1.00, dodge: 0.95, crit: 1.25 }, skillIds: ['arcanePower', 'magicShield', 'manaForce'] },
  commander: { multipliers: { hp: 1.35, atk: 1.05, def: 1.30, spd: 0.95, dodge: 0.85, crit: 0.90 }, skillIds: ['warBanner', 'ironWill', 'commandAura'] },
  merchant:  { multipliers: { hp: 1.10, atk: 1.05, def: 1.05, spd: 1.05, dodge: 1.05, crit: 1.05 }, skillIds: ['profitableDeal', 'deepPockets', 'lucky'] },
};

const MONSTERS = {
  plains: [
    { id: 'wild_boar',    name: 'Wild Boar',    hp: 40,  atk: 5,  def: 2, spd: 8,  xp: 12, gold: [3, 8] },
    { id: 'forest_wolf',  name: 'Forest Wolf',  hp: 55,  atk: 7,  def: 3, spd: 12, xp: 16, gold: [4, 10] },
    { id: 'bandit_scout', name: 'Bandit Scout', hp: 60,  atk: 8,  def: 4, spd: 10, xp: 18, gold: [6, 14] },
  ],
  forest: [
    { id: 'dire_wolf',    name: 'Dire Wolf',    hp: 120, atk: 14, def: 6,  spd: 14, xp: 40, gold: [10, 22] },
    { id: 'treant',       name: 'Treant',       hp: 200, atk: 12, def: 14, spd: 5,  xp: 55, gold: [12, 26] },
    { id: 'forest_witch', name: 'Forest Witch', hp: 140, atk: 20, def: 5,  spd: 11, xp: 60, gold: [14, 30] },
  ],
  mountain: [
    { id: 'rock_golem',    name: 'Rock Golem',    hp: 400, atk: 22, def: 22, spd: 4, xp: 120, gold: [25, 55] },
    { id: 'harpy',         name: 'Harpy',         hp: 260, atk: 30, def: 10, spd: 20, xp: 130, gold: [28, 60] },
    { id: 'mountain_troll',name: 'Mountain Troll',hp: 500, atk: 26, def: 18, spd: 7, xp: 150, gold: [30, 65] },
  ],
  cave: [
    { id: 'cave_spider', name: 'Cave Spider', hp: 600, atk: 40, def: 18, spd: 22, xp: 300, gold: [50, 100] },
    { id: 'dark_dwarf',  name: 'Dark Dwarf',  hp: 800, atk: 35, def: 30, spd: 10, xp: 320, gold: [55, 110] },
    { id: 'crystal_bat', name: 'Crystal Bat', hp: 500, atk: 45, def: 15, spd: 28, xp: 310, gold: [50, 105] },
  ],
  swamp: [
    { id: 'bog_hydra',     name: 'Bog Hydra',     hp: 1400, atk: 60, def: 28, spd: 12, xp: 650, gold: [100, 200] },
    { id: 'plague_wraith', name: 'Plague Wraith', hp: 1100, atk: 75, def: 20, spd: 24, xp: 700, gold: [110, 220] },
    { id: 'swamp_ogre',    name: 'Swamp Ogre',    hp: 1700, atk: 55, def: 35, spd: 8,  xp: 680, gold: [105, 210] },
  ],
  darkzone: [
    { id: 'shadow_knight', name: 'Shadow Knight', hp: 3000, atk: 110, def: 60, spd: 18, xp: 1500, gold: [250, 500] },
    { id: 'void_dragon',   name: 'Void Dragon',   hp: 5000, atk: 140, def: 50, spd: 22, xp: 2200, gold: [350, 700] },
    { id: 'ancient_lich',  name: 'Ancient Lich',  hp: 3800, atk: 130, def: 45, spd: 20, xp: 1900, gold: [300, 600] },
  ],
};

function xpForLevel(level) {
  return Math.round(35 * Math.pow(level, 1.4));
}

module.exports = {
  REGEN, REGEN_AMOUNT_PER_TICK, GENERAL_SKILLS,
  CLASS_SKILL_MAX_LEVEL, CLASS_SKILL_POINT_COSTS, SKILL_POINTS_PER_LEVEL, CLASS_SKILL_POINTS_PER_LEVEL,
  COMBAT, ADVENTURE_ZONES, CLASSES, MONSTERS, xpForLevel,
};
