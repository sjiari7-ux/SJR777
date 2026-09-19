// ============================================================================
// CLASSES — single source of truth for the five playable classes.
// Adding a new class: add one entry here; combat.js and the character-creation
// UI both read from this file and need no changes.
// ============================================================================

export const CLASSES = Object.freeze({
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    role: 'Balanced damage and defense.',
    description: 'The Warrior builds Rage from hits dealt and received and can unleash powerful attacks.',
    resource: { id: 'rage', name: 'Rage' },
    multipliers: { hp: 1.60, atk: 1.20, def: 1.40, spd: 0.85, dodge: 0.75, crit: 0.85 },
    skills: {
      powerStrike: { id: 'powerStrike', name: 'Power Strike', desc: 'Strong attack with extra energy cost.', perLevel: { damageBonus: 0.05, critBonus: 0.02 } },
      ironArmor:   { id: 'ironArmor',   name: 'Iron Armor',    desc: 'Temporarily increases defense.',       perLevel: { defenseBonus: 3, damageReduction: 0.02 } },
      warriorSpirit:{ id: 'warriorSpirit', name: 'Warrior Spirit', desc: 'Recovers HP after battles.',       perLevel: { regenBonus: 0.03 } },
    },
    starterGear: {
      weapon: { name: 'Iron Sword', damage: 4 },
      armor:  { name: 'Iron Armor', defense: 0.05, health: 10 },
    },
  },

  archer: {
    id: 'archer',
    name: 'Archer',
    role: 'High damage, speed and evasion.',
    description: 'Builds Precision through clean hits. A monster critical hit resets the Precision chain.',
    resource: { id: 'precision', name: 'Precision' },
    multipliers: { hp: 0.85, atk: 1.45, def: 0.75, spd: 1.50, dodge: 1.35, crit: 1.45 },
    skills: {
      keenEye:      { id: 'keenEye',      name: 'Keen Eye',      desc: 'Improves crit chance and armor pierce.', perLevel: { critBonus: 0.04, pierceBonus: 0.02 } },
      swiftness:    { id: 'swiftness',    name: 'Swiftness',     desc: 'Improves speed and dodge.',              perLevel: { speedBonus: 3, dodgeBonus: 0.02 } },
      efficientAim: { id: 'efficientAim', name: 'Efficient Aim', desc: 'Reduces energy cost of attacks.',        perLevel: { energyCostReduction: 0.02 } },
    },
    starterGear: {
      weapon: { name: 'Longbow', damage: 6 },
      armor:  { name: 'Leather Vest', defense: 0.02, health: 5 },
    },
  },

  mage: {
    id: 'mage',
    name: 'Mage',
    role: 'Extremely high damage but low durability.',
    description: 'Uses Mana. Can perform an Overload Blast that consumes double mana for greatly increased damage, at the risk of Exhaustion.',
    resource: { id: 'mana', name: 'Mana' },
    multipliers: { hp: 0.65, atk: 1.65, def: 0.65, spd: 1.00, dodge: 0.95, crit: 1.25 },
    skills: {
      arcanePower: { id: 'arcanePower', name: 'Arcane Power', desc: 'Raises spell damage and pierce.', perLevel: { damageBonus: 0.06, pierceBonus: 0.03 } },
      magicShield: { id: 'magicShield', name: 'Magic Shield', desc: 'Raises magic resistance.',        perLevel: { magicResistBonus: 0.04 } },
      manaForce:   { id: 'manaForce',   name: 'Mana Force',   desc: 'Raises max energy, lowers energy cost.', perLevel: { maxEnergyBonus: 5, energyCostReduction: 0.02 } },
    },
    starterGear: {
      weapon: { name: 'Magic Staff', damage: 8 },
      armor:  { name: 'Cloth Robe', defense: 0.01, health: 3 },
    },
  },

  commander: {
    id: 'commander',
    name: 'Commander',
    role: 'Tank / kingdom-war specialist.',
    description: 'Builds Command Points, which persist between battles and can be spent in kingdom wars and Ancient Core sieges.',
    resource: { id: 'commandPoints', name: 'Command Points' },
    multipliers: { hp: 1.35, atk: 1.05, def: 1.30, spd: 0.95, dodge: 0.85, crit: 0.90 },
    skills: {
      warBanner:   { id: 'warBanner',   name: 'War Banner',   desc: 'Raises damage.',            perLevel: { damageBonus: 0.035 } },
      ironWill:    { id: 'ironWill',    name: 'Iron Will',    desc: 'Raises defense.',            perLevel: { defenseBonus: 2, damageReduction: 0.025 } },
      commandAura: { id: 'commandAura', name: 'Command Aura', desc: 'Raises max HP and Command Point gain.', perLevel: { maxHpBonus: 6, commandPointGainBonus: 0.08 } },
    },
    warBonus: { commandCost: 20, warDamageBonus: 0.30 },
    starterGear: {
      weapon: { name: 'Officer Blade', damage: 3 },
      armor:  { name: 'Banner Plate', defense: 0.06, health: 12 },
    },
  },

  merchant: {
    id: 'merchant',
    name: 'Merchant',
    role: 'Economic specialist.',
    description: 'Builds Fortune through valuable loot and victories. Losing a fight reduces Fortune significantly.',
    resource: { id: 'fortune', name: 'Fortune' },
    multipliers: { hp: 1.10, atk: 1.05, def: 1.05, spd: 1.05, dodge: 1.05, crit: 1.05 },
    skills: {
      profitableDeal: { id: 'profitableDeal', name: 'Profitable Deal', desc: 'Raises sell price.',   perLevel: { sellBonus: 0.03 } },
      deepPockets:    { id: 'deepPockets',    name: 'Deep Pockets',    desc: 'Raises battle gold.',   perLevel: { battleGoldBonus: 0.05 } },
      lucky:          { id: 'lucky',          name: 'Lucky',           desc: 'Raises loot chance.',    perLevel: { lootChanceBonus: 0.03 } },
    },
    starterGear: {
      weapon: { name: 'Golden Dagger', damage: 3 },
      armor:  { name: 'Merchant Vest', defense: 0.03, health: 6 },
    },
  },
});

export const CLASS_IDS = Object.freeze(Object.keys(CLASSES));

export function getClass(id) {
  return CLASSES[id] || null;
}
