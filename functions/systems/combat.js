// ============================================================================
// COMBAT (Cloud Functions) — server-authoritative PvE battles (Phase 4).
// The client never computes damage, monster HP, or rewards itself; it only
// calls startBattle/battleAction and renders whatever the server returns.
// Battle state lives directly on the player doc (`activeBattle`), so the
// existing real-time player-doc listener is all the client needs to stay in
// sync — no separate `battles` collection required for single-player PvE.
//
// Scope note: the design spec's full action list is Attack / Skill /
// Ultimate / Charge Attack / Defend / Use Item / Flee. This phase ships a
// fully real, server-validated loop for Attack / Defend / Flee (every class
// multiplier — atk, def, spd, dodge, crit — is already live in the damage
// formula below). Skill/Ultimate/Charge and item use plug into the same
// `battleAction` switch statement and are the natural next increment once
// Phase 5 (inventory) and mana-spending skills need real item/resource state.
// ============================================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { ADVENTURE_ZONES, CLASSES, MONSTERS, GENERAL_SKILLS, COMBAT } = require('../shared/gameData.js');
const { _applyXpGain: applyXpGain } = require('./progression.js');

const BASE_ATK = 5;
const BASE_SPD = 10;
const BASE_CRIT_CHANCE = 0.05;
const BASE_DODGE_CHANCE = 0.05;
const MAX_LOG_ENTRIES = 20;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return Math.random() * (max - min) + min; }
function clampDamage(n) { return Math.max(1, Math.min(COMBAT.maxSingleHitDamage, Math.round(n))); }

function pushLog(log, entry) {
  const next = [...(log || []), entry];
  return next.length > MAX_LOG_ENTRIES ? next.slice(next.length - MAX_LOG_ENTRIES) : next;
}

exports.startBattle = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const { zoneId } = request.data || {};
  const zone = ADVENTURE_ZONES[zoneId];
  const monsterList = MONSTERS[zoneId];
  if (!zone || !monsterList) throw new HttpsError('invalid-argument', 'Unknown zone.');

  const uid = request.auth.uid;
  const db = getFirestore();
  const ref = db.collection('players').doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Player not found.');
    const p = snap.data();

    if (p.activeBattle) throw new HttpsError('failed-precondition', 'Already in a battle.');
    if ((p.energy || 0) < zone.energyCost) throw new HttpsError('failed-precondition', 'Not enough energy.');
    if ((p.health || 0) <= 0) throw new HttpsError('failed-precondition', 'You must heal before adventuring.');

    const monster = monsterList[randInt(0, monsterList.length - 1)];
    const activeBattle = {
      zoneId,
      monsterId: monster.id,
      monsterName: monster.name,
      monsterMaxHp: monster.hp,
      monsterHp: monster.hp,
      monsterAtk: monster.atk,
      monsterDef: monster.def,
      monsterSpd: monster.spd,
      monsterXp: monster.xp,
      monsterGoldMin: monster.gold[0],
      monsterGoldMax: monster.gold[1],
      round: 1,
      log: [`A wild ${monster.name} appears!`],
      startedAt: Date.now(),
    };

    tx.update(ref, {
      activeBattle,
      energy: FieldValue.increment(-zone.energyCost),
      lastActiveAt: FieldValue.serverTimestamp(),
    });
    return { activeBattle };
  });
});

exports.battleAction = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const { action } = request.data || {};
  if (!['attack', 'defend', 'flee'].includes(action)) {
    throw new HttpsError('invalid-argument', 'Unknown action.');
  }

  const uid = request.auth.uid;
  const db = getFirestore();
  const ref = db.collection('players').doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Player not found.');
    const p = snap.data();
    const battle = p.activeBattle;
    if (!battle) throw new HttpsError('failed-precondition', 'No active battle.');

    const mult = CLASSES[p.class]?.multipliers || CLASSES.warrior.multipliers;
    const dmgSkillLevel = p.generalSkills?.damage || 0;
    const defSkillLevel = p.generalSkills?.defense || 0;

    let log = battle.log;
    let monsterHp = battle.monsterHp;
    let playerHealth = p.health;
    let fled = false;
    let defending = false;

    // ---- Player's action ----
    if (action === 'attack') {
      const playerAtk = (BASE_ATK + dmgSkillLevel * GENERAL_SKILLS.damage.perLevel) * mult.atk;
      const isCrit = Math.random() < BASE_CRIT_CHANCE * mult.crit;
      const raw = playerAtk * (isCrit ? 1.5 : 1) * randFloat(0.85, 1.15);
      const defReduction = battle.monsterDef / (battle.monsterDef + 100);
      const dmg = clampDamage(raw * (1 - defReduction));
      monsterHp = Math.max(0, monsterHp - dmg);
      log = pushLog(log, `You hit ${battle.monsterName} for ${dmg}${isCrit ? ' (critical!)' : ''}.`);
    } else if (action === 'defend') {
      defending = true;
      log = pushLog(log, 'You brace yourself, reducing incoming damage.');
    } else if (action === 'flee') {
      const playerSpd = BASE_SPD * mult.spd;
      const fleeChance = Math.min(0.9, Math.max(0.1, 0.5 + (playerSpd - battle.monsterSpd) * 0.01));
      fled = Math.random() < fleeChance;
      log = pushLog(log, fled ? 'You escaped the battle!' : 'You failed to escape!');
    }

    if (fled) {
      tx.update(ref, { activeBattle: FieldValue.delete(), lastActiveAt: FieldValue.serverTimestamp() });
      return { fled: true, log };
    }

    // ---- Victory check before the monster gets to swing ----
    if (monsterHp <= 0) {
      const xpResult = applyXpGain(p, battle.monsterXp);
      const goldReward = randInt(battle.monsterGoldMin, battle.monsterGoldMax);
      log = pushLog(log, `${battle.monsterName} is defeated! +${battle.monsterXp} XP, +${goldReward} gold.`);
      tx.update(ref, {
        activeBattle: FieldValue.delete(),
        level: xpResult.level,
        xp: xpResult.xp,
        skillPoints: xpResult.skillPoints,
        classSkillPoints: xpResult.classSkillPoints,
        gold: FieldValue.increment(goldReward),
        'stats.battlesWon': FieldValue.increment(1),
        lastActiveAt: FieldValue.serverTimestamp(),
      });
      return { victory: true, log, xpGained: battle.monsterXp, goldGained: goldReward, leveledUp: xpResult.leveledUp };
    }

    // ---- Monster's counter-attack ----
    const monsterRaw = battle.monsterAtk * randFloat(0.85, 1.15);
    const dodgeChance = BASE_DODGE_CHANCE * mult.dodge;
    const dodged = Math.random() < dodgeChance;
    let dmgToPlayer = 0;
    if (!dodged) {
      let reduction = defSkillLevel * GENERAL_SKILLS.defense.perLevel + Math.max(0, (mult.def - 1) * 0.15);
      if (defending) reduction += 0.5;
      reduction = Math.min(0.85, reduction);
      dmgToPlayer = clampDamage(monsterRaw * (1 - reduction));
      playerHealth = Math.max(0, playerHealth - dmgToPlayer);
      log = pushLog(log, `${battle.monsterName} hits you for ${dmgToPlayer}.`);
    } else {
      log = pushLog(log, `You dodge ${battle.monsterName}'s attack!`);
    }

    // ---- Defeat check ----
    if (playerHealth <= 0) {
      log = pushLog(log, `You were defeated by ${battle.monsterName}...`);
      tx.update(ref, {
        activeBattle: FieldValue.delete(),
        health: 1, // avoid a hard death-lock; no formal "death" mechanic in the spec
        'stats.battlesLost': FieldValue.increment(1),
        lastActiveAt: FieldValue.serverTimestamp(),
      });
      return { defeat: true, log };
    }

    // ---- Battle continues ----
    const nextBattle = { ...battle, monsterHp, round: battle.round + 1, log };
    tx.update(ref, {
      activeBattle: nextBattle,
      health: playerHealth,
      lastActiveAt: FieldValue.serverTimestamp(),
    });
    return { continuing: true, battle: nextBattle, health: playerHealth };
  });
});
