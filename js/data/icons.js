// ============================================================================
// ICON REGISTRY — every icon reference in the game goes through this map.
// To reskin the game, replace the asset paths here; no other file should
// hardcode an image path or emoji.
// Until real art is dropped into /assets/icons, each key falls back to a
// single glyph so the UI never shows a broken image.
// ============================================================================

const FALLBACK_GLYPHS = {
  damage: '⚔', defense: '🛡', health: '♥', energy: '⚡', mana: '✦', gold: '●',
  wood: '▲', stone: '■', food: '◆', coal: '▪', iron: '◼', cotton: '❋',
  leather: '▤', sand: '░', gemstones: '◈', water: '≈', salt: '·', copper: '○',
  silver: '◎', zinc: '▫', lead: '▮', magic_stones: '✧', herbs: '❧', honey: '⬢',
  weapon: '⚔', armor: '🛡', helmet: '⛨', boots: '👢', accessory: '💍', gloves: '🧤',
  warrior: '⚔', archer: '➶', mage: '✦', commander: '🚩', merchant: '⚖',
  kingdom: '⚑', territory: '⬢', war: '⚔', core: '✦', election: '🗳',
  market: '⚖', craft: '🔨', company: '🏭', pvp: '⚔', leaderboard: '🏆',
  notification: '🔔', settings: '⚙',
};

export function iconPath(key) {
  // Real deployments replace this with `/assets/icons/${key}.svg` once art
  // is added. Falls back to the glyph map so the UI degrades gracefully.
  return null; // no image asset yet — renderer should fall back to iconGlyph()
}

export function iconGlyph(key) {
  return FALLBACK_GLYPHS[key] || '•';
}

export const ICONS = Object.freeze(
  Object.fromEntries(Object.keys(FALLBACK_GLYPHS).map(k => [k, k]))
);
