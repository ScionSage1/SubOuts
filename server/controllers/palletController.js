const { query, sql } = require('../config/database');
const { logActivity } = require('../helpers/activityLog');

// Get all pallets for a sub out
async function getPallets(req, res, next) {
  try {
    const { subOutId } = req.params;

    const sqlQuery = `
      SELECT * FROM FabTracker.vwSubOutPalletsDetail
      WHERE SubOutID = @subOutId
      ORDER BY PalletNumber
    `;

    const result = await query(sqlQuery, { subOutId: parseInt(subOutId) });
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get single pallet with its items
async function getPalletById(req, res, next) {
  try {
    const { palletId } = req.params;

    const palletQuery = `
      SELECT * FROM FabTracker.vwSubOutPalletsDetail
      WHERE PalletID = @palletId
    `;
    const itemsQuery = `
      SELECT * FROM FabTracker.SubOutItems
      WHERE PalletID = @palletId
      ORDER BY MainMark, PieceMark
    `;

    const [palletResult, itemsResult] = await Promise.all([
      query(palletQuery, { palletId: parseInt(palletId) }),
      query(itemsQuery, { palletId: parseInt(palletId) })
    ]);

    if (palletResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Pallet not found' });
    }

    res.json({
      success: true,
      data: {
        ...palletResult.recordset[0],
        items: itemsResult.recordset
      }
    });
  } catch (err) {
    next(err);
  }
}

// Create a pallet (auto-generates PalletNumber)
async function createPallet(req, res, next) {
  try {
    const { subOutId } = req.params;
    const { palletNumber, weight, length, width, height, photoURL, notes } = req.body;

    // Auto-generate pallet number if not provided
    let finalPalletNumber = palletNumber;
    if (!finalPalletNumber) {
      const countQuery = `
        SELECT COUNT(*) AS cnt FROM FabTracker.SubOutPallets
        WHERE SubOutID = @subOutId
      `;
      const countResult = await query(countQuery, { subOutId: parseInt(subOutId) });
      const nextNum = (countResult.recordset[0].cnt || 0) + 1;
      finalPalletNumber = `P-${String(nextNum).padStart(3, '0')}`;
    }

    const sqlQuery = `
      INSERT INTO FabTracker.SubOutPallets (
        SubOutID, PalletNumber, Weight, Length, Width, Height, PhotoURL, Notes
      )
      OUTPUT INSERTED.PalletID
      VALUES (
        @subOutId, @palletNumber, @weight, @length, @width, @height, @photoURL, @notes
      )
    `;

    const result = await query(sqlQuery, {
      subOutId: parseInt(subOutId),
      palletNumber: finalPalletNumber,
      weight: weight || null,
      length: length || null,
      width: width || null,
      height: height || null,
      photoURL: photoURL || null,
      notes: notes || null
    });

    const newId = result.recordset[0].PalletID;

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'PalletCreated', `Pallet ${finalPalletNumber} created`, { palletNumber: finalPalletNumber }, user);

    // Fetch created pallet from view
    const getQuery = `SELECT * FROM FabTracker.vwSubOutPalletsDetail WHERE PalletID = @id`;
    const getResult = await query(getQuery, { id: newId });

    res.status(201).json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    if (err.message.includes('UQ_SubOutPallets_Number')) {
      return res.status(400).json({ success: false, error: 'A pallet with this number already exists for this SubOut' });
    }
    next(err);
  }
}

// Update pallet details
async function updatePallet(req, res, next) {
  try {
    const { subOutId, palletId } = req.params;
    const { palletNumber, weight, length, width, height, photoURL, notes } = req.body;

    // Get current pallet number for logging
    const currentPallet = await query('SELECT PalletNumber FROM FabTracker.SubOutPallets WHERE PalletID = @palletId', { palletId: parseInt(palletId) });
    const palletNum = currentPallet.recordset[0]?.PalletNumber;

    const sqlQuery = `
      UPDATE FabTracker.SubOutPallets
      SET
        PalletNumber = COALESCE(@palletNumber, PalletNumber),
        Weight = @weight,
        Length = @length,
        Width = @width,
        Height = @height,
        PhotoURL = @photoURL,
        Notes = @notes,
        UpdatedAt = GETDATE()
      WHERE PalletID = @palletId
    `;

    const result = await query(sqlQuery, {
      palletId: parseInt(palletId),
      palletNumber: palletNumber || null,
      weight: weight || null,
      length: length || null,
      width: width || null,
      height: height || null,
      photoURL: photoURL || null,
      notes: notes || null
    });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Pallet not found' });
    }

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'PalletEdited', `Pallet ${palletNum} details updated`, { palletNumber: palletNum }, user);

    // Fetch updated pallet
    const getQuery = `SELECT * FROM FabTracker.vwSubOutPalletsDetail WHERE PalletID = @id`;
    const getResult = await query(getQuery, { id: parseInt(palletId) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    if (err.message.includes('UQ_SubOutPallets_Number')) {
      return res.status(400).json({ success: false, error: 'A pallet with this number already exists for this SubOut' });
    }
    next(err);
  }
}

// Delete pallet (unassigns items first)
async function deletePallet(req, res, next) {
  try {
    const { subOutId, palletId } = req.params;

    // Get pallet info for logging before delete
    const currentPallet = await query('SELECT PalletNumber FROM FabTracker.SubOutPallets WHERE PalletID = @palletId', { palletId: parseInt(palletId) });
    const palletNum = currentPallet.recordset[0]?.PalletNumber;

    // Unassign items from this pallet
    await query(
      `UPDATE FabTracker.SubOutItems SET PalletID = NULL WHERE PalletID = @palletId`,
      { palletId: parseInt(palletId) }
    );

    // Delete the pallet
    const result = await query(
      `DELETE FROM FabTracker.SubOutPallets WHERE PalletID = @palletId`,
      { palletId: parseInt(palletId) }
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Pallet not found' });
    }

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'PalletDeleted', `Pallet ${palletNum} deleted`, { palletNumber: palletNum }, user);

    res.json({ success: true, message: 'Pallet deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// Update pallet status
async function updatePalletStatus(req, res, next) {
  try {
    const { subOutId, palletId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    // Get current pallet info for logging
    const currentPallet = await query('SELECT PalletNumber, Status FROM FabTracker.SubOutPallets WHERE PalletID = @palletId', { palletId: parseInt(palletId) });
    const palletNum = currentPallet.recordset[0]?.PalletNumber;
    const oldStatus = currentPallet.recordset[0]?.Status;

    const sqlQuery = `
      UPDATE FabTracker.SubOutPallets
      SET Status = @status, UpdatedAt = GETDATE()
      WHERE PalletID = @palletId
    `;

    const result = await query(sqlQuery, {
      palletId: parseInt(palletId),
      status
    });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Pallet not found' });
    }

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'PalletStatusChange', `Pallet ${palletNum} status changed from ${oldStatus} to ${status}`, { palletNumber: palletNum, from: oldStatus, to: status }, user);

    const getQuery = `SELECT * FROM FabTracker.vwSubOutPalletsDetail WHERE PalletID = @id`;
    const getResult = await query(getQuery, { id: parseInt(palletId) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Assign items to a pallet
async function assignItemsToPallet(req, res, next) {
  try {
    const { subOutId, palletId } = req.params;
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

    // Assign items to pallet
    const updateQuery = `
      UPDATE FabTracker.SubOutItems
      SET PalletID = @palletId
      WHERE SubOutItemID IN (${itemIds.map((_, i) => `@id${i}`).join(',')})
    `;
    const updateParams = { palletId: parseInt(palletId) };
    itemIds.forEach((id, i) => { updateParams[`id${i}`] = parseInt(id); });

    await query(updateQuery, updateParams);

    // Update pallet weight from assigned items
    await query(`
      UPDATE FabTracker.SubOutPallets
      SET Weight = (SELECT SUM(Weight) FROM FabTracker.SubOutItems WHERE PalletID = @palletId),
          UpdatedAt = GETDATE()
      WHERE PalletID = @palletId
    `, { palletId: parseInt(palletId) });

    // Get pallet number for logging
    const palletInfo = await query('SELECT PalletNumber FROM FabTracker.SubOutPallets WHERE PalletID = @palletId', { palletId: parseInt(palletId) });
    const palletNum = palletInfo.recordset[0]?.PalletNumber;

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'ItemsAssignedToPallet', `${itemIds.length} item(s) assigned to pallet ${palletNum}`, { palletNumber: palletNum, itemCount: itemIds.length }, user);

    // Return updated pallet
    const getQuery = `SELECT * FROM FabTracker.vwSubOutPalletsDetail WHERE PalletID = @id`;
    const getResult = await query(getQuery, { id: parseInt(palletId) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Remove item from pallet
async function removeItemFromPallet(req, res, next) {
  try {
    const { subOutId, palletId, itemId } = req.params;

    const result = await query(
      `UPDATE FabTracker.SubOutItems SET PalletID = NULL WHERE SubOutItemID = @itemId AND PalletID = @palletId`,
      { itemId: parseInt(itemId), palletId: parseInt(palletId) }
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Item not found on this pallet' });
    }

    // Update pallet weight
    await query(`
      UPDATE FabTracker.SubOutPallets
      SET Weight = (SELECT COALESCE(SUM(Weight), 0) FROM FabTracker.SubOutItems WHERE PalletID = @palletId),
          UpdatedAt = GETDATE()
      WHERE PalletID = @palletId
    `, { palletId: parseInt(palletId) });

    const palletInfo = await query('SELECT PalletNumber FROM FabTracker.SubOutPallets WHERE PalletID = @palletId', { palletId: parseInt(palletId) });
    const palletNum = palletInfo.recordset[0]?.PalletNumber;

    const user = req.headers['x-user'] || null;
    await logActivity(subOutId, 'ItemRemovedFromPallet', `Item removed from pallet ${palletNum}`, { palletNumber: palletNum }, user);

    res.json({ success: true, message: 'Item removed from pallet' });
  } catch (err) {
    next(err);
  }
}

// Assign pallet to a load
async function assignPalletToLoad(req, res, next) {
  try {
    const { subOutId, palletId } = req.params;
    const { loadId } = req.body;

    // Get pallet number for logging
    const palletInfo = await query('SELECT PalletNumber FROM FabTracker.SubOutPallets WHERE PalletID = @palletId', { palletId: parseInt(palletId) });
    const palletNum = palletInfo.recordset[0]?.PalletNumber;

    const sqlQuery = `
      UPDATE FabTracker.SubOutPallets
      SET LoadID = @loadId, UpdatedAt = GETDATE()
      WHERE PalletID = @palletId
    `;

    const result = await query(sqlQuery, {
      palletId: parseInt(palletId),
      loadId: loadId ? parseInt(loadId) : null
    });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Pallet not found' });
    }

    // Also assign all items on this pallet to the same load
    if (loadId) {
      await query(
        `UPDATE FabTracker.SubOutItems SET LoadID = @loadId WHERE PalletID = @palletId`,
        { loadId: parseInt(loadId), palletId: parseInt(palletId) }
      );

      const loadInfo = await query('SELECT LoadNumber FROM FabTracker.SubOutLoads WHERE LoadID = @loadId', { loadId: parseInt(loadId) });
      const loadNum = loadInfo.recordset[0]?.LoadNumber;

      const user = req.headers['x-user'] || null;
      await logActivity(subOutId, 'PalletAssignedToLoad', `Pallet ${palletNum} assigned to load ${loadNum}`, { palletNumber: palletNum, loadNumber: loadNum }, user);
    } else {
      const user = req.headers['x-user'] || null;
      await logActivity(subOutId, 'PalletUnassignedFromLoad', `Pallet ${palletNum} unassigned from load`, { palletNumber: palletNum }, user);
    }

    const getQuery = `SELECT * FROM FabTracker.vwSubOutPalletsDetail WHERE PalletID = @id`;
    const getResult = await query(getQuery, { id: parseInt(palletId) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPallets,
  getPalletById,
  createPallet,
  updatePallet,
  deletePallet,
  updatePalletStatus,
  assignItemsToPallet,
  removeItemFromPallet,
  assignPalletToLoad
};
