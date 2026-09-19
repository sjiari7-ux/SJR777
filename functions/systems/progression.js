// ============================================================================
// PROGRESSION (Cloud Functions) — the server-authoritative half of Phase 3.
// Energy/health/mana regen, XP->level math, and skill-point spending all
// happen here inside Firestore transactions so the client can never fake
// a level, a stat, or a free skill point (section 62).
//
// Numeric balance data is mirrored from the client's source of truth into
// functions/shared/gameData.js (see that file's header for the mapping) —
// this file imports from there rather than redefining its own copies.
// ============================================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const {
  REGEN, REGEN_AMOUNT_PER_TICK, GENERAL_SKILLS,
  CLASS_SKILL_MAX_LEVEL, CLASS_SKILL_POINT_COSTS,
  SKILL_POINTS_PER_LEVEL, CLASS_SKILL_POINTS_PER_LEVEL,
  CLASSES, xpForLevel,
} = require('../shared/gameData.js');

/** Applies an XP gain to a player object (plain JS object, not a Firestore
 *  doc), cascading through as many level-ups as the XP covers, and granting
 *  skill points per level. Pure function — callers (Phase 4 combat, later
 *  crafting/missions) commit the result inside their own transaction. */
function applyXpGain(player, amount) {
  let { level, xp, skillPoints = 0, classSkillPoints = 0 } = player;
  xp += Math.max(0, Math.floor(amount));
  let leveledUp = false;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
    skillPoints += SKILL_POINTS_PER_LEVEL;
    classSkillPoints += CLASS_SKILL_POINTS_PER_LEVEL;
    leveledUp = true;
  }
  return { level, xp, skillPoints, classSkillPoints, leveledUp };
}
exports._applyXpGain = applyXpGain;

function computeRegenTick(current, max, lastTimestampMs, intervalMs, amountPerTick, nowMs) {
  const last = lastTimestampMs || nowMs;
  if (current >= max) return { value: current, newTimestamp: nowMs };
  const ticks = Math.floor((nowMs - last) / intervalMs);
  if (ticks <= 0) return { value: current, newTimestamp: last };
  const value = Math.min(max, current + ticks * amountPerTick);
  const newTimestamp = last + ticks * intervalMs;
  return { value, newTimestamp };
}
exports._computeRegenTick = computeRegenTick;

exports.syncRegen = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const uid = request.auth.uid;
  const db = getFirestore();
  const ref = db.collection('players').doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Player not found.');
    const p = snap.data();
    const now = Date.now();

    const energy = computeRegenTick(p.energy, p.maxEnergy, p.lastEnergyTimestamp?.toMillis?.(), REGEN.energyIntervalMs, REGEN_AMOUNT_PER_TICK.energy, now);
    const health = computeRegenTick(p.health, p.maxHealth, p.lastHealthTimestamp?.toMillis?.(), REGEN.healthIntervalMs, REGEN_AMOUNT_PER_TICK.health, now);
    const mana = computeRegenTick(p.mana, p.maxMana, p.lastManaTimestamp?.toMillis?.(), REGEN.manaIntervalMs, REGEN_AMOUNT_PER_TICK.mana, now);

    tx.update(ref, {
      energy: energy.value,
      health: health.value,
      mana: mana.value,
      lastEnergyTimestamp: new Date(energy.newTimestamp),
      lastHealthTimestamp: new Date(health.newTimestamp),
      lastManaTimestamp: new Date(mana.newTimestamp),
      lastActiveAt: FieldValue.serverTimestamp(),
    });

    return { energy: energy.value, health: health.value, mana: mana.value };
  });
});

exports.spendSkillPoint = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const { skillId } = request.data || {};
  const def = GENERAL_SKILLS[skillId];
  if (!def) throw new HttpsError('invalid-argument', 'Unknown skill.');

  const uid = request.auth.uid;
  const db = getFirestore();
  const ref = db.collection('players').doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Player not found.');
    const p = snap.data();
    if ((p.skillPoints || 0) < 1) throw new HttpsError('failed-precondition', 'No skill points available.');

    const generalSkills = { ...(p.generalSkills || {}) };
    const currentLevel = generalSkills[skillId] || 0;
    if (currentLevel >= def.maxLevel) throw new HttpsError('failed-precondition', 'Skill already at max level.');

    generalSkills[skillId] = currentLevel + 1;
    const patch = {
      generalSkills,
      skillPoints: FieldValue.increment(-1),
      lastActiveAt: FieldValue.serverTimestamp(),
    };
    if (skillId === 'health') { patch.maxHealth = FieldValue.increment(def.perLevel); patch.health = FieldValue.increment(def.perLevel); }
    if (skillId === 'stamina') { patch.maxEnergy = FieldValue.increment(def.perLevel); }
    if (skillId === 'storage') { patch.storageCapacity = FieldValue.increment(def.perLevel); }

    tx.update(ref, patch);
    return { skillId, newLevel: currentLevel + 1 };
  });
});

exports.spendClassSkillPoint = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const { skillId } = request.data || {};

  const uid = request.auth.uid;
  const db = getFirestore();
  const ref = db.collection('players').doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Player not found.');
    const p = snap.data();

    const allowedSkills = CLASSES[p.class]?.skillIds || [];
    if (!allowedSkills.includes(skillId)) throw new HttpsError('invalid-argument', 'That skill does not belong to your class.');

    const classSkills = { ...(p.classSkills || {}) };
    const currentLevel = classSkills[skillId] || 0;
    if (currentLevel >= CLASS_SKILL_MAX_LEVEL) throw new HttpsError('failed-precondition', 'Skill already at max level.');

    const cost = CLASS_SKILL_POINT_COSTS[currentLevel];
    if ((p.classSkillPoints || 0) < cost) throw new HttpsError('failed-precondition', 'Not enough class skill points.');

    classSkills[skillId] = currentLevel + 1;
    tx.update(ref, {
      classSkills,
      classSkillPoints: FieldValue.increment(-cost),
      lastActiveAt: FieldValue.serverTimestamp(),
    });
    return { skillId, newLevel: currentLevel + 1, spent: cost };
  });
});

exports.resetClassSkills = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const uid = request.auth.uid;
  const db = getFirestore();
  const ref = db.collection('players').doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Player not found.');
    const p = snap.data();
    const classSkills = p.classSkills || {};

    let refund = 0;
    for (const level of Object.values(classSkills)) {
      for (let i = 0; i < level; i++) refund += CLASS_SKILL_POINT_COSTS[i];
    }

    tx.update(ref, {
      classSkills: {},
      classSkillPoints: FieldValue.increment(refund),
      classResets: FieldValue.increment(1),
      lastClassReset: FieldValue.serverTimestamp(),
      lastActiveAt: FieldValue.serverTimestamp(),
    });
    return { refunded: refund };
  });
});
