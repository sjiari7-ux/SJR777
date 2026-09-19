// ============================================================================
// RECIPES — single source of truth for every craftable good.
// inputs/outputs reference resource ids (resources.js) or other crafted
// item ids defined in this same file (goods can chain into other goods).
// ============================================================================

export const RECIPES = Object.freeze({
  plank:          { id: 'plank',          name: 'Plank',                  inputs: { wood: 10 },                              outputQty: 5, energy: 2,  xp: 5,  levelReq: 1 },
  brick:          { id: 'brick',          name: 'Brick',                  inputs: { stone: 10, water: 3 },                   outputQty: 5, energy: 3,  xp: 6,  levelReq: 1 },
  bread:          { id: 'bread',          name: 'Bread',                  inputs: { food: 8, water: 2 },                     outputQty: 4, energy: 2,  xp: 5,  levelReq: 1 },
  rations:        { id: 'rations',        name: 'Rations',                inputs: { food: 6, salt: 2 },                      outputQty: 3, energy: 2,  xp: 5,  levelReq: 1 },
  tannedLeather:  { id: 'tannedLeather',  name: 'Tanned Leather',         inputs: { leather: 8, salt: 2 },                   outputQty: 4, energy: 3,  xp: 8,  levelReq: 3 },
  steel:          { id: 'steel',          name: 'Steel',                  inputs: { iron: 12, coal: 8 },                     outputQty: 3, energy: 4,  xp: 12, levelReq: 5 },
  paper:          { id: 'paper',          name: 'Paper',                  inputs: { wood: 6, water: 4 },                     outputQty: 4, energy: 3,  xp: 8,  levelReq: 5 },
  cloth:          { id: 'cloth',          name: 'Cloth',                  inputs: { cotton: 10 },                            outputQty: 5, energy: 3,  xp: 7,  levelReq: 3 },
  glass:          { id: 'glass',          name: 'Glass',                  inputs: { sand: 10, coal: 2 },                     outputQty: 4, energy: 4,  xp: 10, levelReq: 8 },
  bronze:         { id: 'bronze',         name: 'Bronze',                 inputs: { copper: 8, zinc: 4 },                    outputQty: 3, energy: 4,  xp: 12, levelReq: 10 },
  concrete:       { id: 'concrete',       name: 'Concrete',               inputs: { stone: 10, sand: 6, water: 4 },          outputQty: 3, energy: 5,  xp: 14, levelReq: 12 },
  jewelry:        { id: 'jewelry',        name: 'Jewelry',                inputs: { gold: 8, gemstones: 4, silver: 2 },      outputQty: 2, energy: 8,  xp: 35, levelReq: 20 },
  woodenBow:      { id: 'woodenBow',      name: 'Wooden Bow',             inputs: { plank: 4, leather: 2 },                  outputQty: 1, energy: 4,  xp: 10, levelReq: 4 },
  potionBase:     { id: 'potionBase',     name: 'Potion Base',            inputs: { herbs: 4, water: 4 },                    outputQty: 3, energy: 2,  xp: 6,  levelReq: 2 },
  trainingWeights:{ id: 'trainingWeights',name: 'Training Weights',       inputs: { iron: 6, wood: 4 },                      outputQty: 1, energy: 4,  xp: 10, levelReq: 6 },
  magicCore:      { id: 'magicCore',      name: 'Magic Core',             inputs: { magic_stones: 5, gemstones: 3, gold: 2 },outputQty: 1, energy: 10, xp: 50, levelReq: 30 },

  healthPotion:   { id: 'healthPotion',   name: 'Health Potion',          inputs: { potionBase: 2, herbs: 2 },               outputQty: 2, energy: 3,  xp: 8,  levelReq: 3,  effect: { heal: 40 } },
  energyPotion:   { id: 'energyPotion',   name: 'Energy Potion',          inputs: { potionBase: 2, honey: 2 },               outputQty: 2, energy: 3,  xp: 8,  levelReq: 3,  effect: { energy: 30 } },
  smallEnergyPotion:  { id: 'smallEnergyPotion',  name: 'Small Energy Potion',  inputs: { potionBase: 1, honey: 1 },         outputQty: 2, energy: 2,  xp: 5,  levelReq: 1,  effect: { energy: 15 } },
  mediumEnergyPotion: { id: 'mediumEnergyPotion', name: 'Medium Energy Potion', inputs: { potionBase: 2, honey: 2 },         outputQty: 2, energy: 3,  xp: 10, levelReq: 8,  effect: { energy: 35 } },
  largeEnergyPotion:  { id: 'largeEnergyPotion',  name: 'Large Energy Potion',  inputs: { potionBase: 4, honey: 3 },         outputQty: 2, energy: 5,  xp: 20, levelReq: 18, effect: { energy: 60 } },
  legendaryEnergyPotion: { id: 'legendaryEnergyPotion', name: 'Legendary Energy Potion', inputs: { potionBase: 8, honey: 6, magic_stones: 2 }, outputQty: 1, energy: 10, xp: 60, levelReq: 45, effect: { energy: 100 } },

  toastedBread:   { id: 'toastedBread',   name: 'Toasted Bread',          inputs: { bread: 2, coal: 1 },                     outputQty: 2, energy: 2,  xp: 6,  levelReq: 2,  effect: { heal: 15 } },
  honeyBread:     { id: 'honeyBread',     name: 'Honey Bread',            inputs: { bread: 2, honey: 2 },                    outputQty: 2, energy: 3,  xp: 9,  levelReq: 6,  effect: { heal: 30 } },
  legendaryBread: { id: 'legendaryBread', name: 'Legendary Bread',        inputs: { honeyBread: 2, magic_stones: 1 },        outputQty: 1, energy: 8,  xp: 40, levelReq: 35, effect: { heal: 100 } },
});

export const RECIPE_IDS = Object.freeze(Object.keys(RECIPES));

export function getRecipe(id) {
  return RECIPES[id] || null;
}
