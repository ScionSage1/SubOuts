const { query } = require('../config/database');

/**
 * Log an activity event for a SubOut.
 * Non-blocking: errors are logged but don't affect the caller.
 */
async function logActivity(subOutId, eventType, description, eventData = null, createdBy = null) {
  try {
    await query(`
      INSERT INTO FabTracker.SubOutActivityLog (SubOutID, EventType, Description, EventData, CreatedBy)
      VALUES (@subOutId, @eventType, @description, @eventData, @createdBy)
    `, {
      subOutId: parseInt(subOutId),
      eventType,
      description,
      eventData: eventData ? JSON.stringify(eventData) : null,
      createdBy: createdBy || null
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

/**
 * Auto-advance SubOut to Ready when 100% items are loaded and status is In-Process.
 */
async function autoReadyIfFullyLoaded(subOutId, user) {
  try {
    const countResult = await query(`
      SELECT
        COUNT(*) AS TotalItems,
        (SELECT COUNT(*) FROM FabTracker.SubOutItems i WHERE i.SubOutID = @id AND (
          i.LoadID IS NOT NULL
          OR (i.Barcode IS NOT NULL AND EXISTS (
            SELECT 1 FROM FabTracker.SubOutItems i2
            WHERE i2.SubOutID = @id AND i2.Barcode = i.Barcode AND i2.LoadID IS NOT NULL AND i2.SubOutItemID <> i.SubOutItemID
          ))
        )) AS LoadedItems
      FROM FabTracker.SubOutItems
      WHERE SubOutID = @id
    `, { id: parseInt(subOutId) });
    const { TotalItems, LoadedItems } = countResult.recordset[0];
    if (TotalItems > 0 && LoadedItems >= TotalItems) {
      const statusResult = await query('SELECT Status FROM FabTracker.SubOuts WHERE SubOutID = @id', { id: parseInt(subOutId) });
      const currentStatus = statusResult.recordset[0]?.Status;
      if (currentStatus === 'In-Process') {
        await query("UPDATE FabTracker.SubOuts SET Status = 'Ready', UpdatedAt = GETDATE() WHERE SubOutID = @id", { id: parseInt(subOutId) });
        await logActivity(subOutId, 'StatusChange', 'Status auto-changed from In-Process to Ready (100% loaded)', { from: 'In-Process', to: 'Ready', auto: true }, user);
      }
    }
  } catch (err) {
    console.error('Failed to auto-ready:', err.message);
  }
}

module.exports = { logActivity, autoReadyIfFullyLoaded };
