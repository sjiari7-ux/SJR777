// ============================================================================
// RESOURCES — single source of truth for every raw resource in the game.
// ============================================================================

export const RESOURCES = Object.freeze({
  wood:         { id: 'wood',         name: 'Wood',         icon: 'wood',         basePrice: 4 },
  stone:        { id: 'stone',        name: 'Stone',        icon: 'stone',        basePrice: 5 },
  food:         { id: 'food',         name: 'Food',         icon: 'food',         basePrice: 3 },
  coal:         { id: 'coal',         name: 'Coal',         icon: 'coal',         basePrice: 6 },
  iron:         { id: 'iron',         name: 'Iron',         icon: 'iron',         basePrice: 8 },
  gold:         { id: 'gold',         name: 'Gold',         icon: 'gold',         basePrice: 20 },
  cotton:       { id: 'cotton',       name: 'Cotton',       icon: 'cotton',       basePrice: 3 },
  leather:      { id: 'leather',      name: 'Leather',      icon: 'leather',      basePrice: 6 },
  sand:         { id: 'sand',         name: 'Sand',         icon: 'sand',         basePrice: 2 },
  gemstones:    { id: 'gemstones',    name: 'Gemstones',    icon: 'gemstones',    basePrice: 30 },
  water:        { id: 'water',        name: 'Water',        icon: 'water',        basePrice: 1 },
  salt:         { id: 'salt',         name: 'Salt',         icon: 'salt',         basePrice: 4 },
  copper:       { id: 'copper',       name: 'Copper',       icon: 'copper',       basePrice: 7 },
  silver:       { id: 'silver',       name: 'Silver',       icon: 'silver',       basePrice: 15 },
  zinc:         { id: 'zinc',         name: 'Zinc',         icon: 'zinc',         basePrice: 9 },
  lead:         { id: 'lead',         name: 'Lead',         icon: 'lead',         basePrice: 5 },
  magic_stones: { id: 'magic_stones', name: 'Magic Stones', icon: 'magic_stones', basePrice: 25 },
  herbs:        { id: 'herbs',        name: 'Herbs',        icon: 'herbs',        basePrice: 4 },
  honey:        { id: 'honey',        name: 'Honey',        icon: 'honey',        basePrice: 8 },
});

export const RESOURCE_IDS = Object.freeze(Object.keys(RESOURCES));

export function getResource(id) {
  return RESOURCES[id] || null;
}
