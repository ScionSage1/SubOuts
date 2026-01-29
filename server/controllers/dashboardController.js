const { query } = require('../config/database');

// Get overall statistics
async function getStats(req, res, next) {
  try {
    const sqlQuery = `
      SELECT
        COUNT(*) AS TotalActive,
        SUM(CASE WHEN Status IN ('Pending', 'Ready') THEN 1 ELSE 0 END) AS PendingShipment,
        SUM(CASE WHEN Status IN ('Sent', 'InProcess') THEN 1 ELSE 0 END) AS InProgress,
        SUM(CASE WHEN
          (DateToLeaveMFC < GETDATE() AND LoadsShippedFromMFC < LoadsToShipFromMFC)
          OR (DateToShipFromSub < GETDATE() AND LoadsShippedFromSub < LoadsToShipFromSub)
          OR (MissingSteel IS NOT NULL AND MissingSteel <> '')
        THEN 1 ELSE 0 END) AS ActionRequired,
        SUM(CASE WHEN Status = 'Complete' AND MONTH(UpdatedAt) = MONTH(GETDATE()) AND YEAR(UpdatedAt) = YEAR(GETDATE()) THEN 1 ELSE 0 END) AS CompleteThisMonth
      FROM FabTracker.SubOuts
      WHERE Status <> 'Complete' OR (Status = 'Complete' AND MONTH(UpdatedAt) = MONTH(GETDATE()))
    `;

    const result = await query(sqlQuery);
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Get action items needing attention
async function getActionItems(req, res, next) {
  try {
    const sqlQuery = `
      SELECT
        s.*,
        CASE
          WHEN DateToLeaveMFC < GETDATE() AND LoadsShippedFromMFC < LoadsToShipFromMFC THEN 'Overdue Send'
          WHEN DateToShipFromSub < GETDATE() AND LoadsShippedFromSub < LoadsToShipFromSub THEN 'Overdue Receive'
          WHEN MissingSteel IS NOT NULL AND MissingSteel <> '' THEN 'Missing Steel'
          ELSE 'Other'
        END AS ActionType
      FROM FabTracker.vwSubOutsList s
      WHERE
        (DateToLeaveMFC < GETDATE() AND LoadsShippedFromMFC < LoadsToShipFromMFC)
        OR (DateToShipFromSub < GETDATE() AND LoadsShippedFromSub < LoadsToShipFromSub)
        OR (MissingSteel IS NOT NULL AND MissingSteel <> '')
      ORDER BY
        CASE
          WHEN DateToLeaveMFC < GETDATE() AND LoadsShippedFromMFC < LoadsToShipFromMFC THEN 1
          WHEN DateToShipFromSub < GETDATE() AND LoadsShippedFromSub < LoadsToShipFromSub THEN 2
          ELSE 3
        END,
        DateToLeaveMFC
    `;

    const result = await query(sqlQuery);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get summary by vendor
async function getByVendor(req, res, next) {
  try {
    const sqlQuery = `
      SELECT
        v.VendorID,
        v.VendorName,
        COUNT(s.SubOutID) AS TotalSubOuts,
        SUM(CASE WHEN s.Status IN ('Pending', 'Ready') THEN 1 ELSE 0 END) AS Pending,
        SUM(CASE WHEN s.Status IN ('Sent', 'InProcess', 'Shipped') THEN 1 ELSE 0 END) AS InProgress,
        SUM(CASE WHEN s.Status IN ('Received', 'QCd', 'Complete') THEN 1 ELSE 0 END) AS Complete,
        SUM(ISNULL(s.Weight, 0)) AS TotalWeight,
        SUM(ISNULL(s.MajorPieces, 0)) AS TotalPieces
      FROM FabTracker.SubOutVendors v
      LEFT JOIN FabTracker.SubOuts s ON v.VendorID = s.VendorID
      WHERE v.IsActive = 1
      GROUP BY v.VendorID, v.VendorName
      ORDER BY COUNT(s.SubOutID) DESC
    `;

    const result = await query(sqlQuery);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get recent activity
async function getRecent(req, res, next) {
  try {
    const { limit = 10 } = req.query;

    const sqlQuery = `
      SELECT TOP (@limit) *
      FROM FabTracker.vwSubOutsList
      ORDER BY
        CASE WHEN UpdatedAt IS NOT NULL THEN UpdatedAt ELSE CreatedAt END DESC
    `;

    const result = await query(sqlQuery, { limit: parseInt(limit) });
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  getActionItems,
  getByVendor,
  getRecent
};
