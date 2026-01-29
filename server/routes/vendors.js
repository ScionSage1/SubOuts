const express = require('express');
const router = express.Router();
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');

// GET /api/vendors - Get all vendors
router.get('/', getAllVendors);

// GET /api/vendors/:id - Get single vendor
router.get('/:id', getVendorById);

// POST /api/vendors - Create vendor
router.post('/', createVendor);

// PUT /api/vendors/:id - Update vendor
router.put('/:id', updateVendor);

// DELETE /api/vendors/:id - Soft delete vendor
router.delete('/:id', deleteVendor);

module.exports = router;
