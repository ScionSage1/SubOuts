const { query } = require('../config/database');

// Get PullStatus lookup values from ConfigItems
async function getPullStatuses(req, res, next) {
  try {
    const sqlQuery = `
      SELECT ID, ConfigValue, ConfigDesc
      FROM FabTracker.ConfigItems
      WHERE ConfigName = 'LongPullStatus'
      ORDER BY ID
    `;

    const result = await query(sqlQuery);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPullStatuses
};
