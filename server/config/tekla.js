/**
 * Tekla inventory helper — calls MFCCortex's tekla_get_inventory tool
 * via its admin API to get inventory weights.
 */

const CORTEX_URL = process.env.CORTEX_URL || 'http://localhost:7777';

// 5-minute in-memory cache
let inventoryCache = null;
let inventoryCachedAt = null;
const CACHE_TTL = 5 * 60 * 1000;

async function getInventory() {
  if (inventoryCache && inventoryCachedAt && Date.now() - inventoryCachedAt < CACHE_TTL) {
    return inventoryCache;
  }

  const res = await fetch(`${CORTEX_URL}/api/admin/tools/tekla_get_inventory/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: {} })
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(`MFCCortex tekla_get_inventory failed: ${data.error}`);
  }

  const items = data.result?.InventoryItem || [];
  inventoryCache = items;
  inventoryCachedAt = Date.now();
  console.log(`[Tekla] Inventory cached via MFCCortex: ${items.length} items`);
  return items;
}

function normalize(val) {
  return String(val || '').trim().toLowerCase();
}

function makeCompositeKey(shape, dimension, grade, length) {
  return `${normalize(shape)}|${normalize(dimension)}|${normalize(grade)}|${normalize(length)}`;
}

/**
 * Returns a Map of compositeKey → weight from Tekla inventory.
 * Key: "shape|dimension|grade|length" (lowercased/trimmed).
 * Returns empty map if MFCCortex/Tekla is unreachable.
 */
async function getInventoryWeightMap() {
  try {
    const items = await getInventory();
    const weightMap = new Map();

    for (const item of items) {
      const shape = item.Shape || item.Material || '';
      const dimension = item.Dimension || item.Size || '';
      const grade = item.Grade || '';
      const length = item.Length || '';
      const weight = parseFloat(item.Weight) || null;

      if (weight && (shape || dimension)) {
        const key = makeCompositeKey(shape, dimension, grade, length);
        if (!weightMap.has(key)) {
          weightMap.set(key, weight);
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
 * Enrich an array of items with TeklaWeight by matching on composite key.
 * Mutates items in place.
 */
async function enrichItemsWithTeklaWeight(items) {
  if (!items || items.length === 0) return;

  const weightMap = await getInventoryWeightMap();
  if (weightMap.size === 0) return;

  for (const item of items) {
    const key = makeCompositeKey(item.Shape, item.Dimension, item.Grade, item.Length);
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
