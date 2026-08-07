function getCompanyManagementLevel(level){ return Math.floor(level/5); }
function getMaxAllowedCompanies(level){ return Math.min(MAX_COMPANIES, 1 + Math.floor(level/5)); }
function getConcreteCost(n){ return n <= 1 ? 0 : (n-1)*5; }

/* ===== GATHERING & CONSUMABLES ===== */
function collect(key){
  const cost = getEnergyCost(state, 1);
  if(state.energy < cost){ pushLog(state, 'Not enough energy!', 'lose'); return; }
  const cap = getStorageCap(state);
  if(state.inv[key] >= cap){ pushLog(state, 'Storage full!', 'lose'); return; }
  const amount = Math.min(cap - state.inv[key], 5 + state.prestige.gatherBonus + Math.floor(state.level/3));
  state.inv[key] += amount;
  state.energy -= cost;
  grantXp(state, 1);
  trackMission(state, 'collected', amount);
  pushLog(state, `+${amount} ${ITEMS[key].name}`, 'gain');
  renderBody(); scheduleSave();
}
function eat(){
  if(state.inv.food < 5){ pushLog(state, 'Not enough food!', 'lose'); return; }
  state.inv.food -= 5;
  state.energy = Math.min(getMaxEnergy(state), state.energy + 10);
  pushLog(state, 'Ate 5 food (+10<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">)', 'gain');
  renderBody(); scheduleSave();
}
function healWithFood(){
  if(state.inv.food < 5){ pushLog(state, 'Not enough food!', 'lose'); return; }
  const maxH = getMaxHealth(state);
  if(state.health >= maxH){ pushLog(state, 'Health is full!', 'lose'); return; }
  state.inv.food -= 5;
  state.health = Math.min(maxH, state.health + 20);
  pushLog(state, 'Healed with food (+20<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="❤️">)', 'gain');
  renderBody(); scheduleSave();
}
function consumeBread(key){
  if((state.inv[key]||0) < 1) return;
  const b = BREAD_TIERS[key];
  state.inv[key] -= 1;
  const maxH = getMaxHealth(state);
  state.health = Math.min(maxH, state.health + b.heal);
  pushLog(state, `Ate ${b.name} (+${b.heal} HP)`, 'gain');
  renderBody(); scheduleSave();
}
function consumeEnergyPotion(key){
  if((state.inv[key]||0) < 1) return;
  const p = ENERGY_POTION_TIERS[key] || (key==='energy_potion'?{energy:20}:null);
  if(!p) return;
  state.inv[key] -= 1;
  state.energy = Math.min(getMaxEnergy(state), state.energy + p.energy);
  pushLog(state, `Drank ${p.name} (+${p.energy}<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">)`, 'gain');
  renderBody(); scheduleSave();
}

/* ===== COMPANIES ===== */
function openBuildSelector(){ state.companyBuildResource = COMPANY_RESOURCES[0]; renderBody(); }
function buildCompany(){
  const res = state.companyBuildResource || COMPANY_RESOURCES[0];
  const currentCount = state.companies.length;
  const maxAllowed = getMaxAllowedCompanies(state.level);
  if(currentCount >= MAX_COMPANIES || currentCount >= maxAllowed){ pushLog(state, 'Cannot build more companies!', 'lose'); return; }
  if(currentCount > 0){
    const concreteCost = getConcreteCost(currentCount + 1);
    if(state.inv.concrete < concreteCost){ pushLog(state, 'Not enough concrete!', 'lose'); return; }
    state.inv.concrete -= concreteCost;
  }
  const id = state.companies.length > 0 ? Math.max(...state.companies.map(c=>c.id)) + 1 : 1;
  state.companies.push({ id, resource: res, engineLevel: 1, stored: 0, disabled: false });
  state.companyBuildResource = null;
  pushLog(state, `Built ${ITEMS[res].name} Company!`, 'win');
  renderBody(); scheduleSave();
}
function selectBuildResource(res){ state.companyBuildResource = res; renderBody(); }
function cancelBuild(){ state.companyBuildResource = null; renderBody(); }
function closeCompanyMenu(){
  state.companyMenuOpen = null;
  renderBody();
}
function toggleCompanyMenu(id){
  state.companyMenuOpen = state.companyMenuOpen === id ? null : id;
  renderBody();
}
function startChangeResource(id){ state.companyChangeResourceId = id; renderBody(); }
function selectChangeResource(id, res){
  if(state.gold < 500){ pushLog(state, 'Need 500g to change production!', 'lose'); return; }
  const c = state.companies.find(x=>x.id===id);
  if(!c || c.resource === res) return;
  state.gold -= 500;
  c.resource = res;
  c.stored = 0;
  state.companyChangeResourceId = null;
  pushLog(state, `Changed production to ${ITEMS[res].name}`, 'gain');
  renderBody(); scheduleSave();
}
function cancelChangeResource(){ state.companyChangeResourceId = null; renderBody(); }
function collectFromCompany(id){
  const c = state.companies.find(x=>x.id===id);
  if(!c || c.stored < 1 || c.disabled) return;
  const cap = getStorageCap(state);
  const space = cap - state.inv[c.resource];
  if(space <= 0){ pushLog(state, 'Storage full!', 'lose'); return; }
  const amount = Math.min(Math.floor(c.stored), space);
  state.inv[c.resource] += amount;
  c.stored -= amount;
  pushLog(state, `Collected ${amount} ${ITEMS[c.resource].name} from company`, 'gain');
  renderBody(); scheduleSave();
}
function upgradeEngine(id){
  const c = state.companies.find(x=>x.id===id);
  if(!c || c.engineLevel >= 10) return;
  const cost = ENGINE_UPGRADE_COST[c.engineLevel + 1];
  if(state.inv.steel < cost){ pushLog(state, 'Not enough steel!', 'lose'); return; }
  state.inv.steel -= cost;
  c.engineLevel++;
  pushLog(state, `Upgraded engine to level ${c.engineLevel}!`, 'win');
  renderBody(); scheduleSave();
}
function moveCompanyToTop(id){
  const idx = state.companies.findIndex(c=>c.id===id);
  if(idx > 0){
    const c = state.companies.splice(idx, 1)[0];
    state.companies.unshift(c);
    renderBody(); scheduleSave();
  }
}
function disableCompany(id){
  const c = state.companies.find(x=>x.id===id);
  if(c) c.disabled = !c.disabled;
  renderBody(); scheduleSave();
}

