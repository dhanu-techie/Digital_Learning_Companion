const env = require('../config/env');

/**
 * Standardized global Express error handler
 */
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  const friendlyMessage = statusCode === 500 
    ? 'An internal error occurred. Your offline data remains safe.' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: friendlyMessage,
    data: null,
    error: err.code || 'INTERNAL_SERVER_ERROR',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
