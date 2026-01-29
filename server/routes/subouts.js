const express = require('express');
const router = express.Router();
const {
  getAllSubOuts,
  getGroupedSubOuts,
  getSubOutById,
  createSubOut,
  updateSubOut,
  deleteSubOut,
  updateStatus,
  incrementLoadsOut,
  incrementLoadsIn
} = require('../controllers/subOutController');

// GET /api/subouts - Get all sub outs
router.get('/', getAllSubOuts);

// GET /api/subouts/grouped - Get sub outs grouped by job
router.get('/grouped', getGroupedSubOuts);

// GET /api/subouts/:id - Get single sub out
router.get('/:id', getSubOutById);

// POST /api/subouts - Create sub out
router.post('/', createSubOut);

// PUT /api/subouts/:id - Update sub out
router.put('/:id', updateSubOut);

// DELETE /api/subouts/:id - Delete sub out
router.delete('/:id', deleteSubOut);

// PATCH /api/subouts/:id/status - Update status only
router.patch('/:id/status', updateStatus);

// PATCH /api/subouts/:id/loads-out - Increment loads shipped from MFC
router.patch('/:id/loads-out', incrementLoadsOut);

// PATCH /api/subouts/:id/loads-in - Increment loads shipped from Sub
router.patch('/:id/loads-in', incrementLoadsIn);

module.exports = router;
