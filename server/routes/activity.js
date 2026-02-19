const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { getActivity } = require('../controllers/activityController');

// GET /api/subouts/:id/activity
router.get('/:id/activity', asyncHandler(getActivity));

module.exports = router;
