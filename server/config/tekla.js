/**
 * Tekla inventory helper — calls MFCCortex's tekla_get_inventory tool
 * via its admin API to get inventory weights.
 */

const CORTEX_URL = process.env.CORTEX_URL || 'http://localhost:7777';
const CORTEX_ADMIN_KEY = process.env.CORTEX_ADMIN_KEY || '';

// 5-minute in-memory cache
let inventoryCache = null;
let inventoryCachedAt = null;
const CACHE_TTL = 5 * 60 * 1000;

async function getInventory() {
  if (inventoryCache && inventoryCachedAt && Date.now() - inventoryCachedAt < CACHE_TTL) {
    return inventoryCache;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (CORTEX_ADMIN_KEY) headers['X-Admin-Key'] = CORTEX_ADMIN_KEY;

  const res = await fetch(`${CORTEX_URL}/api/admin/tools/tekla_get_inventory/test`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ input: {} })
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(`MFCCortex tekla_get_inventory failed: ${data.error}`);
  }

  // Response structure: result.GetInventory.InventoryRecord[]
  const items = data.result?.GetInventory?.InventoryRecord || [];
  inventoryCache = items;
  inventoryCachedAt = Date.now();
  console.log(`[Tekla] Inventory cached via MFCCortex: ${items.length} items`);
  return items;
}

function normalize(val) {
  return String(val || '').trim().toLowerCase();
}

/**
 * Extract text value from Tekla fields which may be objects like { "#text": value, "@_UOM": "in" }
 */
function teklaVal(field) {
  if (field == null) return '';
  if (typeof field === 'object' && field['#text'] != null) return field['#text'];
  return field;
}

/**
 * Convert feet-inches string (e.g., "30' 0\"", "25' 6\"") to inches number.
 * Also handles plain numbers and inch strings.
 */
function toInches(val) {
  if (val == null) return null;
  const s = String(val).trim();
  // Already a number
  const num = parseFloat(s);
  if (!isNaN(num) && !s.includes("'")) return num;
  // Feet-inches format: 30' 0", 25' 6", etc.
  const match = s.match(/(\d+)'\s*(\d+(?:\.\d+)?)?/);
  if (match) {
    const feet = parseInt(match[1]) || 0;
    const inches = parseFloat(match[2]) || 0;
    return feet * 12 + inches;
  }
  return num || null;
}

/**
 * Convert Tekla weight from kg to lbs.
 */
function kgToLbs(kg) {
  return kg * 2.20462;
}

function makeCompositeKey(shape, dimension, grade, lengthInches) {
  return `${normalize(shape)}|${normalize(dimension)}|${normalize(grade)}|${lengthInches || ''}`;
}

/**
 * Returns a Map of compositeKey → weight (lbs) from Tekla inventory.
 * Key: "shape|dimension|grade|lengthInInches".
 * Returns empty map if MFCCortex/Tekla is unreachable.
 */
async function getInventoryWeightMap() {
  try {
    const items = await getInventory();
    const weightMap = new Map();

    for (const item of items) {
      const shape = normalize(item.Shape || '');
      const dimension = normalize(String(teklaVal(item.Dimensions) || ''));
      const grade = normalize(item.Grade || '');
      const lengthRaw = teklaVal(item.Length);
      const lengthInches = parseFloat(lengthRaw) || null;
      const weightKg = parseFloat(teklaVal(item.Weight)) || null;

      if (weightKg && (shape || dimension)) {
        const weightLbs = kgToLbs(weightKg);
        const key = makeCompositeKey(shape, dimension, grade, lengthInches ? Math.round(lengthInches) : '');
        if (!weightMap.has(key)) {
          weightMap.set(key, Math.round(weightLbs));
        }
      }
    }

    return weightMap;
  } catch (err) {
    console.warn('[Tekla] Could not fetch inventory for weight map:', err.message);
    return new Map();
  }
}

/**
 * Enrich an array of PullList items with TeklaWeight by matching on composite key.
 * Handles PullList length format (feet-inches) → inches conversion for matching.
 * Mutates items in place.
 */
async function enrichItemsWithTeklaWeight(items) {
  if (!items || items.length === 0) return;

  const weightMap = await getInventoryWeightMap();
  if (weightMap.size === 0) return;

  for (const item of items) {
    const shape = normalize(item.Shape || '');
    const dimension = normalize(item.Dimension || '');
    const grade = normalize(item.Grade || '');
    const lengthInches = toInches(item.Length);
    const key = makeCompositeKey(shape, dimension, grade, lengthInches ? Math.round(lengthInches) : '');
    const teklaWeight = weightMap.get(key);
    if (teklaWeight != null) {
      item.TeklaWeight = teklaWeight;
    }
  }
}

module.exports = {
  getInventory,
  getInventoryWeightMap,
  enrichItemsWithTeklaWeight,
  makeCompositeKey
};
