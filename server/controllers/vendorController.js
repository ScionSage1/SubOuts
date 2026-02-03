const { query } = require('../config/database');

// Get all active vendors (sub fabricators)
async function getAllVendors(req, res, next) {
  try {
    const { includeInactive } = req.query;

    let sqlQuery = `SELECT * FROM FabTracker.SubOutVendors`;
    if (!includeInactive) {
      sqlQuery += ` WHERE IsActive = 1`;
    }
    sqlQuery += ` ORDER BY VendorName`;

    const result = await query(sqlQuery);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Get single vendor
async function getVendorById(req, res, next) {
  try {
    const { id } = req.params;

    const sqlQuery = `SELECT * FROM FabTracker.SubOutVendors WHERE VendorID = @id`;
    const result = await query(sqlQuery, { id: parseInt(id) });

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Sub Fabricator not found' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Create vendor
async function createVendor(req, res, next) {
  try {
    const {
      vendorName,
      city,
      state,
      size,
      contactName,
      aiscBoard,
      mfcOutreach,
      email,
      phone,
      lastContactDate,
      address,
      notes
    } = req.body;

    if (!vendorName) {
      return res.status(400).json({ success: false, error: 'Fabricator Name is required' });
    }

    const sqlQuery = `
      INSERT INTO FabTracker.SubOutVendors (
        VendorName, City, State, Size, ContactName, AISCBoard, MFCOutreach,
        Email, Phone, LastContactDate, Address, Notes
      )
      OUTPUT INSERTED.VendorID
      VALUES (
        @vendorName, @city, @state, @size, @contactName, @aiscBoard, @mfcOutreach,
        @email, @phone, @lastContactDate, @address, @notes
      )
    `;

    const result = await query(sqlQuery, {
      vendorName,
      city: city || null,
      state: state || null,
      size: size || null,
      contactName: contactName || null,
      aiscBoard: aiscBoard ? 1 : 0,
      mfcOutreach: mfcOutreach || null,
      email: email || null,
      phone: phone || null,
      lastContactDate: lastContactDate || null,
      address: address || null,
      notes: notes || null
    });

    const newId = result.recordset[0].VendorID;

    // Fetch created vendor
    const getQuery = `SELECT * FROM FabTracker.SubOutVendors WHERE VendorID = @id`;
    const getResult = await query(getQuery, { id: newId });

    res.status(201).json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Update vendor
async function updateVendor(req, res, next) {
  try {
    const { id } = req.params;
    const {
      vendorName,
      city,
      state,
      size,
      contactName,
      aiscBoard,
      mfcOutreach,
      email,
      phone,
      lastContactDate,
      address,
      notes,
      isActive
    } = req.body;

    const sqlQuery = `
      UPDATE FabTracker.SubOutVendors
      SET
        VendorName = @vendorName,
        City = @city,
        State = @state,
        Size = @size,
        ContactName = @contactName,
        AISCBoard = @aiscBoard,
        MFCOutreach = @mfcOutreach,
        Email = @email,
        Phone = @phone,
        LastContactDate = @lastContactDate,
        Address = @address,
        Notes = @notes,
        IsActive = @isActive
      WHERE VendorID = @id
    `;

    await query(sqlQuery, {
      id: parseInt(id),
      vendorName,
      city: city || null,
      state: state || null,
      size: size || null,
      contactName: contactName || null,
      aiscBoard: aiscBoard ? 1 : 0,
      mfcOutreach: mfcOutreach || null,
      email: email || null,
      phone: phone || null,
      lastContactDate: lastContactDate || null,
      address: address || null,
      notes: notes || null,
      isActive: isActive !== undefined ? isActive : true
    });

    // Fetch updated vendor
    const getQuery = `SELECT * FROM FabTracker.SubOutVendors WHERE VendorID = @id`;
    const getResult = await query(getQuery, { id: parseInt(id) });

    if (getResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Sub Fabricator not found' });
    }

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Soft delete vendor
async function deleteVendor(req, res, next) {
  try {
    const { id } = req.params;

    const sqlQuery = `
      UPDATE FabTracker.SubOutVendors
      SET IsActive = 0
      WHERE VendorID = @id
    `;

    const result = await query(sqlQuery, { id: parseInt(id) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Sub Fabricator not found' });
    }

    res.json({ success: true, message: 'Sub Fabricator deactivated successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
};
