const express = require('express');
const router = express.Router();
const {
  getItems,
  addItem,
  updateItem,
  deleteItem,
  bulkAddItems
} = require('../controllers/subOutItemController');

// GET /api/subouts/:subOutId/items - Get all items for a sub out
router.get('/:subOutId/items', getItems);

// POST /api/subouts/:subOutId/items - Add item to sub out
router.post('/:subOutId/items', addItem);

// POST /api/subouts/:subOutId/items/bulk - Bulk add items
router.post('/:subOutId/items/bulk', bulkAddItems);

// PUT /api/subouts/:subOutId/items/:itemId - Update item
router.put('/:subOutId/items/:itemId', updateItem);

// DELETE /api/subouts/:subOutId/items/:itemId - Delete item
router.delete('/:subOutId/items/:itemId', deleteItem);

module.exports = router;
