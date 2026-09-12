const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Verifies JWT token in Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
      data: null,
      error: 'UNAUTHORIZED'
    });
  }

  jwt.verify(token, env.JWT.SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired authentication token.',
        data: null,
        error: 'TOKEN_INVALID'
      });
    }

    req.user = user; // Contains id, username, role, schoolId
    next();
  });
}

/**
 * Enforces Role-Based Access Control (RBAC)
 * @param {...string} allowedRoles Roles permitted to access route
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user ? req.user.role : 'none'}' does not have sufficient permissions.`,
        data: null,
        error: 'FORBIDDEN'
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
