const db = require('../config/db');

class NotificationRepository {
  async createNotification(notifData) {
    const { id, userId, title, message, type } = notifData;
    await db.query(
      `INSERT INTO notifications (id, user_id, title, message, type)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, title, message, type]
    );
  }

  async getUserNotifications(userId) {
    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );
    return rows;
  }

  async markAsRead(notificationId, userId) {
    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );
  }
}

module.exports = new NotificationRepository();
