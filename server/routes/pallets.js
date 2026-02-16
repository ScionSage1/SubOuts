const express = require('express');
const router = express.Router();
const {
  getPallets,
  getPalletById,
  createPallet,
  updatePallet,
  deletePallet,
  updatePalletStatus,
  assignItemsToPallet,
  removeItemFromPallet,
  assignPalletToLoad
} = require('../controllers/palletController');

// GET /api/subouts/:subOutId/pallets - Get all pallets for a sub out
router.get('/:subOutId/pallets', getPallets);

// GET /api/subouts/:subOutId/pallets/:palletId - Get single pallet with items
router.get('/:subOutId/pallets/:palletId', getPalletById);

// POST /api/subouts/:subOutId/pallets - Create a pallet
router.post('/:subOutId/pallets', createPallet);

// PUT /api/subouts/:subOutId/pallets/:palletId - Update pallet
router.put('/:subOutId/pallets/:palletId', updatePallet);

// DELETE /api/subouts/:subOutId/pallets/:palletId - Delete pallet
router.delete('/:subOutId/pallets/:palletId', deletePallet);

// PATCH /api/subouts/:subOutId/pallets/:palletId/status - Update pallet status
router.patch('/:subOutId/pallets/:palletId/status', updatePalletStatus);

// POST /api/subouts/:subOutId/pallets/:palletId/items - Assign items to pallet
router.post('/:subOutId/pallets/:palletId/items', assignItemsToPallet);

// DELETE /api/subouts/:subOutId/pallets/:palletId/items/:itemId - Remove item from pallet
router.delete('/:subOutId/pallets/:palletId/items/:itemId', removeItemFromPallet);

// PATCH /api/subouts/:subOutId/pallets/:palletId/assign-load - Assign pallet to a load
router.patch('/:subOutId/pallets/:palletId/assign-load', assignPalletToLoad);

module.exports = router;
