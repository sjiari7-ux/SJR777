// ============================================================================
// PROGRESSION (client, display-only) — pure functions used by the UI to
// show a smooth XP bar and predicted stat regen between server syncs.
// The actual values always come from Firestore (written by the Cloud
// Functions in functions/systems/progression.js); nothing here is ever
// written back as truth.
// ============================================================================

import { xpForLevel, REGEN } from '../core/constants.js';

export function xpProgress(player) {
  const needed = xpForLevel(player.level);
  const pct = needed > 0 ? Math.min(100, (player.xp / needed) * 100) : 0;
  return { needed, current: player.xp, pct };
}

function toMillis(ts) {
  if (!ts) return Date.now();
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (ts instanceof Date) return ts.getTime();
  return Date.now();
}

/** Predicts current energy/health/mana for smooth UI display between the
 *  periodic syncRegen() calls. Purely cosmetic — never used to authorize
 *  spending a resource; the server always re-checks on its own clock. */
export function predictRegen(player, now = Date.now()) {
  const predict = (current, max, lastTs, intervalMs) => {
    if (current >= max) return current;
    const ticks = Math.floor((now - toMillis(lastTs)) / intervalMs);
    return Math.min(max, current + Math.max(0, ticks));
  };
  return {
    energy: predict(player.energy, player.maxEnergy, player.lastEnergyTimestamp, REGEN.energyIntervalMs),
    health: predict(player.health, player.maxHealth, player.lastHealthTimestamp, REGEN.healthIntervalMs),
    mana: predict(player.mana, player.maxMana, player.lastManaTimestamp, REGEN.manaIntervalMs),
  };
}

export function nextTickEta(player, kind, now = Date.now()) {
  const map = {
    energy: [player.lastEnergyTimestamp, REGEN.energyIntervalMs],
    health: [player.lastHealthTimestamp, REGEN.healthIntervalMs],
    mana: [player.lastManaTimestamp, REGEN.manaIntervalMs],
  };
  const [lastTs, intervalMs] = map[kind];
  const last = toMillis(lastTs);
  const elapsedInCurrentTick = (now - last) % intervalMs;
  return Math.max(0, intervalMs - elapsedInCurrentTick);
}
