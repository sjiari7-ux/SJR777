// ============================================================================
// WORLD_CONFIG — single source of truth for kingdoms, territories, adjacency,
// tax rates, and zone resources. Every other system (map UI, war engine, tax
// engine, kingdom UI) derives from this file. Do not redefine any of this
// data anywhere else.
//
// Territories use real-world geography groupings (clusters of neighboring
// countries) rather than fictional place names, per project direction.
// ============================================================================

// territory.index meaning within a zone:
//   0 = Capital (cannot be captured)
//   1 = Outpost region      (route step 1)
//   2 = Fortress Gate region (route step 2 — CORE.routeIndices)
//   3 = Mountain Pass region (route step 3 — CORE.routeIndices)
//   4 = Western/outer region (route step 4 — CORE.routeIndices)
// Route to the Ancient Core: Capital -> Outpost -> Fortress Gate -> Mountain Pass -> Core
// If indices 2, 3, or 4 are enemy-owned, the route to the Core is severed.

export const WORLD_CONFIG = Object.freeze({
  zones: {
    europe: {
      id: 'europe',
      name: 'Europe',
      color: '#7fb2e0',
      taxRate: 0.05,
      resources: ['cotton', 'food', 'herbs', 'water'],
      adjacent: ['asia', 'africa', 'arab_world'],
      territories: [
        { index: 0, id: 'europe_capital',  name: 'Central Europe',   countries: 'Germany, Austria, Switzerland, Czechia', capital: true },
        { index: 1, id: 'europe_outpost',  name: 'Northern Europe',  countries: 'Scandinavia, Baltics' },
        { index: 2, id: 'europe_fortress', name: 'Eastern Europe',   countries: 'Poland, Ukraine, Balkans' },
        { index: 3, id: 'europe_mountain', name: 'Southern Europe',  countries: 'Italy, Spain, Portugal, Greece' },
        { index: 4, id: 'europe_western',  name: 'Western Europe',   countries: 'France, Benelux, UK, Ireland' },
      ],
    },
    asia: {
      id: 'asia',
      name: 'Asia',
      color: '#e0b25a',
      taxRate: 0.08,
      resources: ['wood', 'herbs', 'food', 'water'],
      adjacent: ['europe', 'north_america'],
      territories: [
        { index: 0, id: 'asia_capital',  name: 'East Asia',       countries: 'China, Japan, Korea', capital: true },
        { index: 1, id: 'asia_outpost',  name: 'Northern Asia',   countries: 'Mongolia, Siberia' },
        { index: 2, id: 'asia_fortress', name: 'Central Asia',    countries: 'Kazakhstan, Uzbekistan, Turkmenistan' },
        { index: 3, id: 'asia_mountain', name: 'South Asia',      countries: 'India, Pakistan, Bangladesh, Nepal' },
        { index: 4, id: 'asia_western',  name: 'Southeast Asia',  countries: 'Indonesia, Vietnam, Thailand, Philippines' },
      ],
    },
    africa: {
      id: 'africa',
      name: 'Africa',
      color: '#c97b4a',
      taxRate: 0.10,
      resources: ['stone', 'iron', 'coal', 'zinc'],
      adjacent: ['arab_world', 'europe'],
      territories: [
        { index: 0, id: 'africa_capital',  name: 'Central Africa',   countries: 'DRC, Cameroon, Gabon', capital: true },
        { index: 1, id: 'africa_outpost',  name: 'Northern Africa',  countries: 'Morocco, Algeria, Libya, Tunisia' },
        { index: 2, id: 'africa_fortress', name: 'Eastern Africa',   countries: 'Kenya, Ethiopia, Tanzania' },
        { index: 3, id: 'africa_mountain', name: 'Southern Africa',  countries: 'South Africa, Namibia, Zimbabwe' },
        { index: 4, id: 'africa_western',  name: 'Western Africa',   countries: 'Nigeria, Ghana, Senegal, Mali' },
      ],
    },
    north_america: {
      id: 'north_america',
      name: 'North America',
      color: '#6fae7f',
      taxRate: 0.13,
      resources: ['stone', 'iron', 'coal', 'silver'],
      adjacent: ['asia', 'south_america'],
      territories: [
        { index: 0, id: 'na_capital',  name: 'Eastern Seaboard',   countries: 'US Northeast, Ontario, Quebec', capital: true },
        { index: 1, id: 'na_outpost',  name: 'Northern NA',        countries: 'Canada, Alaska' },
        { index: 2, id: 'na_fortress', name: 'Central NA',         countries: 'US Midwest, Great Plains' },
        { index: 3, id: 'na_mountain', name: 'Western NA',         countries: 'US West Coast, Rockies' },
        { index: 4, id: 'na_western',  name: 'Southern NA',        countries: 'Mexico, Central America, Caribbean' },
      ],
    },
    arab_world: {
      id: 'arab_world',
      name: 'Arab World',
      color: '#c9a15a',
      taxRate: 0.16,
      resources: ['herbs', 'water', 'leather', 'salt'],
      adjacent: ['south_america', 'africa', 'europe'],
      territories: [
        { index: 0, id: 'arab_capital',  name: 'Arabian Peninsula', countries: 'Saudi Arabia, UAE, Gulf States', capital: true },
        { index: 1, id: 'arab_outpost',  name: 'Northern Arabia',   countries: 'Iraq, Jordan, Syria' },
        { index: 2, id: 'arab_fortress', name: 'Levant',            countries: 'Lebanon, Palestine, Israel' },
        { index: 3, id: 'arab_mountain', name: 'North Africa Rim',  countries: 'Egypt, Sudan' },
        { index: 4, id: 'arab_western',  name: 'Maghreb Coast',     countries: 'Yemen, Oman, Horn of Africa coast' },
      ],
    },
    south_america: {
      id: 'south_america',
      name: 'South America',
      color: '#8f7fc9',
      taxRate: 0.20,
      resources: ['magic_stones', 'gemstones', 'gold', 'lead'],
      adjacent: ['north_america', 'arab_world'],
      territories: [
        { index: 0, id: 'sa_capital',  name: 'Amazon Basin',     countries: 'Brazil core', capital: true },
        { index: 1, id: 'sa_outpost',  name: 'Northern SA',      countries: 'Venezuela, Guyana, Colombia' },
        { index: 2, id: 'sa_fortress', name: 'Eastern SA',       countries: 'Coastal Brazil' },
        { index: 3, id: 'sa_mountain', name: 'Andean SA',        countries: 'Peru, Bolivia, Ecuador' },
        { index: 4, id: 'sa_western',  name: 'Southern Cone',    countries: 'Argentina, Chile, Uruguay, Paraguay' },
      ],
    },
  },
});

export const ZONE_IDS = Object.freeze(Object.keys(WORLD_CONFIG.zones));

export function getZone(zoneId) {
  return WORLD_CONFIG.zones[zoneId] || null;
}

export function getAllTerritories() {
  const out = [];
  for (const zone of Object.values(WORLD_CONFIG.zones)) {
    for (const t of zone.territories) {
      out.push({ ...t, zone: zone.id, zoneName: zone.name, zoneColor: zone.color, taxRate: zone.taxRate });
    }
  }
  return out;
}

export function getTerritory(territoryId) {
  return getAllTerritories().find(t => t.id === territoryId) || null;
}

export function majorityThreshold(territoryCount) {
  return Math.ceil((territoryCount + 1) / 2);
}

export function isRouteTerritory(index) {
  return [2, 3, 4].includes(index);
}

export function areZonesAdjacent(zoneA, zoneB) {
  const zone = getZone(zoneA);
  return !!zone && zone.adjacent.includes(zoneB);
}
