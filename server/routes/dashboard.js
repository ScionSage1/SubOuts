const express = require('express');
const router = express.Router();
const {
  getStats,
  getActionItems,
  getByVendor,
  getRecent
} = require('../controllers/dashboardController');

// GET /api/dashboard/stats - Get overall statistics
router.get('/stats', getStats);

// GET /api/dashboard/action-items - Get items needing attention
router.get('/action-items', getActionItems);

// GET /api/dashboard/by-vendor - Get summary by vendor
router.get('/by-vendor', getByVendor);

// GET /api/dashboard/recent - Get recent activity
router.get('/recent', getRecent);

module.exports = router;
