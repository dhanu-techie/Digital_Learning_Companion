const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

/**
 * Creates audit record for sensitive operations
 */
function auditLog(action, resourceType) {
  return async (req, res, next) => {
    // Intercept response finish to capture audit log
    res.on('finish', async () => {
      if (res.statusCode < 400 && req.user) {
        try {
          const auditId = uuidv4();
          const resourceId = req.params.id || req.body.id || null;
          const ipAddress = req.ip || req.connection.remoteAddress;

          await db.query(
            `INSERT INTO audit_logs (id, actor_id, actor_role, action, resource_type, resource_id, details_json, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              auditId,
              req.user.id,
              req.user.role,
              action,
              resourceType,
              resourceId,
              JSON.stringify({ path: req.originalUrl, method: req.method }),
              ipAddress
            ]
          );
        } catch (err) {
          console.error('[AUDIT LOG ERROR]', err.message);
        }
      }
    });
    next();
  };
}

module.exports = { auditLog };
