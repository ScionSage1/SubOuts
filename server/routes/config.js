const express = require('express');
const router = express.Router();
const { getPullStatuses } = require('../controllers/configController');

// GET /api/config/pull-statuses
router.get('/pull-statuses', getPullStatuses);

module.exports = router;
