let battleState = null;

/* ===== INTERACTIVE BATTLE SYSTEM v2 ===== */
let battleItemMenuOpen = false;
let battleCodexOpen = false;

function startBattle(zoneId){
  const zone = ZONES.find(z=>z.id===zoneId);
  if(!zone) return;
  const cost = getEnergyCost(state, zone.energyCost);
  if(state.energy < cost){
    pushLog(state, 'Not enough energy for this zone!', 'lose');
    return;
  }
  if(state.health <= 0){
    pushLog(state, 'Health is zero! Rest before fighting.', 'lose');
    return;
  }
  state.energy -= cost;
  const monsters = ZONE_MONSTERS[zoneId];
  const monsterTemplate = monsters[Math.floor(Math.random()*monsters.length)];
  const levelDiff = Math.max(0, state.level - monsterTemplate.level);
  const scale = 1 + levelDiff * 0.02;
  const monster = {
    ...monsterTemplate,
    maxHp: Math.round(monsterTemplate.hp * scale),
    hp: Math.round(monsterTemplate.hp * scale),
    atk: Math.round((monsterTemplate.atkMin + Math.random() * (monsterTemplate.atkMax - monsterTemplate.atkMin)) * scale),
    def: Math.round(monsterTemplate.def * scale),
    spd: monsterTemplate.spd,
    crit: monsterTemplate.crit,
    burnTurns: 0,
    burnDmg: 0,
  };
  const player = getPlayerCombatStats();
  battleState = {
    zoneId, monster,
    playerHP: Math.min(player.hp, state.health),
    playerMaxHP: player.hp,
    playerStats: player,
    turns: [], won: false, lost: false, fled: false,
    turnCount: 0, chargeLevel: 0, isDefending: false,
    waitingForPlayer: true, rewards: null,
  };
  state.battleActive = true;
  battleItemMenuOpen = false;
  battleCodexOpen = false;
  pushLog(state, `Entered ${zone.name} — ${monster.name} appears!`, 'gain');
  renderBody(); scheduleSave();
}

function getChargeMultiplier(){
  if(!battleState) return 1;
  return Math.min(3.0, 1 + battleState.chargeLevel * 0.5);
}

function playerAttackAction(isSkill, skillKey){
  if(!battleState || battleState.won || battleState.lost || battleState.fled) return;
  const bs = battleState;
  const pStats = bs.playerStats;
  const m = bs.monster;
  let dmg = Math.max(1, pStats.atk - m.def);
  let isCrit = Math.random() < pStats.crit;
  let isPierce = false;
  let skillName = '';
  let manaCost = 0;

  if(isSkill && skillKey){
    const cls = CLASS_DATA[state.playerClass];
    const skDef = cls.skills.find(s=>s.key===skillKey);
    skillName = skDef ? skDef.nameAr : 'Skill';
    switch(skillKey){
      case 'powerStrike': manaCost = 10; if(state.mana < manaCost){ pushLog(state, 'Not enough mana!', 'lose'); return; }
        state.mana -= manaCost; dmg = Math.max(1, Math.round(pStats.atk * 2)); isPierce = true; break;
      case 'keenEye': manaCost = 8; if(state.mana < manaCost){ pushLog(state, 'Not enough mana!', 'lose'); return; }
        state.mana -= manaCost; dmg = Math.max(1, Math.round(pStats.atk * 2.5));
        isCrit = Math.random() < Math.min(0.9, pStats.crit + 0.25); break;
      case 'arcanePower': manaCost = 15; if(state.mana < manaCost){ pushLog(state, 'Not enough mana!', 'lose'); return; }
        state.mana -= manaCost; dmg = Math.max(1, Math.round(pStats.atk * 3));
        m.burnTurns = 3; m.burnDmg = Math.round(pStats.atk * 0.3); break;
      case 'fastHeal': manaCost = 10; if(state.mana < manaCost){ pushLog(state, 'Not enough mana!', 'lose'); return; }
        state.mana -= manaCost; const healAmt = Math.round(bs.playerMaxHP * 0.3);
        bs.playerHP = Math.min(bs.playerMaxHP, bs.playerHP + healAmt); state.health = bs.playerHP;
        bs.turns.push({ who:'skill', type:'heal', heal: healAmt, name: skillName });
        bs.turnCount++; afterPlayerAction(); return;
      case 'profitableDeal': manaCost = 5; if(state.mana < manaCost){ pushLog(state, 'Not enough mana!', 'lose'); return; }
        state.mana -= manaCost; const stolen = Math.round(m.goldMin * 0.3 + Math.random() * (m.goldMax - m.goldMin) * 0.3);
        bs.rewards = bs.rewards || {}; bs.rewards.stolenGold = (bs.rewards.stolenGold || 0) + stolen;
        bs.turns.push({ who:'skill', type:'steal', gold: stolen, name: skillName });
        bs.turnCount++; afterPlayerAction(); return;
    }
  }
  const chargeMult = getChargeMultiplier();
  if(chargeMult > 1){ dmg = Math.round(dmg * chargeMult); }
  if(isCrit) dmg = Math.round(dmg * 2);
  if(isPierce) dmg = Math.max(1, Math.round(pStats.atk * 1.5));
  m.hp -= dmg;
  bs.turns.push({ who:'player', dmg, crit:isCrit, pierce:isPierce, charge: chargeMult > 1 ? chargeMult : null, skill: skillName || null });
  if(chargeMult > 1) bs.chargeLevel = 0;
  if(m.hp <= 0){ m.hp = 0; bs.won = true; awardBattleRewards(); renderBody(); scheduleSave(); return; }
  bs.turnCount++; afterPlayerAction();
}

function chargeAttack(){
  if(!battleState || battleState.won || battleState.lost || battleState.fled) return;
  const bs = battleState;
  if(bs.chargeLevel >= 4){ pushLog(state, 'Charge maxed at ×3!', 'gain'); return; }
  bs.chargeLevel++; const mult = getChargeMultiplier();
  bs.turns.push({ who:'player', type:'charge', mult }); bs.turnCount++; afterPlayerAction();
}

function defendStance(){
  if(!battleState || battleState.won || battleState.lost || battleState.fled) return;
  battleState.isDefending = true;
  battleState.turns.push({ who:'player', type:'defend' });
  battleState.turnCount++; afterPlayerAction();
}

function useSkill(skillKey){
  if(!battleState || battleState.won || battleState.lost || battleState.fled) return;
  if(!state.playerClass) return;
  const cls = CLASS_DATA[state.playerClass];
  const skDef = cls.skills.find(s=>s.key===skillKey);
  if(!skDef) return;
  let manaCost = 0;
  if(skillKey === 'powerStrike') manaCost = 10;
  else if(skillKey === 'keenEye') manaCost = 8;
  else if(skillKey === 'arcanePower') manaCost = 15;
  else if(skillKey === 'fastHeal') manaCost = 10;
  else if(skillKey === 'profitableDeal') manaCost = 5;
  if(state.mana < manaCost){ pushLog(state, `Need ${manaCost} mana for ${skDef.nameAr}!`, 'lose'); return; }
  playerAttackAction(true, skillKey);
}

function attemptFlee(){
  if(!battleState || battleState.won || battleState.lost || battleState.fled) return;
  const bs = battleState; const roll = Math.random();
  if(roll < 0.7){
    bs.fled = true; state.battleActive = false;
    bs.turns.push({ who:'player', type:'flee', success:true });
    pushLog(state, 'Escaped successfully!', 'gain');
  } else {
    bs.turns.push({ who:'player', type:'flee', success:false });
    pushLog(state, 'Flee failed! Monster attacks!', 'lose');
    bs.turnCount++; monsterAttackAction();
  }
  renderBody(); scheduleSave();
}

function afterPlayerAction(){
  if(!battleState) return;
  const bs = battleState;
  if(bs.won || bs.lost || bs.fled) return;
  if(bs.monster.burnTurns > 0){
    bs.monster.hp = Math.max(0, bs.monster.hp - bs.monster.burnDmg);
    bs.turns.push({ who:'burn', dmg: bs.monster.burnDmg });
    bs.monster.burnTurns--;
    if(bs.monster.hp <= 0){ bs.monster.hp = 0; bs.won = true; awardBattleRewards(); renderBody(); scheduleSave(); return; }
  }
  monsterAttackAction();
}

function monsterAttackAction(){
  if(!battleState) return;
  const bs = battleState; const pStats = bs.playerStats; const m = bs.monster;
  if(bs.won || bs.lost || bs.fled) return;
  const dodgeRoll = Math.random();
  const dodged = dodgeRoll < pStats.dodge;
  if(dodged){ bs.turns.push({ who:'monster', dmg:0, dodge:true }); bs.isDefending = false; bs.waitingForPlayer = true; renderBody(); return; }
  let dmg = Math.max(1, Math.round(m.atk * (1 - Math.min(0.85, pStats.def))));
  if(bs.isDefending){ dmg = Math.max(1, Math.round(dmg * 0.5)); bs.isDefending = false; }
  const critRoll = Math.random(); const isCrit = critRoll < m.crit;
  if(isCrit) dmg = Math.round(dmg * 2);
  bs.playerHP -= dmg; state.health = bs.playerHP;
  bs.turns.push({ who:'monster', dmg, crit:isCrit });
  if(bs.playerHP <= 0){ bs.playerHP = 0; state.health = 0; bs.lost = true; state.combat.losses += 1; pushLog(state, `${m.name} defeated you!`, 'lose'); }
  bs.waitingForPlayer = true; renderBody(); scheduleSave();
}

function awardBattleRewards(){
  const bs = battleState; const m = bs.monster;
  let gold = Math.round(m.goldMin + Math.random() * (m.goldMax - m.goldMin));
  let xp = m.xp;
  if(bs.rewards && bs.rewards.stolenGold){ gold += bs.rewards.stolenGold; }
  const crit = getCritChance(state);
  if(Math.random() < crit){ gold = Math.round(gold * 1.5); xp = Math.round(xp * 1.3); }
  state.gold += gold; state.totalGoldEarned += gold; state.combat.wins += 1;
  const leveled = grantXp(state, xp); trackMission(state, 'wins', 1);
  const loot = {};
  m.loot.forEach(l => { const amount = l.min + Math.floor(Math.random() * (l.max - l.min + 1)); if(amount > 0){ state.inv[l.item] = (state.inv[l.item] || 0) + amount; loot[l.item] = amount; } });
  const shards = 5 + Math.floor(Math.random() * 11); state.shards += shards;
  const dropChance = 0.30 + (state.playerClass === 'merchant' ? getClassSkillLevel(state, 'lucky') * 0.03 : 0);
  let gearDrop = null;
  if(Math.random() < dropChance){ const tier = rollTier(state.level); const slots = Object.keys(GEAR_SLOTS); const slot = slots[Math.floor(Math.random()*slots.length)]; gearDrop = generateGear(slot, tier); if(state.gearBag.length < GEAR_BAG_LIMIT){ state.gearBag.push(gearDrop); } }
  let gemDrop = 0;
  if(Math.random() < 0.05 + (state.playerClass === 'merchant' ? getClassSkillLevel(state, 'lucky') * 0.03 : 0)){ gemDrop = 1 + Math.floor(Math.random() * 3); state.gems += gemDrop; }
  bs.rewards = { gold, xp, loot, shards, gearDrop, gemDrop, stolenGold: bs.rewards && bs.rewards.stolenGold ? bs.rewards.stolenGold : 0 };
  pushLog(state, `Victory! Defeated ${m.name} (+${gold}g, +${xp}xp)`, 'win');
  if(leveled){ pushLog(state, `Reached level ${state.level}! (+1 skill point)`, 'levelup'); showToast('Level Up!', `You reached level ${state.level}. +1 Skill Point`, 'levelup'); }
  if(gearDrop){ const t = GEAR_TIERS[gearDrop.tier]; pushLog(state, `Found [${t.symbol}] ${gearDrop.name}!`, 'gear'); }
  if(gemDrop > 0){ pushLog(state, `Found ${gemDrop} <img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2VJREFUSEuNlk2IHFUUhb/zesaJC0EXbgwOBARNdCVBBZNZxKTTrQEVguJCQYiBxBAQjMGRSKIJATG4GDAqiiIYBBdRnGS6ZwYRBhJ/0IXkZxHBlXEZMCNGZ/odra7q6qrqnuhbdBfvvrr3nHvuu7fEikuAVzYPWIafT3a7KzcPPuSuiiY5Cy/In4fAyQNUwgw6/Z87VRDXZyBn6FZKVwo/ZVCkkp5PftMA2fvN+bjOHT0x1J0h3sDJkcjtscP6lFDiOXGc0UskC5xv1fVZz21mTcVszPrcsnhwxPwEjPeF8eloHQniPWDMNXZpmf2Izb3M2Uxjdipw2au4rT2h3/oMUudHgEnMJwq8Y7PQRSEWOpHXg3gLuDtz+HMM7KpFDhgmBIvL+M4gvS/TNJ5p18PDPRY0W37MgZNpXSj5e0mBRXd4XqPsc+RNzLpikUS4VIM9iGNEJh2499/XD+ZnzKHWVh3Uti+9enmU57rpCJgOUpebz3SsWwKszV9K7D0QvbSLb+kwIlhfMgnXAj+oOR+fdEdrU2EzBpmAtr6ReKBc3oYgExHB7jJOnksrFT+Ki12RG/NxJ5F3q/fk2ig3rVrie+Cu0mXMCy/xr40yC0Pu/LOtuj7Kq6g55302b/Qrp1vie6NYLbw/ATLkJrclpm2meuC6VOTdM/VwPElIidrWOR+WeaXA5LzEDpuzxcAFIXcgXsirK6kP82K7rmO985XcQXPOUzZ7cic17qDDCeC+XCcpYfe7zPYoZvNLJx1obdHhYqrzFBXpN2f9se2nk0sQzatBLGGOVjT6APMXYncW4GirHiarOuatotoRG+34OUGPyvyyJB4ZMRdKjRYamOPAGompmS3aOyyNKYNKU+s5asx5DrNZeIPRa8CmLkJxQeZl4y9An7bqeqqKvCT6kGGQ2gWNts9i/yh0zuLtrMEdkhg3jLfqyvtRiUGGstTsilHTZmu2n/GNVxf5DlMP4nJS747cE2qc+HPE93+9KVwrDp/iECw1u0GK/Z7eOO1bY2AiBJ6xGJP4MIwxe2pjuFIdZ9VWX5oHZQbFOQr1ltcosCFp16M1ZqYf0q/D9MuB9lOUpztlV4FQrJzHv/LNf/+BTm3TlaKj683nQQ0qQ3zodCturjRNMwSVAP/xiTCsFlcKkLn6B/RWcNXdxjx2AAAAAElFTkSuQmCC" alt="💎"> Gem(s)!`, 'win'); }
  state.battleActive = false; renderHeader(); scheduleSave();
}

function fleeBattle(){
  if(!battleState) return; battleState.fled = true; state.battleActive = false;
  pushLog(state, 'You fled from battle!', 'lose'); renderBody(); scheduleSave();
}

function closeBattle(){
  battleState = null; state.battleActive = false;
  battleItemMenuOpen = false; battleCodexOpen = false; renderBody();
}

function toggleBattleItems(){
  if(!battleState) return; battleItemMenuOpen = !battleItemMenuOpen;
  battleCodexOpen = false; renderBody();
}

function toggleBattleCodex(){
  if(!battleState) return; battleCodexOpen = !battleCodexOpen;
  battleItemMenuOpen = false; renderBody();
}

function useBattleItem(key){
  if(!battleState || battleState.won || battleState.lost || battleState.fled) return;
  const bs = battleState;
  if(BREAD_TIERS[key]){
    if((state.inv[key]||0) < 1) return; state.inv[key] -= 1;
    const b = BREAD_TIERS[key]; const oldHp = bs.playerHP;
    bs.playerHP = Math.min(bs.playerMaxHP, bs.playerHP + b.heal); state.health = bs.playerHP;
    bs.turns.push({ who:'item', type:'health', heal: bs.playerHP - oldHp, name: b.name });
  } else if(ENERGY_POTION_TIERS[key] || key === 'energy_potion'){
    if((state.inv[key]||0) < 1) return; state.inv[key] -= 1;
    let energy = 0; if(ENERGY_POTION_TIERS[key]) energy = ENERGY_POTION_TIERS[key].energy; else if(key === 'energy_potion') energy = 20;
    state.energy = Math.min(getMaxEnergy(state), state.energy + energy);
    bs.turns.push({ who:'item', type:'energy', energy, name: ENERGY_POTION_TIERS[key] ? ENERGY_POTION_TIERS[key].name : 'Energy Potion' });
  } else if(key === 'health_potion'){
    if((state.inv[key]||0) < 1) return; state.inv[key] -= 1;
    const heal = 30 + Math.floor(Math.random()*21); const oldHp = bs.playerHP;
    bs.playerHP = Math.min(bs.playerMaxHP, bs.playerHP + heal); state.health = bs.playerHP;
    bs.turns.push({ who:'item', type:'health', heal: bs.playerHP - oldHp, name: 'Health Potion' });
  }
  battleItemMenuOpen = false; bs.turnCount++; afterPlayerAction();
}

function usePotion(type){
  if(!battleState || battleState.won || battleState.lost || battleState.fled) return;
  if(type === 'health'){ const key = getBestHpItem(); if(key) useBattleItem(key); }
  else if(type === 'energy'){ const key = getBestEnergyItem(); if(key) useBattleItem(key); }
}

/* ===== BATTLE HELPERS ===== */
function getBestHpItem(){
  const order = ['legendary_bread','honey_bread','toasted_bread','health_potion'];
  for(const k of order){ if((state.inv[k]||0) > 0) return k; }
  return null;
}
function getBestEnergyItem(){
  const order = ['legendary_energy_potion','large_energy_potion','medium_energy_potion','small_energy_potion','energy_potion'];
  for(const k of order){ if((state.inv[k]||0) > 0) return k; }
  return null;
}
