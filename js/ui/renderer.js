// ============================================================================
// RENDERER — one render function per tab. Phase 1 wires these up with real
// data-file-driven layouts so the shell is fully navigable; combat, market
// transactions, kingdom actions, etc. get connected to Firebase in later
// phases without changing this file's structure.
// ============================================================================

import { el, card, button, statBar, emptyState, icon } from './components.js';
import { registerRoute, rerenderCurrent } from '../core/router.js';
import { getState, setState } from '../core/state.js';
import { CLASSES } from '../data/classes.js';
import { ADVENTURE_ZONES, GENERAL_SKILLS, CLASS_SKILL } from '../core/constants.js';
import { RESOURCES } from '../data/resources.js';
import { WORLD_CONFIG, getAllTerritories } from '../data/worldConfig.js';
import { toast } from './toast.js';
import { signInWithGoogle, signInAsGuest, linkGuestToGoogle, signOutUser, deleteAccountAndData } from '../services/auth.js';
import { exportLocalData } from '../services/firestore.js';
import { renderCharacterCreation } from './characterCreation.js';
import { xpProgress, predictRegen } from '../systems/progression.js';
import { syncRegen, spendSkillPoint, spendClassSkillPoint, resetClassSkills, startBattle } from '../services/functions.js';
import { renderBattle } from './battle.js';

function requireAuth(outlet, renderFn) {
  const { auth, player } = getState();
  if (!auth.ready) {
    outlet.appendChild(el('div', { class: 'loading-state' }, 'Loading Arcadia…'));
    return;
  }
  if (!auth.uid) {
    outlet.appendChild(card('Sign in to play', [
      el('p', {}, 'Create a character to enter Arcadia.'),
      button('Continue as Guest', async () => {
        const { error } = await signInAsGuest();
        if (error) toast.error(error);
      }),
      button('Sign in with Google', async () => {
        const { error } = await signInWithGoogle();
        if (error) toast.error(error);
      }, { variant: 'secondary' }),
    ]));
    return;
  }
  if (!player) {
    renderCharacterCreation(outlet, auth.uid, () => rerenderCurrent());
    return;
  }
  renderFn(outlet, player);
}

// ---- HOME -------------------------------------------------------------
let regenTicker = null;
let lastRegenSyncAt = 0;

function renderHome(outlet) {
  requireAuth(outlet, (outlet, player) => {
    const regen = predictRegen(player);
    const xp = xpProgress(player);

    outlet.appendChild(el('div', { class: 'grid grid--2' }, [
      card('Character', [
        el('p', {}, `Level ${player.level} ${CLASSES[player.class]?.name || ''} — ${player.gold} gold`),
        el('div', { class: 'xp-bar' }, [
          el('div', { class: 'xp-bar__label' }, `XP ${Math.round(xp.current)} / ${xp.needed}`),
          el('div', { class: 'stat-bar__track' }, [el('div', { class: 'stat-bar__fill stat-bar__fill--xp', style: `width:${xp.pct}%` })]),
        ]),
        statBar('Health', regen.health, player.maxHealth, 'health'),
        statBar('Energy', regen.energy, player.maxEnergy, 'energy'),
        statBar('Mana', regen.mana, player.maxMana, 'mana'),
        el('p', { class: 'muted' }, `Skill points: ${player.skillPoints || 0} general · ${player.classSkillPoints || 0} class`),
      ]),
      card('Notifications', [emptyState('No notifications yet.')]),
    ]));

    outlet.appendChild(renderGeneralSkills(player));
    outlet.appendChild(renderClassSkills(player));

    // Re-render every 5s so the predicted stat bars visibly tick up between
    // real server syncs; only actually call the server every ~30s.
    if (regenTicker) clearInterval(regenTicker);
    regenTicker = setInterval(() => {
      if (getState().ui.activeTab !== 'home') { clearInterval(regenTicker); return; }
      rerenderCurrent();
    }, 5000);

    if (Date.now() - lastRegenSyncAt > 25000) {
      lastRegenSyncAt = Date.now();
      syncRegen().catch(err => console.warn('[syncRegen] failed', err));
    }
  });
}

function renderGeneralSkills(player) {
  const rows = Object.entries(GENERAL_SKILLS).map(([id, def]) => {
    const level = player.generalSkills?.[id] || 0;
    const maxed = level >= def.maxLevel;
    return el('div', { class: 'skill-row' }, [
      el('div', { class: 'skill-row__info' }, [
        el('span', { class: 'skill-row__name' }, def.label),
        el('span', { class: 'muted' }, ` Lv ${level}/${def.maxLevel} · +${def.perLevel} ${def.unit}/level`),
      ]),
      button('+', async () => {
        try {
          await spendSkillPoint(id);
        } catch (err) {
          toast.error(err.message || 'Could not upgrade skill.');
        }
      }, { disabled: maxed || !(player.skillPoints > 0), variant: 'secondary' }),
    ]);
  });
  return card(`General Skills (${player.skillPoints || 0} points)`, rows);
}

function renderClassSkills(player) {
  const cls = CLASSES[player.class];
  if (!cls) return card('Class Skills', [emptyState('No class selected.')]);
  const rows = Object.values(cls.skills).map(skill => {
    const level = player.classSkills?.[skill.id] || 0;
    const maxed = level >= CLASS_SKILL.maxLevel;
    const cost = maxed ? '—' : CLASS_SKILL.pointCosts[level];
    return el('div', { class: 'skill-row' }, [
      el('div', { class: 'skill-row__info' }, [
        el('span', { class: 'skill-row__name' }, skill.name),
        el('span', { class: 'muted' }, ` Lv ${level}/${CLASS_SKILL.maxLevel} — ${skill.desc}`),
      ]),
      button(maxed ? 'Max' : `+ (${cost})`, async () => {
        try {
          await spendClassSkillPoint(skill.id);
        } catch (err) {
          toast.error(err.message || 'Could not upgrade skill.');
        }
      }, { disabled: maxed || !(player.classSkillPoints >= cost), variant: 'secondary' }),
    ]);
  });
  rows.push(button('Reset Class Skills', async () => {
    if (!confirm('Reset all class skills and refund the points spent on them?')) return;
    try {
      await resetClassSkills();
      toast.success('Class skills reset.');
    } catch (err) {
      toast.error(err.message || 'Could not reset skills.');
    }
  }, { variant: 'danger' }));
  return card(`${cls.name} Skills (${player.classSkillPoints || 0} points) — resets: ${player.classResets || 0}`, rows);
}

// ---- ADVENTURE ----------------------------------------------------------
function renderAdventure(outlet) {
  requireAuth(outlet, (outlet, player) => {
    if (player.activeBattle) {
      renderBattle(outlet, player);
      return;
    }
    outlet.appendChild(el('div', { class: 'grid grid--3' }, ADVENTURE_ZONES.map(zone =>
      card(zone.name, [
        el('p', {}, `Levels ${zone.minLevel}–${zone.maxLevel === 999 ? '∞' : zone.maxLevel}`),
        el('p', { class: 'muted' }, `${zone.energyCost} energy per battle`),
        button('Enter Zone', async () => {
          if (player.energy < zone.energyCost) { toast.error('Not enough energy.'); return; }
          try {
            await startBattle(zone.id);
          } catch (err) {
            toast.error(err.message || 'Could not start battle.');
          }
        }),
      ], 'zone-card')
    )));
  });
}

// ---- CRAFT ----------------------------------------------------------
function renderCraft(outlet) {
  requireAuth(outlet, () => {
    outlet.appendChild(card('Crafting', [emptyState('Recipe workshop arrives in Phase 5 (Economy).')]));
  });
}

// ---- MARKET ----------------------------------------------------------
function renderMarket(outlet) {
  requireAuth(outlet, () => {
    outlet.appendChild(el('div', { class: 'grid grid--4' }, Object.values(RESOURCES).map(r =>
      card(r.name, [el('p', {}, `Base price: ${r.basePrice} gold`)], 'resource-card')
    )));
    outlet.appendChild(el('p', { class: 'muted' }, 'Live player marketplace arrives in Phase 5 (Economy).'));
  });
}

// ---- PVP ----------------------------------------------------------
function renderPvp(outlet) {
  requireAuth(outlet, () => {
    outlet.appendChild(card('Arena', [emptyState('Matchmaking arrives in Phase 8 (PvP).')]));
  });
}

// ---- KINGDOM ----------------------------------------------------------
function renderKingdom(outlet) {
  requireAuth(outlet, () => {
    outlet.appendChild(el('div', { class: 'grid grid--3' }, Object.values(WORLD_CONFIG.zones).map(zone =>
      card(zone.name, [
        el('p', { class: 'muted' }, `Tax rate: ${Math.round(zone.taxRate * 100)}%`),
        el('p', { class: 'muted' }, `Resources: ${zone.resources.join(', ')}`),
        button('Join Kingdom', () => toast.info('Kingdom membership arrives in Phase 9.')),
      ], 'kingdom-card')
    )));
  });
}

// ---- TERRITORY ----------------------------------------------------------
function renderTerritory(outlet) {
  requireAuth(outlet, () => {
    const territories = getAllTerritories();
    outlet.appendChild(card('World Map', [
      el('p', { class: 'muted' }, `${territories.length} territories across ${Object.keys(WORLD_CONFIG.zones).length} kingdoms. Interactive SVG map arrives in Phase 10.`),
      el('div', { class: 'territory-list' }, territories.map(t =>
        el('div', { class: 'territory-row' }, [
          el('span', { class: 'territory-row__name' }, t.name),
          el('span', { class: 'territory-row__zone' }, t.zoneName),
          t.capital ? el('span', { class: 'badge badge--capital' }, 'Capital') : null,
        ])
      )),
    ]));
  });
}

// ---- LEADERBOARD ----------------------------------------------------------
function renderLeaderboard(outlet) {
  requireAuth(outlet, () => {
    outlet.appendChild(card('Leaderboards', [emptyState('Live rankings arrive once Firestore is connected (Phase 2+).')]));
  });
}

// ---- PROFILE ----------------------------------------------------------
function renderProfile(outlet) {
  requireAuth(outlet, (outlet, player) => {
    const { auth } = getState();
    const actions = [
      button('Export My Data', () => exportLocalData(player), { variant: 'secondary' }),
    ];
    if (auth.isGuest) {
      actions.unshift(button('Link Google Account (keep your progress)', async () => {
        const { error } = await linkGuestToGoogle();
        if (error) toast.error(error); else toast.success('Account linked!');
      }));
    }
    actions.push(button('Sign Out', async () => { await signOutUser(); }, { variant: 'secondary' }));
    actions.push(button('Delete Account', async () => {
      if (!confirm('This permanently deletes your character and cannot be undone. Continue?')) return;
      const { error } = await deleteAccountAndData();
      if (error) toast.error(error); else toast.success('Account deleted.');
    }, { variant: 'danger' }));

    outlet.appendChild(card('Profile', [
      el('p', {}, `Username: ${player.username}`),
      el('p', {}, `Class: ${CLASSES[player.class]?.name}`),
      el('p', { class: 'muted' }, auth.isGuest ? 'Guest account — link a Google account to keep your progress safe.' : 'Signed in with Google.'),
      ...actions,
    ]));
  });
}

export function registerAllRoutes() {
  registerRoute('home', renderHome);
  registerRoute('adventure', renderAdventure);
  registerRoute('craft', renderCraft);
  registerRoute('market', renderMarket);
  registerRoute('pvp', renderPvp);
  registerRoute('kingdom', renderKingdom);
  registerRoute('territory', renderTerritory);
  registerRoute('leaderboard', renderLeaderboard);
  registerRoute('profile', renderProfile);
}
