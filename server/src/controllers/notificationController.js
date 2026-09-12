const notificationRepository = require('../repositories/notificationRepository');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const notifications = await notificationRepository.getUserNotifications(req.user.id);
      res.json({
        success: true,
        message: 'Notifications fetched',
        data: notifications,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const { id } = req.params;
      await notificationRepository.markAsRead(id, req.user.id);
      res.json({
        success: true,
        message: 'Notification marked as read',
        data: null,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
