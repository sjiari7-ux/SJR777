// ============================================================================
// CLOUD FUNCTIONS — entry point. Each system's functions live in their own
// file under /functions/systems and are re-exported here, so this file never
// grows unbounded as phases are added.
//
// Phase 2 (this batch) ships no gameplay-mutating functions yet: character
// creation is validated by firestore.rules (see /firestore.rules) because
// it only needs to check fixed constants, which rules can do on their own.
// Every later phase's server-authoritative actions (buyMarketListing,
// declareWar, castVote, applyPvPResult, etc. — see section 61 of the spec)
// get added here as that phase is built, without touching this file's
// structure.
// ============================================================================

const { initializeApp } = require('firebase-admin/app');
initializeApp();

// -- Phase 3 (progression): energy/health/mana regen + skill points
const progression = require('./systems/progression.js');
exports.syncRegen = progression.syncRegen;
exports.spendSkillPoint = progression.spendSkillPoint;
exports.spendClassSkillPoint = progression.spendClassSkillPoint;
exports.resetClassSkills = progression.resetClassSkills;

// -- Phase 4 (PvE combat)
const combat = require('./systems/combat.js');
exports.startBattle = combat.startBattle;
exports.battleAction = combat.battleAction;

// -- Phase 5+ (economy): exports.buyMarketListing, createMarketListing, ...
// -- Phase 6+ (gear): exports.buyGearListing, createGearListing, ...
// -- Phase 7+ (companies): exports.collectProduction, upgradeEngine, ...
// -- Phase 8+ (pvp): exports.applyPvPResult, ...
// -- Phase 9+ (kingdom): exports.joinKingdom, leaveKingdom, castVote, ...
// -- Phase 10+ (territory): exports.declareWar, contributeToWar, attackCore, ...
// -- Phase 11+ (seasons): scheduled functions for resolveSeason, ...
