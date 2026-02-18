const { getInventory } = require('../config/tekla');

function normalize(val) {
  return String(val || '').trim().toLowerCase();
}

function teklaVal(field) {
  if (field == null) return '';
  if (typeof field === 'object' && field['#text'] != null) return field['#text'];
  return field;
}

function kgToLbs(kg) {
  return kg * 2.20462;
}

function toInches(val) {
  if (val == null) return null;
  const s = String(val).trim();
  const num = parseFloat(s);
  if (!isNaN(num) && !s.includes("'")) return num;
  const match = s.match(/(\d+)'\s*(\d+(?:\.\d+)?)?/);
  if (match) {
    const feet = parseInt(match[1]) || 0;
    const inches = parseFloat(match[2]) || 0;
    return feet * 12 + inches;
  }
  return num || null;
}

function inchesToFeetStr(inches) {
  if (!inches) return '-';
  const feet = Math.floor(inches / 12);
  const rem = Math.round(inches % 12);
  return rem > 0 ? `${feet}' ${rem}"` : `${feet}' 0"`;
}

// GET /api/tekla/inventory — debug endpoint to inspect raw Tekla inventory
async function getInventoryItems(req, res, next) {
  try {
    const items = await getInventory();
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
}

// GET /api/tekla/inventory/match — find inventory matching shape+grade pairs
// Query: shapes = JSON array of { shape, grade } objects
async function getMatchingInventory(req, res, next) {
  try {
    const shapesParam = req.query.shapes;
    if (!shapesParam) {
      return res.status(400).json({ success: false, error: 'shapes query parameter required' });
    }

    let pairs;
    try {
      pairs = JSON.parse(shapesParam);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid JSON in shapes parameter' });
    }

    if (!Array.isArray(pairs) || pairs.length === 0) {
      return res.status(400).json({ success: false, error: 'shapes must be a non-empty array' });
    }

    // Build lookup set of normalized shape+grade combos
    const lookupSet = new Set(pairs.map(p => `${normalize(p.shape)}|${normalize(p.grade)}`));

    const rawItems = await getInventory();
    const grouped = {};

    for (const item of rawItems) {
      const shape = normalize(item.Shape || '');
      const dimension = normalize(String(teklaVal(item.Dimensions) || ''));
      const grade = normalize(item.Grade || '');
      const key = `${shape}|${grade}`;

      // Also try shape+dimension as the shape match (e.g., "PL" shape with "1/2" dimension)
      // and match with just the dimension part of the grade
      if (!lookupSet.has(key) && !lookupSet.has(`${shape} ${dimension}|${grade}`)) continue;

      const lengthRaw = teklaVal(item.Length);
      const lengthInches = parseFloat(lengthRaw) || toInches(lengthRaw);
      const weightKg = parseFloat(teklaVal(item.Weight)) || 0;
      const weightLbs = weightKg > 0 ? Math.round(kgToLbs(weightKg)) : 0;

      if (!lengthInches || lengthInches <= 0) continue;

      const groupKey = `${item.Shape || ''}|${String(teklaVal(item.Dimensions) || '')}|${item.Grade || ''}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          shape: item.Shape || '',
          dimension: String(teklaVal(item.Dimensions) || ''),
          grade: item.Grade || '',
          sticks: []
        };
      }

      // Group by length — aggregate count of identical sticks
      const existing = grouped[groupKey].sticks.find(s => Math.abs(s.lengthInches - lengthInches) < 0.5);
      if (existing) {
        existing.count += 1;
      } else {
        grouped[groupKey].sticks.push({
          lengthInches: Math.round(lengthInches),
          lengthDisplay: inchesToFeetStr(lengthInches),
          weightLbs,
          count: 1
        });
      }
    }

    // Sort sticks by length descending within each group
    for (const group of Object.values(grouped)) {
      group.sticks.sort((a, b) => b.lengthInches - a.lengthInches);
    }

    res.json({ success: true, data: Object.values(grouped) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getInventoryItems, getMatchingInventory };
