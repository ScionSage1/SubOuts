const express = require('express');
const router = express.Router();
const {
  getLoads,
  getLoadById,
  createLoad,
  updateLoad,
  deleteLoad,
  updateLoadStatus,
  assignItemsToLoad,
  removeItemFromLoad,
  assignPalletsToLoad,
  removePalletFromLoad
} = require('../controllers/loadController');

// GET /api/subouts/:subOutId/loads - Get all loads for a sub out
router.get('/:subOutId/loads', getLoads);

// GET /api/subouts/:subOutId/loads/:loadId - Get single load with items and pallets
router.get('/:subOutId/loads/:loadId', getLoadById);

// POST /api/subouts/:subOutId/loads - Create a load
router.post('/:subOutId/loads', createLoad);

// PUT /api/subouts/:subOutId/loads/:loadId - Update load
router.put('/:subOutId/loads/:loadId', updateLoad);

// DELETE /api/subouts/:subOutId/loads/:loadId - Delete load
router.delete('/:subOutId/loads/:loadId', deleteLoad);

// PATCH /api/subouts/:subOutId/loads/:loadId/status - Update load status
router.patch('/:subOutId/loads/:loadId/status', updateLoadStatus);

// POST /api/subouts/:subOutId/loads/:loadId/items - Assign items to load
router.post('/:subOutId/loads/:loadId/items', assignItemsToLoad);

// DELETE /api/subouts/:subOutId/loads/:loadId/items/:itemId - Remove item from load
router.delete('/:subOutId/loads/:loadId/items/:itemId', removeItemFromLoad);

// POST /api/subouts/:subOutId/loads/:loadId/pallets - Assign pallets to load
router.post('/:subOutId/loads/:loadId/pallets', assignPalletsToLoad);

// DELETE /api/subouts/:subOutId/loads/:loadId/pallets/:palletId - Remove pallet from load
router.delete('/:subOutId/loads/:loadId/pallets/:palletId', removePalletFromLoad);

module.exports = router;
