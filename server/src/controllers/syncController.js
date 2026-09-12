const syncService = require('../services/syncService');

class SyncController {
  async pushSync(req, res, next) {
    try {
      const { operations } = req.body;
      if (!operations || !Array.isArray(operations)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payload. Array of "operations" is required.',
          data: null,
          error: 'BAD_REQUEST'
        });
      }

      const result = await syncService.processBatchSync(operations, req.user.id);
      res.json({
        success: true,
        message: 'Sync operations processed successfully',
        data: result,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async pullSync(req, res, next) {
    try {
      const { lastSyncedAt } = req.query;
      const result = await syncService.getDeltaChanges(lastSyncedAt);
      res.json({
        success: true,
        message: 'Delta changes fetched successfully',
        data: result,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SyncController();
