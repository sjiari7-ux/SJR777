function generateMissions(){
  const list = [];
  const counters = { collected:0, crafted:0, sold:0, wins:0 };
  const pool = [...MISSION_POOL].sort(()=>Math.random()-0.5).slice(0,3);
  pool.forEach(tpl=>{
    const target = tpl.gen();
    list.push({ templateId: tpl.id, target, reward: tpl.reward(target), done: false });
  });
  state.missions = { list, counters, resetAt: Date.now() + MISSION_PERIOD_MS };
}
function trackMission(s, track, amount){
  if(!s.missions) return;
  s.missions.counters[track] = (s.missions.counters[track]||0) + amount;
  s.missions.list.forEach(ms=>{
    if(ms.done) return;
    const tpl = MISSION_POOL.find(m=>m.id===ms.templateId);
    if(tpl && tpl.track===track){
      if(s.missions.counters[track] >= ms.target){
        ms.done = true;
        s.gold += ms.reward;
        s.totalGoldEarned += ms.reward;
        pushLog(s, `Mission complete: ${tpl.label(ms.target)} (+${ms.reward}g)`, 'win');
        showToast('Mission Complete', tpl.label(ms.target) + ` +${ms.reward}g`, 'win');
      }
    }
  });
}
function evolveLeaderboard(){
  state.leaderboard = LB_NAMES.map((name,i)=>{
    const level = Math.max(1, state.level + Math.floor((Math.random()-0.5)*8));
    const gold = Math.max(0, Math.floor(state.gold * (0.5 + Math.random()*1.5)));
    return { name, level, gold };
  });
}

