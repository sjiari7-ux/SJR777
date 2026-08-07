/* ===== CORE LOOP & RENDER ===== */
async function startGame(){
  if(window.__gameStarted) return; window.__gameStarted = true;
  await loadState();
  if(!state.missions) generateMissions();
  if(!state.leaderboard) evolveLeaderboard();
  render();
  setInterval(tick, TICK_MS);
  setInterval(()=>{ updatePrices(); renderBody(); }, PRICE_TICK_MS);
  setInterval(()=>{ if(state && state.missions && Date.now() >= state.missions.resetAt){ generateMissions(); renderBody(); } }, 60000);
  setInterval(syncToFirestore, SYNC_INTERVAL);
  loadUsername();
}
function scheduleSave(){
  if(saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 300);
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
  const dot = document.querySelector('.save-dot');
  if(dot){ dot.classList.add('flash'); setTimeout(()=>dot.classList.remove('flash'), 500); }
  syncToFirestore();
}
async function loadState(){
  // Try Firestore first
  const cloudLoaded = await loadFromFirestore();
  if(cloudLoaded) return;
  // Fallback to localStorage
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ state = migrateState(JSON.parse(raw)); return; }
  }catch(e){}
  state = defaultState();
}
/* ===== TICK & ECONOMY ===== */
function tick(){
  const now = Date.now();
  // Energy regen
  const eDiff = now - state.lastEnergyTs;
  if(eDiff >= ENERGY_REGEN_MS){
    const ticks = Math.floor(eDiff / ENERGY_REGEN_MS);
    state.energy = Math.min(getMaxEnergy(state), state.energy + ticks);
    state.lastEnergyTs += ticks * ENERGY_REGEN_MS;
  }
  // Health regen
  const hDiff = now - state.lastHealthRegenTs;
  if(hDiff >= HEALTH_REGEN_MS){
    const ticks = Math.floor(hDiff / HEALTH_REGEN_MS);
    const maxH = getMaxHealth(state);
    state.health = Math.min(maxH, state.health + ticks);
    state.lastHealthRegenTs += ticks * HEALTH_REGEN_MS;
  }
  // Mana regen (1 per minute)
  const mDiff = now - state.lastManaRegenTs;
  if(mDiff >= 60000){
    const ticks = Math.floor(mDiff / 60000);
    state.mana = Math.min(state.maxMana, state.mana + ticks);
    state.lastManaRegenTs += ticks * 60000;
  }
  // Companies production
  state.companies.forEach(c=>{
    if(c.disabled) return;
    const rate = ENGINE_PRODUCTION[c.engineLevel];
    const maxCap = rate * 24;
    c.stored = Math.min(maxCap, c.stored + rate / 3600); // per second
  });
  // Leaderboard evolve
  if(now - state.lastLbEvolve >= LB_EVOLVE_MS){
    evolveLeaderboard();
    state.lastLbEvolve = now;
  }
  // Missions reset check
  if(state.missions && now >= state.missions.resetAt){
    generateMissions();
  }
  renderHeader();
}
