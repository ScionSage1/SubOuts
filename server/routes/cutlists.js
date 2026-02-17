const express = require('express');
const router = express.Router();
const {
  getPackages,
  getLongShapes,
  getParts,
  getPullList,
  getAvailableItems,
  updatePullListItem
} = require('../controllers/cutlistController');

// GET /api/cutlists/packages/:jobCode - Get available packages for a job
router.get('/packages/:jobCode', getPackages);

// GET /api/cutlists/longshapes/:jobCode?package=XXX - Get LongShapes for a job + package
router.get('/longshapes/:jobCode', getLongShapes);

// GET /api/cutlists/parts/:jobCode - Get Parts for a job
router.get('/parts/:jobCode', getParts);

// GET /api/cutlists/pulllist/:jobCode - Get PullList for a job
router.get('/pulllist/:jobCode', getPullList);

// GET /api/cutlists/available/:jobCode - Get all available items not yet assigned
router.get('/available/:jobCode', getAvailableItems);

// PUT /api/cutlists/pulllist/:pullListId - Update PullList source data (PullStatus, RMNumber)
router.put('/pulllist/:pullListId', updatePullListItem);

module.exports = router;
