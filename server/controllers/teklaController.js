const { getInventory } = require('../config/tekla');

// GET /api/tekla/inventory — debug endpoint to inspect raw Tekla inventory
async function getInventoryItems(req, res, next) {
  try {
    const items = await getInventory();
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
}

module.exports = { getInventoryItems };
