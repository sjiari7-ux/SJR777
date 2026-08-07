function rollTier(playerLevel){
  const weights = [];
  GEAR_TIERS.forEach((t,i)=>{
    if(playerLevel < t.minLevel) weights.push(0);
    else if(i===0) weights.push(60);
    else if(i===1) weights.push(25);
    else if(i===2) weights.push(10);
    else if(i===3) weights.push(3.5);
    else if(i===4) weights.push(1.2);
    else weights.push(0.3);
  });
  const total = weights.reduce((a,b)=>a+b,0);
  let roll = Math.random()*total;
  for(let i=0;i<weights.length;i++){
    roll -= weights[i];
    if(roll <= 0) return i;
  }
  return 0;
}

function generateGear(slot, tierIdx){
  const tier = GEAR_TIERS[tierIdx];
  const name = GEAR_NAMES[slot][tierIdx];
  const stats = {};
  const chosen = [...STAT_POOL].sort(()=>Math.random()-0.5).slice(0, tier.numStats);
  chosen.forEach(stat=>{
    const baseVal = SKILLS[stat].perLevel * (1 + Math.floor(Math.random()*3));
    stats[stat] = Math.max(1, Math.round(baseVal * tier.power));
  });
  const gear = { id: Date.now()+Math.random(), slot, tier: tierIdx, upgradeLevel: 0, name, stats };
  gear.sellValue = tier.sellMin + Math.floor(Math.random()*(tier.sellMax-tier.sellMin));
  return gear;
}

function getGearEffectiveStats(gear){
  if(!gear) return {};
  const result = {};
  Object.keys(gear.stats).forEach(st=>{
    result[st] = Math.round(gear.stats[st] * (1 + gear.upgradeLevel * 0.1));
  });
  return result;
}

function getGearBonus(s, stat){
  let total = 0;
  Object.values(s.equipped).forEach(item=>{
    if(!item) return;
    const eff = getGearEffectiveStats(item);
    if(eff[stat]) total += eff[stat];
  });
  return total;
}

function getGearValue(gear){
  if(!gear) return 0;
  if(gear.sellValue) return Math.round(gear.sellValue * (1 + gear.upgradeLevel * 0.15));
  const t = GEAR_TIERS[gear.tier];
  let val = t.sellMin + Math.floor(Math.random()*(t.sellMax-t.sellMin));
  return Math.round(val * (1 + gear.upgradeLevel * 0.15));
}

function getGearScrapValue(gear){
  const t = GEAR_TIERS[gear.tier];
  return Math.max(1, Math.floor((t.sellMin + t.sellMax) / 2 / 15));
}

let state = null;
let saveTimer = null;
let activeTab = 'production';
let forgeSlot = null;
let forgeTier = null;

// ─── State & Save System ───
function defaultState(){
  const inv = {}; Object.keys(ITEMS).forEach(k=> inv[k]=0);
  const prices = {}; Object.keys(ITEMS).forEach(k=> prices[k]=ITEMS[k].basePrice);
  const prevPrices = {}; Object.keys(ITEMS).forEach(k=> prevPrices[k]=ITEMS[k].basePrice);
  const priceHistory = {}; Object.keys(ITEMS).forEach(k=> priceHistory[k]=[ITEMS[k].basePrice]);
  return {
    version: 8,
    level:1, xp:0, xpToNext: xpForLevel(1), gold:150,
    energy:100, maxEnergy:100, lastEnergyTs: Date.now(),
    storageCap:500,
    inv, prices, prevPrices, priceHistory, lastPriceTs: Date.now(),
    combat: { wins:0, losses:0 },
    missions: null,
    leaderboard: null,
    lastLbEvolve: Date.now(),
    log:[], lastTimestamp: Date.now(),
    prestige: { points:0, gatherBonus:0, sellBonus:0, energyBonus:0, storageBonus:0 },
    totalGoldEarned: 150,
    skills: { health:0, damage:0, defense:0, stamina:0, storage:0, profit:0 },
    skillPoints: 0,
    health: 100,
    lastHealthRegenTs: Date.now(),
    mana: 20,
    maxMana: 20,
    lastManaRegenTs: Date.now(),
    equipped: { weapon:null, armor:null, helmet:null, boots:null, accessory:null, gloves:null },
    gearBag: [],
    shards: 0,
    gems: 0,
    companies: [],
    companyBuildResource: null,
    companyMenuOpen: null,
    companyChangeResourceId: null,
    // Class system
    playerClass: null,
    classSkills: {},
    classSkillPoints: 0,
    classResets: 0,
    lastClassReset: 0,
    // Potions
    potions: { health:0, energy:0 },
    // Battle state
    battleLog: [],
    battleActive: false,
    battleResult: null,
  };
}

function migrateState(s){
  if(!s.version) s.version = 1;
  if(s.version < 8) s.version = 8;
  Object.keys(ITEMS).forEach(k=>{
    if(typeof s.inv[k]!=='number') s.inv[k]=0;
    if(typeof s.prices[k]!=='number') s.prices[k]=ITEMS[k].basePrice;
    if(!s.prevPrices) s.prevPrices = {};
    if(typeof s.prevPrices[k]!=='number') s.prevPrices[k]=ITEMS[k].basePrice;
    if(!s.priceHistory) s.priceHistory = {};
    if(!s.priceHistory[k]) s.priceHistory[k] = [ITEMS[k].basePrice];
  });
  if(!s.log) s.log=[];
  if(!s.combat) s.combat = { wins:0, losses:0 };
  if(!s.leaderboard) s.leaderboard = null;
  if(!s.lastLbEvolve) s.lastLbEvolve = Date.now();
  if(!s.prestige) s.prestige = { points:0, gatherBonus:0, sellBonus:0, energyBonus:0, storageBonus:0 };
  if(typeof s.totalGoldEarned !== 'number') s.totalGoldEarned = s.gold;
  if(!s.skills) s.skills = { health:0, damage:0, defense:0, stamina:0, storage:0, profit:0 };
  if(typeof s.skillPoints !== 'number') s.skillPoints = 0;
  if(typeof s.health !== 'number') s.health = 100;
  if(!s.lastHealthRegenTs) s.lastHealthRegenTs = Date.now();
  if(typeof s.mana !== 'number') s.mana = 20;
  if(typeof s.maxMana !== 'number') s.maxMana = 20;
  if(!s.lastManaRegenTs) s.lastManaRegenTs = Date.now();
  if(!s.equipped) s.equipped = { weapon:null, armor:null, helmet:null, boots:null, accessory:null, gloves:null };
  if(!s.gearBag) s.gearBag = [];
  if(typeof s.shards !== 'number') s.shards = 0;
  if(typeof s.gems !== 'number') s.gems = 0;
  if(typeof s.inv['magic_stones'] !== 'number') s.inv['magic_stones'] = 0;
  if(typeof s.prices['magic_stones'] !== 'number') s.prices['magic_stones'] = 25;
  if(typeof s.prevPrices['magic_stones'] !== 'number') s.prevPrices['magic_stones'] = 25;
  if(typeof s.inv['concrete'] !== 'number') s.inv['concrete'] = 0;
  if(typeof s.prices['concrete'] !== 'number') s.prices['concrete'] = 15;
  if(typeof s.prevPrices['concrete'] !== 'number') s.prevPrices['concrete'] = 15;
  if(typeof s.inv['herbs'] !== 'number') s.inv['herbs'] = 0;
  if(typeof s.prices['herbs'] !== 'number') s.prices['herbs'] = 4;
  if(typeof s.prevPrices['herbs'] !== 'number') s.prevPrices['herbs'] = 4;
  if(typeof s.inv['honey'] !== 'number') s.inv['honey'] = 0;
  if(typeof s.prices['honey'] !== 'number') s.prices['honey'] = 8;
  if(typeof s.prevPrices['honey'] !== 'number') s.prevPrices['honey'] = 8;
  // New consumables
  ['toasted_bread','honey_bread','legendary_bread','small_energy_potion','medium_energy_potion','large_energy_potion','legendary_energy_potion'].forEach(k=>{
    if(typeof s.inv[k] !== 'number') s.inv[k] = 0;
    if(typeof s.prices[k] !== 'number') s.prices[k] = (GOODS[k] || ITEMS[k]).basePrice;
    if(typeof s.prevPrices[k] !== 'number') s.prevPrices[k] = (GOODS[k] || ITEMS[k]).basePrice;
    if(!s.priceHistory[k]) s.priceHistory[k] = [(GOODS[k] || ITEMS[k]).basePrice];
  });

  if(!s.companies) s.companies = [];
  if(typeof s.companyBuildResource !== 'string' && s.companyBuildResource !== null) s.companyBuildResource = null;
  if(typeof s.companyMenuOpen !== 'number' && s.companyMenuOpen !== null) s.companyMenuOpen = null;
  if(typeof s.companyChangeResourceId !== 'number' && s.companyChangeResourceId !== null) s.companyChangeResourceId = null;

  // Class system migration
  if(!s.playerClass) s.playerClass = null;
  if(!s.classSkills) s.classSkills = {};
  if(typeof s.classSkillPoints !== 'number') s.classSkillPoints = 0;
  if(typeof s.classResets !== 'number') s.classResets = 0;
  if(typeof s.lastClassReset !== 'number') s.lastClassReset = 0;
  if(!s.potions) s.potions = { health:0, energy:0 };
  if(!s.battleLog) s.battleLog = [];
  if(typeof s.battleActive !== 'boolean') s.battleActive = false;
  if(!s.battleResult) s.battleResult = null;

  // Migrate old gear (v4/v5) to v6 tier system
  function migrateGear(g){
    if(!g) return null;
    if(typeof g.tier === 'number') return g;
    const tier = g.rarity === 'legendary' ? 4 : 0;
    return { ...g, tier, upgradeLevel: 0 };
  }
  s.equipped = Object.fromEntries(Object.entries(s.equipped).map(([k,v])=>[k,migrateGear(v)]));
  s.gearBag = s.gearBag.map(migrateGear).filter(Boolean);

  return s;
}

function xpForLevel(level){ return Math.round(35*Math.pow(level,1.4)); }

function pushLog(s,text,cls){ s.log.push({t:Date.now(),text,cls:cls||''}); if(s.log.length>100) s.log.shift(); }

function grantXp(s, amount){
  const oldLevel = s.level;
  s.xp += amount;
  let leveled=false;
  while(s.xp >= s.xpToNext){
    s.xp -= s.xpToNext; s.level += 1; s.xpToNext = xpForLevel(s.level);
    s.maxEnergy += 5; s.storageCap += 100;
    s.skillPoints += 1;
    // Class skill point every 5 levels
    if(s.level % 5 === 0){
      s.classSkillPoints += 1;
    }
    leveled = true;
  }
  return leveled;
}

/* ===== DERIVED STATS ===== */
function getClassMult(s, stat){
  if(!s.playerClass || !CLASS_DATA[s.playerClass]) return 1;
  return CLASS_DATA[s.playerClass].stats[stat] || 1;
}

function getClassSkillLevel(s, skillKey){
  return s.classSkills[skillKey] || 0;
}

function getMaxHealth(s){
  const base = 100 + s.skills.health*SKILLS.health.perLevel + getGearBonus(s,'health');
  const classMult = getClassMult(s, 'hp');
  let bonus = 0;
  if(s.playerClass === 'support'){
    bonus = getClassSkillLevel(s, 'lifeForce') * 8;
  }
  return Math.round(base * classMult + bonus);
}

function getMaxEnergy(s){
  let base = s.maxEnergy + s.prestige.energyBonus + s.skills.stamina*SKILLS.stamina.perLevel + getGearBonus(s,'stamina');
  if(s.playerClass === 'mage'){
    base += getClassSkillLevel(s, 'manaForce') * 5;
  }
  return base;
}

function getStorageCap(s){ return s.storageCap + s.prestige.storageBonus + s.skills.storage*SKILLS.storage.perLevel + getGearBonus(s,'storage'); }

function getEnergyCost(s, base){
  let reduction = Math.min(0.5, s.skills.stamina*0.03);
  if(s.playerClass === 'mage'){
    reduction += getClassSkillLevel(s, 'manaForce') * 0.02;
  }
  if(s.playerClass === 'archer'){
    reduction += getClassSkillLevel(s, 'efficientAim') * 0.02;
  }
  return Math.max(1, Math.ceil(base*(1-Math.min(0.6, reduction))));
}

function playerPower(s){
  let base = s.level*5 + s.combat.wins*0.5 + s.prestige.points*2 + s.skills.damage*SKILLS.damage.perLevel + getGearBonus(s,'damage');
  const classMult = getClassMult(s, 'atk');
  base = base * classMult;
  if(s.playerClass === 'warrior'){
    base *= (1 + getClassSkillLevel(s, 'powerStrike') * 0.05);
  }
  if(s.playerClass === 'mage'){
    base *= (1 + getClassSkillLevel(s, 'arcanePower') * 0.06);
  }
  return Math.round(base);
}

function getSellMult(s){
  let mult = 0.92 * (1 + s.skills.profit*SKILLS.profit.perLevel + getGearBonus(s,'profit')) * (1 + s.prestige.sellBonus);
  if(s.playerClass === 'merchant'){
    mult *= (1 + getClassSkillLevel(s, 'profitableDeal') * 0.03);
  }
  return mult;
}

function getDamageReduction(s){
  let dr = Math.min(0.75, s.skills.defense*SKILLS.defense.perLevel + getGearBonus(s,'defense'));
  if(s.playerClass === 'warrior'){
    dr += getClassSkillLevel(s, 'ironArmor') * 0.02;
  }
  if(s.playerClass === 'support'){
    dr += getClassSkillLevel(s, 'protectiveAura') * 0.03;
  }
  if(s.playerClass === 'mage'){
    // Magic Shield absorbs a portion of all incoming damage (general damage reduction)
    dr += getClassSkillLevel(s, 'magicShield') * 0.04;
  }
  return Math.min(0.85, dr);
}

function getDodgeChance(s){
  if(!s.playerClass) return 0;
  const base = (getClassMult(s, 'dodge') - 1) * 0.10;
  let bonus = 0;
  if(s.playerClass === 'archer'){
    bonus += getClassSkillLevel(s, 'swiftness') * 0.02;
  }
  return Math.min(0.35, base + bonus);
}

function getCritChance(s){
  if(!s.playerClass) return 0.10;
  const base = (getClassMult(s, 'crit') - 1) * 0.10 + 0.10;
  let bonus = 0;
  if(s.playerClass === 'archer'){
    bonus += getClassSkillLevel(s, 'keenEye') * 0.04;
  }
  if(s.playerClass === 'warrior'){
    bonus += getClassSkillLevel(s, 'powerStrike') * 0.02;
  }
  return Math.min(0.60, base + bonus);
}

function getPierceChance(s){
  let pierce = 0;
  if(s.playerClass === 'archer'){
    pierce += getClassSkillLevel(s, 'keenEye') * 0.02;
  }
  if(s.playerClass === 'mage'){
    pierce += getClassSkillLevel(s, 'arcanePower') * 0.03;
  }
  return Math.min(0.30, pierce);
}

/* ===== PLAYER COMBAT STATS ===== */
function getPlayerCombatStats(){
  return {
    hp: getMaxHealth(state),
    atk: playerPower(state),
    def: getDamageReduction(state),
    spd: Math.round(40 + state.level * 0.4 + getGearBonus(state,'stamina') * 0.1),
    crit: getCritChance(state),
    dodge: getDodgeChance(state),
    pierce: getPierceChance(state),
  };
}
