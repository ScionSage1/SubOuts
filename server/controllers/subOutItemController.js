const { query, sql } = require('../config/database');

// Get all items for a sub out
async function getItems(req, res, next) {
  try {
    const { subOutId } = req.params;

    const sqlQuery = `
      SELECT * FROM FabTracker.SubOutItems
      WHERE SubOutID = @subOutId
      ORDER BY SourceTable, MainMark, PieceMark
    `;

    const result = await query(sqlQuery, { subOutId: parseInt(subOutId) });
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

// Add single item to sub out
async function addItem(req, res, next) {
  try {
    const { subOutId } = req.params;
    const {
      sourceTable, sourceId,
      mainMark, pieceMark, shape, dimension, grade, length,
      quantity, weight, heatNumber, certNumber, barcode, notes
    } = req.body;

    if (!sourceTable || !sourceId) {
      return res.status(400).json({ success: false, error: 'SourceTable and SourceID are required' });
    }

    const sqlQuery = `
      INSERT INTO FabTracker.SubOutItems (
        SubOutID, SourceTable, SourceID,
        MainMark, PieceMark, Shape, Dimension, Grade, Length,
        Quantity, Weight, HeatNumber, CertNumber, Barcode, Notes
      )
      OUTPUT INSERTED.SubOutItemID
      VALUES (
        @subOutId, @sourceTable, @sourceId,
        @mainMark, @pieceMark, @shape, @dimension, @grade, @length,
        @quantity, @weight, @heatNumber, @certNumber, @barcode, @notes
      )
    `;

    const result = await query(sqlQuery, {
      subOutId: parseInt(subOutId),
      sourceTable,
      sourceId: parseInt(sourceId),
      mainMark: mainMark || null,
      pieceMark: pieceMark || null,
      shape: shape || null,
      dimension: dimension || null,
      grade: grade || null,
      length: length || null,
      quantity: quantity || null,
      weight: weight || null,
      heatNumber: heatNumber || null,
      certNumber: certNumber || null,
      barcode: barcode || null,
      notes: notes || null
    });

    const newId = result.recordset[0].SubOutItemID;

    // Fetch created item
    const getQuery = `SELECT * FROM FabTracker.SubOutItems WHERE SubOutItemID = @id`;
    const getResult = await query(getQuery, { id: newId });

    res.status(201).json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    if (err.message.includes('UQ_SubOutItems_Source')) {
      return res.status(400).json({ success: false, error: 'This item is already assigned to this SubOut' });
    }
    next(err);
  }
}

// Update item
async function updateItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const {
      quantitySent, quantityReceived, status, notes
    } = req.body;

    const sqlQuery = `
      UPDATE FabTracker.SubOutItems
      SET
        QuantitySent = @quantitySent,
        QuantityReceived = @quantityReceived,
        Status = @status,
        Notes = @notes
      WHERE SubOutItemID = @itemId
    `;

    await query(sqlQuery, {
      itemId: parseInt(itemId),
      quantitySent: quantitySent || 0,
      quantityReceived: quantityReceived || 0,
      status: status || 'Pending',
      notes: notes || null
    });

    // Fetch updated item
    const getQuery = `SELECT * FROM FabTracker.SubOutItems WHERE SubOutItemID = @id`;
    const getResult = await query(getQuery, { id: parseInt(itemId) });

    if (getResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, data: getResult.recordset[0] });
  } catch (err) {
    next(err);
  }
}

// Delete item
async function deleteItem(req, res, next) {
  try {
    const { itemId } = req.params;

    const sqlQuery = `DELETE FROM FabTracker.SubOutItems WHERE SubOutItemID = @itemId`;
    const result = await query(sqlQuery, { itemId: parseInt(itemId) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item removed successfully' });
  } catch (err) {
    next(err);
  }
}

// Bulk add items
async function bulkAddItems(req, res, next) {
  try {
    const { subOutId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }

    const insertedIds = [];
    const errors = [];

    for (const item of items) {
      try {
        const sqlQuery = `
          INSERT INTO FabTracker.SubOutItems (
            SubOutID, SourceTable, SourceID,
            MainMark, PieceMark, Shape, Dimension, Grade, Length,
            Quantity, Weight, HeatNumber, CertNumber, Barcode, Notes
          )
          OUTPUT INSERTED.SubOutItemID
          VALUES (
            @subOutId, @sourceTable, @sourceId,
            @mainMark, @pieceMark, @shape, @dimension, @grade, @length,
            @quantity, @weight, @heatNumber, @certNumber, @barcode, @notes
          )
        `;

        const result = await query(sqlQuery, {
          subOutId: parseInt(subOutId),
          sourceTable: item.sourceTable,
          sourceId: parseInt(item.sourceId),
          mainMark: item.mainMark || null,
          pieceMark: item.pieceMark || null,
          shape: item.shape || null,
          dimension: item.dimension || null,
          grade: item.grade || null,
          length: item.length || null,
          quantity: item.quantity || null,
          weight: item.weight || null,
          heatNumber: item.heatNumber || null,
          certNumber: item.certNumber || null,
          barcode: item.barcode || null,
          notes: item.notes || null
        });

        insertedIds.push(result.recordset[0].SubOutItemID);
      } catch (err) {
        errors.push({
          item,
          error: err.message.includes('UQ_SubOutItems_Source')
            ? 'Item already assigned'
            : err.message
        });
      }
    }

    // Fetch all inserted items
    const getQuery = `
      SELECT * FROM FabTracker.SubOutItems
      WHERE SubOutID = @subOutId
      ORDER BY SourceTable, MainMark, PieceMark
    `;
    const getResult = await query(getQuery, { subOutId: parseInt(subOutId) });

    res.status(201).json({
      success: true,
      data: getResult.recordset,
      inserted: insertedIds.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getItems,
  addItem,
  updateItem,
  deleteItem,
  bulkAddItems
};
