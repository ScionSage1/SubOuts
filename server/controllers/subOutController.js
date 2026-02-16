const { query, sql } = require('../config/database');

// Get all sub outs with optional filters
async function getAllSubOuts(req, res, next) {
  try {
    const { jobCode, vendorId, status, includeArchived, archivedOnly } = req.query;

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

    // Archive filtering: exclude Complete by default
    if (archivedOnly === 'true') {
      sqlQuery += ` AND Status = 'Complete'`;
    } else if (includeArchived !== 'true' && !status) {
      sqlQuery += ` AND Status <> 'Complete'`;
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
    const { includeArchived } = req.query;
    const archiveFilter = includeArchived === 'true' ? '' : ` AND Status <> 'Complete'`;

    const sqlQuery = `
      SELECT DISTINCT JobCode, JobDescription, ProjectManager
      FROM FabTracker.vwSubOutsList
      WHERE 1=1${archiveFilter}
      ORDER BY JobCode DESC
    `;

    const jobsResult = await query(sqlQuery);
    const jobs = jobsResult.recordset;

    // Get sub outs for each job
    const groupedData = await Promise.all(
      jobs.map(async (job) => {
        const subOutsQuery = `
          SELECT * FROM FabTracker.vwSubOutsList
          WHERE JobCode = @jobCode${archiveFilter}
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

    // Get items, pallets, and loads for this sub out
    const itemsQuery = `
      SELECT * FROM FabTracker.SubOutItems
      WHERE SubOutID = @id
      ORDER BY SourceTable, MainMark, PieceMark
    `;
    const palletsQuery = `
      SELECT * FROM FabTracker.vwSubOutPalletsDetail
      WHERE SubOutID = @id
      ORDER BY PalletNumber
    `;
    const loadsQuery = `
      SELECT * FROM FabTracker.vwSubOutLoadsDetail
      WHERE SubOutID = @id
      ORDER BY Direction, LoadNumber
    `;

    const [itemsResult, palletsResult, loadsResult] = await Promise.all([
      query(itemsQuery, { id: parseInt(id) }),
      query(palletsQuery, { id: parseInt(id) }),
      query(loadsQuery, { id: parseInt(id) })
    ]);

    res.json({
      success: true,
      data: {
        ...result.recordset[0],
        items: itemsResult.recordset,
        pallets: palletsResult.recordset,
        loads: loadsResult.recordset
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

// Increment loads shipped from MFC (Quick Ship - also creates a load record)
async function incrementLoadsOut(req, res, next) {
  try {
    const { id } = req.params;

    // Create a Delivered outbound load record
    const countQuery = `
      SELECT COUNT(*) AS cnt FROM FabTracker.SubOutLoads
      WHERE SubOutID = @id AND Direction = 'Outbound'
    `;
    const countResult = await query(countQuery, { id: parseInt(id) });
    const nextNum = (countResult.recordset[0].cnt || 0) + 1;
    const loadNumber = `OUT-${String(nextNum).padStart(3, '0')}`;

    await query(`
      INSERT INTO FabTracker.SubOutLoads (SubOutID, LoadNumber, Direction, Status, ActualDate, Notes)
      VALUES (@id, @loadNumber, 'Outbound', 'Delivered', GETDATE(), 'Quick ship')
    `, { id: parseInt(id), loadNumber });

    // Sync legacy counters from load records
    await query(`
      UPDATE FabTracker.SubOuts
      SET
        LoadsToShipFromMFC = (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = @id AND Direction = 'Outbound'),
        LoadsShippedFromMFC = (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = @id AND Direction = 'Outbound' AND Status = 'Delivered'),
        UpdatedAt = GETDATE()
      WHERE SubOutID = @id
    `, { id: parseInt(id) });

    const getQuery = `SELECT * FROM FabTracker.vwSubOutsList WHERE SubOutID = @id`;
    const getResult = await query(getQuery, { id: parseInt(id) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Increment loads shipped from Sub (Quick Ship - also creates a load record)
async function incrementLoadsIn(req, res, next) {
  try {
    const { id } = req.params;

    // Create a Delivered inbound load record
    const countQuery = `
      SELECT COUNT(*) AS cnt FROM FabTracker.SubOutLoads
      WHERE SubOutID = @id AND Direction = 'Inbound'
    `;
    const countResult = await query(countQuery, { id: parseInt(id) });
    const nextNum = (countResult.recordset[0].cnt || 0) + 1;
    const loadNumber = `IN-${String(nextNum).padStart(3, '0')}`;

    await query(`
      INSERT INTO FabTracker.SubOutLoads (SubOutID, LoadNumber, Direction, Status, ActualDate, Notes)
      VALUES (@id, @loadNumber, 'Inbound', 'Delivered', GETDATE(), 'Quick ship')
    `, { id: parseInt(id), loadNumber });

    // Sync legacy counters from load records
    await query(`
      UPDATE FabTracker.SubOuts
      SET
        LoadsToShipFromSub = (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = @id AND Direction = 'Inbound'),
        LoadsShippedFromSub = (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = @id AND Direction = 'Inbound' AND Status = 'Delivered'),
        UpdatedAt = GETDATE()
      WHERE SubOutID = @id
    `, { id: parseInt(id) });

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
