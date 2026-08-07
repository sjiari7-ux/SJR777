/* ===== CRAFTING ===== */
function craft(key){
  const r = RECIPES[key];
  if(state.level < r.minLevel) return;
  const cost = getEnergyCost(state, r.energyCost);
  if(state.energy < cost){ pushLog(state, 'Not enough energy!', 'lose'); return; }
  const cap = getStorageCap(state);
  if(state.inv[key] + r.output > cap){ pushLog(state, 'Storage full!', 'lose'); return; }
  for(const inp in r.inputs){ if(state.inv[inp] < r.inputs[inp]){ pushLog(state, `Missing ${ITEMS[inp].name}!`, 'lose'); return; } }
  for(const inp in r.inputs){ state.inv[inp] -= r.inputs[inp]; }
  state.inv[key] += r.output;
  state.energy -= cost;
  const leveled = grantXp(state, r.xp);
  trackMission(state, 'crafted', 1);
  pushLog(state, `Crafted ${r.output} ${ITEMS[key].name} (+${r.xp}XP)`, 'gain');
  if(leveled){ pushLog(state, `Level up! You are now level ${state.level}`, 'levelup'); showToast('Level Up!', `Level ${state.level}`, 'levelup'); }
  renderBody(); scheduleSave();
}
function craftMax(key){
  const r = RECIPES[key];
  if(state.level < r.minLevel) return;
  const cost = getEnergyCost(state, r.energyCost);
  const cap = getStorageCap(state);
  let count = 0;
  while(state.energy >= cost){
    if(state.inv[key] + r.output > cap) break;
    let can = true;
    for(const inp in r.inputs){ if(state.inv[inp] < r.inputs[inp]){ can=false; break; } }
    if(!can) break;
    for(const inp in r.inputs){ state.inv[inp] -= r.inputs[inp]; }
    state.inv[key] += r.output;
    state.energy -= cost;
    count++;
  }
  if(count > 0){
    const xp = count * r.xp;
    const leveled = grantXp(state, xp);
    trackMission(state, 'crafted', count);
    pushLog(state, `Crafted ${count*r.output} ${ITEMS[key].name} (+${xp}XP)`, 'gain');
    if(leveled){ pushLog(state, `Level up! You are now level ${state.level}`, 'levelup'); showToast('Level Up!', `Level ${state.level}`, 'levelup'); }
    renderBody(); scheduleSave();
  }
}

/* ===== FORGE & GEAR ===== */
function openForge(){ forgeSlot='weapon'; forgeTier=0; renderBody(); }
function closeForge(){ forgeSlot=null; forgeTier=null; renderBody(); }
function selectForgeTier(idx){ forgeTier=idx; renderBody(); }
function craftGear(slot, tier){
  const recipe = CRAFTABLE_GEAR[slot][tier];
  if(state.level < recipe.levelReq) return;
  const cost = getEnergyCost(state, recipe.energyCost);
  if(state.energy < cost){ pushLog(state, 'Not enough energy!', 'lose'); return; }
  if(state.gearBag.length >= GEAR_BAG_LIMIT){ pushLog(state, 'Gear bag full!', 'lose'); return; }
  for(const inp in recipe.inputs){ if(state.inv[inp] < recipe.inputs[inp]){ pushLog(state, `Missing ${ITEMS[inp].name}!`, 'lose'); return; } }
  for(const inp in recipe.inputs){ state.inv[inp] -= recipe.inputs[inp]; }
  state.energy -= cost;
  const gear = { ...recipe, id: Date.now()+Math.random(), slot, tier, upgradeLevel: 0, stats: {} };
  // Generate stats based on tier
  const t = GEAR_TIERS[tier];
  const chosen = [...STAT_POOL].sort(()=>Math.random()-0.5).slice(0, t.numStats);
  chosen.forEach(st=>{
    const baseVal = SKILLS[st].perLevel * (1 + Math.floor(Math.random()*3));
    gear.stats[st] = Math.max(1, Math.round(baseVal * t.power));
  });
  gear.sellValue = t.sellMin + Math.floor(Math.random()*(t.sellMax-t.sellMin));
  state.gearBag.push(gear);
  const leveled = grantXp(state, recipe.xp);
  pushLog(state, `Forged [${t.symbol}] ${recipe.name}!`, 'gear');
  if(leveled){ pushLog(state, `Level up! You are now level ${state.level}`, 'levelup'); showToast('Level Up!', `Level ${state.level}`, 'levelup'); }
  renderBody(); scheduleSave();
}
function equipGear(id){
  const idx = state.gearBag.findIndex(g=>g.id===id);
  if(idx < 0) return;
  const gear = state.gearBag[idx];
  const old = state.equipped[gear.slot];
  if(old) state.gearBag.push(old);
  state.equipped[gear.slot] = gear;
  state.gearBag.splice(idx, 1);
  pushLog(state, `Equipped ${gear.name}`, 'gear');
  renderBody(); scheduleSave();
}
function unequipGear(slot){
  const gear = state.equipped[slot];
  if(!gear) return;
  if(state.gearBag.length >= GEAR_BAG_LIMIT){ pushLog(state, 'Bag full! Cannot unequip.', 'lose'); return; }
  state.gearBag.push(gear);
  state.equipped[slot] = null;
  pushLog(state, `Unequipped ${gear.name}`, 'gear');
  renderBody(); scheduleSave();
}
function upgradeGear(id){
  const idx = state.gearBag.findIndex(g=>g.id===id);
  if(idx < 0) return;
  const gear = state.gearBag[idx];
  const t = GEAR_TIERS[gear.tier];
  if(gear.upgradeLevel >= t.maxUpgrade){ pushLog(state, 'Max upgrade reached!', 'lose'); return; }
  const req = UPGRADE_TABLE[gear.upgradeLevel];
  if(state.shards < req.shards || state.gold < req.gold || state.gems < req.gems){ pushLog(state, 'Not enough materials!', 'lose'); return; }
  state.shards -= req.shards;
  state.gold -= req.gold;
  state.gems -= req.gems;
  if(Math.random() < req.chance){
    gear.upgradeLevel++;
    pushLog(state, `Upgrade success! ${gear.name} +${gear.upgradeLevel}`, 'upgrade-success');
    showToast('Upgrade Success', `${gear.name} +${gear.upgradeLevel}`, 'win');
  } else {
    if(gear.upgradeLevel > 0) gear.upgradeLevel--;
    pushLog(state, `Upgrade failed! ${gear.name} ${gear.upgradeLevel>0?'+${gear.upgradeLevel}':'(+0)'}`, 'upgrade-fail');
    showToast('Upgrade Failed', 'Better luck next time', 'lose');
  }
  renderBody(); scheduleSave();
}
function sellGear(id){
  const idx = state.gearBag.findIndex(g=>g.id===id);
  if(idx < 0) return;
  const gear = state.gearBag[idx];
  const val = getGearValue(gear);
  state.gold += val;
  state.totalGoldEarned += val;
  state.gearBag.splice(idx, 1);
  pushLog(state, `Sold ${gear.name} for ${val}g`, 'sell');
  renderBody(); scheduleSave();
}
function destroyGear(id){
  const idx = state.gearBag.findIndex(g=>g.id===id);
  if(idx < 0) return;
  const gear = state.gearBag[idx];
  const shards = getGearScrapValue(gear);
  state.shards += shards;
  state.gearBag.splice(idx, 1);
  pushLog(state, `Scrapped ${gear.name} for ${shards} shards`, 'gain');
  renderBody(); scheduleSave();
}

