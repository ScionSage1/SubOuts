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
 * Auto-toggle between In-Process and Ready based on loaded percentage.
 * - 100% loaded + In-Process → Ready
 * - <100% loaded + Ready → In-Process
 */
async function autoStatusFromLoadPercent(subOutId, user) {
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
    if (TotalItems === 0) return;

    const statusResult = await query('SELECT Status FROM FabTracker.SubOuts WHERE SubOutID = @id', { id: parseInt(subOutId) });
    const currentStatus = statusResult.recordset[0]?.Status;

    if (LoadedItems >= TotalItems && currentStatus === 'In-Process') {
      await query("UPDATE FabTracker.SubOuts SET Status = 'Ready', UpdatedAt = GETDATE() WHERE SubOutID = @id", { id: parseInt(subOutId) });
      await logActivity(subOutId, 'StatusChange', 'Status auto-changed from In-Process to Ready (100% loaded)', { from: 'In-Process', to: 'Ready', auto: true }, user);
    } else if (LoadedItems < TotalItems && currentStatus === 'Ready') {
      const pct = ((LoadedItems / TotalItems) * 100).toFixed(1);
      await query("UPDATE FabTracker.SubOuts SET Status = 'In-Process', UpdatedAt = GETDATE() WHERE SubOutID = @id", { id: parseInt(subOutId) });
      await logActivity(subOutId, 'StatusChange', `Status auto-changed from Ready to In-Process (${pct}% loaded)`, { from: 'Ready', to: 'In-Process', auto: true, pctLoaded: pct }, user);
    }
  } catch (err) {
    console.error('Failed to auto-status:', err.message);
  }
}

module.exports = { logActivity, autoStatusFromLoadPercent };
