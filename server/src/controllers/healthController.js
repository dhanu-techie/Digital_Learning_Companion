const db = require('../config/db');

class HealthController {
  async getHealth(req, res) {
    res.json({
      status: 'UP',
      service: 'digital-learning-backend',
      timestamp: new Date().toISOString()
    });
  }

  async getDbHealth(req, res) {
    try {
      await db.query('SELECT 1');
      res.json({
        status: 'UP',
        database: 'MySQL',
        connected: true,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(503).json({
        status: 'DOWN',
        database: 'MySQL',
        connected: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new HealthController();
