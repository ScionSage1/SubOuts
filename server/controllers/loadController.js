const { query, sql } = require('../config/database');
const { logActivity, autoStatusFromLoadPercent } = require('../helpers/activityLog');

// Helper: Sync legacy load counters on SubOuts from SubOutLoads
async function syncLegacyCounters(subOutId) {
  await query(`
    UPDATE FabTracker.SubOuts
    SET
      LoadsToShipFromMFC = (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = @id AND Direction = 'Outbound'),
      LoadsShippedFromMFC = (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = @id AND Direction = 'Outbound' AND Status = 'Delivered'),
      LoadsToShipFromSub = (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = @id AND Direction = 'Inbound'),
      LoadsShippedFromSub = (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = @id AND Direction = 'Inbound' AND Status = 'Delivered'),
      UpdatedAt = GETDATE()
    WHERE SubOutID = @id
  `, { id: parseInt(subOutId) });
}

// Get all loads for a sub out
async function getLoads(req, res, next) {
  try {
    const { subOutId } = req.params;
    const { direction } = req.query;

    let sqlQuery = `
      SELECT * FROM FabTracker.vwSubOutLoadsDetail
      WHERE SubOutID = @subOutId
    `;
    const params = { subOutId: parseInt(subOutId) };

    if (direction) {
      sqlQuery += ` AND Direction = @direction`;
      params.direction = direction;
    }

    sqlQuery += ` ORDER BY Direction, LoadNumber`;

    const result = await query(sqlQuery, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get single load with its items and pallets
async function getLoadById(req, res, next) {
  try {
    const { loadId } = req.params;

    const loadQuery = `
      SELECT * FROM FabTracker.vwSubOutLoadsDetail
      WHERE LoadID = @loadId
    `;
    const itemsQuery = `
      SELECT * FROM FabTracker.SubOutItems
      WHERE LoadID = @loadId
      ORDER BY MainMark, PieceMark
    `;
    const palletsQuery = `
      SELECT * FROM FabTracker.vwSubOutPalletsDetail
      WHERE LoadID = @loadId
      ORDER BY PalletNumber
    `;

    const [loadResult, itemsResult, palletsResult] = await Promise.all([
      query(loadQuery, { loadId: parseInt(loadId) }),
      query(itemsQuery, { loadId: parseInt(loadId) }),
      query(palletsQuery, { loadId: parseInt(loadId) })
    ]);

    if (loadResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Load not found' });
    }

    res.json({
      success: true,
      data: {
        ...loadResult.recordset[0],
        items: itemsResult.recordset,
        pallets: palletsResult.recordset
      }
    });
  } catch (err) {
    next(err);
  }
}

// Create a load (auto-generates LoadNumber)
async function createLoad(req, res, next) {
  try {
    const { subOutId } = req.params;
    const { direction, scheduledDate, truckCompany, trailerNumber, driverName, bolNumber, weight, pieceCount, status, notes } = req.body;

    if (!direction || !['Outbound', 'Inbound'].includes(direction)) {
      return res.status(400).json({ success: false, error: 'Direction is required and must be Outbound or Inbound' });
    }

    // Auto-generate load number
    const prefix = direction === 'Outbound' ? 'OUT' : 'IN';
    const countQuery = `
      SELECT COUNT(*) AS cnt FROM FabTracker.SubOutLoads
      WHERE SubOutID = @subOutId AND Direction = @direction
    `;
    const countResult = await query(countQuery, { subOutId: parseInt(subOutId), direction });
    const nextNum = (countResult.recordset[0].cnt || 0) + 1;
    const loadNumber = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    const sqlQuery = `
      INSERT INTO FabTracker.SubOutLoads (
        SubOutID, LoadNumber, Direction, ScheduledDate, ActualDate,
        TruckCompany, TrailerNumber, DriverName, BOLNumber,
        Weight, PieceCount, Status, Notes
      )
      OUTPUT INSERTED.LoadID
      VALUES (
        @subOutId, @loadNumber, @direction, @scheduledDate, @actualDate,
        @truckCompany, @trailerNumber, @driverName, @bolNumber,
        @weight, @pieceCount, @status, @notes
      )
    `;

    const result = await query(sqlQuery, {
      subOutId: parseInt(subOutId),
      loadNumber,
      direction,
      scheduledDate: scheduledDate || null,
      actualDate: status === 'Delivered' ? (new Date().toISOString().split('T')[0]) : null,
      truckCompany: truckCompany || null,
      trailerNumber: trailerNumber || null,
      driverName: driverName || null,
      bolNumber: bolNumber || null,
      weight: weight || null,
      pieceCount: pieceCount || null,
      status: status || 'Planned',
      notes: notes || null
    });

    const newId = result.recordset[0].LoadID;

    // Sync legacy counters
    await syncLegacyCounters(subOutId);

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'LoadCreated', `Load ${loadNumber} created (${direction})`, { loadNumber, direction, status: status || 'Planned' }, user);

    // Fetch created load from view
    const getQuery = `SELECT * FROM FabTracker.vwSubOutLoadsDetail WHERE LoadID = @id`;
    const getResult = await query(getQuery, { id: newId });

    res.status(201).json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    if (err.message.includes('UQ_SubOutLoads_Number')) {
      return res.status(400).json({ success: false, error: 'A load with this number already exists for this SubOut' });
    }
    next(err);
  }
}

// Update load details
async function updateLoad(req, res, next) {
  try {
    const { subOutId, loadId } = req.params;
    const { scheduledDate, actualDate, truckCompany, trailerNumber, driverName, bolNumber, weight, pieceCount, notes } = req.body;

    // Get load number for logging
    const currentLoad = await query('SELECT LoadNumber FROM FabTracker.SubOutLoads WHERE LoadID = @loadId', { loadId: parseInt(loadId) });
    const loadNum = currentLoad.recordset[0]?.LoadNumber;

    const sqlQuery = `
      UPDATE FabTracker.SubOutLoads
      SET
        ScheduledDate = @scheduledDate,
        ActualDate = @actualDate,
        TruckCompany = @truckCompany,
        TrailerNumber = @trailerNumber,
        DriverName = @driverName,
        BOLNumber = @bolNumber,
        Weight = @weight,
        PieceCount = @pieceCount,
        Notes = @notes,
        UpdatedAt = GETDATE()
      WHERE LoadID = @loadId
    `;

    const result = await query(sqlQuery, {
      loadId: parseInt(loadId),
      scheduledDate: scheduledDate || null,
      actualDate: actualDate || null,
      truckCompany: truckCompany || null,
      trailerNumber: trailerNumber || null,
      driverName: driverName || null,
      bolNumber: bolNumber || null,
      weight: weight || null,
      pieceCount: pieceCount || null,
      notes: notes || null
    });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Load not found' });
    }

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'LoadEdited', `Load ${loadNum} details updated`, { loadNumber: loadNum }, user);

    const getQuery = `SELECT * FROM FabTracker.vwSubOutLoadsDetail WHERE LoadID = @id`;
    const getResult = await query(getQuery, { id: parseInt(loadId) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Delete load (unassigns items/pallets first)
async function deleteLoad(req, res, next) {
  try {
    const { subOutId, loadId } = req.params;

    // Get load info for logging before delete
    const currentLoad = await query('SELECT LoadNumber, Direction FROM FabTracker.SubOutLoads WHERE LoadID = @loadId', { loadId: parseInt(loadId) });
    const loadNum = currentLoad.recordset[0]?.LoadNumber;
    const direction = currentLoad.recordset[0]?.Direction;

    // Unassign items from this load
    await query(
      `UPDATE FabTracker.SubOutItems SET LoadID = NULL WHERE LoadID = @loadId`,
      { loadId: parseInt(loadId) }
    );

    // Unassign pallets from this load
    await query(
      `UPDATE FabTracker.SubOutPallets SET LoadID = NULL WHERE LoadID = @loadId`,
      { loadId: parseInt(loadId) }
    );

    // Delete the load
    const result = await query(
      `DELETE FROM FabTracker.SubOutLoads WHERE LoadID = @loadId`,
      { loadId: parseInt(loadId) }
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Load not found' });
    }

    // Sync legacy counters
    await syncLegacyCounters(subOutId);

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'LoadDeleted', `Load ${loadNum} deleted (${direction})`, { loadNumber: loadNum, direction }, user);
    await autoStatusFromLoadPercent(subOutId, user);

    res.json({ success: true, message: 'Load deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// Update load status
async function updateLoadStatus(req, res, next) {
  try {
    const { subOutId, loadId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    // Get current load info for logging
    const currentLoad = await query('SELECT LoadNumber, Status FROM FabTracker.SubOutLoads WHERE LoadID = @loadId', { loadId: parseInt(loadId) });
    const oldStatus = currentLoad.recordset[0]?.Status;
    const loadNum = currentLoad.recordset[0]?.LoadNumber;

    // Set ActualDate when delivered
    const sqlQuery = `
      UPDATE FabTracker.SubOutLoads
      SET
        Status = @status,
        ActualDate = CASE WHEN @status = 'Delivered' AND ActualDate IS NULL THEN GETDATE() ELSE ActualDate END,
        UpdatedAt = GETDATE()
      WHERE LoadID = @loadId
    `;

    const result = await query(sqlQuery, {
      loadId: parseInt(loadId),
      status
    });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Load not found' });
    }

    // Sync legacy counters
    await syncLegacyCounters(subOutId);

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'LoadStatusChange', `Load ${loadNum} status changed to ${status}`, { loadNumber: loadNum, from: oldStatus, to: status }, user);

    const getQuery = `SELECT * FROM FabTracker.vwSubOutLoadsDetail WHERE LoadID = @id`;
    const getResult = await query(getQuery, { id: parseInt(loadId) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Assign items to a load
async function assignItemsToLoad(req, res, next) {
  try {
    const { subOutId, loadId } = req.params;
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ success: false, error: 'itemIds array is required' });
    }

    // Verify items belong to this SubOut
    const verifyQuery = `
      SELECT SubOutItemID FROM FabTracker.SubOutItems
      WHERE SubOutID = @subOutId AND SubOutItemID IN (${itemIds.map((_, i) => `@id${i}`).join(',')})
    `;
    const verifyParams = { subOutId: parseInt(subOutId) };
    itemIds.forEach((id, i) => { verifyParams[`id${i}`] = parseInt(id); });

    const verifyResult = await query(verifyQuery, verifyParams);
    if (verifyResult.recordset.length !== itemIds.length) {
      return res.status(400).json({ success: false, error: 'Some items do not belong to this SubOut' });
    }

    // Check for items already on another load
    const conflictQuery = `
      SELECT SubOutItemID, LoadID FROM FabTracker.SubOutItems
      WHERE SubOutItemID IN (${itemIds.map((_, i) => `@id${i}`).join(',')})
        AND LoadID IS NOT NULL AND LoadID != @loadId
    `;
    const conflictParams = { loadId: parseInt(loadId) };
    itemIds.forEach((id, i) => { conflictParams[`id${i}`] = parseInt(id); });

    const conflictResult = await query(conflictQuery, conflictParams);
    if (conflictResult.recordset.length > 0) {
      return res.status(400).json({ success: false, error: `${conflictResult.recordset.length} item(s) already assigned to another load` });
    }

    // Assign items to load
    const updateQuery = `
      UPDATE FabTracker.SubOutItems
      SET LoadID = @loadId
      WHERE SubOutItemID IN (${itemIds.map((_, i) => `@id${i}`).join(',')})
    `;
    const updateParams = { loadId: parseInt(loadId) };
    itemIds.forEach((id, i) => { updateParams[`id${i}`] = parseInt(id); });

    await query(updateQuery, updateParams);

    // Get load number for logging
    const loadInfo = await query('SELECT LoadNumber FROM FabTracker.SubOutLoads WHERE LoadID = @loadId', { loadId: parseInt(loadId) });
    const loadNum = loadInfo.recordset[0]?.LoadNumber;

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'ItemsAssignedToLoad', `${itemIds.length} item(s) assigned to load ${loadNum}`, { loadNumber: loadNum, itemCount: itemIds.length }, user);
    await autoStatusFromLoadPercent(subOutId, user);

    const getQuery = `SELECT * FROM FabTracker.vwSubOutLoadsDetail WHERE LoadID = @id`;
    const getResult = await query(getQuery, { id: parseInt(loadId) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Remove item from load
async function removeItemFromLoad(req, res, next) {
  try {
    const { subOutId, loadId, itemId } = req.params;

    const result = await query(
      `UPDATE FabTracker.SubOutItems SET LoadID = NULL WHERE SubOutItemID = @itemId AND LoadID = @loadId`,
      { itemId: parseInt(itemId), loadId: parseInt(loadId) }
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Item not found on this load' });
    }

    const loadInfo = await query('SELECT LoadNumber FROM FabTracker.SubOutLoads WHERE LoadID = @loadId', { loadId: parseInt(loadId) });
    const loadNum = loadInfo.recordset[0]?.LoadNumber;

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'ItemRemovedFromLoad', `Item removed from load ${loadNum}`, { loadNumber: loadNum }, user);
    await autoStatusFromLoadPercent(subOutId, user);

    res.json({ success: true, message: 'Item removed from load' });
  } catch (err) {
    next(err);
  }
}

// Assign pallets to a load
async function assignPalletsToLoad(req, res, next) {
  try {
    const { subOutId, loadId } = req.params;
    const { palletIds } = req.body;

    if (!palletIds || !Array.isArray(palletIds) || palletIds.length === 0) {
      return res.status(400).json({ success: false, error: 'palletIds array is required' });
    }

    // Assign pallets to load
    const updatePalletsQuery = `
      UPDATE FabTracker.SubOutPallets
      SET LoadID = @loadId, UpdatedAt = GETDATE()
      WHERE SubOutID = @subOutId AND PalletID IN (${palletIds.map((_, i) => `@pid${i}`).join(',')})
    `;
    const palletParams = { loadId: parseInt(loadId), subOutId: parseInt(subOutId) };
    palletIds.forEach((id, i) => { palletParams[`pid${i}`] = parseInt(id); });

    await query(updatePalletsQuery, palletParams);

    // Also assign all items on those pallets to this load
    const updateItemsQuery = `
      UPDATE FabTracker.SubOutItems
      SET LoadID = @loadId
      WHERE PalletID IN (${palletIds.map((_, i) => `@pid${i}`).join(',')})
    `;
    const itemParams = { loadId: parseInt(loadId) };
    palletIds.forEach((id, i) => { itemParams[`pid${i}`] = parseInt(id); });

    await query(updateItemsQuery, itemParams);

    // Get load number for logging
    const loadInfo = await query('SELECT LoadNumber FROM FabTracker.SubOutLoads WHERE LoadID = @loadId', { loadId: parseInt(loadId) });
    const loadNum = loadInfo.recordset[0]?.LoadNumber;

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'PalletsAssignedToLoad', `${palletIds.length} pallet(s) assigned to load ${loadNum}`, { loadNumber: loadNum, palletCount: palletIds.length }, user);
    await autoStatusFromLoadPercent(subOutId, user);

    const getQuery = `SELECT * FROM FabTracker.vwSubOutLoadsDetail WHERE LoadID = @id`;
    const getResult = await query(getQuery, { id: parseInt(loadId) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Remove pallet from load
async function removePalletFromLoad(req, res, next) {
  try {
    const { subOutId, loadId, palletId } = req.params;

    // Get load and pallet info for logging
    const [loadInfo, palletInfo] = await Promise.all([
      query('SELECT LoadNumber FROM FabTracker.SubOutLoads WHERE LoadID = @loadId', { loadId: parseInt(loadId) }),
      query('SELECT PalletNumber FROM FabTracker.SubOutPallets WHERE PalletID = @palletId', { palletId: parseInt(palletId) })
    ]);
    const loadNum = loadInfo.recordset[0]?.LoadNumber;
    const palletNum = palletInfo.recordset[0]?.PalletNumber;

    // Unassign pallet from load
    const result = await query(
      `UPDATE FabTracker.SubOutPallets SET LoadID = NULL, UpdatedAt = GETDATE() WHERE PalletID = @palletId AND LoadID = @loadId`,
      { palletId: parseInt(palletId), loadId: parseInt(loadId) }
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Pallet not found on this load' });
    }

    // Also unassign items on that pallet from the load
    await query(
      `UPDATE FabTracker.SubOutItems SET LoadID = NULL WHERE PalletID = @palletId AND LoadID = @loadId`,
      { palletId: parseInt(palletId), loadId: parseInt(loadId) }
    );

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'PalletRemovedFromLoad', `Pallet ${palletNum} removed from load ${loadNum}`, { loadNumber: loadNum, palletNumber: palletNum }, user);
    await autoStatusFromLoadPercent(subOutId, user);

    res.json({ success: true, message: 'Pallet removed from load' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLoads,
  getLoadById,
  createLoad,
  updateLoad,
  deleteLoad,
  updateLoadStatus,
  assignItemsToLoad,
  removeItemFromLoad,
  assignPalletsToLoad,
  removePalletFromLoad
};
