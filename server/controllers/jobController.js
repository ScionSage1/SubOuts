const { query } = require('../config/database');

// Get active jobs from SSData
async function getAllJobs(req, res, next) {
  try {
    const sqlQuery = `
      SELECT DISTINCT
        JobCode,
        eJobDescription AS JobDescription,
        eProjectManager AS ProjectManager
      FROM ScheduleShare.SSData
      WHERE JobCode IS NOT NULL
      ORDER BY JobCode DESC
    `;

    const result = await query(sqlQuery);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get single job details
async function getJobByCode(req, res, next) {
  try {
    const { jobCode } = req.params;

    const sqlQuery = `
      SELECT
        JobCode,
        eJobDescription AS JobDescription,
        eProjectManager AS ProjectManager
      FROM ScheduleShare.SSData
      WHERE JobCode = @jobCode
    `;

    const result = await query(sqlQuery, { jobCode: parseInt(jobCode) });

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Get all sub outs for a job
async function getJobSubOuts(req, res, next) {
  try {
    const { jobCode } = req.params;

    const sqlQuery = `
      SELECT * FROM FabTracker.vwSubOutsList
      WHERE JobCode = @jobCode
      ORDER BY Lot
    `;

    const result = await query(sqlQuery, { jobCode: parseInt(jobCode) });
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllJobs,
  getJobByCode,
  getJobSubOuts
};
