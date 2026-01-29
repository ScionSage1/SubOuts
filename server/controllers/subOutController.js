const { query, sql } = require('../config/database');

// Get all sub outs with optional filters
async function getAllSubOuts(req, res, next) {
  try {
    const { jobCode, vendorId, status } = req.query;

    let sqlQuery = `SELECT * FROM FabTracker.vwSubOutsList WHERE 1=1`;
    const params = {};

    if (jobCode) {
      sqlQuery += ` AND JobCode = @jobCode`;
      params.jobCode = parseInt(jobCode);
    }
    if (vendorId) {
      sqlQuery += ` AND VendorID = @vendorId`;
      params.vendorId = parseInt(vendorId);
    }
    if (status) {
      sqlQuery += ` AND Status = @status`;
      params.status = status;
    }

    sqlQuery += ` ORDER BY JobCode DESC, Lot`;

    const result = await query(sqlQuery, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get sub outs grouped by job for dashboard
async function getGroupedSubOuts(req, res, next) {
  try {
    const sqlQuery = `
      SELECT DISTINCT JobCode, JobDescription, ProjectManager
      FROM FabTracker.vwSubOutsList
      ORDER BY JobCode DESC
    `;

    const jobsResult = await query(sqlQuery);
    const jobs = jobsResult.recordset;

    // Get sub outs for each job
    const groupedData = await Promise.all(
      jobs.map(async (job) => {
        const subOutsQuery = `
          SELECT * FROM FabTracker.vwSubOutsList
          WHERE JobCode = @jobCode
          ORDER BY Lot
        `;
        const subOutsResult = await query(subOutsQuery, { jobCode: job.JobCode });
        return {
          ...job,
          subOuts: subOutsResult.recordset
        };
      })
    );

    res.json({ success: true, data: groupedData });
  } catch (err) {
    next(err);
  }
}

// Get single sub out by ID
async function getSubOutById(req, res, next) {
  try {
    const { id } = req.params;

    const sqlQuery = `SELECT * FROM FabTracker.vwSubOutsList WHERE SubOutID = @id`;
    const result = await query(sqlQuery, { id: parseInt(id) });

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'SubOut not found' });
    }

    // Get items for this sub out
    const itemsQuery = `
      SELECT * FROM FabTracker.SubOutItems
      WHERE SubOutID = @id
      ORDER BY SourceTable, MainMark, PieceMark
    `;
    const itemsResult = await query(itemsQuery, { id: parseInt(id) });

    res.json({
      success: true,
      data: {
        ...result.recordset[0],
        items: itemsResult.recordset
      }
    });
  } catch (err) {
    next(err);
  }
}

// Create new sub out
async function createSubOut(req, res, next) {
  try {
    const {
      jobCode, lot, description, vendorId,
      dateToLeaveMFC, loadsToShipFromMFC,
      dateToShipFromSub, loadsToShipFromSub,
      zone, weight, majorPieces, missingSteel,
      status, poNumber, estimatedCost, notes
    } = req.body;

    if (!jobCode || !lot) {
      return res.status(400).json({ success: false, error: 'JobCode and Lot are required' });
    }

    const sqlQuery = `
      INSERT INTO FabTracker.SubOuts (
        JobCode, Lot, Description, VendorID,
        DateToLeaveMFC, LoadsToShipFromMFC,
        DateToShipFromSub, LoadsToShipFromSub,
        Zone, Weight, MajorPieces, MissingSteel,
        Status, PONumber, EstimatedCost, Notes, CreatedAt
      )
      OUTPUT INSERTED.SubOutID
      VALUES (
        @jobCode, @lot, @description, @vendorId,
        @dateToLeaveMFC, @loadsToShipFromMFC,
        @dateToShipFromSub, @loadsToShipFromSub,
        @zone, @weight, @majorPieces, @missingSteel,
        @status, @poNumber, @estimatedCost, @notes, GETDATE()
      )
    `;

    const result = await query(sqlQuery, {
      jobCode: parseInt(jobCode),
      lot,
      description: description || null,
      vendorId: vendorId ? parseInt(vendorId) : null,
      dateToLeaveMFC: dateToLeaveMFC || null,
      loadsToShipFromMFC: loadsToShipFromMFC || 1,
      dateToShipFromSub: dateToShipFromSub || null,
      loadsToShipFromSub: loadsToShipFromSub || 1,
      zone: zone || null,
      weight: weight || null,
      majorPieces: majorPieces || null,
      missingSteel: missingSteel || null,
      status: status || 'Pending',
      poNumber: poNumber || null,
      estimatedCost: estimatedCost || null,
      notes: notes || null
    });

    const newId = result.recordset[0].SubOutID;

    // Fetch the created record
    const getQuery = `SELECT * FROM FabTracker.vwSubOutsList WHERE SubOutID = @id`;
    const getResult = await query(getQuery, { id: newId });

    res.status(201).json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    if (err.message.includes('UQ_SubOuts_JobLot')) {
      return res.status(400).json({ success: false, error: 'A SubOut with this Job and Lot already exists' });
    }
    next(err);
  }
}

// Update sub out
async function updateSubOut(req, res, next) {
  try {
    const { id } = req.params;
    const {
      description, vendorId,
      dateToLeaveMFC, loadsToShipFromMFC, loadsShippedFromMFC,
      dateToShipFromSub, loadsToShipFromSub, loadsShippedFromSub,
      zone, weight, majorPieces, missingSteel,
      status, poNumber, estimatedCost, actualCost, notes
    } = req.body;

    const sqlQuery = `
      UPDATE FabTracker.SubOuts
      SET
        Description = @description,
        VendorID = @vendorId,
        DateToLeaveMFC = @dateToLeaveMFC,
        LoadsToShipFromMFC = @loadsToShipFromMFC,
        LoadsShippedFromMFC = @loadsShippedFromMFC,
        DateToShipFromSub = @dateToShipFromSub,
        LoadsToShipFromSub = @loadsToShipFromSub,
        LoadsShippedFromSub = @loadsShippedFromSub,
        Zone = @zone,
        Weight = @weight,
        MajorPieces = @majorPieces,
        MissingSteel = @missingSteel,
        Status = @status,
        PONumber = @poNumber,
        EstimatedCost = @estimatedCost,
        ActualCost = @actualCost,
        Notes = @notes,
        UpdatedAt = GETDATE()
      WHERE SubOutID = @id
    `;

    await query(sqlQuery, {
      id: parseInt(id),
      description: description || null,
      vendorId: vendorId ? parseInt(vendorId) : null,
      dateToLeaveMFC: dateToLeaveMFC || null,
      loadsToShipFromMFC: loadsToShipFromMFC || 1,
      loadsShippedFromMFC: loadsShippedFromMFC || 0,
      dateToShipFromSub: dateToShipFromSub || null,
      loadsToShipFromSub: loadsToShipFromSub || 1,
      loadsShippedFromSub: loadsShippedFromSub || 0,
      zone: zone || null,
      weight: weight || null,
      majorPieces: majorPieces || null,
      missingSteel: missingSteel || null,
      status: status || 'Pending',
      poNumber: poNumber || null,
      estimatedCost: estimatedCost || null,
      actualCost: actualCost || null,
      notes: notes || null
    });

    // Fetch updated record
    const getQuery = `SELECT * FROM FabTracker.vwSubOutsList WHERE SubOutID = @id`;
    const getResult = await query(getQuery, { id: parseInt(id) });

    if (getResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'SubOut not found' });
    }

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Delete sub out
async function deleteSubOut(req, res, next) {
  try {
    const { id } = req.params;

    const sqlQuery = `DELETE FROM FabTracker.SubOuts WHERE SubOutID = @id`;
    const result = await query(sqlQuery, { id: parseInt(id) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'SubOut not found' });
    }

    res.json({ success: true, message: 'SubOut deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// Update status only
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const sqlQuery = `
      UPDATE FabTracker.SubOuts
      SET Status = @status, UpdatedAt = GETDATE()
      WHERE SubOutID = @id
    `;

    await query(sqlQuery, { id: parseInt(id), status });

    const getQuery = `SELECT * FROM FabTracker.vwSubOutsList WHERE SubOutID = @id`;
    const getResult = await query(getQuery, { id: parseInt(id) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Increment loads shipped from MFC
async function incrementLoadsOut(req, res, next) {
  try {
    const { id } = req.params;

    const sqlQuery = `
      UPDATE FabTracker.SubOuts
      SET LoadsShippedFromMFC = LoadsShippedFromMFC + 1,
          UpdatedAt = GETDATE()
      WHERE SubOutID = @id
    `;

    await query(sqlQuery, { id: parseInt(id) });

    const getQuery = `SELECT * FROM FabTracker.vwSubOutsList WHERE SubOutID = @id`;
    const getResult = await query(getQuery, { id: parseInt(id) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Increment loads shipped from Sub
async function incrementLoadsIn(req, res, next) {
  try {
    const { id } = req.params;

    const sqlQuery = `
      UPDATE FabTracker.SubOuts
      SET LoadsShippedFromSub = LoadsShippedFromSub + 1,
          UpdatedAt = GETDATE()
      WHERE SubOutID = @id
    `;

    await query(sqlQuery, { id: parseInt(id) });

    const getQuery = `SELECT * FROM FabTracker.vwSubOutsList WHERE SubOutID = @id`;
    const getResult = await query(getQuery, { id: parseInt(id) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllSubOuts,
  getGroupedSubOuts,
  getSubOutById,
  createSubOut,
  updateSubOut,
  deleteSubOut,
  updateStatus,
  incrementLoadsOut,
  incrementLoadsIn
};
