const db = require('../config/db');

class SyncRepository {
  async findOperationById(operationId) {
    const [rows] = await db.query(
      'SELECT * FROM offline_sync_operations WHERE operation_id = ?',
      [operationId]
    );
    return rows[0] || null;
  }

  async recordSyncOperation(opData) {
    const { operationId, userId, entityType, entityId, action, clientTimestamp, status, errorMessage } = opData;
    await db.query(
      `INSERT INTO offline_sync_operations (operation_id, user_id, entity_type, entity_id, action, client_timestamp, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operationId,
        userId,
        entityType,
        entityId,
        action,
        new Date(clientTimestamp || Date.now()),
        status || 'success',
        errorMessage || null
      ]
    );
  }

  async getDeltaChanges(sinceTimestamp) {
    const sinceDate = new Date(sinceTimestamp || 0);

    const [updatedCourses] = await db.query(
      'SELECT id, title, version, updated_at FROM courses WHERE updated_at > ?',
      [sinceDate]
    );

    const [updatedLessons] = await db.query(
      'SELECT id, topic_id, title, content_type, textContent, content_url, version, updated_at FROM lessons WHERE updated_at > ?',
      [sinceDate]
    );

    return {
      serverTimestamp: new Date().toISOString(),
      delta: {
        courses: updatedCourses,
        lessons: updatedLessons
      }
    };
  }
}

module.exports = new SyncRepository();
