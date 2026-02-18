const express = require('express');
const router = express.Router();
const { getInventoryItems, getMatchingInventory } = require('../controllers/teklaController');

router.get('/inventory', getInventoryItems);
router.get('/inventory/match', getMatchingInventory);

module.exports = router;
