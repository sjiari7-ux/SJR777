// ============================================================================
// FIRESTORE (players) — reading and writing the `players/{uid}` document.
//
// IMPORTANT: this file only ever writes fields the security rules (see
// /firestore.rules) classify as client-editable profile settings (username,
// avatar, bio, theme/language/fontSize/accentColor). Gold, XP, level,
// inventory, PvP rating, kingdom membership, etc. are server-owned and are
// only ever changed by Cloud Functions — never write them from the client.
// ============================================================================

import { db } from './firebase.js';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { newPlayerDefaults } from '../core/state.js';
import { CLASS_IDS } from '../data/classes.js';

const PLAYER_EDITABLE_FIELDS = ['username', 'avatar', 'bio', 'settings'];

export async function getPlayerDoc(uid) {
  const snap = await getDoc(doc(db, 'players', uid));
  return snap.exists() ? snap.data() : null;
}

/** Creates the initial player document. Firestore security rules re-check
 *  that every stat here matches the fixed starting values (see
 *  CHARACTER_DEFAULTS in core/constants.js) and that `class` is one of the
 *  five valid classes — a client can't sneak in extra starting gold this way. */
export async function createPlayerDoc(uid, username, classId) {
  if (!CLASS_IDS.includes(classId)) throw new Error('Invalid class.');
  const trimmed = (username || '').trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    throw new Error('Username must be 3–20 characters.');
  }
  const player = {
    ...newPlayerDefaults(uid, trimmed, classId),
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    lastEnergyTimestamp: serverTimestamp(),
    lastHealthTimestamp: serverTimestamp(),
    lastManaTimestamp: serverTimestamp(),
  };
  await setDoc(doc(db, 'players', uid), player);
  return player;
}

/** Real-time listener for the player doc — keeps gameState.player in sync
 *  with whatever Cloud Functions have most recently written server-side. */
export function subscribePlayerDoc(uid, onChange) {
  return onSnapshot(doc(db, 'players', uid), (snap) => {
    onChange(snap.exists() ? snap.data() : null);
  });
}

/** Updates only the client-editable profile fields (section 6: username,
 *  avatar, bio, theme, language, font size, accent color). */
export async function updatePlayerProfile(uid, patch) {
  const safePatch = {};
  for (const key of Object.keys(patch)) {
    if (PLAYER_EDITABLE_FIELDS.includes(key)) safePatch[key] = patch[key];
  }
  if (Object.keys(safePatch).length === 0) return;
  safePatch.lastActiveAt = serverTimestamp();
  await updateDoc(doc(db, 'players', uid), safePatch);
}

export function exportLocalData(player) {
  const blob = new Blob([JSON.stringify(player, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arcadia-profile-${player.uid}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
