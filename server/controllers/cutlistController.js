const { query } = require('../config/database');

// Get available packages for a job
async function getPackages(req, res, next) {
  try {
    const { jobCode } = req.params;

    const sqlQuery = `
      SELECT DISTINCT Package
      FROM (
        SELECT Package FROM FabTracker.LongShapeCutlist WHERE JobCode = @jobCode
        UNION
        SELECT Package FROM FabTracker.PartsCutlist WHERE JobCode = @jobCode
      ) AS AllPackages
      WHERE Package IS NOT NULL
      ORDER BY Package
    `;

    const result = await query(sqlQuery, { jobCode: parseInt(jobCode) });
    res.json({ success: true, data: result.recordset.map(r => r.Package) });
  } catch (err) {
    next(err);
  }
}

// Get LongShapes for a job and package
async function getLongShapes(req, res, next) {
  try {
    const { jobCode } = req.params;
    const { package: pkg } = req.query;

    if (!pkg) {
      return res.status(400).json({ success: false, error: 'Package is required' });
    }

    const sqlQuery = `
      SELECT
        ls.ID,
        ls.LongShapeCutlistID,
        lsc.Package,
        ls.MainMark,
        ls.PieceMark,
        ls.Shape,
        ls.myDimension AS Dimension,
        ls.Grade,
        ls.myLength AS Length,
        ls.RawLength,
        ls.Quantity,
        ls.LeftQuantity,
        ls.Weight,
        ls.Barcode,
        ls.HeatNumber,
        ls.CertNumber,
        ls.Status,
        ls.PullStatus,
        'LongShapes' AS SourceTable
      FROM FabTracker.LongShapes ls
      JOIN FabTracker.LongShapeCutlist lsc ON ls.LongShapeCutlistID = lsc.ID
      WHERE lsc.JobCode = @jobCode AND lsc.Package = @package
      ORDER BY ls.MainMark, ls.PieceMark
    `;

    const result = await query(sqlQuery, { jobCode: parseInt(jobCode), package: pkg });
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get Parts for a job and package
async function getParts(req, res, next) {
  try {
    const { jobCode } = req.params;
    const { package: pkg } = req.query;

    if (!pkg) {
      return res.status(400).json({ success: false, error: 'Package is required' });
    }

    const sqlQuery = `
      SELECT
        p.ID,
        p.PartsCutlistID,
        pc.Package,
        p.MainMark,
        p.PieceMark,
        p.Shape,
        p.myDimension AS Dimension,
        p.Grade,
        p.myLength AS Length,
        p.Quantity,
        p.LeftQuantity,
        p.Weight,
        p.HeatNumber,
        p.CertNumber,
        'Parts' AS SourceTable
      FROM FabTracker.Parts p
      JOIN FabTracker.PartsCutlist pc ON p.PartsCutlistID = pc.ID
      WHERE pc.JobCode = @jobCode AND pc.Package = @package
      ORDER BY p.MainMark, p.PieceMark
    `;

    const result = await query(sqlQuery, { jobCode: parseInt(jobCode), package: pkg });
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get PullList items for a job and package
async function getPullList(req, res, next) {
  try {
    const { jobCode } = req.params;
    const { package: pkg } = req.query;

    if (!pkg) {
      return res.status(400).json({ success: false, error: 'Package is required' });
    }

    const sqlQuery = `
      SELECT
        pl.ID,
        pl.LongShapeCutlistID,
        lsc.Package,
        pl.Shape,
        pl.myDimension AS Dimension,
        pl.Grade,
        pl.RawLength AS Length,
        pl.Quantity,
        pl.Weight,
        pl.Barcode,
        pl.HeatNumber,
        pl.PONumber,
        'PullList' AS SourceTable
      FROM FabTracker.PullList pl
      JOIN FabTracker.LongShapeCutlist lsc ON pl.LongShapeCutlistID = lsc.ID
      WHERE lsc.JobCode = @jobCode AND lsc.Package = @package
      ORDER BY pl.Shape, pl.myDimension
    `;

    const result = await query(sqlQuery, { jobCode: parseInt(jobCode), package: pkg });
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get all available items not yet assigned to a sub out (filtered by job + package)
async function getAvailableItems(req, res, next) {
  try {
    const { jobCode } = req.params;
    const { package: pkg } = req.query;

    if (!pkg) {
      return res.status(400).json({ success: false, error: 'Package is required' });
    }

    // Get LongShapes not yet assigned
    const longShapesQuery = `
      SELECT
        ls.ID,
        lsc.Package,
        ls.MainMark,
        ls.PieceMark,
        ls.Shape,
        ls.myDimension AS Dimension,
        ls.Grade,
        ls.myLength AS Length,
        ls.Quantity,
        ls.Weight,
        ls.HeatNumber,
        ls.CertNumber,
        ls.Barcode,
        'LongShapes' AS SourceTable,
        si.SubOutID AS AssignedToSubOutID,
        so.Lot AS AssignedToLot
      FROM FabTracker.LongShapes ls
      JOIN FabTracker.LongShapeCutlist lsc ON ls.LongShapeCutlistID = lsc.ID
      LEFT JOIN FabTracker.SubOutItems si ON ls.ID = si.SourceID AND si.SourceTable = 'LongShapes'
      LEFT JOIN FabTracker.SubOuts so ON si.SubOutID = so.SubOutID
      WHERE lsc.JobCode = @jobCode AND lsc.Package = @package
      ORDER BY ls.MainMark, ls.PieceMark
    `;

    // Get Parts not yet assigned
    const partsQuery = `
      SELECT
        p.ID,
        pc.Package,
        p.MainMark,
        p.PieceMark,
        p.Shape,
        p.myDimension AS Dimension,
        p.Grade,
        p.myLength AS Length,
        p.Quantity,
        p.Weight,
        p.HeatNumber,
        p.CertNumber,
        NULL AS Barcode,
        'Parts' AS SourceTable,
        si.SubOutID AS AssignedToSubOutID,
        so.Lot AS AssignedToLot
      FROM FabTracker.Parts p
      JOIN FabTracker.PartsCutlist pc ON p.PartsCutlistID = pc.ID
      LEFT JOIN FabTracker.SubOutItems si ON p.ID = si.SourceID AND si.SourceTable = 'Parts'
      LEFT JOIN FabTracker.SubOuts so ON si.SubOutID = so.SubOutID
      WHERE pc.JobCode = @jobCode AND pc.Package = @package
      ORDER BY p.MainMark, p.PieceMark
    `;

    // Get PullList not yet assigned
    const pullListQuery = `
      SELECT
        pl.ID,
        lsc.Package,
        NULL AS MainMark,
        NULL AS PieceMark,
        pl.Shape,
        pl.myDimension AS Dimension,
        pl.Grade,
        pl.RawLength AS Length,
        pl.Quantity,
        pl.Weight,
        pl.HeatNumber,
        NULL AS CertNumber,
        pl.Barcode,
        'PullList' AS SourceTable,
        si.SubOutID AS AssignedToSubOutID,
        so.Lot AS AssignedToLot
      FROM FabTracker.PullList pl
      JOIN FabTracker.LongShapeCutlist lsc ON pl.LongShapeCutlistID = lsc.ID
      LEFT JOIN FabTracker.SubOutItems si ON pl.ID = si.SourceID AND si.SourceTable = 'PullList'
      LEFT JOIN FabTracker.SubOuts so ON si.SubOutID = so.SubOutID
      WHERE lsc.JobCode = @jobCode AND lsc.Package = @package
      ORDER BY pl.Shape, pl.myDimension
    `;

    const [longShapesResult, partsResult, pullListResult] = await Promise.all([
      query(longShapesQuery, { jobCode: parseInt(jobCode), package: pkg }),
      query(partsQuery, { jobCode: parseInt(jobCode), package: pkg }),
      query(pullListQuery, { jobCode: parseInt(jobCode), package: pkg })
    ]);

    res.json({
      success: true,
      data: {
        longShapes: longShapesResult.recordset,
        parts: partsResult.recordset,
        pullList: pullListResult.recordset
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPackages,
  getLongShapes,
  getParts,
  getPullList,
  getAvailableItems
};
