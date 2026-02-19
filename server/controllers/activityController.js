const { query } = require('../config/database');

// Get activity log for a sub out
async function getActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const sqlQuery = `
      SELECT TOP (@limit) *
      FROM FabTracker.SubOutActivityLog
      WHERE SubOutID = @id
      ORDER BY CreatedAt DESC
    `;

    const result = await query(sqlQuery, {
      id: parseInt(id),
      limit: parseInt(limit)
    });

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

module.exports = { getActivity };
