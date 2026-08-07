function renderBattle(){
  if(!battleState) return '';
  const bs = battleState, m = bs.monster;
  const pMax = bs.playerMaxHP, pHp = bs.playerHP;
  const mMax = m.maxHp, mHp = m.hp;
  const pPct = Math.max(0, (pHp/pMax)*100), mPct = Math.max(0, (mHp/mMax)*100);
  const manaPct = Math.max(0, (state.mana / state.maxMana) * 100);
  const chargeMult = getChargeMultiplier();
  const chargeText = chargeMult > 1 ? `×${chargeMult.toFixed(1)}` : '';
  const cls = state.playerClass ? CLASS_DATA[state.playerClass] : null;
  const canAct = bs.waitingForPlayer && !bs.won && !bs.lost && !bs.fled;

  // Build last few battle log lines for inline display
  const logLines = bs.turns.slice(-4).map(t => {
    let txt = '', color = 'var(--dim)';
    if(t.who==='player' && t.type==='charge'){ txt=`<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡"> Charge ${t.mult.toFixed(1)}×`; color='var(--brass-bright)'; }
    else if(t.who==='player' && t.type==='defend'){ txt=`🛡️ Defending`; color='var(--skill)'; }
    else if(t.who==='player' && t.type==='flee' && t.success){ txt=`🏃 Escaped!`; color='var(--green)'; }
    else if(t.who==='player' && t.type==='flee' && !t.success){ txt=`🏃 Flee failed`; color='var(--red)'; }
    else if(t.who==='player' && t.skill){ txt=`✨ ${t.skill} ${t.dmg} dmg`; color='var(--prestige)'; }
    else if(t.who==='player' && t.dmg>0){ txt=`⚔️ ${t.dmg}${t.crit?' 💥':''}${t.charge?' ('+t.charge.toFixed(1)+'×)':''}`; color='var(--green)'; }
    else if(t.who==='monster' && t.dmg>0){ txt=`🩸 ${t.dmg}${t.crit?' 💥':''}`; color='var(--red)'; }
    else if(t.who==='monster' && t.dodge){ txt=`💨 Dodged!`; color='var(--skill)'; }
    else if(t.who==='burn'){ txt=`🔥 Burn ${t.dmg}`; color='var(--copper)'; }
    else if(t.who==='skill' && t.type==='heal'){ txt=`💚 +${t.heal} HP`; color='var(--health)'; }
    else if(t.who==='skill' && t.type==='steal'){ txt=`💰 +${t.gold}g`; color='var(--brass-bright)'; }
    else if(t.who==='item' && t.type==='health'){ txt=`🧪 +${t.heal} HP`; color='var(--health)'; }
    else if(t.who==='item' && t.type==='energy'){ txt=`🧪 +${t.energy}<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">`; color='var(--brass-bright)'; }
    return `<span style="color:${color};font-size:11px;margin-right:10px;white-space:nowrap;">${txt}</span>`;
  }).join('');

  // Result overlay
  const resultHtml = bs.won ? `
    <div style="position:absolute;inset:0;background:rgba(5,12,10,0.88);backdrop-filter:blur(4px);z-index:10;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:20px;text-align:center;animation:fadeIn 0.3s ease-out;">
      <div style="font-size:56px;animation:pulse 1.5s ease-in-out infinite;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA0RJREFUSEuFVT1oFEEU/t7cxWzEpIlobm/PICJYRAwRsfQHrUwMBsTOTiwlaiEWhghiFX9qOwVBBEEDplAwliJKxHQiYm5zG4lpjHh73t08M/s7+3Nm2WLmzcyb7733vW8IiY8AcNIUzvSlaOwPUlMgtngj71ODP441TYQLzHyJiAYgMRHv6AyFgTmG/CZI3GfGg56SPaX79bz/WbIOiy48I8JD2UIDAvMEvInQqcAiOKmwiMa5zSOiCMmMi7KJia0V+10A3HfRcMpnGXQRhOck5StJ0iUUv+XnK2Utyn3UBLEQJwk4DpaPu0u1p2FmPGRNe3CkLdpPjJK9Nzzu1qwFEA54G5hzIvCwfTJMezg641hfhCyc21L+/jG+IFh1nQqDccUwq3eUyV0pT4Lpjl40b6u6S93peeDLxsDyXW9/rXKZiGe6S7Ze25gev+xy/xZBPyHEaWNgaVbNi4IWBJGVxy5mspssh/vKy2vuyuAYZPvFX8nb+6zaWrg/VTbCetUa6iryZzDdM8zqZKNWvs5Etzpw96phVmcajnWbma41W9jfW6kuhrQkPas6zesrg7uB9k1iHJJtPiEKNAfGkJ+WYCfhk2zxqBD0mgXeA4UbPQPfA1LE3jLECwuj8vvbLg93FekIk5iFlM8BDAU1WKSCGGeWY60Wv91mLS/k9WOmyJlipvJSd6wjytRTst/G7dmh84O2yY2g02HXsd6oNcO0jwUUSkpFTqESUpHEQoqC6o/Uqe5YR70ITHtet3dqRuVcefEcRYj0k5qKra729/a2DK951gvuyI4dP9czgHShDNz6F+iKGGmhbie4K+YomGaDIp8yTPtlBnlWVgP5ioLIRuMHRHCd8jMAZxQgBj/aWrLPa0KdumsTmqaRuT8qe1jKXbpdCLHUvbP6VZN+bTl9wSbvjOtYUyzooB+Nr9vE/GFDc6Zjr3r08ZsT1SCiZooeDceKHo/oSYgGhO5SdTqLr2MEqRqAsYFeuZvvQMWjhmmroiSeyVCLPNXVJ7pIeQUkRqNmsS6/+p66Y7GhSXMiXQFlU42WDVZFEDpJEzpcyy1hug+y8uAfC1LkN6IHJ+kuTlE2iUEn5y8kOf6/MuayMzL+A6BcbS4X2D18AAAAAElFTkSuQmCC" alt="🏆"></div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:24px;color:var(--green);">Victory!</div>
      <div style="display:flex;flex-direction:column;gap:8px;min-width:220px;">
        <div style="display:flex;justify-content:space-between;background:var(--panel-light);border:1px solid var(--border);border-radius:10px;padding:10px 16px;font-size:14px;"><span><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2RJREFUSEuNVUuIHFUUPefV2NWFjpuMyfQniYoOmIkfRHEhkRHMTrJxiGaniyQkMmDUheDC1SxFCChxIQoijWYz+CEIigpBInGhggQXxkT6M8mYLBKdrv7UO9JVNdU1VdWjD7qhX993zr3n/ggQgOJvpE50P+nkX+XtRzejz2ZQKsbdgiDzV6GLsU2GIO9vsV9FEWfebiJIo/wf7yYKt/HHOKYtIiAQy+Vfrd/LIfYK2iFxFkYXQbS82fbXxfkbexARjLE2fsI2q9t8OAdo7CHQ7M8mPHqog26ldTqCKy6WEXToaTq33U79MIXXAez+DzV+KVebD6aLLUuTEIyM/LXaHIdcFrAYOZivs2zVGWsfKtVaP+cciVWJCOI+6Hbq30BYIAs6ICFLVYHwFgAHDk/aIR71+s6KueuSH9ZYLEmSA79dPwlgKetJApeJRsAP5ZJd7PXNBQM8LfAzGd2AxYo75SzzjsudjfSi264+T/L9DVkKI0iYCUK/+n2zr+wOP5DMAcLMC/ZtAAuRmS6BWCrPtj4PI/A7tT8A3hnKJWFrApyBtSdEvkfycUBnnSnnpWBof8xE/61XaT4Z5qDbrv1piJ25yZOWRbgJ4Jgb4ExvCucB3D0CNDKPWGOPQjicJpCw5lWb28MIequ1BsTnigaAgLYD2yhV2q/2VutLEka5Cs8IPIBdJPFavg/0jldpvZiUaa9dfwPQboEvUPzKAt+RuO56bPT94GVZPAPyvjBxwnmIyzTBPgvzSuL5uNJOWRN8eOuO9vdJmfqr9XcpXLTAOYJ7ATsPg3touT+UTghzY6VlWZzybikNenawOpZFFyB+SqOzspoDzZvlSnP0JDp+Z9cewn4iYT6d5LhLfqexDch8XCoFN26u85/prvf38Pb1h/sD+FNldDHg/SAPQXhKwDSA0+VK8+CmYdfr7NojBE8QeMyKrgF+kvib23e+9N3Bs4Y8BmJexBUKVyTeBumB7FYBseIa5zi3X+4kEkVx5Kf/2trM9PTQOwLpCIi53EhIdbighhG+cKutj1KdXDBKJ2zK9U59wTHYpkAzFpgxwLoB/rLkNXeIc9zZvF4wCSbt5HRMaSe2tk8TxDt50u4tXG2FMuZkS11sGteTDfNkyf6Y9Gi8k/MhJzdplEyq8kVRjPMv4Yt7MK5KE1sAAAAASUVORK5CYII=" alt="🪙"> Gold</span><b style="color:var(--brass-bright);">${bs.rewards.gold}</b></div>
        <div style="display:flex;justify-content:space-between;background:var(--panel-light);border:1px solid var(--border);border-radius:10px;padding:10px 16px;font-size:14px;"><span>✨ XP</span><b style="color:var(--prestige);">${bs.rewards.xp}</b></div>
        ${bs.rewards.shards ? `<div style="display:flex;justify-content:space-between;background:var(--panel-light);border:1px solid var(--border);border-radius:10px;padding:10px 16px;font-size:14px;"><span><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA6xJREFUSEt1lk1oXFUYhp/33NiIKAVdtHSmSiWWWtSY4CYImuJCKuimIGjBqISIYIVaWgSDTQuCP5Qi/fEHS8WF4EYXIu50Nt0I7cSIuJEqbUwN3RQlttq557V3bu7MvTOTuxjOvfOd837v934/R1QeAabzK2ev+ZN/7Dxly/IRPWbZtvKntdcL1B9x8GMR7klimB3lwvkSXtXProvtVdXBARjzYdM7SAewDiPvBEaMXhlLFz+vcJIpky6Ir0niZ7ava4Ur5wh6dbT1x3fzoX4I4izBT8SYTIi45cG49KIgXSOGqyEagNwMtf0S7yplwoEXgIcE3xiekdhgc1tbFKthe3aMpTO9Cq0yyGQoxMzX86pdBOqGlwQftQ3N1//6ppl14foliV9s7i1iK3P5BtjcaFw62St4R4Pij3NJfadS/pE8R2Ayx9brSvjRqb8V/B3F8WBmDHe095lGtOYy98ZYbJSAuyEqUrAZajPAAeR9juFKdFweCtoNTCXodIrfzKl7LlXyg1JfdRLXyzqCNT3uxUaR6ANEFvNDGx+PURMJetqRZQK/A7fIrT3W0FlwHamI6mkiWzKmbSJRO3IG3SrpS9Mm9UnBVRMTobcI/En0CRK2yjrlNtV8m/EnskZQBmAcwyCAXNhC5wxghWtnbw3DPxH5jYSbST1l6T2Jp6p14w+J2qbAZAabMRhnUIhKDaBJbTLJbIMbmXiStw3H/7ZeC8N/5cRNFqJcs3Acx/tyBv0AmX3OtVS9GYMQPG44kgFkmxVbGxyGlntTEHjfZrQMMCCLygCiqdqkFKdBu4k0MgGTGEbSEH/taTiZX2sAdGurrw5yBpww3l4wcGRMCc3e5lplkIuca1Ct6UqU2lkU/H1RQMAKwV9incq3dbOoj4G1Y8zdNB1YB5nIBH8q+bBgM9ZBY3WFLULquVbki4SwkSSuJyu0qOk166Ag1VR9EnlK8DziiMy+G0J+hYkEdgFLiuxy0KPgt1f7VCPNWoVQzqASot4ZBOdC7Y2A9wOvQR6arNm1HPamJCvDuv6xxZOlcF3OWseol072TsA+kTtMqD2swDHD7cJ3tbsPPpTHVQc7bpnVdn3pTHfc5qes1kHPdO3sbB+YLIRNRw17KgDSwdxTHxv10t5g0kHjswLQxew3XUg2Pxsdjxp/0PZMejlBe+9fHZklnyoXg24W9VZQqeEUub/AnXe3Qus5IZKYfPYAF86XzMoXjsppPa2iPN3WQu1tGH13mY5Bdvj/vuTOM+9PyqQAAAAASUVORK5CYII=" alt="🔷"> Shards</span><b style="color:var(--skill);">${bs.rewards.shards}</b></div>` : ''}
        ${bs.rewards.gemDrop ? `<div style="display:flex;justify-content:space-between;background:var(--panel-light);border:1px solid var(--border);border-radius:10px;padding:10px 16px;font-size:14px;"><span><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2VJREFUSEuNlk2IHFUUhb/zesaJC0EXbgwOBARNdCVBBZNZxKTTrQEVguJCQYiBxBAQjMGRSKIJATG4GDAqiiIYBBdRnGS6ZwYRBhJ/0IXkZxHBlXEZMCNGZ/odra7q6qrqnuhbdBfvvrr3nHvuu7fEikuAVzYPWIafT3a7KzcPPuSuiiY5Cy/In4fAyQNUwgw6/Z87VRDXZyBn6FZKVwo/ZVCkkp5PftMA2fvN+bjOHT0x1J0h3sDJkcjtscP6lFDiOXGc0UskC5xv1fVZz21mTcVszPrcsnhwxPwEjPeF8eloHQniPWDMNXZpmf2Izb3M2Uxjdipw2au4rT2h3/oMUudHgEnMJwq8Y7PQRSEWOpHXg3gLuDtz+HMM7KpFDhgmBIvL+M4gvS/TNJ5p18PDPRY0W37MgZNpXSj5e0mBRXd4XqPsc+RNzLpikUS4VIM9iGNEJh2499/XD+ZnzKHWVh3Uti+9enmU57rpCJgOUpebz3SsWwKszV9K7D0QvbSLb+kwIlhfMgnXAj+oOR+fdEdrU2EzBpmAtr6ReKBc3oYgExHB7jJOnksrFT+Ki12RG/NxJ5F3q/fk2ig3rVrie+Cu0mXMCy/xr40yC0Pu/LOtuj7Kq6g55302b/Qrp1vie6NYLbw/ATLkJrclpm2meuC6VOTdM/VwPElIidrWOR+WeaXA5LzEDpuzxcAFIXcgXsirK6kP82K7rmO985XcQXPOUzZ7cic17qDDCeC+XCcpYfe7zPYoZvNLJx1obdHhYqrzFBXpN2f9se2nk0sQzatBLGGOVjT6APMXYncW4GirHiarOuatotoRG+34OUGPyvyyJB4ZMRdKjRYamOPAGompmS3aOyyNKYNKU+s5asx5DrNZeIPRa8CmLkJxQeZl4y9An7bqeqqKvCT6kGGQ2gWNts9i/yh0zuLtrMEdkhg3jLfqyvtRiUGGstTsilHTZmu2n/GNVxf5DlMP4nJS747cE2qc+HPE93+9KVwrDp/iECw1u0GK/Z7eOO1bY2AiBJ6xGJP4MIwxe2pjuFIdZ9VWX5oHZQbFOQr1ltcosCFp16M1ZqYf0q/D9MuB9lOUpztlV4FQrJzHv/LNf/+BTm3TlaKj683nQQ0qQ3zodCturjRNMwSVAP/xiTCsFlcKkLn6B/RWcNXdxjx2AAAAAElFTkSuQmCC" alt="💎"> Gems</span><b style="color:var(--gem);">${bs.rewards.gemDrop}</b></div>` : ''}
      </div>
      ${Object.keys(bs.rewards.loot).length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:4px;">${Object.entries(bs.rewards.loot).map(([k,v])=>`<span class="resource-chip">${ITEMS[k].icon} ${v}</span>`).join('')}</div>` : ''}
      ${bs.rewards.gearDrop ? `<div style="background:var(--panel-light);border:1px solid ${GEAR_TIERS[bs.rewards.gearDrop.tier].color};border-radius:8px;padding:8px 14px;font-size:13px;color:${GEAR_TIERS[bs.rewards.gearDrop.tier].color};">[${GEAR_TIERS[bs.rewards.gearDrop.tier].symbol}] ${bs.rewards.gearDrop.name}</div>` : ''}
      <button class="act-btn buy" style="width:auto;padding:12px 36px;font-size:14px;margin-top:6px;" onclick="closeBattle()">Continue</button>
    </div>`
    : bs.lost ? `
    <div style="position:absolute;inset:0;background:rgba(5,12,10,0.88);backdrop-filter:blur(4px);z-index:10;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:20px;text-align:center;animation:fadeIn 0.3s ease-out;">
      <div style="font-size:56px;">💀</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:24px;color:var(--red);">Defeat</div>
      <div style="font-size:13px;color:var(--dim);">${m.nameAr} defeated you.</div>
      <button class="act-btn red" style="width:auto;padding:12px 36px;font-size:14px;margin-top:6px;" onclick="closeBattle()">Continue</button>
    </div>`
    : bs.fled ? `
    <div style="position:absolute;inset:0;background:rgba(5,12,10,0.88);backdrop-filter:blur(4px);z-index:10;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:20px;text-align:center;animation:fadeIn 0.3s ease-out;">
      <div style="font-size:56px;">🏃</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:22px;color:var(--copper);">You fled!</div>
      <button class="act-btn" style="width:auto;padding:12px 36px;font-size:14px;margin-top:6px;" onclick="closeBattle()">Continue</button>
    </div>`
    : '';

  // Skill button (first class skill)
  const skillBtn = cls ? (()=>{
    const sk = cls.skills[0];
    let manaCost = 0, skillLabel = sk.nameAr;
    if(sk.key==='powerStrike') manaCost = 10;
    else if(sk.key==='keenEye') manaCost = 8;
    else if(sk.key==='arcanePower') manaCost = 15;
    else if(sk.key==='fastHeal') manaCost = 10;
    else if(sk.key==='profitableDeal') manaCost = 5;
    const hasMana = state.mana >= manaCost;
    return { key: sk.key, label: skillLabel, mana: manaCost, disabled: !canAct || !hasMana };
  })() : null;

  // Item menu overlay
  const itemMenuHtml = battleItemMenuOpen ? `
    <div style="position:absolute;bottom:0;left:0;right:0;background:var(--panel);border-top:1px solid var(--border);border-radius:16px 16px 0 0;padding:16px;z-index:20;animation:slideUp 0.25s ease-out;" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="font-size:13px;color:var(--dim);font-family:'Cairo',sans-serif;font-weight:700;">🧪 Use Item</div>
        <button style="background:none;border:none;color:var(--dim);font-size:18px;cursor:pointer;" onclick="toggleBattleItems()">✕</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${Object.keys(BREAD_TIERS).map(key=>{ const have = state.inv[key]||0; if(have<1) return ''; const b = BREAD_TIERS[key]; return `<button class="mini-btn" style="border-color:var(--health);color:var(--health);padding:8px 12px;" onclick="useBattleItem('${key}')">${ITEMS[key].icon} ${b.name} +${b.heal}HP ×${have}</button>`; }).join('')}
        ${Object.keys(ENERGY_POTION_TIERS).map(key=>{ const have = state.inv[key]||0; if(have<1) return ''; const p = ENERGY_POTION_TIERS[key]; return `<button class="mini-btn" style="border-color:var(--brass-bright);color:var(--brass-bright);padding:8px 12px;" onclick="useBattleItem('${key}')">${ITEMS[key].icon} ${p.name} +${p.energy}<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡"> ×${have}</button>`; }).join('')}
        ${(state.inv.health_potion||0)>0 ? `<button class="mini-btn" style="border-color:var(--health);color:var(--health);padding:8px 12px;" onclick="useBattleItem('health_potion')">💚 Health Potion +30-50HP ×${state.inv.health_potion}</button>` : ''}
      </div>
    </div>
  ` : '';

  // Codex overlay
  const codexHtml = battleCodexOpen ? `
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(5,12,10,0.92);backdrop-filter:blur(6px);z-index:20;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s ease-out;" onclick="if(event.target===this)toggleBattleCodex()">
      <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:20px;width:100%;max-width:360px;" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:16px;color:var(--brass-bright);"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAArdJREFUSEuNlr1rFUEUxX9nGxtrwcJChShBRAtRsMgLBAIWNoKSQqysxV4QwX/A2krSRW2FoPBeQFGLoIiFBoxCECsbCyEWc8zs7Mfsvn0hAwn75uvcc++5945AIIMZHCIu5f/TtjTTG81kuxq/pg7Uy7ZH1fKuCr1NN6bVYM8LjpQz0qQL2RrUAMSNdhhJxSTY5wX3qssfARPghqSn5b7gecQq+A7obrXvoQp9cPAoATaGK158DljYuyhafBF4Cd4G/QQeg9dA1w0XhP9irSE+gVf29tw2LCjSMkuI95VBG5I+lgwcPEZsg7+AtoB3wDxmBbECPgz6AbwG/wZdBY4Dv4Bn1d9X4JJhTnAaOCFpMQHYY8Oo9ld0tfBn0AvDE8EO8AcI4AJr0yIePgbcAq7sgZwpY9ReMlFRAwSPrRZgSE6SFOxTgn+SvttO0nNU4cAJUwOUMRgn//cOZBZFgHQpqJAc0ndn5Axg0nFRA5Cbk+ENA3RvbMHK+UmRYpAYNDEYJGFUFArB0SFR9w2bPoPMY0MMBpM5JWKhCsBIRQvQGFRJo41zzSDJNAV5FuVkdXDLoP6ebRKZi0JoVTRDGJ0YZGAz49yqKOVBlcUzVJHckjOoFbUP6SwGKZOTTLNMiRpPQUtBrqXZsjmQivZh0PDpBjaPR0+a+c8sk/NSMWhU46JY1KKiNqYTbergARKtaiqli5I0x2X7UbE4GINeJleJVsr0GmIOfBZ0mVTEOiGp3HK/SrQHTS3qZv4O4g3EUs6WpOepTPX6n+2T4GXQMrAMPtRRUVuLdjHrFuuCdRX61vTRqhP3AHKktMPBR8FLUrHaFLtUKm6CX0lF7AnNyNtybPVVrc3auly9AXq0YsvqtcMh9m2jTNV8n6bfY5Nzn/UE6aV1Ga+pWjL4Hpn1Tmns7T1t2kv+A0C2mDG3mYcHAAAAAElFTkSuQmCC" alt="📖"> Codex — ${m.nameAr}</div>
          <button style="background:none;border:none;color:var(--dim);font-size:18px;cursor:pointer;" onclick="toggleBattleCodex()">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;color:var(--dim);margin-bottom:12px;">
          <div>👹 Level: <b style="color:var(--text);">${m.level}</b></div>
          <div><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="❤️"> HP: <b style="color:var(--text);">${m.maxHp}</b></div>
          <div>⚔️ ATK: <b style="color:var(--text);">${m.atkMin}-${m.atkMax}</b></div>
          <div>🛡️ DEF: <b style="color:var(--text);">${m.def}</b></div>
          <div>💨 SPD: <b style="color:var(--text);">${m.spd}</b></div>
          <div>🎯 Crit: <b style="color:var(--text);">${(m.crit*100).toFixed(0)}%</b></div>
        </div>
        <div style="font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Expected Loot</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
          ${m.loot.map(l=>`<span class="resource-chip" style="font-size:10px;">${ITEMS[l.item].icon} ${l.min}-${l.max} ${ITEMS[l.item].name}</span>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--dim);">💰 Gold: ${m.goldMin}-${m.goldMax}g · ✨ XP: ${m.xp}</div>
      </div>
    </div>
  ` : '';

  return `<div style="position:relative;display:flex;flex-direction:column;height:100%;min-height:calc(100vh - 60px);background:linear-gradient(180deg,#0a140f 0%,#142820 40%,#1a3020 100%);overflow:hidden;">
    <!-- Top Bar -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;z-index:5;">
      <div>
        <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:18px;color:var(--text);text-transform:uppercase;letter-spacing:0.05em;">${m.name}</div>
        <div style="font-size:12px;color:var(--dim);">Level ${m.level}</div>
      </div>
      <button class="mini-btn" style="border-color:var(--border);color:var(--dim);font-size:12px;padding:6px 12px;display:flex;align-items:center;gap:6px;" onclick="toggleBattleCodex()"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAArdJREFUSEuNlr1rFUEUxX9nGxtrwcJChShBRAtRsMgLBAIWNoKSQqysxV4QwX/A2krSRW2FoPBeQFGLoIiFBoxCECsbCyEWc8zs7Mfsvn0hAwn75uvcc++5945AIIMZHCIu5f/TtjTTG81kuxq/pg7Uy7ZH1fKuCr1NN6bVYM8LjpQz0qQL2RrUAMSNdhhJxSTY5wX3qssfARPghqSn5b7gecQq+A7obrXvoQp9cPAoATaGK158DljYuyhafBF4Cd4G/QQeg9dA1w0XhP9irSE+gVf29tw2LCjSMkuI95VBG5I+lgwcPEZsg7+AtoB3wDxmBbECPgz6AbwG/wZdBY4Dv4Bn1d9X4JJhTnAaOCFpMQHYY8Oo9ld0tfBn0AvDE8EO8AcI4AJr0yIePgbcAq7sgZwpY9ReMlFRAwSPrRZgSE6SFOxTgn+SvttO0nNU4cAJUwOUMRgn//cOZBZFgHQpqJAc0ndn5Axg0nFRA5Cbk+ENA3RvbMHK+UmRYpAYNDEYJGFUFArB0SFR9w2bPoPMY0MMBpM5JWKhCsBIRQvQGFRJo41zzSDJNAV5FuVkdXDLoP6ebRKZi0JoVTRDGJ0YZGAz49yqKOVBlcUzVJHckjOoFbUP6SwGKZOTTLNMiRpPQUtBrqXZsjmQivZh0PDpBjaPR0+a+c8sk/NSMWhU46JY1KKiNqYTbergARKtaiqli5I0x2X7UbE4GINeJleJVsr0GmIOfBZ0mVTEOiGp3HK/SrQHTS3qZv4O4g3EUs6WpOepTPX6n+2T4GXQMrAMPtRRUVuLdjHrFuuCdRX61vTRqhP3AHKktMPBR8FLUrHaFLtUKm6CX0lF7AnNyNtybPVVrc3auly9AXq0YsvqtcMh9m2jTNV8n6bfY5Nzn/UE6aV1Ga+pWjL4Hpn1Tmns7T1t2kv+A0C2mDG3mYcHAAAAAElFTkSuQmCC" alt="📖"> Codex</button>
    </div>

    <!-- Battle Scene -->
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;padding:0 20px;gap:24px;">
      <!-- Grass background hint -->
      <div style="position:absolute;bottom:30%;left:0;right:0;height:40%;background:linear-gradient(0deg,rgba(30,60,35,0.6) 0%,transparent 100%);pointer-events:none;"></div>

      <!-- Characters Row -->
      <div style="display:flex;justify-content:space-between;align-items:flex-end;width:100%;max-width:420px;position:relative;z-index:2;">
        <!-- Player -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="font-size:52px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));animation:${canAct?'none':'shake 0.5s ease-in-out'};">${cls?cls.icon:'🧙'}</div>
          <!-- HP Bar -->
          <div style="width:90px;height:10px;background:#3a1a1a;border-radius:5px;overflow:hidden;border:1px solid #5a2a2a;position:relative;">
            <div style="width:${pPct}%;height:100%;background:linear-gradient(90deg,#c44c4c,#e06060);transition:width 0.4s ease-out;"></div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:8px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.8);font-weight:700;">${Math.floor(pHp)}</div>
          </div>
          <!-- MP Bar -->
          <div style="width:90px;height:6px;background:#1a2a3a;border-radius:3px;overflow:hidden;border:1px solid #2a4a5a;">
            <div style="width:${manaPct}%;height:100%;background:linear-gradient(90deg,#4a8cc4,#6ab8e0);transition:width 0.4s ease-out;"></div>
          </div>
          <div style="font-size:10px;color:var(--dim);font-family:'JetBrains Mono',monospace;">${Math.floor(state.mana)} MP</div>
        </div>

        <!-- VS or Charge indicator -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          ${chargeText ? `<div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:16px;color:var(--brass-bright);text-shadow:0 0 12px rgba(212,162,76,0.4);animation:pulse 1s ease-in-out infinite;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡"> ${chargeText}</div>` : `<div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:14px;color:var(--dim);opacity:0.5;">VS</div>`}
          ${bs.isDefending ? `<div style="font-size:11px;color:var(--skill);font-weight:700;">🛡️ Defending</div>` : ''}
          ${m.burnTurns > 0 ? `<div style="font-size:11px;color:var(--copper);font-weight:700;">🔥 Burn ${m.burnTurns}t</div>` : ''}
        </div>

        <!-- Monster -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="font-size:52px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));">${m.icon}</div>
          <!-- HP Bar -->
          <div style="width:90px;height:10px;background:#3a1a1a;border-radius:5px;overflow:hidden;border:1px solid #5a2a2a;position:relative;">
            <div style="width:${mPct}%;height:100%;background:linear-gradient(90deg,#c44c4c,#e06060);transition:width 0.4s ease-out;"></div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:8px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.8);font-weight:700;">${Math.floor(mHp)}</div>
          </div>
          <div style="font-size:10px;color:var(--dim);font-family:'JetBrains Mono',monospace;">${m.nameAr}</div>
        </div>
      </div>

      <!-- Mini Log -->
      <div style="width:100%;max-width:400px;height:32px;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;">
        ${logLines || '<span style="color:var(--dim);font-size:11px;">Battle started...</span>'}
      </div>
    </div>

    <!-- Action Buttons -->
    <div style="padding:12px 16px 24px;display:flex;flex-direction:column;gap:8px;z-index:5;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <!-- CHARGE -->
        <button class="battle-btn" style="${!canAct?'opacity:0.35;':''}" ${!canAct?'disabled':''} onclick="chargeAttack()">
          <div style="font-size:10px;color:var(--dim);margin-bottom:2px;">20 MANA</div>
          <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.08em;">CHARGE</div>
        </button>
        <!-- ATTACK -->
        <button class="battle-btn" style="${!canAct?'opacity:0.35;':''}" ${!canAct?'disabled':''} onclick="playerAttackAction(false)">
          <div style="font-size:22px;margin-bottom:2px;">⚔️</div>
          <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.08em;">ATTACK</div>
        </button>
        <!-- DEFEND -->
        <button class="battle-btn" style="${!canAct?'opacity:0.35;':''}" ${!canAct?'disabled':''} onclick="defendStance()">
          <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.08em;">DEFEND</div>
        </button>
        <!-- SKILL -->
        <button class="battle-btn" style="border-color:${skillBtn && !skillBtn.disabled ? 'var(--prestige)' : 'var(--border)'};color:${skillBtn && !skillBtn.disabled ? 'var(--prestige)' : 'var(--dim)'};${(skillBtn && skillBtn.disabled) || !canAct ? 'opacity:0.35;' : ''}" ${(skillBtn && skillBtn.disabled) || !canAct ? 'disabled' : ''} onclick="useSkill('${skillBtn ? skillBtn.key : ''}')">
          <div style="font-size:22px;margin-bottom:2px;">✨</div>
          <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.08em;">SKILL</div>
          ${skillBtn ? `<div style="font-size:9px;color:var(--dim);margin-top:1px;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA/xJREFUSEt9Vl1oW2UYft4vacdoNUlJRmvT5WQ6xW5F3NVQ/GmTeqFzF4r1YoKIP7iBDhQG4sALERR0KOKVN5tMwe1GEX+wSQPFsV0Mlbk5duFyssmqbU1OWtT0J98j5+Sc05OT2HORfDnf+73v8z7v+z5fBBAAhPdQqISi/RfdFsEj7cc7rO1t57EXM6n5fr3272c5K7O/lLi2e7y2/WLXQCGnXWO4L/0AZ/r/2NaINi5BkBTIoyAOa8GJfC1zctMkBBAGOfDg0gFtb6OUuGFornwB4C57m4AVoXqxqfSxfM0Ybg/Qghb87ASwsSuFgcqoEKdA7goaCuRxAs+QvJCvG6+3OdkEtU+4m1aLIgEKsfJhgbzvZmCn3VgHRqOCH7fqyK33LI1U7b3pePlBv27Cat7acSFIUbj+fg2KMfNTJfI9hX2aOKaAsxOWMT6dKB9UWsYg8ifAF0hcc+zAOwGMAtKrgG/RbLw5vnzHop9puMjFWPkIRN4BZSpXz5z2W4tAMWZ+AyVXRPTnE9XsudmkObS2jlcB2QNwDLAbAyZEnpqoZc4EW9/PwHb4Q/LKTSvNLSegMagiPVPj1eHf7fezycrQ/YuZOQ/dTNwsEfCpsqfIcSRAk/rph6wdnwTbPwjWWU8nzEcilLcJPZ2zsq+Eu6iUMPdp6iOA3AJBGsQigTIhr9l09RLb76tnam6bhprM7ZBCvPISRC/natnjHoLzZE8jeT31z3pzm1KyVXTvjUFraG4XZNXzUoxVnqdwb94ynvUmouuwFuNmmYLTIO4FdEqgUgTibZx6HjQaFD0vErEb4WdQbteKByerxuUOe68VI1AfkkxCMBjWqzCiYA1cWbsE8N2clT3uTHJ4Moux8pMQ2d1k88tmXf/SG9uS1tIcUaLSANPUGIkAcS1SpeiqovpLC6qKrK7qv8/1SP9jAPfk68ahNrHzNHUmXnmZ4Aet2FwDZJ7AgoAL4qxlgeCyAvog0kdymEBaAfZ3qgVaf5Wzsvs7AwgwEzcPkfjItiPdFnRFXRz56lA3V9bo2jvIjuYt461QDVqHZ/vmUmvRlfmu1Xcp9XkPGXnvlZbJiaVMwa9B2FkxXjkF8InuQVry7GXjZ+kLkVxdUat3P1zdudQ1A/t0aeDqXk11NnDZubE2ucI8SompXN1w5KaVgc9puxYWY+XnKPjYk4FgPXxZ9hH4Z7/OWcY+7ybunIOQ3hZi5kkBDvwfVb682wuNy7klw1ZYH3TXOQijKyTMA0K+AcjOsC451SAaAN7L1Y2jYQI7axAi3Tvw3c3XB6KyPilKbhPIGEmloX9ViPwWBS8+YGV/2riZ2zLwW7iznuHbIwB/o2EC/3pC8O2f/wEgF7MwmSw7rgAAAABJRU5ErkJggg==" alt="🔮"> ${skillBtn.mana} MP</div>` : ''}
        </button>
        <!-- FLEE -->
        <button class="battle-btn" style="${!canAct?'opacity:0.35;':''}" ${!canAct?'disabled':''} onclick="attemptFlee()">
          <div style="font-size:22px;margin-bottom:2px;">👢</div>
          <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.08em;">FLEE</div>
        </button>
        <!-- ITEM -->
        <button class="battle-btn" style="${!canAct?'opacity:0.35;':''}" ${!canAct?'disabled':''} onclick="toggleBattleItems()">
          <div style="font-size:22px;margin-bottom:2px;">🧪</div>
          <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.08em;">ITEM</div>
        </button>
      </div>
      <!-- Forfeit row -->
      <div style="display:flex;justify-content:center;gap:8px;margin-top:4px;">
        <button class="mini-btn" style="font-size:10px;padding:4px 12px;opacity:0.6;" onclick="fleeBattle()">🏃 Forfeit</button>
      </div>
    </div>

    ${resultHtml}
    ${itemMenuHtml}
    ${codexHtml}
  </div>
  <style>
    .battle-btn {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      color: var(--text);
      padding: 14px 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 72px;
      transition: all 0.15s;
      position: relative;
      overflow: hidden;
    }
    .battle-btn:hover:not(:disabled) {
      border-color: var(--brass);
      background: linear-gradient(180deg, rgba(212,162,76,0.08) 0%, rgba(212,162,76,0.02) 100%);
      transform: translateY(-1px);
    }
    .battle-btn:active:not(:disabled) {
      transform: scale(0.97);
    }
    .battle-btn:disabled {
      cursor: not-allowed;
    }
  
  </style>`;
}

// ─── UI Renderers ───
function renderBodyHTML(){
  if(battleState && activeTab==='combat') return renderBattle();
  switch(activeTab){
    case 'production': return renderProduction();
    case 'inventory': return renderInventory();
    case 'crafting': return renderCrafting();
    case 'market': return renderMarket();
    case 'combat': return renderCombat();
    case 'gear': return renderGear();
    case 'class': return renderClass();
    case 'skills': return renderSkills();
    case 'missions': return renderMissions();
    case 'leaderboard': return renderLeaderboard();
    case 'companies': return renderCompanies();
    case 'settings': return renderSettings();
    default: return '';
  }
}

function renderProduction(){
  const cap = getStorageCap(state);
  const maxH = getMaxHealth(state);
  const resCards = Object.keys(RESOURCES).map(key=>{
    const r = RESOURCES[key];
    const full = state.inv[key] >= cap;
    const cost = getEnergyCost(state, 1);
    const bonus = state.prestige.gatherBonus > 0 ? ` <span class="stat-pill">+${state.prestige.gatherBonus}</span>` : '';
    const pct = Math.min(100, (state.inv[key]/cap)*100);
    return `<div class="card">
      <div class="card-top"><div class="card-icon">${r.icon}</div><div><div class="card-name">${r.name}</div><div class="card-sub">${fmtG(state.inv[key])} / ${fmtG(cap)}</div></div></div>
      <div class="bar-track"><div class="bar-fill ${full?'warn':''}" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
        <span style="font-size:10px;color:var(--dim);font-family:'JetBrains Mono',monospace;">${pct.toFixed(0)}%</span>
        ${bonus}
      </div>
      <button class="act-btn" style="margin-top:8px;" ${state.energy<cost||full?'disabled':''} onclick="collect('${key}')">Gather (<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">${cost})</button>
    </div>`;
  }).join('');
  const maxE = getMaxEnergy(state);
  const ePct = maxE > 0 ? (state.energy/maxE)*100 : 0;
  return `
    <div class="grid">${resCards}</div>
    <div class="section-title"><h2><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="🍖"> Recovery</h2><div class="rule"></div></div>
    <div class="panel">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
        <div class="card" style="padding:12px;">
          <div style="font-size:13px;color:var(--dim);margin-bottom:8px;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡"> Energy</div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="flex:1;"><div class="bar-track" style="height:10px;"><div class="bar-fill ${ePct<20?'warn':''}" style="width:${ePct}%"></div></div></div>
            <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--brass-bright);">${state.energy}/${maxE}</span>
          </div>
          <div style="font-size:11px;color:var(--dim);">Regenerates 1 point every 5 minutes</div>
        </div>
        <div class="card" style="padding:12px;">
          <div style="font-size:13px;color:var(--dim);margin-bottom:8px;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="❤️"> Health</div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="flex:1;"><div class="bar-track" style="height:10px;"><div class="bar-fill health ${state.health<maxH*0.3?'health':''}" style="width:${(state.health/maxH)*100}%"></div></div></div>
            <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--health);">${Math.floor(state.health)}/${maxH}</span>
          </div>
          <div style="font-size:11px;color:var(--dim);">Regenerates 1 point every 30 seconds</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
        <button class="act-btn copper" style="width:auto;padding:9px 18px;" ${state.inv.food<5?'disabled':''} onclick="eat()">🍞 Eat 5 Food (+5<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">)</button>
        <button class="act-btn red" style="width:auto;padding:9px 18px;" ${(state.inv.food<5||state.health>=maxH)?'disabled':''} onclick="healWithFood()">🩹 Heal (+20<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="❤️">)</button>
      </div>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
        <div style="font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">🍞 Crafted Consumables — No Energy Cost</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${Object.keys(BREAD_TIERS).map(key=>{
            const b = BREAD_TIERS[key];
            const have = state.inv[key]||0;
            const maxed = state.health >= getMaxHealth(state);
            return `<button class="mini-btn" style="border-color:var(--health);color:var(--health);" ${(have<1||maxed)?'disabled':''} onclick="consumeBread('${key}')">${ITEMS[key].icon} ${b.name} (+${b.heal} HP) ×${have}</button>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
          ${Object.keys(ENERGY_POTION_TIERS).map(key=>{
            const p = ENERGY_POTION_TIERS[key];
            const have = state.inv[key]||0;
            const maxed = state.energy >= getMaxEnergy(state);
            return `<button class="mini-btn" style="border-color:var(--brass-bright);color:var(--brass-bright);" ${(have<1||maxed)?'disabled':''} onclick="consumeEnergyPotion('${key}')">${ITEMS[key].icon} ${p.name} (+${p.energy}<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">) ×${have}</button>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

function renderInventory(){
  const cap = getStorageCap(state);
  const totalItems = Object.values(state.inv).reduce((a,b)=>a+b,0);
  const storagePct = Math.min(100, (totalItems/cap)*100);
  const allCards = Object.keys(ITEMS).map(key=>{
    const it = ITEMS[key];
    const pct = Math.min(100, (state.inv[key]/cap)*100);
    const isResource = RESOURCES[key] !== undefined;
    const isBread = BREAD_TIERS[key] !== undefined;
    const isEnergy = ENERGY_POTION_TIERS[key] !== undefined;
    const isHealthPotion = key === 'health_potion';
    const canConsume = (isBread || isEnergy || isHealthPotion) && (state.inv[key]||0) > 0;
    let consumeBtn = '';
    if(isBread){
      const maxed = state.health >= getMaxHealth(state);
      consumeBtn = `<button class="mini-btn" style="border-color:var(--health);color:var(--health);margin-top:8px;width:100%;" ${maxed?'disabled':''} onclick="consumeBread('${key}')">🍽️ Eat (+${BREAD_TIERS[key].heal} HP)</button>`;
    } else if(isEnergy){
      const maxed = state.energy >= getMaxEnergy(state);
      consumeBtn = `<button class="mini-btn" style="border-color:var(--brass-bright);color:var(--brass-bright);margin-top:8px;width:100%;" ${maxed?'disabled':''} onclick="consumeEnergyPotion('${key}')">🧪 Drink (+${ENERGY_POTION_TIERS[key].energy}<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">)</button>`;
    } else if(isHealthPotion){
      const maxed = state.health >= getMaxHealth(state);
      consumeBtn = `<button class="mini-btn" style="border-color:var(--health);color:var(--health);margin-top:8px;width:100%;" ${maxed?'disabled':''} onclick="consumeBread('${key}')">🍽️ Use (+30-50 HP)</button>`;
    }
    return `<div class="card">
      <div class="card-top"><div class="card-icon" style="font-size:26px;">${it.icon}</div><div><div class="card-name">${it.name}</div><div class="card-sub">${fmtG(state.inv[key])} / ${fmtG(cap)}</div></div></div>
      <div class="bar-track"><div class="bar-fill ${isResource?'':'warn'}" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;">
        <span style="font-size:10px;color:var(--dim);font-family:'JetBrains Mono',monospace;">${pct.toFixed(0)}%</span>
        <span style="font-size:10px;color:var(--dim);">${isResource?'Resource':(isBread||isEnergy||isHealthPotion?'Consumable':'Good')}</span>
      </div>
      ${consumeBtn}
    </div>`;
  }).join('');
  return `
    <div class="panel" style="margin-bottom:14px;padding:12px 16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:13px;color:var(--dim);">Total Storage Used</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--brass-bright);">${fmtG(totalItems)} / ${fmtG(cap)}</span>
      </div>
      <div class="bar-track" style="height:10px;"><div class="bar-fill ${storagePct>90?'warn':''}" style="width:${storagePct}%"></div></div>
    </div>
    <div class="grid">${allCards}</div>`;
}

function renderCrafting(){
  const cap = getStorageCap(state);
  const cards = Object.keys(RECIPES).map(key=>{
    const r = RECIPES[key];
    const g = GOODS[key];
    const locked = state.level < r.minLevel;
    const hasInputs = Object.keys(r.inputs).every(inp=> state.inv[inp] >= r.inputs[inp]);
    const hasSpace = state.inv[key]+r.output <= cap;
    const cost = getEnergyCost(state, r.energyCost);
    const hasEnergy = state.energy >= cost;
    const inputsHtml = Object.keys(r.inputs).map(inp=>{
      const have = state.inv[inp] || 0;
      const need = r.inputs[inp];
      const enough = have >= need;
      return `<span class="resource-chip" style="border-color:${enough?'var(--green)':'var(--red)'};color:${enough?'var(--green)':'var(--red)'};">${ITEMS[inp].icon} ${have}/${need}</span>`;
    }).join(' ');
    const canCraft = !locked && hasInputs && hasSpace && hasEnergy;
    return `<div class="card ${canCraft?'animate-glow':''}" style="${canCraft?'border-color:rgba(212,162,76,0.3);':''}">
      <div class="card-top"><div class="card-icon">${g.icon}</div><div><div class="card-name">${g.name}</div><div class="card-sub">Produces ${r.output} · <img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">${cost} · +${r.xp}XP</div></div></div>
      <div style="margin:8px 0;display:flex;flex-wrap:wrap;gap:5px;">${inputsHtml}</div>
      ${locked ? `<div class="locked-tag"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAqBJREFUSEuVVjtrFUEYPWd+gZUSK21UiGXsb1ASLBTBB4q2klYLBYkQA9pooa3YGhQfCFolKDe9wSoRY6OVAXvBao47j52dmd2b4MJddpj5vnO+8z3mEns8BCCEt6RDfkXzcy87t++s3C+8NWxipQOE7gA8CeC4PyVsgvgEaJHG/Am2BKjop6MVAPInA5N0EcCrdtv5KQ20DfC0IX9M4Nedz6XwJKVzAN4F544ZV0B8jGCnAFzNgKcN+bUQIwaUCCXiBGS1D9AXgIcjwCXSvE6BhjMpOgFbBGZI/q3FqHIQYGV1GdALyK1xjOT2kIySjgL4FveukHw5pHgvB7K61+iyBOCtIS+0OewXAiFr34A436RnmaSzK6rGU+wKMQoivQd0BuAjkreH6yudfSjgFqEPNOZsTqIr08qDpDGgEcRlGscqSBeqsKxpHy19tOskZ1MEsWSrJAdH1mpMYNR4KwASu6zkpSRnBtAJVfVB6thxw2jU6ZpHUKrsAJrAlhpCZQSRzZ6dnDKUd2n67mcnz2gvB5LTHePUflXrhqVvuljBccS0OoQDs6RZb2dPEYGk53mH+ij9if6Q2KWyVkhzrQfgorbSJoTp0F+Jb/rerVyzvS2SfigW0zQCqCD7X8Q7QqbpuBYwNVoccKsA5tKAy2dnDhbSUE3WZLVmaOYn5WARwv3ceGBEZ94r1AB5lzQP2ruh6ANJcxBWJ1VRHtmg63BgnuRa2/CFRF4mq8cibvRvolbVPPm9tD8heTO/InsAMRefAcxMrM6qfONyg+SJHLJotHyEWWmKwAKE6yIOVtdkneFfAJ4BeErDnXqkD86idtpIdkrAgrutADh2+/2e8BuEi3LDOyZ3JvVIfxZV/zDypaQjvoHI78lhftfWl0Gj3T9vdCwxhL+7FwAAAABJRU5ErkJggg==" alt="🔒"> Requires level ${r.minLevel}</div>` :
        `<div style="display:flex;gap:6px;">
          <button class="act-btn" style="flex:1;" ${(!hasInputs||!hasSpace||!hasEnergy)?'disabled':''} onclick="craft('${key}')">Craft</button>
          <button class="act-btn buy" style="flex:1;" ${(!hasInputs||!hasSpace||!hasEnergy)?'disabled':''} onclick="craftMax('${key}')">Craft Max</button>
        </div>`}
    </div>`;
  }).join('');
  return `<div class="grid">${cards}</div>`;
}

function renderMarket(){
  const cap = getStorageCap(state);
  const mult = getSellMult(state);
  const rows = Object.keys(ITEMS).map(key=>{
    const it = ITEMS[key];
    const price = state.prices[key];
    const prev = state.prevPrices[key];
    const trendUp = price >= prev;
    const trendPct = prev > 0 ? ((price/prev)-1)*100 : 0;
    const owned = state.inv[key];
    const canBuy1 = state.gold >= price && state.inv[key]+1<=cap;
    const canBuy10 = state.gold >= price*10 && state.inv[key]+10<=cap;
    const canBuyMax = state.gold >= Math.ceil(price) && state.inv[key]<cap;
    const canSell1 = owned >= 1;
    const canSell10 = owned >= 10;
    const canSellMax = owned >= 1;
    const bonusText = mult > 0.92 ? ` <span class="stat-pill">${(mult*100).toFixed(0)}%</span>` : '';
    const sparkline = sparklineSVG(state.priceHistory[key] || []);
    return `<div class="market-row">
      <div class="market-left">
        <div class="card-icon" style="font-size:26px;">${it.icon}</div>
        <div>
          <div class="card-name">${it.name}</div>
          <div class="market-owned">${fmtG(owned)} owned · Cap ${fmtG(cap)}</div>
        </div>
      </div>
      <div style="text-align:center;min-width:60px;">
        ${sparkline}
      </div>
      <div style="text-align:center;min-width:80px;">
        <div class="market-price" style="font-size:15px;">${price.toFixed(1)}g</div>
        <div class="market-trend ${trendUp?'up':'down'}" style="font-size:11px;">${trendUp?'▲':'▼'} ${Math.abs(trendPct).toFixed(1)}%</div>
      </div>
      <div class="market-actions">
        <button class="mini-btn buy" ${canBuy1?'':'disabled'} onclick="buy('${key}',1)">Buy ×1</button>
        <button class="mini-btn buy" ${canBuy10?'':'disabled'} onclick="buy('${key}',10)">×10</button>
        <button class="mini-btn buy" ${canBuyMax?'':'disabled'} onclick="buy('${key}','max')">Max</button>
        <button class="mini-btn sell" ${canSell1?'':'disabled'} onclick="sell('${key}',1)">Sell ×1</button>
        <button class="mini-btn sell" ${canSell10?'':'disabled'} onclick="sell('${key}',10)">×10</button>
        <button class="mini-btn sell" ${canSellMax?'':'disabled'} onclick="sell('${key}','max')">All${bonusText}</button>
      </div>
    </div>`;
  }).join('');
  return `
    <div class="panel" style="padding:0;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--panel-light);">
        <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:13px;color:var(--brass-bright);"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAmlJREFUSEuFVr2KVDEYPedr7F0ZmEIQLEQQrLaxWgutt3EtRLQQFPcN1sLGzhdYC5tlQZ1tFhQbC7dRfAIbFUQ7YWQLK4scTXKTySa5M4EZQm5uvuT85RK+EYBCr2jdwfg8PyrnEKCGdeK4//c/SBLJ0D9RrHq/3MRiiWZnYRE5t0njYS5gpK/ftG6NJRuX0xTADoAfJJ9WJyiPWaExhl4Bl5y7+3/zjwGcA/DAyGexgJPM+ifI63Zxb2mT0wcA3yG8ofGF3zIkN8pB5i1ydRXAGZIHmYNigqQdAZeNvCnpPMlvLckVFFWBXQD3hylbvlDShZO7BPETiOskP6ZlWogyDaVOYl/SnOSapBsCZvSyErdoPJD0DsAXkg9ruk7KNCu19YGkXyQnaQFfCMJsEPsxxLM0/im13lVRCUvSkuQ2BVwzcrs2ZigErdFst/ZKRXKr+jQiaV/AcyPfL/zYureXBwGiaLQKllLjcnPz+I/O6bi0GxWdeZJOQfhpxsm42/vhsTIqhqy6BeEKjdspryJPrfNrY3Z94KR7BL6SPPITnLQP4RWNr/tADKOd4Mo+oPk0Da5+Ke9W4AKA20YeOWkOYErybxO3nrmU0p28ygVArAPYA/AWwBMAFwF4R/p4mNE4ae+M5ek7qC1mEYDPgB6RdlhofwOAl+UeyTvdQF1BQ5eDUg+SNgBNSfPJuPwQnWIRd+cUOeiHvqTTNP6Oq68s06wS7oNcYMk1Oaag8qqoruUg5OI+iGfMGs+AjO26wmQUokhy2/xoAi4kc9hO6gyMhJFyWu77D4nwSvrEaHKmiu7xKFwYrYboHw4CaSz/QJEYAAAAAElFTkSuQmCC" alt="📊"> Live Market</div>
        <div style="font-size:11px;color:var(--dim);">Prices update every 15 seconds · Sparklines show last 12 ticks</div>
      </div>
      ${rows}
    </div>`;
}

function renderCombat(){
  const maxH = getMaxHealth(state);
  const hPct = maxH > 0 ? (state.health/maxH)*100 : 0;
  const hBarClass = hPct > 50 ? 'ok' : (hPct > 20 ? 'warn' : '');
  const pStats = getPlayerCombatStats();
  const zoneCards = ZONES.map(z => {
    const unlocked = state.level >= z.levelMin;
    const cost = getEnergyCost(state, z.energyCost);
    const canFight = unlocked && state.energy >= cost && state.health > 0;
    const monsters = ZONE_MONSTERS[z.id];
    const avgGold = monsters ? Math.round(monsters.reduce((a,m)=>a+(m.goldMin+m.goldMax)/2,0)/monsters.length) : 0;
    const avgXp = monsters ? Math.round(monsters.reduce((a,m)=>a+m.xp,0)/monsters.length) : 0;
    return `<div class="card" style="${unlocked?'':'opacity:0.45;'} ${canFight?'border-color:'+z.color+';':''}">
      <div class="card-top"><div class="card-icon" style="font-size:28px;">${z.icon}</div><div><div class="card-name" style="color:${unlocked?z.color:'var(--dim)'};">${z.nameAr}</div><div class="card-sub">${z.name} · Lv.${z.levelMin}-${z.levelMax===999?'∞':z.levelMax}</div></div></div>
      <div style="font-size:11px;color:var(--dim);margin:6px 0;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">${cost} energy · ~${avgGold}g · ~${avgXp}XP</div>
      <button class="act-btn" style="width:100%;${canFight?'':'opacity:0.4;'}" ${canFight?`onclick="startBattle('${z.id}')"`:''}>${!unlocked?'<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAqBJREFUSEuVVjtrFUEYPWd+gZUSK21UiGXsb1ASLBTBB4q2klYLBYkQA9pooa3YGhQfCFolKDe9wSoRY6OVAXvBao47j52dmd2b4MJddpj5vnO+8z3mEns8BCCEt6RDfkXzcy87t++s3C+8NWxipQOE7gA8CeC4PyVsgvgEaJHG/Am2BKjop6MVAPInA5N0EcCrdtv5KQ20DfC0IX9M4Nedz6XwJKVzAN4F544ZV0B8jGCnAFzNgKcN+bUQIwaUCCXiBGS1D9AXgIcjwCXSvE6BhjMpOgFbBGZI/q3FqHIQYGV1GdALyK1xjOT2kIySjgL4FveukHw5pHgvB7K61+iyBOCtIS+0OewXAiFr34A436RnmaSzK6rGU+wKMQoivQd0BuAjkreH6yudfSjgFqEPNOZsTqIr08qDpDGgEcRlGscqSBeqsKxpHy19tOskZ1MEsWSrJAdH1mpMYNR4KwASu6zkpSRnBtAJVfVB6thxw2jU6ZpHUKrsAJrAlhpCZQSRzZ6dnDKUd2n67mcnz2gvB5LTHePUflXrhqVvuljBccS0OoQDs6RZb2dPEYGk53mH+ij9if6Q2KWyVkhzrQfgorbSJoTp0F+Jb/rerVyzvS2SfigW0zQCqCD7X8Q7QqbpuBYwNVoccKsA5tKAy2dnDhbSUE3WZLVmaOYn5WARwv3ceGBEZ94r1AB5lzQP2ruh6ANJcxBWJ1VRHtmg63BgnuRa2/CFRF4mq8cibvRvolbVPPm9tD8heTO/InsAMRefAcxMrM6qfONyg+SJHLJotHyEWWmKwAKE6yIOVtdkneFfAJ4BeErDnXqkD86idtpIdkrAgrutADh2+/2e8BuEi3LDOyZ3JvVIfxZV/zDypaQjvoHI78lhftfWl0Gj3T9vdCwxhL+7FwAAAABJRU5ErkJggg==" alt="🔒"> Locked':(state.health<=0?'<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="❤️"> Rest needed':(state.energy<cost?'<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡"> No energy':'⚔️ Adventure'))}</button>
    </div>`;
  }).join('');
  return `
    <div class="panel" style="text-align:center;padding:18px;margin-bottom:14px;">
      <div style="display:flex;justify-content:space-around;align-items:center;max-width:480px;margin:0 auto;flex-wrap:wrap;gap:10px;">
        <div style="text-align:center;"><div style="font-size:28px;">${state.playerClass?CLASS_DATA[state.playerClass].icon:'🧙'}</div><div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:13px;">You</div><div style="font-size:11px;color:var(--dim);">ATK ${pStats.atk} · DEF ${pStats.def} · SPD ${pStats.spd}</div></div>
        <div style="font-family:'Cairo',sans-serif;font-size:24px;color:var(--brass-bright);">VS</div>
        <div style="text-align:center;"><div style="font-size:28px;">👹</div><div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:13px;">Monster</div><div style="font-size:11px;color:var(--dim);">Zone encounter</div></div>
      </div>
      <div style="width:100%;max-width:320px;margin:14px auto;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--dim);margin-bottom:3px;"><span>Health</span><span>${Math.floor(state.health)} / ${maxH}</span></div>
        <div class="health-bar"><div class="health-bar-fill ${hBarClass}" style="width:${hPct}%"></div></div>
      </div>
      <div style="font-size:12px;color:var(--dim);margin-top:8px;">Crit ${(pStats.crit*100).toFixed(0)}% · Dodge ${(pStats.dodge*100).toFixed(0)}% · Pierce ${(pStats.pierce*100).toFixed(0)}% · <img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA/xJREFUSEt9Vl1oW2UYft4vacdoNUlJRmvT5WQ6xW5F3NVQ/GmTeqFzF4r1YoKIP7iBDhQG4sALERR0KOKVN5tMwe1GEX+wSQPFsV0Mlbk5duFyssmqbU1OWtT0J98j5+Sc05OT2HORfDnf+73v8z7v+z5fBBAAhPdQqISi/RfdFsEj7cc7rO1t57EXM6n5fr3272c5K7O/lLi2e7y2/WLXQCGnXWO4L/0AZ/r/2NaINi5BkBTIoyAOa8GJfC1zctMkBBAGOfDg0gFtb6OUuGFornwB4C57m4AVoXqxqfSxfM0Ybg/Qghb87ASwsSuFgcqoEKdA7goaCuRxAs+QvJCvG6+3OdkEtU+4m1aLIgEKsfJhgbzvZmCn3VgHRqOCH7fqyK33LI1U7b3pePlBv27Cat7acSFIUbj+fg2KMfNTJfI9hX2aOKaAsxOWMT6dKB9UWsYg8ifAF0hcc+zAOwGMAtKrgG/RbLw5vnzHop9puMjFWPkIRN4BZSpXz5z2W4tAMWZ+AyVXRPTnE9XsudmkObS2jlcB2QNwDLAbAyZEnpqoZc4EW9/PwHb4Q/LKTSvNLSegMagiPVPj1eHf7fezycrQ/YuZOQ/dTNwsEfCpsqfIcSRAk/rph6wdnwTbPwjWWU8nzEcilLcJPZ2zsq+Eu6iUMPdp6iOA3AJBGsQigTIhr9l09RLb76tnam6bhprM7ZBCvPISRC/natnjHoLzZE8jeT31z3pzm1KyVXTvjUFraG4XZNXzUoxVnqdwb94ynvUmouuwFuNmmYLTIO4FdEqgUgTibZx6HjQaFD0vErEb4WdQbteKByerxuUOe68VI1AfkkxCMBjWqzCiYA1cWbsE8N2clT3uTHJ4Moux8pMQ2d1k88tmXf/SG9uS1tIcUaLSANPUGIkAcS1SpeiqovpLC6qKrK7qv8/1SP9jAPfk68ahNrHzNHUmXnmZ4Aet2FwDZJ7AgoAL4qxlgeCyAvog0kdymEBaAfZ3qgVaf5Wzsvs7AwgwEzcPkfjItiPdFnRFXRz56lA3V9bo2jvIjuYt461QDVqHZ/vmUmvRlfmu1Xcp9XkPGXnvlZbJiaVMwa9B2FkxXjkF8InuQVry7GXjZ+kLkVxdUat3P1zdudQ1A/t0aeDqXk11NnDZubE2ucI8SompXN1w5KaVgc9puxYWY+XnKPjYk4FgPXxZ9hH4Z7/OWcY+7ybunIOQ3hZi5kkBDvwfVb682wuNy7klw1ZYH3TXOQijKyTMA0K+AcjOsC451SAaAN7L1Y2jYQI7axAi3Tvw3c3XB6KyPilKbhPIGEmloX9ViPwWBS8+YGV/2riZ2zLwW7iznuHbIwB/o2EC/3pC8O2f/wEgF7MwmSw7rgAAAABJRU5ErkJggg==" alt="🔮"> ${state.mana}/${state.maxMana} MP</div>
    </div>
    <div class="grid">${zoneCards}</div>`;
}

function renderGear(){
  const forgeButton = `
    <div class="panel" style="text-align:center;padding:28px;background:radial-gradient(ellipse at center,rgba(212,162,76,0.06) 0%,transparent 70%);">
      <div style="font-size:42px;margin-bottom:8px;">⚒️</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:18px;color:var(--brass-bright);margin-bottom:6px;">The Forge</div>
      <div style="font-size:13px;color:var(--dim);margin-bottom:16px;max-width:320px;margin-left:auto;margin-right:auto;">Craft powerful gear from gathered materials. 36 recipes across 6 tiers.</div>
      <button class="act-btn" style="width:auto;padding:12px 32px;font-size:14px;" onclick="openForge()">Open Forge</button>
      <div style="font-size:11px;color:var(--dim);margin-top:12px;">Bag: <b>${state.gearBag.length}</b> / ${GEAR_BAG_LIMIT}</div>
    </div>`;

  let forgeModal = '';
  if(forgeSlot !== null){
    const slotInfo = GEAR_SLOTS[forgeSlot];
    const recipe = CRAFTABLE_GEAR[forgeSlot][forgeTier];
    const tier = GEAR_TIERS[forgeTier];
    const locked = state.level < recipe.levelReq;
    const hasInputs = Object.keys(recipe.inputs).every(inp=> state.inv[inp] >= recipe.inputs[inp]);
    const cost = getEnergyCost(state, recipe.energyCost);
    const hasEnergy = state.energy >= cost;
    const bagFull = state.gearBag.length >= GEAR_BAG_LIMIT;

    const tierButtons = CRAFTABLE_GEAR[forgeSlot].map((r, idx)=>{
      const t = GEAR_TIERS[idx];
      const active = idx === forgeTier;
      const tierLocked = state.level < r.levelReq;
      return `<button class="mini-btn ${active?'buy':''}" style="${active?'background:rgba(111,162,133,0.14);':''}color:${t.color};border-color:${t.color};${tierLocked?'opacity:0.4;':''}" onclick="selectForgeTier(${idx})" ${tierLocked?'disabled':''} title="Lv.${r.levelReq}">[${t.symbol}]</button>`;
    }).join('');

    const resourceRows = Object.keys(recipe.inputs).map(inp=>{
      const have = state.inv[inp] || 0;
      const need = recipe.inputs[inp];
      const enough = have >= need;
      const it = ITEMS[inp];
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:12.5px;">
        <span style="display:flex;align-items:center;gap:6px;"><span style="font-size:16px;">${it.icon}</span> ${it.name}</span>
        <span style="font-family:'JetBrains Mono',monospace;color:${enough?'var(--green)':'var(--red)'};font-weight:600;">${fmtG(have)} / ${fmtG(need)}</span>
      </div>`;
    }).join('');

    forgeModal = `
      <div class="modal-overlay" onclick="if(event.target===this)closeForge()">
        <div class="modal-box">
          <div class="modal-header">
            <h3>⚒️ Forge — ${slotInfo.icon} ${slotInfo.name}</h3>
            <button class="modal-close" onclick="closeForge()">✕</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom:14px;">
              <div style="font-size:11px;color:var(--dim);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Select Tier</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">${tierButtons}</div>
            </div>
            <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:14px;">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <div style="font-size:36px;">${recipe.icon}</div>
                <div>
                  <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:16px;color:${tier.color};">[${tier.symbol}] ${recipe.name}</div>
                  <div style="font-size:11px;color:var(--dim);margin-top:3px;">Lv.${recipe.levelReq} required · <img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡">${cost} energy · +${recipe.xp} XP</div>
                </div>
              </div>
              <div style="margin-bottom:12px;">${resourceRows}</div>
              ${locked ? `<div class="locked-tag" style="text-align:center;padding:10px;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAqBJREFUSEuVVjtrFUEYPWd+gZUSK21UiGXsb1ASLBTBB4q2klYLBYkQA9pooa3YGhQfCFolKDe9wSoRY6OVAXvBao47j52dmd2b4MJddpj5vnO+8z3mEns8BCCEt6RDfkXzcy87t++s3C+8NWxipQOE7gA8CeC4PyVsgvgEaJHG/Am2BKjop6MVAPInA5N0EcCrdtv5KQ20DfC0IX9M4Nedz6XwJKVzAN4F544ZV0B8jGCnAFzNgKcN+bUQIwaUCCXiBGS1D9AXgIcjwCXSvE6BhjMpOgFbBGZI/q3FqHIQYGV1GdALyK1xjOT2kIySjgL4FveukHw5pHgvB7K61+iyBOCtIS+0OewXAiFr34A436RnmaSzK6rGU+wKMQoivQd0BuAjkreH6yudfSjgFqEPNOZsTqIr08qDpDGgEcRlGscqSBeqsKxpHy19tOskZ1MEsWSrJAdH1mpMYNR4KwASu6zkpSRnBtAJVfVB6thxw2jU6ZpHUKrsAJrAlhpCZQSRzZ6dnDKUd2n67mcnz2gvB5LTHePUflXrhqVvuljBccS0OoQDs6RZb2dPEYGk53mH+ij9if6Q2KWyVkhzrQfgorbSJoTp0F+Jb/rerVyzvS2SfigW0zQCqCD7X8Q7QqbpuBYwNVoccKsA5tKAy2dnDhbSUE3WZLVmaOYn5WARwv3ceGBEZ94r1AB5lzQP2ruh6ANJcxBWJ1VRHtmg63BgnuRa2/CFRF4mq8cibvRvolbVPPm9tD8heTO/InsAMRefAcxMrM6qfONyg+SJHLJotHyEWWmKwAKE6yIOVtdkneFfAJ4BeErDnXqkD86idtpIdkrAgrutADh2+/2e8BuEi3LDOyZ3JvVIfxZV/zDypaQjvoHI78lhftfWl0Gj3T9vdCwxhL+7FwAAAABJRU5ErkJggg==" alt="🔒"> Requires player level ${recipe.levelReq}</div>` :
                `<button class="act-btn ${(!hasInputs||!hasEnergy||bagFull)?'':'buy'}" style="width:100%;padding:12px;" ${(!hasInputs||!hasEnergy||bagFull)?'disabled':''} onclick="craftGear('${forgeSlot}',${forgeTier})">
                  ${bagFull ? '<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA/FJREFUSEuNlltoXUUYhb+1NRIjJl6qaBRTpdZixBveDbWColjRoASrIEULebBK8daiKLRRvFJENGAfvD21tdqb4IME2yreHgSLtWIrGpGomJQabWq1zVnuf+85yTkntrhhH2bmzMw//1rrX7NFPAIZHA1cDFUHy/FDPA1LysmTg9Gq7U/p2l4G3Aj8GWtV7FD8tgo2KNOy2jM1nqYMMBGj9jjlYKXiiwRfKdPftVlW7GZBp6QvDpVxgFMHi115EvgI/DxoGjAN3FTOm3zKPDgAjADD4CVYFytTX+28ulU5HNFfB3wAvAhsAj4GfwYaS5sW6w1HCy4FrgCuBh4GLpR0x9QAieSK3YZ5CfEdBPZqBx4FOjCtZRLBepH4H+BBrGcQQ8DTwMlAr6T9VdhLiORCRRV7BvCAYUzwEKYT8S5wBtBtGE0ktxnWC34Brge2powPA56Q9FsV+TqSK/a5mAVJKouADw1PCS4HXgN+TPh0WNwt/DnW/RbXCl7B7EX0S/r+YAFOBR4B/spl+WDC8gD4faz5iHvLqtDLhtcF1wFNad4LwJHA45JGqrXVmEFMWJWTtgVY3lBenwD7EwdNqCA3xSsai0GzDd2ZsvFqeTbUAdgOPO+pWSrwcZOSLZIfNowoJGpGLPYJt4NWSDpvaiXHbvYxQLy353iflpN2bPRTxWaYCmIc2AP8nt49mBMRR6T+oGG1YLcyjYZwChW5UmlBvAfcmQMc1rARPAaKQtoG7kzSbDSlbXmtXJXXwBjQDMwNFQFvRlvS3lLZdgtwCrALM4R4Ne3UlTK6DBisd0Kmgz8FvQ0MAIdj5iFmgo8HDWU1AUIJm4EFwDdAfyKwCxVZRf9KIEuBK0kI9wGrDQOKANBrmCG8EmtOlml/NYPwnGHgbGB7TYDZFn3CawKisoDrHOlWrD4U1uIMayEqkIjKPiHk2hhgFvBO6S0TuA+Bb4HCxILMeP4BHgPWJ2gDva9B4V03pIKsCxAcLAZWpgBLi0IzX1qMC54FdgPnJOEHuaGyJTmpYQ/ng5fn+cW6ueC7QM/VktwGrA0MMRtQ4Y4nhfQMzcKLQAvTiSNGd1hC8p99pbz9K9YmxDXgVaCbJY1WIQqSg8RQyg+Jgx3AdMNGwRtRGyHrxIENPwnmY26yGBShHuIQRwGXhM2HqzZycHoEMPSrtN+OXKbfAq2Yny1mFmox2y3aRVg2Z5kiQNh6b8p8V5Cc1ZDcYtgp6MLsQKxISrjA8Fahogn91F07PaAew9ZkFfPKC8gDWLOUFYU28UlRSt9ea9giOBMzJ/87iFszec/U3jn05ONLLTYLdsbmkm476JVZ/eM/v0QaTeJ/9v8Fy5uWLrMnW18AAAAASUVORK5CYII=" alt="🎒"> Bag Full' : (!hasInputs ? '❌ Missing Materials' : (!hasEnergy ? '<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡"> Not Enough Energy' : `🔨 Forge ${recipe.name}`))}
                </button>`}
            </div>
            <div style="font-size:11px;color:var(--dim);text-align:center;">Bag: <b>${state.gearBag.length}</b> / ${GEAR_BAG_LIMIT}</div>
          </div>
        </div>
      </div>`;
  }

  const equipped = Object.keys(GEAR_SLOTS).map(slot=>{
    const info = GEAR_SLOTS[slot];
    const item = state.equipped[slot];
    if(!item){
      return `<div class="gear-slot empty">
        <div class="gear-slot-name">${info.icon} ${info.name}</div>
        <div style="font-size:12px;color:var(--dim);">Empty</div>
      </div>`;
    }
    const t = GEAR_TIERS[item.tier];
    const effStats = getGearEffectiveStats(item);
    const statsHtml = Object.keys(effStats).map(st=>{
      const val = effStats[st];
      const label = SKILLS[st].name;
      const display = st==='defense'||st==='profit' ? `+${(val*100).toFixed(0)}%` : `+${val}`;
      return `<div class="gear-stat">${label}: ${display}</div>`;
    }).join('');
    return `<div class="gear-slot" style="border-color:${t.color};">
      <div class="gear-slot-name">${info.icon} ${info.name}</div>
      <div class="gear-item-name" style="color:${t.color};">[${t.symbol}] ${item.name} <span class="upgrade-badge">+${item.upgradeLevel}</span></div>
      <div class="tier-badge" style="background:rgba(255,255,255,0.05);color:${t.color};border:1px solid ${t.color};">${t.name}</div>
      ${statsHtml}
      <button class="act-btn red" style="margin-top:8px;" onclick="unequipGear('${slot}')">Unequip</button>
    </div>`;
  }).join('');

  const bagItems = state.gearBag.map(item=>{
    const t = GEAR_TIERS[item.tier];
    const effStats = getGearEffectiveStats(item);
    const statsHtml = Object.keys(effStats).map(st=>{
      const val = effStats[st];
      const label = SKILLS[st].name;
      const display = st==='defense'||st==='profit' ? `+${(val*100).toFixed(0)}%` : `+${val}`;
      return `<div class="gear-stat">${label}: ${display}</div>`;
    }).join('');
    const canUpgrade = item.upgradeLevel < t.maxUpgrade;
    const nextReq = canUpgrade ? UPGRADE_TABLE[item.upgradeLevel] : null;
    const canAfford = nextReq && state.shards >= nextReq.shards && state.gold >= nextReq.gold && state.gems >= nextReq.gems;
    const scrapValue = getGearScrapValue(item);
    return `<div class="gear-bag-item" style="border-color:${t.color};">
      <div class="slot">${GEAR_SLOTS[item.slot].icon} ${GEAR_SLOTS[item.slot].name}</div>
      <div class="name" style="color:${t.color};">[${t.symbol}] ${item.name} <span class="upgrade-badge">+${item.upgradeLevel}</span></div>
      <div class="tier-badge" style="background:rgba(255,255,255,0.05);color:${t.color};border:1px solid ${t.color};">${t.name}</div>
      ${statsHtml}
      <div class="gear-actions">
        <button class="mini-btn buy" onclick="equipGear(${item.id})">Equip</button>
        ${canUpgrade ? `<button class="mini-btn" style="border-color:${t.color};color:${t.color};" ${canAfford?'':'disabled'} onclick="upgradeGear(${item.id})">Upgrade +${item.upgradeLevel+1}</button>` : ''}
        <button class="mini-btn sell" onclick="sellGear(${item.id})">Sell</button>
        <button class="mini-btn" onclick="destroyGear(${item.id})">Scrap (+${scrapValue}<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA6xJREFUSEt1lk1oXFUYhp/33NiIKAVdtHSmSiWWWtSY4CYImuJCKuimIGjBqISIYIVaWgSDTQuCP5Qi/fEHS8WF4EYXIu50Nt0I7cSIuJEqbUwN3RQlttq557V3bu7MvTOTuxjOvfOd837v934/R1QeAabzK2ev+ZN/7Dxly/IRPWbZtvKntdcL1B9x8GMR7klimB3lwvkSXtXProvtVdXBARjzYdM7SAewDiPvBEaMXhlLFz+vcJIpky6Ir0niZ7ava4Ur5wh6dbT1x3fzoX4I4izBT8SYTIi45cG49KIgXSOGqyEagNwMtf0S7yplwoEXgIcE3xiekdhgc1tbFKthe3aMpTO9Cq0yyGQoxMzX86pdBOqGlwQftQ3N1//6ppl14foliV9s7i1iK3P5BtjcaFw62St4R4Pij3NJfadS/pE8R2Ayx9brSvjRqb8V/B3F8WBmDHe095lGtOYy98ZYbJSAuyEqUrAZajPAAeR9juFKdFweCtoNTCXodIrfzKl7LlXyg1JfdRLXyzqCNT3uxUaR6ANEFvNDGx+PURMJetqRZQK/A7fIrT3W0FlwHamI6mkiWzKmbSJRO3IG3SrpS9Mm9UnBVRMTobcI/En0CRK2yjrlNtV8m/EnskZQBmAcwyCAXNhC5wxghWtnbw3DPxH5jYSbST1l6T2Jp6p14w+J2qbAZAabMRhnUIhKDaBJbTLJbIMbmXiStw3H/7ZeC8N/5cRNFqJcs3Acx/tyBv0AmX3OtVS9GYMQPG44kgFkmxVbGxyGlntTEHjfZrQMMCCLygCiqdqkFKdBu4k0MgGTGEbSEH/taTiZX2sAdGurrw5yBpww3l4wcGRMCc3e5lplkIuca1Ct6UqU2lkU/H1RQMAKwV9incq3dbOoj4G1Y8zdNB1YB5nIBH8q+bBgM9ZBY3WFLULquVbki4SwkSSuJyu0qOk166Ag1VR9EnlK8DziiMy+G0J+hYkEdgFLiuxy0KPgt1f7VCPNWoVQzqASot4ZBOdC7Y2A9wOvQR6arNm1HPamJCvDuv6xxZOlcF3OWseol072TsA+kTtMqD2swDHD7cJ3tbsPPpTHVQc7bpnVdn3pTHfc5qes1kHPdO3sbB+YLIRNRw17KgDSwdxTHxv10t5g0kHjswLQxew3XUg2Pxsdjxp/0PZMejlBe+9fHZklnyoXg24W9VZQqeEUub/AnXe3Qus5IZKYfPYAF86XzMoXjsppPa2iPN3WQu1tGH13mY5Bdvj/vuTOM+9PyqQAAAAASUVORK5CYII=" alt="🔷">)</button>
      </div>
      ${nextReq ? `<div style="font-size:10px;color:var(--dim);margin-top:4px;">Cost: <img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA6xJREFUSEt1lk1oXFUYhp/33NiIKAVdtHSmSiWWWtSY4CYImuJCKuimIGjBqISIYIVaWgSDTQuCP5Qi/fEHS8WF4EYXIu50Nt0I7cSIuJEqbUwN3RQlttq557V3bu7MvTOTuxjOvfOd837v934/R1QeAabzK2ev+ZN/7Dxly/IRPWbZtvKntdcL1B9x8GMR7klimB3lwvkSXtXProvtVdXBARjzYdM7SAewDiPvBEaMXhlLFz+vcJIpky6Ir0niZ7ava4Ur5wh6dbT1x3fzoX4I4izBT8SYTIi45cG49KIgXSOGqyEagNwMtf0S7yplwoEXgIcE3xiekdhgc1tbFKthe3aMpTO9Cq0yyGQoxMzX86pdBOqGlwQftQ3N1//6ppl14foliV9s7i1iK3P5BtjcaFw62St4R4Pij3NJfadS/pE8R2Ayx9brSvjRqb8V/B3F8WBmDHe095lGtOYy98ZYbJSAuyEqUrAZajPAAeR9juFKdFweCtoNTCXodIrfzKl7LlXyg1JfdRLXyzqCNT3uxUaR6ANEFvNDGx+PURMJetqRZQK/A7fIrT3W0FlwHamI6mkiWzKmbSJRO3IG3SrpS9Mm9UnBVRMTobcI/En0CRK2yjrlNtV8m/EnskZQBmAcwyCAXNhC5wxghWtnbw3DPxH5jYSbST1l6T2Jp6p14w+J2qbAZAabMRhnUIhKDaBJbTLJbIMbmXiStw3H/7ZeC8N/5cRNFqJcs3Acx/tyBv0AmX3OtVS9GYMQPG44kgFkmxVbGxyGlntTEHjfZrQMMCCLygCiqdqkFKdBu4k0MgGTGEbSEH/taTiZX2sAdGurrw5yBpww3l4wcGRMCc3e5lplkIuca1Ct6UqU2lkU/H1RQMAKwV9incq3dbOoj4G1Y8zdNB1YB5nIBH8q+bBgM9ZBY3WFLULquVbki4SwkSSuJyu0qOk166Ag1VR9EnlK8DziiMy+G0J+hYkEdgFLiuxy0KPgt1f7VCPNWoVQzqASot4ZBOdC7Y2A9wOvQR6arNm1HPamJCvDuv6xxZOlcF3OWseol072TsA+kTtMqD2swDHD7cJ3tbsPPpTHVQc7bpnVdn3pTHfc5qes1kHPdO3sbB+YLIRNRw17KgDSwdxTHxv10t5g0kHjswLQxew3XUg2Pxsdjxp/0PZMejlBe+9fHZklnyoXg24W9VZQqeEUub/AnXe3Qus5IZKYfPYAF86XzMoXjsppPa2iPN3WQu1tGH13mY5Bdvj/vuTOM+9PyqQAAAAASUVORK5CYII=" alt="🔷">${nextReq.shards} <img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2RJREFUSEuNVUuIHFUUPefV2NWFjpuMyfQniYoOmIkfRHEhkRHMTrJxiGaniyQkMmDUheDC1SxFCChxIQoijWYz+CEIigpBInGhggQXxkT6M8mYLBKdrv7UO9JVNdU1VdWjD7qhX993zr3n/ggQgOJvpE50P+nkX+XtRzejz2ZQKsbdgiDzV6GLsU2GIO9vsV9FEWfebiJIo/wf7yYKt/HHOKYtIiAQy+Vfrd/LIfYK2iFxFkYXQbS82fbXxfkbexARjLE2fsI2q9t8OAdo7CHQ7M8mPHqog26ldTqCKy6WEXToaTq33U79MIXXAez+DzV+KVebD6aLLUuTEIyM/LXaHIdcFrAYOZivs2zVGWsfKtVaP+cciVWJCOI+6Hbq30BYIAs6ICFLVYHwFgAHDk/aIR71+s6KueuSH9ZYLEmSA79dPwlgKetJApeJRsAP5ZJd7PXNBQM8LfAzGd2AxYo75SzzjsudjfSi264+T/L9DVkKI0iYCUK/+n2zr+wOP5DMAcLMC/ZtAAuRmS6BWCrPtj4PI/A7tT8A3hnKJWFrApyBtSdEvkfycUBnnSnnpWBof8xE/61XaT4Z5qDbrv1piJ25yZOWRbgJ4Jgb4ExvCucB3D0CNDKPWGOPQjicJpCw5lWb28MIequ1BsTnigaAgLYD2yhV2q/2VutLEka5Cs8IPIBdJPFavg/0jldpvZiUaa9dfwPQboEvUPzKAt+RuO56bPT94GVZPAPyvjBxwnmIyzTBPgvzSuL5uNJOWRN8eOuO9vdJmfqr9XcpXLTAOYJ7ATsPg3touT+UTghzY6VlWZzybikNenawOpZFFyB+SqOzspoDzZvlSnP0JDp+Z9cewn4iYT6d5LhLfqexDch8XCoFN26u85/prvf38Pb1h/sD+FNldDHg/SAPQXhKwDSA0+VK8+CmYdfr7NojBE8QeMyKrgF+kvib23e+9N3Bs4Y8BmJexBUKVyTeBumB7FYBseIa5zi3X+4kEkVx5Kf/2trM9PTQOwLpCIi53EhIdbighhG+cKutj1KdXDBKJ2zK9U59wTHYpkAzFpgxwLoB/rLkNXeIc9zZvF4wCSbt5HRMaSe2tk8TxDt50u4tXG2FMuZkS11sGteTDfNkyf6Y9Gi8k/MhJzdplEyq8kVRjPMv4Yt7MK5KE1sAAAAASUVORK5CYII=" alt="🪙">${nextReq.gold}${nextReq.gems?` <img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2VJREFUSEuNlk2IHFUUhb/zesaJC0EXbgwOBARNdCVBBZNZxKTTrQEVguJCQYiBxBAQjMGRSKIJATG4GDAqiiIYBBdRnGS6ZwYRBhJ/0IXkZxHBlXEZMCNGZ/odra7q6qrqnuhbdBfvvrr3nHvuu7fEikuAVzYPWIafT3a7KzcPPuSuiiY5Cy/In4fAyQNUwgw6/Z87VRDXZyBn6FZKVwo/ZVCkkp5PftMA2fvN+bjOHT0x1J0h3sDJkcjtscP6lFDiOXGc0UskC5xv1fVZz21mTcVszPrcsnhwxPwEjPeF8eloHQniPWDMNXZpmf2Izb3M2Uxjdipw2au4rT2h3/oMUudHgEnMJwq8Y7PQRSEWOpHXg3gLuDtz+HMM7KpFDhgmBIvL+M4gvS/TNJ5p18PDPRY0W37MgZNpXSj5e0mBRXd4XqPsc+RNzLpikUS4VIM9iGNEJh2499/XD+ZnzKHWVh3Uti+9enmU57rpCJgOUpebz3SsWwKszV9K7D0QvbSLb+kwIlhfMgnXAj+oOR+fdEdrU2EzBpmAtr6ReKBc3oYgExHB7jJOnksrFT+Ki12RG/NxJ5F3q/fk2ig3rVrie+Cu0mXMCy/xr40yC0Pu/LOtuj7Kq6g55302b/Qrp1vie6NYLbw/ATLkJrclpm2meuC6VOTdM/VwPElIidrWOR+WeaXA5LzEDpuzxcAFIXcgXsirK6kP82K7rmO985XcQXPOUzZ7cic17qDDCeC+XCcpYfe7zPYoZvNLJx1obdHhYqrzFBXpN2f9se2nk0sQzatBLGGOVjT6APMXYncW4GirHiarOuatotoRG+34OUGPyvyyJB4ZMRdKjRYamOPAGompmS3aOyyNKYNKU+s5asx5DrNZeIPRa8CmLkJxQeZl4y9An7bqeqqKvCT6kGGQ2gWNts9i/yh0zuLtrMEdkhg3jLfqyvtRiUGGstTsilHTZmu2n/GNVxf5DlMP4nJS747cE2qc+HPE93+9KVwrDp/iECw1u0GK/Z7eOO1bY2AiBJ6xGJP4MIwxe2pjuFIdZ9VWX5oHZQbFOQr1ltcosCFp16M1ZqYf0q/D9MuB9lOUpztlV4FQrJzHv/LNf/+BTm3TlaKj683nQQ0qQ3zodCturjRNMwSVAP/xiTCsFlcKkLn6B/RWcNXdxjx2AAAAAElFTkSuQmCC" alt="💎">${nextReq.gems}`:''} | ${(nextReq.chance*100).toFixed(0)}% success</div>` : ''}
    </div>`;
  }).join('');

  const totalGearStats = {};
  Object.keys(SKILLS).forEach(st=>{
    const bonus = getGearBonus(state, st);
    if(bonus > 0) totalGearStats[st] = bonus;
  });
  const totalStatsHtml = Object.keys(totalGearStats).length > 0
    ? Object.keys(totalGearStats).map(st=>{
        const val = totalGearStats[st];
        const label = SKILLS[st].name;
        const display = st==='defense'||st==='profit' ? `+${(val*100).toFixed(0)}%` : `+${val}`;
        return `<span class="bonus-tag">${label} ${display}</span>`;
      }).join('')
    : '<span style="color:var(--dim);font-size:12px;">No gear equipped</span>';

  const upgradeRows = UPGRADE_TABLE.map(u=>`
    <tr>
      <td>+${u.level}</td>
      <td><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA6xJREFUSEt1lk1oXFUYhp/33NiIKAVdtHSmSiWWWtSY4CYImuJCKuimIGjBqISIYIVaWgSDTQuCP5Qi/fEHS8WF4EYXIu50Nt0I7cSIuJEqbUwN3RQlttq557V3bu7MvTOTuxjOvfOd837v934/R1QeAabzK2ev+ZN/7Dxly/IRPWbZtvKntdcL1B9x8GMR7klimB3lwvkSXtXProvtVdXBARjzYdM7SAewDiPvBEaMXhlLFz+vcJIpky6Ir0niZ7ava4Ur5wh6dbT1x3fzoX4I4izBT8SYTIi45cG49KIgXSOGqyEagNwMtf0S7yplwoEXgIcE3xiekdhgc1tbFKthe3aMpTO9Cq0yyGQoxMzX86pdBOqGlwQftQ3N1//6ppl14foliV9s7i1iK3P5BtjcaFw62St4R4Pij3NJfadS/pE8R2Ayx9brSvjRqb8V/B3F8WBmDHe095lGtOYy98ZYbJSAuyEqUrAZajPAAeR9juFKdFweCtoNTCXodIrfzKl7LlXyg1JfdRLXyzqCNT3uxUaR6ANEFvNDGx+PURMJetqRZQK/A7fIrT3W0FlwHamI6mkiWzKmbSJRO3IG3SrpS9Mm9UnBVRMTobcI/En0CRK2yjrlNtV8m/EnskZQBmAcwyCAXNhC5wxghWtnbw3DPxH5jYSbST1l6T2Jp6p14w+J2qbAZAabMRhnUIhKDaBJbTLJbIMbmXiStw3H/7ZeC8N/5cRNFqJcs3Acx/tyBv0AmX3OtVS9GYMQPG44kgFkmxVbGxyGlntTEHjfZrQMMCCLygCiqdqkFKdBu4k0MgGTGEbSEH/taTiZX2sAdGurrw5yBpww3l4wcGRMCc3e5lplkIuca1Ct6UqU2lkU/H1RQMAKwV9incq3dbOoj4G1Y8zdNB1YB5nIBH8q+bBgM9ZBY3WFLULquVbki4SwkSSuJyu0qOk166Ag1VR9EnlK8DziiMy+G0J+hYkEdgFLiuxy0KPgt1f7VCPNWoVQzqASot4ZBOdC7Y2A9wOvQR6arNm1HPamJCvDuv6xxZOlcF3OWseol072TsA+kTtMqD2swDHD7cJ3tbsPPpTHVQc7bpnVdn3pTHfc5qes1kHPdO3sbB+YLIRNRw17KgDSwdxTHxv10t5g0kHjswLQxew3XUg2Pxsdjxp/0PZMejlBe+9fHZklnyoXg24W9VZQqeEUub/AnXe3Qus5IZKYfPYAF86XzMoXjsppPa2iPN3WQu1tGH13mY5Bdvj/vuTOM+9PyqQAAAAASUVORK5CYII=" alt="🔷"> ${u.shards}</td>
      <td><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2RJREFUSEuNVUuIHFUUPefV2NWFjpuMyfQniYoOmIkfRHEhkRHMTrJxiGaniyQkMmDUheDC1SxFCChxIQoijWYz+CEIigpBInGhggQXxkT6M8mYLBKdrv7UO9JVNdU1VdWjD7qhX993zr3n/ggQgOJvpE50P+nkX+XtRzejz2ZQKsbdgiDzV6GLsU2GIO9vsV9FEWfebiJIo/wf7yYKt/HHOKYtIiAQy+Vfrd/LIfYK2iFxFkYXQbS82fbXxfkbexARjLE2fsI2q9t8OAdo7CHQ7M8mPHqog26ldTqCKy6WEXToaTq33U79MIXXAez+DzV+KVebD6aLLUuTEIyM/LXaHIdcFrAYOZivs2zVGWsfKtVaP+cciVWJCOI+6Hbq30BYIAs6ICFLVYHwFgAHDk/aIR71+s6KueuSH9ZYLEmSA79dPwlgKetJApeJRsAP5ZJd7PXNBQM8LfAzGd2AxYo75SzzjsudjfSi264+T/L9DVkKI0iYCUK/+n2zr+wOP5DMAcLMC/ZtAAuRmS6BWCrPtj4PI/A7tT8A3hnKJWFrApyBtSdEvkfycUBnnSnnpWBof8xE/61XaT4Z5qDbrv1piJ25yZOWRbgJ4Jgb4ExvCucB3D0CNDKPWGOPQjicJpCw5lWb28MIequ1BsTnigaAgLYD2yhV2q/2VutLEka5Cs8IPIBdJPFavg/0jldpvZiUaa9dfwPQboEvUPzKAt+RuO56bPT94GVZPAPyvjBxwnmIyzTBPgvzSuL5uNJOWRN8eOuO9vdJmfqr9XcpXLTAOYJ7ATsPg3touT+UTghzY6VlWZzybikNenawOpZFFyB+SqOzspoDzZvlSnP0JDp+Z9cewn4iYT6d5LhLfqexDch8XCoFN26u85/prvf38Pb1h/sD+FNldDHg/SAPQXhKwDSA0+VK8+CmYdfr7NojBE8QeMyKrgF+kvib23e+9N3Bs4Y8BmJexBUKVyTeBumB7FYBseIa5zi3X+4kEkVx5Kf/2trM9PTQOwLpCIi53EhIdbighhG+cKutj1KdXDBKJ2zK9U59wTHYpkAzFpgxwLoB/rLkNXeIc9zZvF4wCSbt5HRMaSe2tk8TxDt50u4tXG2FMuZkS11sGteTDfNkyf6Y9Gi8k/MhJzdplEyq8kVRjPMv4Yt7MK5KE1sAAAAASUVORK5CYII=" alt="🪙"> ${u.gold}</td>
      <td>${u.gems ? '<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2VJREFUSEuNlk2IHFUUhb/zesaJC0EXbgwOBARNdCVBBZNZxKTTrQEVguJCQYiBxBAQjMGRSKIJATG4GDAqiiIYBBdRnGS6ZwYRBhJ/0IXkZxHBlXEZMCNGZ/odra7q6qrqnuhbdBfvvrr3nHvuu7fEikuAVzYPWIafT3a7KzcPPuSuiiY5Cy/In4fAyQNUwgw6/Z87VRDXZyBn6FZKVwo/ZVCkkp5PftMA2fvN+bjOHT0x1J0h3sDJkcjtscP6lFDiOXGc0UskC5xv1fVZz21mTcVszPrcsnhwxPwEjPeF8eloHQniPWDMNXZpmf2Izb3M2Uxjdipw2au4rT2h3/oMUudHgEnMJwq8Y7PQRSEWOpHXg3gLuDtz+HMM7KpFDhgmBIvL+M4gvS/TNJ5p18PDPRY0W37MgZNpXSj5e0mBRXd4XqPsc+RNzLpikUS4VIM9iGNEJh2499/XD+ZnzKHWVh3Uti+9enmU57rpCJgOUpebz3SsWwKszV9K7D0QvbSLb+kwIlhfMgnXAj+oOR+fdEdrU2EzBpmAtr6ReKBc3oYgExHB7jJOnksrFT+Ki12RG/NxJ5F3q/fk2ig3rVrie+Cu0mXMCy/xr40yC0Pu/LOtuj7Kq6g55302b/Qrp1vie6NYLbw/ATLkJrclpm2meuC6VOTdM/VwPElIidrWOR+WeaXA5LzEDpuzxcAFIXcgXsirK6kP82K7rmO985XcQXPOUzZ7cic17qDDCeC+XCcpYfe7zPYoZvNLJx1obdHhYqrzFBXpN2f9se2nk0sQzatBLGGOVjT6APMXYncW4GirHiarOuatotoRG+34OUGPyvyyJB4ZMRdKjRYamOPAGompmS3aOyyNKYNKU+s5asx5DrNZeIPRa8CmLkJxQeZl4y9An7bqeqqKvCT6kGGQ2gWNts9i/yh0zuLtrMEdkhg3jLfqyvtRiUGGstTsilHTZmu2n/GNVxf5DlMP4nJS747cE2qc+HPE93+9KVwrDp/iECw1u0GK/Z7eOO1bY2AiBJ6xGJP4MIwxe2pjuFIdZ9VWX5oHZQbFOQr1ltcosCFp16M1ZqYf0q/D9MuB9lOUpztlV4FQrJzHv/LNf/+BTm3TlaKj683nQQ0qQ3zodCturjRNMwSVAP/xiTCsFlcKkLn6B/RWcNXdxjx2AAAAAElFTkSuQmCC" alt="💎"> '+u.gems : '-'}</td>
      <td>${(u.chance*100).toFixed(0)}%</td>
    </tr>
  `).join('');

  return `
    ${forgeModal}
    <div class="section-title"><h2>⚒️ Forge</h2><div class="rule"></div><div class="sub">Craft gear from materials</div></div>
    ${forgeButton}
    <div class="section-title"><h2>🛡️ Equipped Gear</h2><div class="rule"></div></div>
    <div class="gear-equipped">${equipped}</div>
    <div class="panel" style="margin-top:12px;">
      <div style="font-size:13px;color:var(--dim);margin-bottom:8px;">Total equipped gear bonuses:</div>
      <div class="bonus-row" style="justify-content:flex-start;">${totalStatsHtml}</div>
    </div>
    <div class="section-title"><h2>Gear Bag (${state.gearBag.length})</h2><div class="rule"></div></div>
    ${state.gearBag.length === 0 ? '<div class="panel" style="text-align:center;color:var(--dim);padding:20px;">Bag is empty. Defeat monsters to find gear!</div>' : `<div class="gear-bag">${bagItems}</div>`}
    <div class="section-title"><h2>Upgrade Table</h2><div class="rule"></div><div class="sub">Failure downgrades by 1 (except +0)</div></div>
    <div class="panel" style="overflow-x:auto;">
      <table class="upgrade-table">
        <tr><th>Level</th><th>Shards</th><th>Gold</th><th>Gems</th><th>Success</th></tr>
        ${upgradeRows}
      </table>
    </div>
    <div class="panel" style="margin-top:12px;">
      <div style="font-size:12px;color:var(--dim);line-height:1.6;">
        <b>Tier Limits:</b> Common (+0), Uncommon (+1), Rare (+2), Epic (+3), Legendary (+5), Mythic (+7)<br>
        <b>Shards</b> drop from every battle win. <b>Gems</b> are rare drops. Higher tier gear has more stats and higher base power.
      </div>
    </div>
  `;
}

function renderCompanies(){
  const cap = getStorageCap(state);
  const mgmtLevel = getCompanyManagementLevel(state.level);
  const maxAllowed = getMaxAllowedCompanies(state.level);
  const currentCount = state.companies.length;
  const canBuild = currentCount < MAX_COMPANIES && currentCount < maxAllowed;
  const nextConcreteCost = currentCount > 0 && currentCount < MAX_COMPANIES ? getConcreteCost(currentCount + 1) : 0;

  // Build modal
  let buildModal = '';
  if(state.companyBuildResource !== null){
    const chosenRes = state.companyBuildResource || COMPANY_RESOURCES[0];
    const it = ITEMS[chosenRes];
    const isFirstCompany = currentCount === 0;
    const hasConcrete = isFirstCompany || state.inv.concrete >= nextConcreteCost;
    const costText = isFirstCompany 
      ? '<span class="resource-chip" style="border-color:var(--green);color:var(--green);">🎁 Free!</span>'
      : `<span class="resource-chip" style="${hasConcrete?'border-color:var(--green);color:var(--green);':'border-color:var(--red);color:var(--red);'}">🧱 ${nextConcreteCost} Concrete</span>`;

    buildModal = `
      <div class="modal-overlay" onclick="if(event.target===this)cancelBuild()">
        <div class="modal-box">
          <div class="modal-header"><h3>🏗️ Build New Company</h3><button class="modal-close" onclick="cancelBuild()">✕</button></div>
          <div class="modal-body">
            <div style="font-size:12px;color:var(--dim);margin-bottom:12px;">Choose what resource this company will produce:</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px;">
              ${COMPANY_RESOURCES.map(res => {
                const rIt = ITEMS[res];
                const active = res === chosenRes;
                return `<button class="mini-btn ${active?'buy':''}" style="padding:8px 4px;font-size:11px;${active?'background:rgba(111,162,133,0.14);':''}" onclick="selectBuildResource('${res}')">
                  <div style="font-size:18px;margin-bottom:2px;">${rIt.icon}</div><div>${rIt.name}</div>
                </button>`;
              }).join('')}
            </div>
            <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center;">
              <div style="font-size:40px;margin-bottom:6px;">${it.icon}</div>
              <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;color:var(--brass-bright);">${it.name}</div>
              <div style="font-size:11px;color:var(--dim);margin-top:4px;">Production: ${ENGINE_PRODUCTION[1]}/hour · Engine Lv.1</div>
            </div>
            <div style="margin-top:14px;text-align:center;">
              <div style="font-size:12px;color:var(--dim);margin-bottom:8px;">Cost: ${costText}</div>
              <button class="act-btn buy" style="width:100%;padding:12px;" ${hasConcrete?'':'disabled'} onclick="buildCompany()">
                ${hasConcrete ? `🏗️ Build ${it.name} Company` : 'Not Enough Concrete'}
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }

  // Company cards
  const companyCards = state.companies.map((c, idx) => {
    const it = ITEMS[c.resource];
    const rate = ENGINE_PRODUCTION[c.engineLevel];
    const maxCap = rate * 24;
    const pct = maxCap > 0 ? (c.stored / maxCap) * 100 : 0;
    const canCollect = c.stored >= 1 && !c.disabled;
    const space = cap - state.inv[c.resource];
    const canUpgrade = c.engineLevel < 10;
    const upgradeCost = canUpgrade ? ENGINE_UPGRADE_COST[c.engineLevel + 1] : 0;
    const hasSteel = state.inv.steel >= upgradeCost;
    const menuOpen = state.companyMenuOpen === c.id;
    const isDisabled = c.disabled;
    const isChanging = state.companyChangeResourceId === c.id;

    const menuItems = [];
    menuItems.push({icon:'🔄', label:'Change production', action:`startChangeResource(${c.id});`, cls:''});

    if(canUpgrade){
      const ok = hasSteel ? '✓' : '✗';
      const okCls = hasSteel ? 'ok' : 'fail';
      menuItems.push({icon:'⚙️', label:'Upgrade automated engine', cost:`⚙️ ${state.inv.steel}/${upgradeCost} ${ok}`, action:`upgradeEngine(${c.id});closeCompanyMenu();`, cls:hasSteel?'':'disabled', checkCls:okCls});
    } else {
      menuItems.push({icon:'⚙️', label:'Upgrade automated engine', cost:'Max level', action:'', cls:'disabled', checkCls:''});
    }

    if(idx > 0){
      menuItems.push({icon:'⬆️', label:'Move to top', action:`moveCompanyToTop(${c.id});`, cls:''});
    }

    menuItems.push({icon:isDisabled?'▶️':'⏸️', label:isDisabled?'Enable company':'Disable company', action:`disableCompany(${c.id});`, cls:''});

    const menuHtml = menuOpen ? `
      <div class="company-menu" onclick="event.stopPropagation()">
        ${menuItems.map(item => `
          <div class="company-menu-item ${item.cls}" ${item.action ? `onclick="${item.action}"` : ''}>
            <span class="icon">${item.icon}</span>
            <span class="label">${item.label}</span>
            ${item.cost ? `<span class="check ${item.checkCls}">${item.cost}</span>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';

    const changeResourcePicker = isChanging ? `
      <div style="margin-top:10px;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:6px;" onclick="event.stopPropagation()">
        <div style="font-size:11px;color:var(--dim);margin-bottom:8px;">Select new production (500g):</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
          ${COMPANY_RESOURCES.map(res => {
            const rIt = ITEMS[res];
            const active = res === c.resource;
            return `<button class="mini-btn ${active?'buy':''}" style="padding:6px 2px;font-size:10px;${active?'opacity:0.4;cursor:not-allowed;':''}" ${active?'disabled':''} onclick="selectChangeResource(${c.id},'${res}')">
              <div style="font-size:16px;">${rIt.icon}</div><div>${rIt.name}</div>
            </button>`;
          }).join('')}
        </div>
        <button class="mini-btn" style="width:100%;margin-top:8px;" onclick="cancelChangeResource()">Cancel</button>
      </div>
    ` : '';

    return `<div class="company-card" style="${isDisabled?'opacity:0.5;':''}${canCollect?'border-color:rgba(111,162,133,0.3);':''}">
      <button class="company-menu-btn" onclick="event.stopPropagation();toggleCompanyMenu(${c.id})">⋯</button>
      ${menuHtml}
      <div class="company-header">
        <div class="company-icon">${it.icon}</div>
        <div class="company-info">
          <div class="company-name">${it.name}${isDisabled?' <span style="color:var(--dim);font-size:11px;">(paused)</span>':''}</div>
          <div class="company-meta">Company #${c.id} · Engine Lv.${c.engineLevel} · ${rate}/hr</div>
        </div>
      </div>
      <div class="company-bar"><div class="company-bar-fill ${pct>90?'warn':''}" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--dim);margin-top:4px;font-family:'JetBrains Mono',monospace;">
        <span>${Math.floor(c.stored)} stored</span>
        <span>${pct.toFixed(0)}% · ${maxCap} cap</span>
      </div>
      <button class="act-btn buy" style="width:100%;margin-top:10px;padding:10px;" ${(!canCollect || space<=0)?'disabled':''} onclick="collectFromCompany(${c.id})">
        ${space<=0?'❌ Storage Full':(canCollect?`📦 Collect ${Math.min(Math.floor(c.stored),space)} ${it.icon}`:'⏳ Nothing to Collect')}
      </button>
      ${changeResourcePicker}
    </div>`;
  }).join('');

  const buildSection = currentCount >= MAX_COMPANIES ? '' : `
    <div class="panel" style="text-align:center;padding:24px;background:radial-gradient(ellipse at center,rgba(111,162,133,0.06) 0%,transparent 70%);">
      <div style="font-size:36px;margin-bottom:8px;">🏗️</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:16px;color:var(--brass-bright);margin-bottom:6px;">Build New Company</div>
      <div style="font-size:12px;color:var(--dim);margin-bottom:12px;"><b>${currentCount}</b> / ${MAX_COMPANIES} companies · Management <b>Lv.${mgmtLevel}</b></div>
      ${canBuild ? `
        <div style="font-size:12px;color:var(--dim);margin-bottom:10px;">
          ${currentCount === 0 ? '<span class="resource-chip" style="border-color:var(--green);color:var(--green);">🎁 First company is FREE</span>' : `<span class="resource-chip">🧱 ${nextConcreteCost} Concrete</span>`}
          ${currentCount >= 2 ? `<span style="margin-left:8px;" class="resource-chip">🏭 Lv.${currentCount-1} Mgmt</span>` : ''}
        </div>
        <button class="act-btn buy" style="width:auto;padding:10px 24px;" onclick="openBuildSelector()">🏗️ Build Company</button>
      ` : `<div class="locked-tag"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAqBJREFUSEuVVjtrFUEYPWd+gZUSK21UiGXsb1ASLBTBB4q2klYLBYkQA9pooa3YGhQfCFolKDe9wSoRY6OVAXvBao47j52dmd2b4MJddpj5vnO+8z3mEns8BCCEt6RDfkXzcy87t++s3C+8NWxipQOE7gA8CeC4PyVsgvgEaJHG/Am2BKjop6MVAPInA5N0EcCrdtv5KQ20DfC0IX9M4Nedz6XwJKVzAN4F544ZV0B8jGCnAFzNgKcN+bUQIwaUCCXiBGS1D9AXgIcjwCXSvE6BhjMpOgFbBGZI/q3FqHIQYGV1GdALyK1xjOT2kIySjgL4FveukHw5pHgvB7K61+iyBOCtIS+0OewXAiFr34A436RnmaSzK6rGU+wKMQoivQd0BuAjkreH6yudfSjgFqEPNOZsTqIr08qDpDGgEcRlGscqSBeqsKxpHy19tOskZ1MEsWSrJAdH1mpMYNR4KwASu6zkpSRnBtAJVfVB6thxw2jU6ZpHUKrsAJrAlhpCZQSRzZ6dnDKUd2n67mcnz2gvB5LTHePUflXrhqVvuljBccS0OoQDs6RZb2dPEYGk53mH+ij9if6Q2KWyVkhzrQfgorbSJoTp0F+Jb/rerVyzvS2SfigW0zQCqCD7X8Q7QqbpuBYwNVoccKsA5tKAy2dnDhbSUE3WZLVmaOYn5WARwv3ceGBEZ94r1AB5lzQP2ruh6ANJcxBWJ1VRHtmg63BgnuRa2/CFRF4mq8cibvRvolbVPPm9tD8heTO/InsAMRefAcxMrM6qfONyg+SJHLJotHyEWWmKwAKE6yIOVtdkneFfAJ4BeErDnXqkD86idtpIdkrAgrutADh2+/2e8BuEi3LDOyZ3JvVIfxZV/zDypaQjvoHI78lhftfWl0Gj3T9vdCwxhL+7FwAAAABJRU5ErkJggg==" alt="🔒"> ${currentCount >= MAX_COMPANIES ? 'Maximum reached' : `Reach level ${(currentCount-1)*5} for next slot`}</div>`}
    </div>
  `;

  return `
    ${buildModal}
    <div class="section-title"><h2>🏭 Your Companies</h2><div class="rule"></div><div class="sub">${currentCount}/${MAX_COMPANIES} companies · Collect below · ⋯ for more · 1-9 tabs</div></div>
    ${state.companies.length === 0 ? `
      <div class="panel" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:12px;">🏭</div>
        <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:18px;color:var(--brass-bright);margin-bottom:8px;">No Companies Yet</div>
        <div style="font-size:13px;color:var(--dim);margin-bottom:16px;max-width:320px;margin-left:auto;margin-right:auto;">Build your first company to start automatic resource production.</div>
        ${canBuild ? `
          <div style="font-size:12px;color:var(--dim);margin-bottom:10px;">First company is <b>free</b> — pick any resource!</div>
          <button class="act-btn buy" style="width:auto;padding:12px 28px;font-size:14px;" onclick="openBuildSelector()">🏗️ Build First Company</button>
        ` : `<div class="locked-tag"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAqBJREFUSEuVVjtrFUEYPWd+gZUSK21UiGXsb1ASLBTBB4q2klYLBYkQA9pooa3YGhQfCFolKDe9wSoRY6OVAXvBao47j52dmd2b4MJddpj5vnO+8z3mEns8BCCEt6RDfkXzcy87t++s3C+8NWxipQOE7gA8CeC4PyVsgvgEaJHG/Am2BKjop6MVAPInA5N0EcCrdtv5KQ20DfC0IX9M4Nedz6XwJKVzAN4F544ZV0B8jGCnAFzNgKcN+bUQIwaUCCXiBGS1D9AXgIcjwCXSvE6BhjMpOgFbBGZI/q3FqHIQYGV1GdALyK1xjOT2kIySjgL4FveukHw5pHgvB7K61+iyBOCtIS+0OewXAiFr34A436RnmaSzK6rGU+wKMQoivQd0BuAjkreH6yudfSjgFqEPNOZsTqIr08qDpDGgEcRlGscqSBeqsKxpHy19tOskZ1MEsWSrJAdH1mpMYNR4KwASu6zkpSRnBtAJVfVB6thxw2jU6ZpHUKrsAJrAlhpCZQSRzZ6dnDKUd2n67mcnz2gvB5LTHePUflXrhqVvuljBccS0OoQDs6RZb2dPEYGk53mH+ij9if6Q2KWyVkhzrQfgorbSJoTp0F+Jb/rerVyzvS2SfigW0zQCqCD7X8Q7QqbpuBYwNVoccKsA5tKAy2dnDhbSUE3WZLVmaOYn5WARwv3ceGBEZ94r1AB5lzQP2ruh6ANJcxBWJ1VRHtmg63BgnuRa2/CFRF4mq8cibvRvolbVPPm9tD8heTO/InsAMRefAcxMrM6qfONyg+SJHLJotHyEWWmKwAKE6yIOVtdkneFfAJ4BeErDnXqkD86idtpIdkrAgrutADh2+/2e8BuEi3LDOyZ3JvVIfxZV/zDypaQjvoHI78lhftfWl0Gj3T9vdCwxhL+7FwAAAABJRU5ErkJggg==" alt="🔒"> Reach level ${(currentCount-1)*5} to unlock next slot</div>`}
      </div>
    ` : `<div class="grid">${companyCards}</div>`}
    ${buildSection}
  `;
}


function renderClass(){
  if(!state.playerClass){
    return `
      <div class="panel" style="text-align:center;padding:40px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">🧙</div>
        <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:20px;color:var(--brass-bright);margin-bottom:8px;">Choose Your Class</div>
        <div style="font-size:13px;color:var(--dim);margin-bottom:24px;max-width:400px;margin-left:auto;margin-right:auto;">Select a class to unlock unique stats and 3 exclusive skills. You can change later for a gold cost.</div>
        <div class="grid">${Object.keys(CLASS_DATA).map(key=>{
          const c = CLASS_DATA[key];
          return `<div class="card" style="border-color:${c.color};cursor:pointer;" onclick="selectClass('${key}')">
            <div style="font-size:42px;margin-bottom:8px;">${c.icon}</div>
            <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:16px;color:${c.color};margin-bottom:4px;">${c.nameAr}</div>
            <div style="font-size:11px;color:var(--dim);margin-bottom:8px;">${c.name}</div>
            <div style="font-size:12px;color:var(--dim);margin-bottom:10px;">${c.desc}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--dim);">
              <div><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="❤️"> HP: ${(c.stats.hp*100).toFixed(0)}%</div>
              <div>⚔️ ATK: ${(c.stats.atk*100).toFixed(0)}%</div>
              <div>🛡️ DEF: ${(c.stats.def*100).toFixed(0)}%</div>
              <div>💨 SPD: ${(c.stats.spd*100).toFixed(0)}%</div>
            </div>
            <div style="margin-top:10px;font-size:10px;color:var(--brass-bright);">3 unique skills</div>
          </div>`;
        }).join('')}</div>
      </div>`;
  }

  const cls = CLASS_DATA[state.playerClass];
  const stats = cls.stats;
  const canReset = canResetClass();
  const resetCost = getClassResetCost();
  const cooldownLeft = Math.max(0, 7*24*60*60*1000 - (Date.now() - state.lastClassReset));
  const cooldownText = cooldownLeft > 0 ? `${Math.floor(cooldownLeft/3600000)}h ${Math.floor((cooldownLeft%3600000)/60000)}m` : 'Ready';

  const skillCards = cls.skills.map((sk, idx)=>{
    const lvl = state.classSkills[sk.key] || 0;
    const maxed = lvl >= CLASS_SKILL_MAX;
    const nextCost = maxed ? 0 : CLASS_SKILL_COST_TABLE[lvl];
    const canUpgrade = !maxed && state.classSkillPoints >= nextCost;
    const pct = (lvl / CLASS_SKILL_MAX) * 100;

    // Build effect text
    let effects = [];
    Object.keys(sk.perLevel).forEach(ef=>{
      const val = sk.perLevel[ef];
      const total = val * lvl;
      const nextTotal = val * (lvl + 1);
      let label = '';
      if(ef==='dmgBonus') label = `+${(total*100).toFixed(0)}% damage`;
      else if(ef==='critBonus') label = `+${(total*100).toFixed(0)}% crit`;
      else if(ef==='defBonus') label = `+${total} defense`;
      else if(ef==='drBonus') label = `+${(total*100).toFixed(0)}% damage reduction`;
      else if(ef==='regenBonus') label = `+${(total*100).toFixed(0)}% HP regen`;
      else if(ef==='pierceBonus') label = `+${(total*100).toFixed(0)}% pierce`;
      else if(ef==='spdBonus') label = `+${total} speed`;
      else if(ef==='dodgeBonus') label = `+${(total*100).toFixed(0)}% dodge`;
      else if(ef==='energyReduction') label = `-${(total*100).toFixed(0)}% energy cost`;
      else if(ef==='energyBonus') label = `+${total} max energy`;
      else if(ef==='healPerTurn') label = `+${total} HP/turn`;
      else if(ef==='healBonus') label = `+${(total*100).toFixed(0)}% healing`;
      else if(ef==='hpBonus') label = `+${total} max HP`;
      else if(ef==='sellBonus') label = `+${(total*100).toFixed(0)}% sell price`;
      else if(ef==='goldCapBonus') label = `+${(total*100).toFixed(0)}% gold cap`;
      else if(ef==='lootBonus') label = `+${(total*100).toFixed(0)}% loot chance`;
      else if(ef==='magicResist') label = `+${(total*100).toFixed(0)}% magic resist`;
      effects.push(label);
    });

    return `<div class="card" style="${canUpgrade?'border-color:'+cls.color+';':''}">
      <div class="card-top"><div class="card-icon" style="font-size:24px;">${sk.icon}</div><div><div class="card-name">${sk.nameAr}</div><div class="card-sub">${sk.name} · Lv.${lvl}/${CLASS_SKILL_MAX}</div></div></div>
      <div class="bar-track" style="margin:6px 0;height:4px;"><div class="bar-fill" style="width:${pct}%;background:${cls.color};opacity:0.7;"></div></div>
      <div class="skill-desc">${sk.desc}</div>
      <div class="skill-effect">${effects.join(' · ')}</div>
      ${maxed ? '<div class="skill-max">✨ Maxed</div>' : `<button class="act-btn skill" style="border-color:${cls.color};color:${cls.color};" ${canUpgrade?'':'disabled'} onclick="upgradeClassSkill('${sk.key}')">Upgrade (${nextCost} CSP)</button>`}
    </div>`;
  }).join('');

  return `
    <div class="panel" style="text-align:center;padding:24px;background:radial-gradient(ellipse at center,${cls.color}15 0%,transparent 70%);border-color:${cls.color}40;">
      <div style="font-size:48px;margin-bottom:8px;">${cls.icon}</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:22px;color:${cls.color};margin-bottom:4px;">${cls.nameAr}</div>
      <div style="font-size:12px;color:var(--dim);margin-bottom:12px;">${cls.name} · ${cls.desc}</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;">
        <span class="stat-pill" style="border-color:${cls.color};color:${cls.color};"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="❤️"> ${(stats.hp*100).toFixed(0)}%</span>
        <span class="stat-pill" style="border-color:${cls.color};color:${cls.color};">⚔️ ${(stats.atk*100).toFixed(0)}%</span>
        <span class="stat-pill" style="border-color:${cls.color};color:${cls.color};">🛡️ ${(stats.def*100).toFixed(0)}%</span>
        <span class="stat-pill" style="border-color:${cls.color};color:${cls.color};">💨 ${(stats.spd*100).toFixed(0)}%</span>
        <span class="stat-pill" style="border-color:${cls.color};color:${cls.color};">🎯 ${(stats.crit*100).toFixed(0)}%</span>
        <span class="stat-pill" style="border-color:${cls.color};color:${cls.color};">💨 ${(stats.dodge*100).toFixed(0)}%</span>
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--brass-bright);margin-bottom:16px;">Class Skill Points: <b>${state.classSkillPoints}</b></div>
    </div>
    <div class="section-title"><h2>🎯 Unique Skills</h2><div class="rule"></div></div>
    <div class="grid">${skillCards}</div>
    <div class="panel" style="margin-top:16px;text-align:center;padding:20px;">
      <div style="font-size:24px;margin-bottom:8px;">🔄</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;color:var(--brass-bright);margin-bottom:6px;">Reset Class</div>
      <div style="font-size:12px;color:var(--dim);margin-bottom:12px;">Change your class. You will lose all class skill progress but regain the points spent.</div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:10px;">Cooldown: ${cooldownText} · Resets: ${state.classResets}</div>
      <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;">
        ${Object.keys(CLASS_DATA).filter(k=>k!==state.playerClass).map(k=>{
          const c = CLASS_DATA[k];
          return `<button class="mini-btn" style="border-color:${c.color};color:${c.color};" ${canReset?'':'disabled'} onclick="if(confirm('Reset to ${c.nameAr} ${c.icon} for ${fmtG(resetCost)}g?'))resetClass('${k}')">${c.icon} ${c.nameAr}</button>`;
        }).join('')}
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--dim);">Cost: <b style="color:var(--brass-bright);">${fmtG(resetCost)}g</b></div>
    </div>
  `;
}

function renderSkills(){
  const cards = Object.keys(SKILLS).map(key=>{
    const sk = SKILLS[key];
    const lvl = state.skills[key];
    const cost = lvl + 1;
    const canUpgrade = state.skillPoints >= cost && lvl < sk.max;
    const maxed = lvl >= sk.max;
    const pct = (lvl / sk.max) * 100;
    let currentEffect = '', nextEffect = '';
    if(key === 'health'){
      currentEffect = `Max health: ${100 + lvl*sk.perLevel}`;
      if(!maxed) nextEffect = `→ ${100 + (lvl+1)*sk.perLevel}`;
    } else if(key === 'damage'){
      currentEffect = `+${lvl*sk.perLevel} combat power`;
      if(!maxed) nextEffect = `→ +${(lvl+1)*sk.perLevel}`;
    } else if(key === 'defense'){
      currentEffect = `-${(lvl*sk.perLevel*100).toFixed(0)}% damage reduction`;
      if(!maxed) nextEffect = `→ -${((lvl+1)*sk.perLevel*100).toFixed(0)}%`;
    } else if(key === 'stamina'){
      const reduction = Math.min(0.5, lvl*0.03);
      currentEffect = `+${lvl*sk.perLevel} energy, -${(reduction*100).toFixed(0)}% cost`;
      if(!maxed){
        const nextRed = Math.min(0.5, (lvl+1)*0.03);
        nextEffect = `→ +${(lvl+1)*sk.perLevel} energy, -${(nextRed*100).toFixed(0)}% cost`;
      }
    } else if(key === 'storage'){
      currentEffect = `+${lvl*sk.perLevel} storage capacity`;
      if(!maxed) nextEffect = `→ +${(lvl+1)*sk.perLevel}`;
    } else if(key === 'profit'){
      currentEffect = `+${(lvl*sk.perLevel*100).toFixed(0)}% sell profit`;
      if(!maxed) nextEffect = `→ +${((lvl+1)*sk.perLevel*100).toFixed(0)}%`;
    }
    return `<div class="card" style="${canUpgrade?'border-color:rgba(122,184,212,0.4);':''}">
      <div class="card-top"><div class="card-icon" style="font-size:24px;">${sk.icon}</div><div><div class="card-name">${sk.name}</div><div class="card-sub">Lv.${lvl} / ${sk.max}</div></div></div>
      <div class="bar-track" style="margin:6px 0;height:4px;"><div class="bar-fill" style="width:${pct}%;background:var(--skill);opacity:0.7;"></div></div>
      <div class="skill-desc">${sk.desc}</div>
      <div class="skill-effect">${currentEffect}</div>
      ${maxed ? '<div class="skill-max">✨ Maxed</div>' : `<div class="skill-next">${nextEffect}</div>`}
      ${maxed ? '' : `<button class="act-btn skill" ${canUpgrade?'':'disabled'} onclick="upgradeSkill('${key}')">Upgrade (${cost} SP)</button>`}
    </div>`;
  }).join('');
  return `
    <div class="grid">${cards}</div>
    <div class="panel" style="margin-top:14px;text-align:center;padding:18px;">
      <div style="font-size:28px;margin-bottom:6px;">🎯</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:16px;">
        Available Skill Points: <b style="color:var(--brass-bright);font-size:20px;">${state.skillPoints}</b>
      </div>
      <div style="font-size:12px;color:var(--dim);margin-top:6px;">Earn 1 skill point with every new level. Spend wisely.</div>
    </div>`;
}

function renderMissions(){
  const rows = state.missions.list.map(ms=>{
    const tpl = MISSION_POOL.find(m=>m.id===ms.templateId);
    const progress = Math.min(ms.target, state.missions.counters[tpl.track]);
    return `<div class="mission-row ${ms.done?'done':''}">
      <div class="mission-mark">${ms.done?'✔':'○'}</div>
      <div>
        <div class="mission-title">${tpl.label(ms.target)}</div>
        <div class="mission-desc">${progress} / ${ms.target}</div>
        <div class="mission-reward">Reward: ${ms.reward}g</div>
      </div>
    </div>`;
  }).join('');
  return `
    <div class="reset-note">Missions reset in: ${hmsUntil(state.missions.resetAt)}</div>
    <div class="grid" style="grid-template-columns:1fr;">${rows}</div>`;
}

function renderLeaderboard(){
  const rows = [...state.leaderboard, { name:'You', level:state.level, gold:state.gold, me:true }];
  const byGold = [...rows].sort((a,b)=>b.gold-a.gold);
  const byLevel = [...rows].sort((a,b)=>b.level-a.level);
  const tbl = (list, valueKey, suffix)=> `
    <table class="lb-table">
      <tr><th>#</th><th>Player</th><th>${valueKey==='gold'?'Gold':'Level'}</th></tr>
      ${list.map((r,i)=>`<tr class="${r.me?'me':''}"><td class="lb-rank">${i+1}</td><td>${r.name}</td><td>${valueKey==='gold'?fmtG(r.gold)+'g':r.level}</td></tr>`).join('')}
    </table>`;
  return `
    <div class="lb-note">This is a local simulation (no real multiplayer connection) — a real leaderboard would need a shared backend database.</div>
    <div class="grid" style="grid-template-columns:1fr 1fr;">
      <div class="panel"><div class="section-title" style="margin-top:0;"><h2>🥇 Richest</h2></div>${tbl(byGold,'gold')}</div>
      <div class="panel"><div class="section-title" style="margin-top:0;"><h2>🥈 Highest Level</h2></div>${tbl(byLevel,'level')}</div>
    </div>`;
}

function renderSettings(){
  const p = state.prestige;
  const canPrest = canPrestige(state);
  const ptsOnPrestige = Math.floor(state.level/5) + Math.floor(state.totalGoldEarned/5000);
  const progressPct = Math.min(100, (state.level / PRESTIGE_LEVEL_REQ) * 100);
  const isGuest = !!(auth.currentUser && auth.currentUser.isAnonymous);
  return `
    <div class="grid" style="grid-template-columns:1fr;">
      <div class="panel" style="padding:20px;">
        <h2 style="font-size:15px;color:var(--brass-bright);margin-bottom:12px;">👤 Account</h2>
        ${isGuest ? `
          <p style="color:var(--dim);font-size:13px;margin-bottom:14px;">You're playing as a guest. Your progress is saved to this device/browser only — link a Google account any time to keep it safe and play from other devices.</p>
          <button class="act-btn buy" style="width:auto;padding:10px 20px;" onclick="linkGoogleAccount()">🔗 Link Google Account</button>
        ` : `
          <p style="color:var(--dim);font-size:13px;">Signed in${EMAIL ? ' as <b style="color:var(--text);">'+EMAIL+'</b>' : ''}. Your progress is synced to this account.</p>
        `}
      </div>
      <div class="panel prestige-panel" style="background:radial-gradient(ellipse at center,rgba(184,160,212,0.06) 0%,transparent 70%);">
        <div style="font-size:42px;margin-bottom:8px;">✨</div>
        <h2>Prestige — Spiritual Renewal</h2>
        <div class="desc">At level ${PRESTIGE_LEVEL_REQ}, restart for permanent bonuses. Your gear stays with you! Companies will be reset.</div>
        <div style="width:100%;max-width:300px;margin:14px auto;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--dim);margin-bottom:4px;">
            <span>Progress to Prestige</span><span>${state.level} / ${PRESTIGE_LEVEL_REQ}</span>
          </div>
          <div class="bar-track" style="height:10px;"><div class="bar-fill" style="width:${progressPct}%;background:var(--prestige);"></div></div>
        </div>
        <div class="prestige-stat">Current Prestige Points: <b style="color:var(--prestige);">${p.points}</b></div>
        <div class="prestige-stat">Total Gold Earned: <b>${fmtG(state.totalGoldEarned)}g</b></div>
        ${canPrest ? `<div class="prestige-stat" style="color:var(--prestige);margin:8px 0;font-size:14px;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA3BJREFUSEt9Vk1oE1sU/s6d6E6TuHm4KEmKrnQpT31u2k7qD4iCiiAodOPmLYq8hUVQm6oguhDpwo2bgoIgKiiCUhPbjT8Vl7pSyBQX8jYvk27bud/zzmQmNzMTQ0iGuefcc77vfPecKxj4CCA0X7D3XtB7Th4GPRC5JPbJas/e/Fmf6G3ym/J8Xf6+26wd6uz4EjnZUW3f/pbZADaCJDtBq9S+TuByz+GG61ev5CWXwhemkMnFNmpt/fEn1cZDEdkZ8RBnzW/QhbPu2sinYTsYS5NjzHI6OJrl9i2hXMzYWC4U3q53ajPDbKIAKa6bxdVJEdwHWLGjGgAh5Cz1q6Scr69V3qSrPVCDz/i8yS9uuyui/h7kLd5RvkbvuStPNmRwr9T978Ie7Fm3qQ8zam5dPaWE8xRsJ7OZanDOCfjIOAaOnFGQ2XiTCFmiop+amK53q0+SGrRK3gOAZ4eo4j0VziPgURG5ZWyoOYOCeik6pPGvfBrlodupnAspelvylgiMpcgNROQqAnlMFSxAcGBQRXintJqig9MkrwF0bPWLcNntVMeTABoYi2EqyItA8ZJocQHOZ+SVvAjdp6nQUho3CR6LJSvg8oQfByh7S2SI4F/RuAqot5RgHgpHcntAorpIgdR45dCZpugJikEjf2QCaIrnQM+N+zWvVfLiVtRPnviweRNOmoX1dTylYH+MOM7a7VZkqdiuaqhZAasJglapPeX6tYW4Bs2Sx1QPuQI6i5DgWbiZdk5QBQcFct1uc65fTdzMnnW/tpDb7CwESxr8R0Ed/7VRI2kJIUXSCBA8d6DuABg3ayZAql32W4W9YAKQeqbeHb3dKnsfQezNOb0G8Irbqe5rFtsXjYT7AWw9pSUiRrarByY61XcGfkIX8Wo92JgyiRScgpHtkTjrUOplr+eTPU1WO7IHToQpRANeEBY+UIJnIad0TlA29gvUXVPYYUozTEY1GNZQDZotP/ZSBYd/mfVrAJqx1FBavZ5YG1mxB1R6GibtetgUy9bAykZkxe1U9mWba28QZBGkNRBR1GP1OwXTEUWYJ7DDnAPXr/SUk89E7sCx0bSKHjX03GR3tGHfBN4U2w0FNWsC2GVN05WiqA8tno6LxfbYQX90uX8ZSE4DFkvtsclubdkOnL5hpA5adlr97kqS1wTTevkfcNOmMT/oF7gAAAAASUVORK5CYII=" alt="🎉"> You will gain <b>${ptsOnPrestige}</b> prestige points!</div>` : ''}
        <div class="bonus-row" style="margin:16px 0;">
          <div class="bonus-tag">+${p.gatherBonus} gather</div>
          <div class="bonus-tag">+${(p.sellBonus*100).toFixed(0)}% sell</div>
          <div class="bonus-tag">+${p.energyBonus} max energy</div>
          <div class="bonus-tag">+${p.storageBonus} storage</div>
        </div>
        <button class="act-btn prestige ${canPrest?'animate-pulse':''}" style="width:auto;padding:12px 28px;margin-top:10px;font-size:13px;" ${canPrest?'':'disabled'} onclick="doPrestige()">
          ${canPrest ? '✨ Spiritual Renewal' : `<img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAqBJREFUSEuVVjtrFUEYPWd+gZUSK21UiGXsb1ASLBTBB4q2klYLBYkQA9pooa3YGhQfCFolKDe9wSoRY6OVAXvBao47j52dmd2b4MJddpj5vnO+8z3mEns8BCCEt6RDfkXzcy87t++s3C+8NWxipQOE7gA8CeC4PyVsgvgEaJHG/Am2BKjop6MVAPInA5N0EcCrdtv5KQ20DfC0IX9M4Nedz6XwJKVzAN4F544ZV0B8jGCnAFzNgKcN+bUQIwaUCCXiBGS1D9AXgIcjwCXSvE6BhjMpOgFbBGZI/q3FqHIQYGV1GdALyK1xjOT2kIySjgL4FveukHw5pHgvB7K61+iyBOCtIS+0OewXAiFr34A436RnmaSzK6rGU+wKMQoivQd0BuAjkreH6yudfSjgFqEPNOZsTqIr08qDpDGgEcRlGscqSBeqsKxpHy19tOskZ1MEsWSrJAdH1mpMYNR4KwASu6zkpSRnBtAJVfVB6thxw2jU6ZpHUKrsAJrAlhpCZQSRzZ6dnDKUd2n67mcnz2gvB5LTHePUflXrhqVvuljBccS0OoQDs6RZb2dPEYGk53mH+ij9if6Q2KWyVkhzrQfgorbSJoTp0F+Jb/rerVyzvS2SfigW0zQCqCD7X8Q7QqbpuBYwNVoccKsA5tKAy2dnDhbSUE3WZLVmaOYn5WARwv3ceGBEZ94r1AB5lzQP2ruh6ANJcxBWJ1VRHtmg63BgnuRa2/CFRF4mq8cibvRvolbVPPm9tD8heTO/InsAMRefAcxMrM6qfONyg+SJHLJotHyEWWmKwAKE6yIOVtdkneFfAJ4BeErDnXqkD86idtpIdkrAgrutADh2+/2e8BuEi3LDOyZ3JvVIfxZV/zDypaQjvoHI78lhftfWl0Gj3T9vdCwxhL+7FwAAAABJRU5ErkJggg==" alt="🔒"> Requires level ${PRESTIGE_LEVEL_REQ}`}
        </button>
      </div>
      <div class="panel" style="text-align:center;padding:24px;">
        <div style="font-size:32px;margin-bottom:8px;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA8lJREFUSEuNVk2IHGUQfa96xz0ETy5LtmdXonhQg5vuzZqASjQIESSSSCASWNQkiCBGBP+I0VxET0r0pLkYwq4eooccFDTmsIgGxTUzk3gIyMZIphtFPRhUstntKvmme3p7vhnEPvX0V1WvXtWr+oYY8BCA9Xz/P18AEKA53/Kl89YbbvWs76iBifAadGkzkj9K/H53H6Caan+m7vR7TEwGgZ6G8mv3m7SJZZVHptFe9Ln6BXERezP1MBYQjgwJfzPl1hjteWfekHAnwI8yHR6Z5sU/y3pWfYv3HKCKURrltWqynhA4tkGTV6r+TakfhWEkQrKr2jAfo59BhWNL6i+D2J7RDk+tpKer9M8F4w+q2Qkjn4yz9gd9WvEZlDxyGeACRq6/GgxfsUw2UezRSNsHehgw/Azk5yRm7siSaSmakdusWpYl8lvdkPr7ANaQ/EJVd8eWbuu6OfAlGb4CyhNm+jSB4xs0PbLa8Ly8LtdcpkXWXZBzGNuowoWayg3LYt8CVossXdet9XmMT6pYC8AFBnZAM8zWdDhej59+8RMte1DFaAbjX5rZVwCUwCHntKK2ZhrpPx0VBeEOMZ50w0jidShuNdqPkaYHfaF7g0aclbE9Afg2FBst4EWY1Rx1UZncgPZ5F7QR1J+l4Ughv6tDWe2mFVn+ThXbp5A4Zj1z2DMHDamnQr5qZvcBmOlaGuzhWNOT7ndTwncAPlOJMwtYAshorO391TXT0+SmhIdBbkPG5yD2zaoYOsV4PtLkLZdNQ8IWgcnqAJlyEwN7D7SD0Up6qutbAiwgvHFI+LOq3Isge02MW6pUDXg31uSpnEHd+pYKMU/YnCl3RpY81NVOCdCUcA7gNSU/Dcw+NicZclVgylMR2g+0MDpqUvt14NYid8FsN8hPIm3PdUK4jHJZykKgy2szqZ0BcHPvZDo4Lsaa3NLC+GZz5RvwkFjUjPsR6Jtxlt7pgndU1JTwKIC/Ca4Y7IVBzgPGxTPLGRuwl8bbQPshypLZLoBFmrAp9SUQ13m3TR7IMB9ZsrVIqPc+KgyKglyC8h4TOxFrcnenRK5ppriLYmcKo3I1lWAeQHXp+gm5ZBtSvzSlyboSIFO9PRC+CPDx6pR4W2RgWaoABrwRa3qoIeHxKU0e6wC0gnCPGT8EbV+Upce8K6H/fi4WWXVrNjFeNzIUZjMG7ghU7p/E5cVSpmcxsSWgvmTEGIG1BowNbHbxMU+iM4BdszaJy1C0h2xp33r+/lchU0/RA6697i4ZeORl4fdm4Lr+rwb2/dXwrnSf9b/W/LowO5cxbAAAAABJRU5ErkJggg==" alt="⚠️"></div>
        <h2 style="color:var(--red);font-size:16px;margin-bottom:10px;">Danger Zone</h2>
        <p style="color:var(--dim);font-size:13px;margin-bottom:16px;">Permanently erase all saved data. This cannot be undone.</p>
        <button class="danger-btn" onclick="hardReset()"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAApVJREFUSEuNlS9sFEEUxn/fCIIBQT2uhIBD4XqECkqCxbSC4BAFUUtyPYGrAQyOEFqBwBGKgPSqwJAqEpIqNCHBVrAfN7uzf253runmstnbnXnv+/PeGzF3CTDV/fSru/K0XfEbbcSzhK4SNyuHDwPIndU91GfPl90Yt1cMuoiapUPi3Xxd4PJiSXsSZTNhe9RCjO6kbQrTfOgWSsOgy7GP3S4OOmRbjtKtdl+WX18igRx/c1Vk+2AGeyJpGgO68AgxVkqQD11BynpQ2CPhcfzcCNJ7aIWqOXgihWm/LiLkEnUFuXouEcIovnO1Yv7qRm/XTBU07bPvMWjVL1xs46hXit0EGmKPyKSw3QrbNzlT73axAXrrqH0l1Hh2306E4vOkzG3GiIeSXve7L3nQi57+2r4JfAVeAseYFzO5mgTAY2AZ2ARWpfClL3WUqydvm8wuLmP9QuyB97F2EZMk2BjYAK9hrSOuSOE4V4GJ8XC02T4HnAD7icXHWfCoc9wTE9wFb2KtIc5LOsnNtGGjdRRz4b8WPwVPgG9VgjJMTBAlfA5cD9KFRTN4oURlDxTFd8RFYK30oU5QGRv1j+z+Sbq6YKCVhd/p3nnDbb+LBiYz/8Ru7niwBD4GHQVpdSByCtV4kKnUOOR2DFtBQXbhpmStsYLKd6A3QXpQ92l3xrSjIl+pMcEWsDMzeQlzjGLJlj0RSzNKFFk9k/S0lijTyb1R0YFgex3YBS+Dot57SaL4vvblUZBe1SZnZtHiU8yFbyM+1xVj+JSq4g51ZZl7CvowH2XheTAw+RrwI5m7AhwmiVYMh+XEtW4o6Kg/D+tTsgKUc7gq00sW79PMmev7auSV9/uSfueO3vwsGh5tp5zYi+RtEf8HRbEjL695gbYAAAAASUVORK5CYII=" alt="🗑️"> Erase All Progress</button>
      </div>
      <div class="panel" style="padding:20px;">
        <h2 style="font-size:15px;color:var(--brass-bright);margin-bottom:12px;"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAmlJREFUSEuFVr2KVDEYPedr7F0ZmEIQLEQQrLaxWgutt3EtRLQQFPcN1sLGzhdYC5tlQZ1tFhQbC7dRfAIbFUQ7YWQLK4scTXKTySa5M4EZQm5uvuT85RK+EYBCr2jdwfg8PyrnEKCGdeK4//c/SBLJ0D9RrHq/3MRiiWZnYRE5t0njYS5gpK/ftG6NJRuX0xTADoAfJJ9WJyiPWaExhl4Bl5y7+3/zjwGcA/DAyGexgJPM+ifI63Zxb2mT0wcA3yG8ofGF3zIkN8pB5i1ydRXAGZIHmYNigqQdAZeNvCnpPMlvLckVFFWBXQD3hylbvlDShZO7BPETiOskP6ZlWogyDaVOYl/SnOSapBsCZvSyErdoPJD0DsAXkg9ruk7KNCu19YGkXyQnaQFfCMJsEPsxxLM0/im13lVRCUvSkuQ2BVwzcrs2ZigErdFst/ZKRXKr+jQiaV/AcyPfL/zYureXBwGiaLQKllLjcnPz+I/O6bi0GxWdeZJOQfhpxsm42/vhsTIqhqy6BeEKjdspryJPrfNrY3Z94KR7BL6SPPITnLQP4RWNr/tADKOd4Mo+oPk0Da5+Ke9W4AKA20YeOWkOYErybxO3nrmU0p28ygVArAPYA/AWwBMAFwF4R/p4mNE4ae+M5ek7qC1mEYDPgB6RdlhofwOAl+UeyTvdQF1BQ5eDUg+SNgBNSfPJuPwQnWIRd+cUOeiHvqTTNP6Oq68s06wS7oNcYMk1Oaag8qqoruUg5OI+iGfMGs+AjO26wmQUokhy2/xoAi4kc9hO6gyMhJFyWu77D4nwSvrEaHKmiu7xKFwYrYboHw4CaSz/QJEYAAAAAElFTkSuQmCC" alt="📊"> Session Stats</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12.5px;color:var(--dim);">
          <div><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2RJREFUSEuNVUuIHFUUPefV2NWFjpuMyfQniYoOmIkfRHEhkRHMTrJxiGaniyQkMmDUheDC1SxFCChxIQoijWYz+CEIigpBInGhggQXxkT6M8mYLBKdrv7UO9JVNdU1VdWjD7qhX993zr3n/ggQgOJvpE50P+nkX+XtRzejz2ZQKsbdgiDzV6GLsU2GIO9vsV9FEWfebiJIo/wf7yYKt/HHOKYtIiAQy+Vfrd/LIfYK2iFxFkYXQbS82fbXxfkbexARjLE2fsI2q9t8OAdo7CHQ7M8mPHqog26ldTqCKy6WEXToaTq33U79MIXXAez+DzV+KVebD6aLLUuTEIyM/LXaHIdcFrAYOZivs2zVGWsfKtVaP+cciVWJCOI+6Hbq30BYIAs6ICFLVYHwFgAHDk/aIR71+s6KueuSH9ZYLEmSA79dPwlgKetJApeJRsAP5ZJd7PXNBQM8LfAzGd2AxYo75SzzjsudjfSi264+T/L9DVkKI0iYCUK/+n2zr+wOP5DMAcLMC/ZtAAuRmS6BWCrPtj4PI/A7tT8A3hnKJWFrApyBtSdEvkfycUBnnSnnpWBof8xE/61XaT4Z5qDbrv1piJ25yZOWRbgJ4Jgb4ExvCucB3D0CNDKPWGOPQjicJpCw5lWb28MIequ1BsTnigaAgLYD2yhV2q/2VutLEka5Cs8IPIBdJPFavg/0jldpvZiUaa9dfwPQboEvUPzKAt+RuO56bPT94GVZPAPyvjBxwnmIyzTBPgvzSuL5uNJOWRN8eOuO9vdJmfqr9XcpXLTAOYJ7ATsPg3touT+UTghzY6VlWZzybikNenawOpZFFyB+SqOzspoDzZvlSnP0JDp+Z9cewn4iYT6d5LhLfqexDch8XCoFN26u85/prvf38Pb1h/sD+FNldDHg/SAPQXhKwDSA0+VK8+CmYdfr7NojBE8QeMyKrgF+kvib23e+9N3Bs4Y8BmJexBUKVyTeBumB7FYBseIa5zi3X+4kEkVx5Kf/2trM9PTQOwLpCIi53EhIdbighhG+cKutj1KdXDBKJ2zK9U59wTHYpkAzFpgxwLoB/rLkNXeIc9zZvF4wCSbt5HRMaSe2tk8TxDt50u4tXG2FMuZkS11sGteTDfNkyf6Y9Gi8k/MhJzdplEyq8kVRjPMv4Yt7MK5KE1sAAAAASUVORK5CYII=" alt="🪙"> Gold: <b style="color:var(--text);">${fmtG(state.gold)}</b></div>
          <div>🏅 Level: <b style="color:var(--text);">${state.level}</b></div>
          <div>⚔️ Wins: <b style="color:var(--green);">${state.combat.wins}</b></div>
          <div>💀 Losses: <b style="color:var(--red);">${state.combat.losses}</b></div>
          <div><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA/FJREFUSEuNlltoXUUYhb+1NRIjJl6qaBRTpdZixBveDbWColjRoASrIEULebBK8daiKLRRvFJENGAfvD21tdqb4IME2yreHgSLtWIrGpGomJQabWq1zVnuf+85yTkntrhhH2bmzMw//1rrX7NFPAIZHA1cDFUHy/FDPA1LysmTg9Gq7U/p2l4G3Aj8GWtV7FD8tgo2KNOy2jM1nqYMMBGj9jjlYKXiiwRfKdPftVlW7GZBp6QvDpVxgFMHi115EvgI/DxoGjAN3FTOm3zKPDgAjADD4CVYFytTX+28ulU5HNFfB3wAvAhsAj4GfwYaS5sW6w1HCy4FrgCuBh4GLpR0x9QAieSK3YZ5CfEdBPZqBx4FOjCtZRLBepH4H+BBrGcQQ8DTwMlAr6T9VdhLiORCRRV7BvCAYUzwEKYT8S5wBtBtGE0ktxnWC34Brge2powPA56Q9FsV+TqSK/a5mAVJKouADw1PCS4HXgN+TPh0WNwt/DnW/RbXCl7B7EX0S/r+YAFOBR4B/spl+WDC8gD4faz5iHvLqtDLhtcF1wFNad4LwJHA45JGqrXVmEFMWJWTtgVY3lBenwD7EwdNqCA3xSsai0GzDd2ZsvFqeTbUAdgOPO+pWSrwcZOSLZIfNowoJGpGLPYJt4NWSDpvaiXHbvYxQLy353iflpN2bPRTxWaYCmIc2AP8nt49mBMRR6T+oGG1YLcyjYZwChW5UmlBvAfcmQMc1rARPAaKQtoG7kzSbDSlbXmtXJXXwBjQDMwNFQFvRlvS3lLZdgtwCrALM4R4Ne3UlTK6DBisd0Kmgz8FvQ0MAIdj5iFmgo8HDWU1AUIJm4EFwDdAfyKwCxVZRf9KIEuBK0kI9wGrDQOKANBrmCG8EmtOlml/NYPwnGHgbGB7TYDZFn3CawKisoDrHOlWrD4U1uIMayEqkIjKPiHk2hhgFvBO6S0TuA+Bb4HCxILMeP4BHgPWJ2gDva9B4V03pIKsCxAcLAZWpgBLi0IzX1qMC54FdgPnJOEHuaGyJTmpYQ/ng5fn+cW6ueC7QM/VktwGrA0MMRtQ4Y4nhfQMzcKLQAvTiSNGd1hC8p99pbz9K9YmxDXgVaCbJY1WIQqSg8RQyg+Jgx3AdMNGwRtRGyHrxIENPwnmY26yGBShHuIQRwGXhM2HqzZycHoEMPSrtN+OXKbfAq2Yny1mFmox2y3aRVg2Z5kiQNh6b8p8V5Cc1ZDcYtgp6MLsQKxISrjA8Fahogn91F07PaAew9ZkFfPKC8gDWLOUFYU28UlRSt9ea9giOBMzJ/87iFszec/U3jn05ONLLTYLdsbmkm476JVZ/eM/v0QaTeJ/9v8Fy5uWLrMnW18AAAAASUVORK5CYII=" alt="🎒"> Gear Items: <b style="color:var(--text);">${state.gearBag.length}</b></div>
          <div><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA6xJREFUSEt1lk1oXFUYhp/33NiIKAVdtHSmSiWWWtSY4CYImuJCKuimIGjBqISIYIVaWgSDTQuCP5Qi/fEHS8WF4EYXIu50Nt0I7cSIuJEqbUwN3RQlttq557V3bu7MvTOTuxjOvfOd837v934/R1QeAabzK2ev+ZN/7Dxly/IRPWbZtvKntdcL1B9x8GMR7klimB3lwvkSXtXProvtVdXBARjzYdM7SAewDiPvBEaMXhlLFz+vcJIpky6Ir0niZ7ava4Ur5wh6dbT1x3fzoX4I4izBT8SYTIi45cG49KIgXSOGqyEagNwMtf0S7yplwoEXgIcE3xiekdhgc1tbFKthe3aMpTO9Cq0yyGQoxMzX86pdBOqGlwQftQ3N1//6ppl14foliV9s7i1iK3P5BtjcaFw62St4R4Pij3NJfadS/pE8R2Ayx9brSvjRqb8V/B3F8WBmDHe095lGtOYy98ZYbJSAuyEqUrAZajPAAeR9juFKdFweCtoNTCXodIrfzKl7LlXyg1JfdRLXyzqCNT3uxUaR6ANEFvNDGx+PURMJetqRZQK/A7fIrT3W0FlwHamI6mkiWzKmbSJRO3IG3SrpS9Mm9UnBVRMTobcI/En0CRK2yjrlNtV8m/EnskZQBmAcwyCAXNhC5wxghWtnbw3DPxH5jYSbST1l6T2Jp6p14w+J2qbAZAabMRhnUIhKDaBJbTLJbIMbmXiStw3H/7ZeC8N/5cRNFqJcs3Acx/tyBv0AmX3OtVS9GYMQPG44kgFkmxVbGxyGlntTEHjfZrQMMCCLygCiqdqkFKdBu4k0MgGTGEbSEH/taTiZX2sAdGurrw5yBpww3l4wcGRMCc3e5lplkIuca1Ct6UqU2lkU/H1RQMAKwV9incq3dbOoj4G1Y8zdNB1YB5nIBH8q+bBgM9ZBY3WFLULquVbki4SwkSSuJyu0qOk166Ag1VR9EnlK8DziiMy+G0J+hYkEdgFLiuxy0KPgt1f7VCPNWoVQzqASot4ZBOdC7Y2A9wOvQR6arNm1HPamJCvDuv6xxZOlcF3OWseol072TsA+kTtMqD2swDHD7cJ3tbsPPpTHVQc7bpnVdn3pTHfc5qes1kHPdO3sbB+YLIRNRw17KgDSwdxTHxv10t5g0kHjswLQxew3XUg2Pxsdjxp/0PZMejlBe+9fHZklnyoXg24W9VZQqeEUub/AnXe3Qus5IZKYfPYAF86XzMoXjsppPa2iPN3WQu1tGH13mY5Bdvj/vuTOM+9PyqQAAAAASUVORK5CYII=" alt="🔷"> Shards: <b style="color:var(--text);">${state.shards}</b></div>
          <div><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2VJREFUSEuNlk2IHFUUhb/zesaJC0EXbgwOBARNdCVBBZNZxKTTrQEVguJCQYiBxBAQjMGRSKIJATG4GDAqiiIYBBdRnGS6ZwYRBhJ/0IXkZxHBlXEZMCNGZ/odra7q6qrqnuhbdBfvvrr3nHvuu7fEikuAVzYPWIafT3a7KzcPPuSuiiY5Cy/In4fAyQNUwgw6/Z87VRDXZyBn6FZKVwo/ZVCkkp5PftMA2fvN+bjOHT0x1J0h3sDJkcjtscP6lFDiOXGc0UskC5xv1fVZz21mTcVszPrcsnhwxPwEjPeF8eloHQniPWDMNXZpmf2Izb3M2Uxjdipw2au4rT2h3/oMUudHgEnMJwq8Y7PQRSEWOpHXg3gLuDtz+HMM7KpFDhgmBIvL+M4gvS/TNJ5p18PDPRY0W37MgZNpXSj5e0mBRXd4XqPsc+RNzLpikUS4VIM9iGNEJh2499/XD+ZnzKHWVh3Uti+9enmU57rpCJgOUpebz3SsWwKszV9K7D0QvbSLb+kwIlhfMgnXAj+oOR+fdEdrU2EzBpmAtr6ReKBc3oYgExHB7jJOnksrFT+Ki12RG/NxJ5F3q/fk2ig3rVrie+Cu0mXMCy/xr40yC0Pu/LOtuj7Kq6g55302b/Qrp1vie6NYLbw/ATLkJrclpm2meuC6VOTdM/VwPElIidrWOR+WeaXA5LzEDpuzxcAFIXcgXsirK6kP82K7rmO985XcQXPOUzZ7cic17qDDCeC+XCcpYfe7zPYoZvNLJx1obdHhYqrzFBXpN2f9se2nk0sQzatBLGGOVjT6APMXYncW4GirHiarOuatotoRG+34OUGPyvyyJB4ZMRdKjRYamOPAGompmS3aOyyNKYNKU+s5asx5DrNZeIPRa8CmLkJxQeZl4y9An7bqeqqKvCT6kGGQ2gWNts9i/yh0zuLtrMEdkhg3jLfqyvtRiUGGstTsilHTZmu2n/GNVxf5DlMP4nJS747cE2qc+HPE93+9KVwrDp/iECw1u0GK/Z7eOO1bY2AiBJ6xGJP4MIwxe2pjuFIdZ9VWX5oHZQbFOQr1ltcosCFp16M1ZqYf0q/D9MuB9lOUpztlV4FQrJzHv/LNf/+BTm3TlaKj683nQQ0qQ3zodCturjRNMwSVAP/xiTCsFlcKkLn6B/RWcNXdxjx2AAAAAElFTkSuQmCC" alt="💎"> Gems: <b style="color:var(--text);">${state.gems}</b></div>
          <div>🎯 Skill Points: <b style="color:var(--text);">${state.skillPoints}</b></div>
        </div>
      </div>
    </div>`;
}

function renderLog(){
  const el = document.getElementById('log-panel');
  if(el) el.innerHTML = renderLogHTML();
}

function renderLogHTML(){
  return state.log.slice().reverse().map(l=>`<div class="log-line ${l.cls}"><span class="t">${timeLabel(l.t)}</span>${l.text}</div>`).join('') || '<div class="log-line">Nothing yet.</div>';
}



/* ===== UTILITY FUNCTIONS ===== */
function fmtG(n){
  if(n===0) return '0';
  if(n>=1000000) return (n/1000000).toFixed(1)+'M';
  if(n>=1000) return (n/1000).toFixed(1)+'K';
  return n.toLocaleString();
}
function timeLabel(ts){
  const d=new Date(ts);
  return d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
}
function hmsUntil(ts){
  const diff=Math.max(0,ts-Date.now());
  const h=Math.floor(diff/3600000);
  const m=Math.floor((diff%3600000)/60000);
  const s=Math.floor((diff%60000)/1000);
  return `${h}h ${m}m ${s}s`;
}
function sparklineSVG(arr){
  if(!arr||arr.length<2) return '';
  const min=Math.min(...arr), max=Math.max(...arr), range=max-min||1;
  const w=60,h=20;
  const pts=arr.map((v,i)=>`${(i/(arr.length-1))*w},${h-((v-min)/range)*h}`).join(' ');
  return `<svg width="${w}" height="${h}" class="sparkline" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="var(--dim)" stroke-width="1.5"/></svg>`;
}

/* ===== COMPANY HELPERS ===== */
function render(){
  renderHeader();
  renderBody();
  renderLog();
  renderBottomNav();
}
function renderBody(){ document.getElementById('app').innerHTML = renderBodyHTML(); }
function renderHeader(){
  const el = document.getElementById('header');
  if(!el) return;
  // Compact topbar v2
  const maxE = getMaxEnergy(state);
  const maxH = getMaxHealth(state);
  const ePct = maxE>0?(state.energy/maxE)*100:0;
  const hPct = maxH>0?(state.health/maxH)*100:0;
  const xpPct = state.xpToNext>0?(state.xp/state.xpToNext)*100:0;
  const cls = state.playerClass ? CLASS_DATA[state.playerClass] : null;
  el.innerHTML = `
  <div class="topbar-v2">
    <div class="topbar-main">
      <div class="avatar-wrap">
        <div class="avatar-circle">${cls?cls.icon:'🧙'}</div>
        <div class="avatar-level">${state.level}</div>
      </div>
      <div class="stats-col">
        <div class="stat-row"><span class="icon"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyNJREFUSEuFVT1oFEEU/t4aL3tJEwtzP7sXJAQR6wgGSaGixaUxRUBMQERRCwlYpBIlAbGQIIYgKioERDGNIARt1SqNmEpQECS3t3fxBwUht3vx9slk/2bn9nSr3dk37837ft4QQAAY8uOvtK/7MQQQB1vk9/QMIgsaVXNW08CeRwRmv2bwiNLbn8FL1rBmO9aOdvmFxTn8VAS4dXOKPTxOtCJvCHpqgWZ6CpX5qEu5GwWJIHXUOJobxkjLo7cAutIL+atalzac2b3+LglvOqRRB+FBftdz/Rne+YaBfXERmRUCg1d7CtZIkrkAy+3FuJgASyItTunUSisAj8nnit5FEo1u6PnKlThXaqRMp3pewLHNBRCmO8NFY3qx8tKHXoEo+JT0EgfJoW7dnGbGQloRAj5uNroO7hr88qvTIXyIItWne6JRM8bAtJLar4YHes46n8yTQCPJwWbVMKHRkKz9MJyAZQD9AhKi2J4a6EymUFlK80cEkXp2p2beBDCTTp1UkhlM+E4tPqSXqp8iK6gcpKnYsY2LAAmiM22SJbzwWrQW90HIGpVZlYs2HyQCCHDqpeNosSgi+SKKmtGL1nxkZiW7SK6oKHZ1qDyxufHVHEILCwSUE+Yi/NHAo5l8dTUcOeq0aJMp1woDLrS7AMrhgPvPSHitF6zDYQG1m3aIAjJCkv+h75hP4uvd+erVpDj9kd5RReKXaxuTTLgPoFcEM2Mu6oYwRITJKOkOlPV+65UygFUO4jkeXjjuxsCg5/EzAh8AYa1b145Q3/pPkahRK10j5rntcQa8b7ja0b49/r/QE4qT2wEJ5evYpXsgvgCi23qhcjmcP65dnABhkUE5MO7oReuSMk3Tx2wa9s2acdoDLXkenew1Ksuhorwfhtls0lMAo9AwpeesJ5IVlXEdOS79AnG+GXtpi5578MrZor0ujwfHLt0C8Qls0TF9oPK5ow9Uoto0Lq7Yqvmwu2idU5Xj2saExzSeLVqnAirS57jUYspN66O8WTfPZvPWIxlOsS4gc7doXM9bi6lO7ky1emcIKZf268X1DyEf8nGbdmn4LzwhQV11Lo8iAAAAAElFTkSuQmCC" alt="⚡"></span><div class="bar"><div class="bar-fill" style="width:${ePct}%;background:var(--brass);"></div></div><span class="val"><b>${Math.floor(state.energy)}</b>/${maxE}</span></div>
        <div class="stat-row"><span class="icon"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAx9JREFUSEuFVT1oFEEU/t5sBMFSxLh7gqA2prjdEyOikKTUQlGw11ZtEtRELXIp1EQladRWe0HRQstcoSgR7jZFbDQgeLsYxNJCzM7Tmf2b/bm4xd3e7c58P+97bwjJRQB44L35NF3xn28CiAG1snB1MbyLLGscjBGLaCWKNj952PiawyNexUAPw/ssa+jQJstRIlrjKOq08P2HuaHC0W+rT1/YlyRoioD98YYxPjGeRYylFoL36r8u2ccsYJKJz5scGVgX4MWmDB+nJDIFvtU4C+bnBTklZ1jShAYUvLylQUTnXNl/oThqgFXs3gExtMqaeXrFCkoYQfLUKdkANhUD65CbzSY2fmmAHu09QiRXYj/qqq2oUE0KchvLYWEWoy3+9jEGsJwLgvHEZFG0gAGmTkENYXwrmxi42JLB09giYV9l0H2zsJXFjI7Lga5BT9htAZrVsa5NsA7NtaYMH+gUdS3npGB+XWFt2jIIYACGJDp1OOq/0QrW0DjwR/BnraDktWoWzZTR8TiYUNx6Yk+bQLNbWbSN6eAI979kMe0KxxdA05TM4Ll4k9gHT4Ztda8ACiliGoOqSdK9Elj1ZOCmK/W7vnAmAV40o+nKQOnJRkgtYwJ8OMsaILdrypXBUgHgA5yd2wX7ADXSjVwOKN497/Z0XmVgJkD8Wv+3ZPcowp/qZzILktki7OsEWkhZM/GcSb8lw7YCUCkyrRNMY5xYxMzTngzvpbSyGqQcfct+S4zjKfGsyBIdF3lMq0XWTffOk8EJU2UJAFi17NPM9LLS1RIdDypFpT4wYkrEZ9wofFULYEr2hXMTwO28qAxIqleQJAfgW00Z3jFrkw27PJp5ZnrCaf+bPnnWGZ1CNAnj6WhRcY4jXL2y88BUkN77wp4EsDi4oXRjTrlRHEkjptl9DJBVsrpVT9iXCfSwPHOUVgm+4snwUUFZ2jeJGYWYDmLqi8Y0wPOmv8Q005TBQnoaFgdfbnXlTM5BigeDL5wZgO8mRtxwZX++Tn3WksTFQ998kHVvyboeHD1fPAR+dYTUD5WSgkH1qD3mSomsB/gL/oxeMA2V9SIAAAAASUVORK5CYII=" alt="❤️"></span><div class="bar"><div class="bar-fill ${hPct<30?'health':''}" style="width:${hPct}%;background:var(--health);"></div></div><span class="val"><b>${Math.floor(state.health)}</b>/${maxH}</span></div>
        <div class="stat-row"><span class="icon">✨</span><div class="bar"><div class="bar-fill" style="width:${xpPct}%;background:var(--prestige);"></div></div><span class="val"><b>${state.xp}</b>/${state.xpToNext}</span></div>
      </div>
      <div class="topbar-right">
        <div class="gold-pill"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA2RJREFUSEuNVUuIHFUUPefV2NWFjpuMyfQniYoOmIkfRHEhkRHMTrJxiGaniyQkMmDUheDC1SxFCChxIQoijWYz+CEIigpBInGhggQXxkT6M8mYLBKdrv7UO9JVNdU1VdWjD7qhX993zr3n/ggQgOJvpE50P+nkX+XtRzejz2ZQKsbdgiDzV6GLsU2GIO9vsV9FEWfebiJIo/wf7yYKt/HHOKYtIiAQy+Vfrd/LIfYK2iFxFkYXQbS82fbXxfkbexARjLE2fsI2q9t8OAdo7CHQ7M8mPHqog26ldTqCKy6WEXToaTq33U79MIXXAez+DzV+KVebD6aLLUuTEIyM/LXaHIdcFrAYOZivs2zVGWsfKtVaP+cciVWJCOI+6Hbq30BYIAs6ICFLVYHwFgAHDk/aIR71+s6KueuSH9ZYLEmSA79dPwlgKetJApeJRsAP5ZJd7PXNBQM8LfAzGd2AxYo75SzzjsudjfSi264+T/L9DVkKI0iYCUK/+n2zr+wOP5DMAcLMC/ZtAAuRmS6BWCrPtj4PI/A7tT8A3hnKJWFrApyBtSdEvkfycUBnnSnnpWBof8xE/61XaT4Z5qDbrv1piJ25yZOWRbgJ4Jgb4ExvCucB3D0CNDKPWGOPQjicJpCw5lWb28MIequ1BsTnigaAgLYD2yhV2q/2VutLEka5Cs8IPIBdJPFavg/0jldpvZiUaa9dfwPQboEvUPzKAt+RuO56bPT94GVZPAPyvjBxwnmIyzTBPgvzSuL5uNJOWRN8eOuO9vdJmfqr9XcpXLTAOYJ7ATsPg3touT+UTghzY6VlWZzybikNenawOpZFFyB+SqOzspoDzZvlSnP0JDp+Z9cewn4iYT6d5LhLfqexDch8XCoFN26u85/prvf38Pb1h/sD+FNldDHg/SAPQXhKwDSA0+VK8+CmYdfr7NojBE8QeMyKrgF+kvib23e+9N3Bs4Y8BmJexBUKVyTeBumB7FYBseIa5zi3X+4kEkVx5Kf/2trM9PTQOwLpCIi53EhIdbighhG+cKutj1KdXDBKJ2zK9U59wTHYpkAzFpgxwLoB/rLkNXeIc9zZvF4wCSbt5HRMaSe2tk8TxDt50u4tXG2FMuZkS11sGteTDfNkyf6Y9Gi8k/MhJzdplEyq8kVRjPMv4Yt7MK5KE1sAAAAASUVORK5CYII=" alt="🪙"> ${fmtG(state.gold)}</div>
        <button class="top-icon-btn" onclick="activeTab='settings';renderBody();" title="Settings">⚙️</button>
        <button class="top-icon-btn" onclick="logout()" title="Log out">🚪</button>
      </div>
    </div>
    <div class="topbar-sub">
      <div class="timer-pill"><img class="ui-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA/xJREFUSEt9Vl1oW2UYft4vacdoNUlJRmvT5WQ6xW5F3NVQ/GmTeqFzF4r1YoKIP7iBDhQG4sALERR0KOKVN5tMwe1GEX+wSQPFsV0Mlbk5duFyssmqbU1OWtT0J98j5+Sc05OT2HORfDnf+73v8z7v+z5fBBAAhPdQqISi/RfdFsEj7cc7rO1t57EXM6n5fr3272c5K7O/lLi2e7y2/WLXQCGnXWO4L/0AZ/r/2NaINi5BkBTIoyAOa8GJfC1zctMkBBAGOfDg0gFtb6OUuGFornwB4C57m4AVoXqxqfSxfM0Ybg/Qghb87ASwsSuFgcqoEKdA7goaCuRxAs+QvJCvG6+3OdkEtU+4m1aLIgEKsfJhgbzvZmCn3VgHRqOCH7fqyK33LI1U7b3pePlBv27Cat7acSFIUbj+fg2KMfNTJfI9hX2aOKaAsxOWMT6dKB9UWsYg8ifAF0hcc+zAOwGMAtKrgG/RbLw5vnzHop9puMjFWPkIRN4BZSpXz5z2W4tAMWZ+AyVXRPTnE9XsudmkObS2jlcB2QNwDLAbAyZEnpqoZc4EW9/PwHb4Q/LKTSvNLSegMagiPVPj1eHf7fezycrQ/YuZOQ/dTNwsEfCpsqfIcSRAk/rph6wdnwTbPwjWWU8nzEcilLcJPZ2zsq+Eu6iUMPdp6iOA3AJBGsQigTIhr9l09RLb76tnam6bhprM7ZBCvPISRC/natnjHoLzZE8jeT31z3pzm1KyVXTvjUFraG4XZNXzUoxVnqdwb94ynvUmouuwFuNmmYLTIO4FdEqgUgTibZx6HjQaFD0vErEb4WdQbteKByerxuUOe68VI1AfkkxCMBjWqzCiYA1cWbsE8N2clT3uTHJ4Moux8pMQ2d1k88tmXf/SG9uS1tIcUaLSANPUGIkAcS1SpeiqovpLC6qKrK7qv8/1SP9jAPfk68ahNrHzNHUmXnmZ4Aet2FwDZJ7AgoAL4qxlgeCyAvog0kdymEBaAfZ3qgVaf5Wzsvs7AwgwEzcPkfjItiPdFnRFXRz56lA3V9bo2jvIjuYt461QDVqHZ/vmUmvRlfmu1Xcp9XkPGXnvlZbJiaVMwa9B2FkxXjkF8InuQVry7GXjZ+kLkVxdUat3P1zdudQ1A/t0aeDqXk11NnDZubE2ucI8SompXN1w5KaVgc9puxYWY+XnKPjYk4FgPXxZ9hH4Z7/OWcY+7ybunIOQ3hZi5kkBDvwfVb682wuNy7klw1ZYH3TXOQijKyTMA0K+AcjOsC451SAaAN7L1Y2jYQI7axAi3Tvw3c3XB6KyPilKbhPIGEmloX9ViPwWBS8+YGV/2riZ2zLwW7iznuHbIwB/o2EC/3pC8O2f/wEgF7MwmSw7rgAAAABJRU5ErkJggg==" alt="🔮"> ${state.mana}/${state.maxMana} MP</div>
      <div class="action-pill"><span class="dot"></span>Online</div>
      <div class="timer-pill" id="usernameDisplay" style="background:rgba(184,160,212,0.12);border-color:var(--prestige);color:var(--prestige);">👤 ${window.__playerUsername || "Player"}</div>
    </div>
  </div>`;
}
function renderBottomNav(){
  const existing = document.getElementById('bottom-nav');
  if(existing) existing.remove();
  const nav = document.createElement('div');
  nav.id = 'bottom-nav';
  nav.className = 'bottom-nav';
  const tabs = [
    {id:'production',icon:'⚒️',label:'Gather'},
    {id:'crafting',icon:'🔨',label:'Craft'},
    {id:'market',icon:'📊',label:'Market'},
    {id:'combat',icon:'⚔️',label:'Combat'},
    {id:'gear',icon:'🛡️',label:'Gear'},
    {id:'class',icon:'🧙',label:'Class'},
    {id:'skills',icon:'🎯',label:'Skills'},
    {id:'companies',icon:'🏭',label:'Biz'},
    {id:'settings',icon:'⚙️',label:'More'},
  ];
  nav.innerHTML = tabs.map(t=>`<button class="nav-item ${activeTab===t.id?'active':''}" onclick="activeTab='${t.id}';renderBody();"><span class="nav-icon">${t.icon}</span><span>${t.label}</span></button>`).join('');
  document.body.appendChild(nav);
}
function showToast(title, body, cls){
  let container = document.getElementById('toast-container');
  if(!container){ container = document.createElement('div'); container.id='toast-container'; document.body.appendChild(container); }
  const toast = document.createElement('div');
  toast.className = 'toast ' + (cls||'');
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-body">${body}</div>`;
  container.appendChild(toast);
  setTimeout(()=>{ toast.classList.add('hiding'); setTimeout(()=>toast.remove(), 300); }, 4000);
}

