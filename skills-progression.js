/* ===== CLASS SYSTEM ===== */
function selectClass(key){
  const cls = CLASS_DATA[key];
  state.playerClass = key;
  state.classSkills = {};
  state.classSkillPoints = 0;
  state.classResets = 0;
  state.lastClassReset = 0;
  // Give starter gear
  Object.values(cls.starterGear).forEach(g=>{
    if(state.gearBag.length < GEAR_BAG_LIMIT){
      const gear = { ...g, id: Date.now()+Math.random(), upgradeLevel: 0 };
      const t = GEAR_TIERS[gear.tier];
      gear.sellValue = t.sellMin + Math.floor(Math.random()*(t.sellMax-t.sellMin));
      state.gearBag.push(gear);
    }
  });
  pushLog(state, `Became a ${cls.nameAr}!`, 'prestige');
  showToast('Class Selected', cls.nameAr, 'prestige');
  renderBody(); scheduleSave();
}
function upgradeClassSkill(key){
  const lvl = state.classSkills[key] || 0;
  if(lvl >= CLASS_SKILL_MAX) return;
  const cost = CLASS_SKILL_COST_TABLE[lvl];
  if(state.classSkillPoints < cost){ pushLog(state, 'Not enough class skill points!', 'lose'); return; }
  state.classSkillPoints -= cost;
  state.classSkills[key] = lvl + 1;
  pushLog(state, `Upgraded class skill to level ${lvl+1}`, 'skill');
  renderBody(); scheduleSave();
}
function canResetClass(){ return Date.now() - state.lastClassReset >= 7*24*60*60*1000; }
function getClassResetCost(){ return 500 * (1 + state.classResets); }
function resetClass(newClass){
  if(!canResetClass()){ pushLog(state, 'Class reset on cooldown!', 'lose'); return; }
  const cost = getClassResetCost();
  if(state.gold < cost){ pushLog(state, 'Not enough gold!', 'lose'); return; }
  state.gold -= cost;
  state.classResets++;
  state.lastClassReset = Date.now();
  // Refund points
  let refunded = 0;
  Object.values(state.classSkills).forEach(lvl=>{ for(let i=0;i<lvl;i++) refunded += CLASS_SKILL_COST_TABLE[i]; });
  state.classSkillPoints += refunded;
  state.classSkills = {};
  state.playerClass = newClass;
  const cls = CLASS_DATA[newClass];
  pushLog(state, `Reset to ${cls.nameAr}!`, 'prestige');
  showToast('Class Reset', cls.nameAr, 'prestige');
  renderBody(); scheduleSave();
}

/* ===== SKILLS ===== */
function upgradeSkill(key){
  const sk = SKILLS[key];
  const lvl = state.skills[key];
  if(lvl >= sk.max) return;
  const cost = lvl + 1;
  if(state.skillPoints < cost){ pushLog(state, 'Not enough skill points!', 'lose'); return; }
  state.skillPoints -= cost;
  state.skills[key] = lvl + 1;
  if(key==='health'){ state.health += SKILLS.health.perLevel; }
  if(key==='stamina'){ state.maxEnergy += SKILLS.stamina.perLevel; state.energy += SKILLS.stamina.perLevel; }
  if(key==='storage'){ state.storageCap += SKILLS.storage.perLevel; }
  pushLog(state, `Upgraded ${sk.name} to level ${lvl+1}`, 'skill');
  renderBody(); scheduleSave();
}

/* ===== PRESTIGE ===== */
function canPrestige(s){ return s.level >= PRESTIGE_LEVEL_REQ; }
function doPrestige(){
  if(!canPrestige(state)) return;
  const pts = Math.floor(state.level/5) + Math.floor(state.totalGoldEarned/5000);
  const keepGear = [...state.gearBag];
  const keepEquipped = { ...state.equipped };
  const keepShards = state.shards;
  const keepGems = state.gems;
  const keepClass = state.playerClass;
  const keepClassSkills = { ...state.classSkills };
  const keepClassPoints = state.classSkillPoints;
  const keepClassResets = state.classResets;
  const keepPrestige = { ...state.prestige };
  keepPrestige.points += pts;
  keepPrestige.gatherBonus += 1;
  keepPrestige.sellBonus += 0.02;
  keepPrestige.energyBonus += 5;
  keepPrestige.storageBonus += 50;
  state = defaultState();
  state.prestige = keepPrestige;
  state.gearBag = keepGear;
  state.equipped = keepEquipped;
  state.shards = keepShards;
  state.gems = keepGems;
  state.playerClass = keepClass;
  state.classSkills = keepClassSkills;
  state.classSkillPoints = keepClassPoints;
  state.classResets = keepClassResets;
  pushLog(state, `Prestiged! Gained ${pts} prestige points.`, 'prestige');
  showToast('Prestige!', `+${pts} Points`, 'prestige');
  render(); scheduleSave();
}
function hardReset(){
  if(!confirm('ERASE ALL PROGRESS? This cannot be undone!')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  render(); scheduleSave();
}

