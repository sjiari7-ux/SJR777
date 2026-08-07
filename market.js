function updatePrices(){
  Object.keys(ITEMS).forEach(k=>{
    state.prevPrices[k] = state.prices[k];
    const change = (Math.random()-0.5)*0.3;
    state.prices[k] = Math.max(1, Math.round(state.prices[k]*(1+change)*10)/10);
    if(!state.priceHistory[k]) state.priceHistory[k]=[];
    state.priceHistory[k].push(state.prices[k]);
    if(state.priceHistory[k].length > PRICE_HISTORY_LENGTH) state.priceHistory[k].shift();
  });
}
/* ===== MARKET ===== */
function buy(key, amount){
  const price = state.prices[key];
  const cap = getStorageCap(state);
  if(amount === 'max') amount = Math.floor(state.gold / Math.ceil(price));
  amount = Math.min(amount, cap - state.inv[key]);
  if(amount <= 0) return;
  const cost = Math.ceil(price * amount);
  if(cost > state.gold){ pushLog(state, 'Not enough gold!', 'lose'); return; }
  state.gold -= cost;
  state.inv[key] += amount;
  pushLog(state, `Bought ${amount} ${ITEMS[key].name} for ${cost}g`, 'gain');
  renderBody(); scheduleSave();
}
function sell(key, amount){
  if(amount === 'max') amount = state.inv[key];
  amount = Math.min(amount, state.inv[key]);
  if(amount <= 0) return;
  const price = state.prices[key] * getSellMult(state);
  const gold = Math.floor(price * amount);
  state.gold += gold;
  state.totalGoldEarned += gold;
  state.inv[key] -= amount;
  trackMission(state, 'sold', amount);
  pushLog(state, `Sold ${amount} ${ITEMS[key].name} for ${gold}g`, 'sell');
  renderBody(); scheduleSave();
}

