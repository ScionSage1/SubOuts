const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobByCode,
  getJobSubOuts
} = require('../controllers/jobController');

// GET /api/jobs - Get all jobs
router.get('/', getAllJobs);

// GET /api/jobs/:jobCode - Get single job
router.get('/:jobCode', getJobByCode);

// GET /api/jobs/:jobCode/subouts - Get all sub outs for a job
router.get('/:jobCode/subouts', getJobSubOuts);

module.exports = router;
