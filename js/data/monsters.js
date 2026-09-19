// ============================================================================
// MONSTERS — static PvE monster definitions, grouped by zone.
// stats scale roughly with the zone's level band; combat.js applies the
// player's class multipliers and skills on top of these base numbers.
// ============================================================================

export const MONSTERS = Object.freeze({
  plains: [
    { id: 'wild_boar',    name: 'Wild Boar',    hp: 40,  atk: 5,  def: 2, spd: 8,  xp: 12, gold: [3, 8],  drops: ['leather', 'food'] },
    { id: 'forest_wolf',  name: 'Forest Wolf',  hp: 55,  atk: 7,  def: 3, spd: 12, xp: 16, gold: [4, 10], drops: ['leather'] },
    { id: 'bandit_scout', name: 'Bandit Scout', hp: 60,  atk: 8,  def: 4, spd: 10, xp: 18, gold: [6, 14], drops: ['gold', 'cloth'] },
  ],
  forest: [
    { id: 'dire_wolf',    name: 'Dire Wolf',    hp: 120, atk: 14, def: 6,  spd: 14, xp: 40,  gold: [10, 22], drops: ['leather', 'wood'] },
    { id: 'treant',       name: 'Treant',       hp: 200, atk: 12, def: 14, spd: 5,  xp: 55,  gold: [12, 26], drops: ['wood', 'herbs'] },
    { id: 'forest_witch', name: 'Forest Witch', hp: 140, atk: 20, def: 5,  spd: 11, xp: 60,  gold: [14, 30], drops: ['herbs', 'magic_stones'] },
  ],
  mountain: [
    { id: 'rock_golem',   name: 'Rock Golem',   hp: 400, atk: 22, def: 22, spd: 4,  xp: 120, gold: [25, 55], drops: ['stone', 'iron'] },
    { id: 'harpy',        name: 'Harpy',        hp: 260, atk: 30, def: 10, spd: 20, xp: 130, gold: [28, 60], drops: ['feather', 'gold'] },
    { id: 'mountain_troll',name: 'Mountain Troll', hp: 500, atk: 26, def: 18, spd: 7, xp: 150, gold: [30, 65], drops: ['iron', 'coal'] },
  ],
  cave: [
    { id: 'cave_spider',  name: 'Cave Spider',  hp: 600,  atk: 40, def: 18, spd: 22, xp: 300, gold: [50, 100], drops: ['silk', 'gemstones'] },
    { id: 'dark_dwarf',   name: 'Dark Dwarf',   hp: 800,  atk: 35, def: 30, spd: 10, xp: 320, gold: [55, 110], drops: ['iron', 'silver'] },
    { id: 'crystal_bat',  name: 'Crystal Bat',  hp: 500,  atk: 45, def: 15, spd: 28, xp: 310, gold: [50, 105], drops: ['gemstones', 'magic_stones'] },
  ],
  swamp: [
    { id: 'bog_hydra',    name: 'Bog Hydra',    hp: 1400, atk: 60, def: 28, spd: 12, xp: 650, gold: [100, 200], drops: ['leather', 'magic_stones'] },
    { id: 'plague_wraith',name: 'Plague Wraith',hp: 1100, atk: 75, def: 20, spd: 24, xp: 700, gold: [110, 220], drops: ['magic_stones', 'gold'] },
    { id: 'swamp_ogre',   name: 'Swamp Ogre',   hp: 1700, atk: 55, def: 35, spd: 8,  xp: 680, gold: [105, 210], drops: ['food', 'leather'] },
  ],
  darkzone: [
    { id: 'shadow_knight',name: 'Shadow Knight',hp: 3000, atk: 110, def: 60, spd: 18, xp: 1500, gold: [250, 500], drops: ['magic_stones', 'gemstones'] },
    { id: 'void_dragon',  name: 'Void Dragon',  hp: 5000, atk: 140, def: 50, spd: 22, xp: 2200, gold: [350, 700], drops: ['magic_stones', 'gold'] },
    { id: 'ancient_lich', name: 'Ancient Lich', hp: 3800, atk: 130, def: 45, spd: 20, xp: 1900, gold: [300, 600], drops: ['magic_stones', 'gemstones'] },
  ],
});

export function getMonstersForZone(zoneId) {
  return MONSTERS[zoneId] || [];
}
