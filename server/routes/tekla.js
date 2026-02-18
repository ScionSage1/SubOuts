const express = require('express');
const router = express.Router();
const { getInventoryItems, getMatchingInventory, getInventoryFilters } = require('../controllers/teklaController');

router.get('/inventory', getInventoryItems);
router.get('/inventory/filters', getInventoryFilters);
router.get('/inventory/match', getMatchingInventory);

module.exports = router;
