// ============================================================================
// FUNCTIONS (client) — thin wrapper around Firebase Cloud Functions callables.
// No other module should call httpsCallable directly; add a new export here
// each time a new phase adds a Cloud Function.
// ============================================================================

import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-functions.js';
import { app } from './firebase.js';

const functions = getFunctions(app);

function call(name, data) {
  return httpsCallable(functions, name)(data).then(r => r.data);
}

// -- Phase 3: progression --
export const syncRegen = () => call('syncRegen');
export const spendSkillPoint = (skillId) => call('spendSkillPoint', { skillId });
export const spendClassSkillPoint = (skillId) => call('spendClassSkillPoint', { skillId });
export const resetClassSkills = () => call('resetClassSkills');

// -- Phase 4: PvE combat --
export const startBattle = (zoneId) => call('startBattle', { zoneId });
export const battleAction = (action) => call('battleAction', { action });
