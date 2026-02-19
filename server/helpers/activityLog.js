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

module.exports = { logActivity };
