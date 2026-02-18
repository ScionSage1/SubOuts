const express = require('express');
const router = express.Router();
const { getInventoryItems } = require('../controllers/teklaController');

router.get('/inventory', getInventoryItems);

module.exports = router;
