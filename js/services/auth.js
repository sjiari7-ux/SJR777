// ============================================================================
// AUTH — every authentication operation goes through this file. No other
// module should call the Firebase Auth SDK directly.
//
// Supports: Google login, guest (anonymous) accounts, linking a guest to a
// permanent Google account, sign out, account deletion, persistent session
// (Firebase's own IndexedDB persistence handles this automatically), and
// password reset for accounts that add an email/password credential.
// ============================================================================

import { auth, db } from './firebase.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  linkWithPopup,
  signOut,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

const googleProvider = new GoogleAuthProvider();

/** Subscribes to auth state. callback receives the Firebase user or null. */
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (err) {
    return { user: null, error: describeAuthError(err) };
  }
}

export async function signInAsGuest() {
  try {
    const result = await signInAnonymously(auth);
    return { user: result.user, error: null };
  } catch (err) {
    return { user: null, error: describeAuthError(err) };
  }
}

/** Upgrades the current guest session to a permanent Google account,
 *  keeping the same uid (and therefore the same player doc/progress). */
export async function linkGuestToGoogle() {
  if (!auth.currentUser) return { user: null, error: 'No active session.' };
  try {
    const result = await linkWithPopup(auth.currentUser, googleProvider);
    return { user: result.user, error: null };
  } catch (err) {
    return { user: null, error: describeAuthError(err) };
  }
}

export function isGuestUser(user) {
  return !!user && user.isAnonymous;
}

export async function signOutUser() {
  await signOut(auth);
}

export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (err) {
    return { error: describeAuthError(err) };
  }
}

/** Deletes the player's Firestore profile AND their auth account.
 *  Firebase requires a recent login for this; if it fails with
 *  auth/requires-recent-login, prompt the user to sign in again first. */
export async function deleteAccountAndData() {
  const user = auth.currentUser;
  if (!user) return { error: 'No active session.' };
  try {
    await deleteDoc(doc(db, 'players', user.uid));
    await deleteUser(user);
    return { error: null };
  } catch (err) {
    return { error: describeAuthError(err) };
  }
}

function describeAuthError(err) {
  const code = err?.code || '';
  const map = {
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/requires-recent-login': 'Please sign in again to confirm this action.',
    'auth/credential-already-in-use': 'That Google account is already linked to another player.',
    'auth/network-request-failed': 'Network error — check your connection.',
  };
  return map[code] || (err?.message || 'Authentication error.');
}
