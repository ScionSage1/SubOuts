const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get all communication logs (optionally filtered by vendor)
router.get('/', async (req, res, next) => {
  try {
    const { vendorId, limit = 50 } = req.query;

    let sqlQuery = `
      SELECT TOP (@limit) *
      FROM FabTracker.vwCommunicationLog
    `;

    const params = { limit: parseInt(limit) };

    if (vendorId) {
      sqlQuery += ` WHERE VendorID = @vendorId`;
      params.vendorId = parseInt(vendorId);
    }

    sqlQuery += ` ORDER BY ContactDate DESC`;

    const result = await query(sqlQuery, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
});

// Get pending follow-ups
router.get('/follow-ups', async (req, res, next) => {
  try {
    const sqlQuery = `
      SELECT *
      FROM FabTracker.vwCommunicationLog
      WHERE FollowUpRequired = 1 AND FollowUpCompleted = 0
      ORDER BY FollowUpDate ASC, ContactDate DESC
    `;

    const result = await query(sqlQuery);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
});

// Get single communication log entry
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const sqlQuery = `
      SELECT * FROM FabTracker.vwCommunicationLog WHERE LogID = @id
    `;

    const result = await query(sqlQuery, { id: parseInt(id) });

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Log entry not found' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
});

// Create new communication log entry
router.post('/', async (req, res, next) => {
  try {
    const {
      vendorId,
      contactDate,
      contactType,
      contactPerson,
      mfcEmployee,
      summary,
      details,
      followUpRequired,
      followUpDate,
      followUpType,
      followUpNotes,
      createdBy,
      source = 'Manual'
    } = req.body;

    if (!vendorId || !summary) {
      return res.status(400).json({ success: false, error: 'VendorID and Summary are required' });
    }

    const sqlQuery = `
      INSERT INTO FabTracker.SubFabricatorCommunicationLog (
        VendorID, ContactDate, ContactType, ContactPerson, MFCEmployee,
        Summary, Details, FollowUpRequired, FollowUpDate, FollowUpType,
        FollowUpNotes, CreatedBy, Source
      )
      OUTPUT INSERTED.LogID
      VALUES (
        @vendorId, @contactDate, @contactType, @contactPerson, @mfcEmployee,
        @summary, @details, @followUpRequired, @followUpDate, @followUpType,
        @followUpNotes, @createdBy, @source
      )
    `;

    const result = await query(sqlQuery, {
      vendorId: parseInt(vendorId),
      contactDate: contactDate || new Date(),
      contactType: contactType || 'Phone',
      contactPerson: contactPerson || null,
      mfcEmployee: mfcEmployee || null,
      summary,
      details: details || null,
      followUpRequired: followUpRequired ? 1 : 0,
      followUpDate: followUpDate || null,
      followUpType: followUpType || null,
      followUpNotes: followUpNotes || null,
      createdBy: createdBy || null,
      source
    });

    const newId = result.recordset[0].LogID;

    // Also update the vendor's LastContactDate
    await query(`
      UPDATE FabTracker.SubOutVendors
      SET LastContactDate = @contactDate
      WHERE VendorID = @vendorId
    `, {
      vendorId: parseInt(vendorId),
      contactDate: contactDate || new Date()
    });

    // Fetch created entry
    const getResult = await query(`SELECT * FROM FabTracker.vwCommunicationLog WHERE LogID = @id`, { id: newId });

    res.status(201).json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
});

// Update communication log entry
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      contactDate,
      contactType,
      contactPerson,
      mfcEmployee,
      summary,
      details,
      followUpRequired,
      followUpDate,
      followUpType,
      followUpNotes,
      followUpCompleted
    } = req.body;

    // Build dynamic update - only update fields that are provided
    const sqlQuery = `
      UPDATE FabTracker.SubFabricatorCommunicationLog
      SET
        ContactDate = COALESCE(@contactDate, ContactDate),
        ContactType = COALESCE(@contactType, ContactType),
        ContactPerson = @contactPerson,
        MFCEmployee = @mfcEmployee,
        Summary = COALESCE(@summary, Summary),
        Details = @details,
        FollowUpRequired = @followUpRequired,
        FollowUpDate = @followUpDate,
        FollowUpType = @followUpType,
        FollowUpNotes = @followUpNotes,
        FollowUpCompleted = @followUpCompleted
      WHERE LogID = @id
    `;

    await query(sqlQuery, {
      id: parseInt(id),
      contactDate: contactDate || null,
      contactType: contactType || null,
      contactPerson: contactPerson || null,
      mfcEmployee: mfcEmployee || null,
      summary: summary || null,
      details: details || null,
      followUpRequired: followUpRequired ? 1 : 0,
      followUpDate: followUpDate || null,
      followUpType: followUpType || null,
      followUpNotes: followUpNotes || null,
      followUpCompleted: followUpCompleted ? 1 : 0
    });

    const getResult = await query(`SELECT * FROM FabTracker.vwCommunicationLog WHERE LogID = @id`, { id: parseInt(id) });

    if (getResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Log entry not found' });
    }

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
});

// Mark follow-up as completed
router.patch('/:id/complete-followup', async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(`
      UPDATE FabTracker.SubFabricatorCommunicationLog
      SET FollowUpCompleted = 1
      WHERE LogID = @id
    `, { id: parseInt(id) });

    const getResult = await query(`SELECT * FROM FabTracker.vwCommunicationLog WHERE LogID = @id`, { id: parseInt(id) });

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
});

// Delete communication log entry
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM FabTracker.SubFabricatorCommunicationLog WHERE LogID = @id
    `, { id: parseInt(id) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Log entry not found' });
    }

    res.json({ success: true, message: 'Log entry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
