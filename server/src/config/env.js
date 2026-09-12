const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const listedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const extraOrigins = [process.env.FRONTEND_URL, process.env.RENDER_EXTERNAL_URL]
  .filter(Boolean)
  .map((origin) => origin.trim());

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || 'root',
    NAME: process.env.DB_NAME || 'digital_learning_db',
    SSL: process.env.DB_SSL === 'true',
    SSL_REJECT_UNAUTHORIZED: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'super_secret_digital_learning_jwt_key_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super_secret_digital_learning_refresh_key_2026',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  CORS: {
    ALLOWED_ORIGINS: [...new Set([...listedOrigins, ...extraOrigins])],
  }
};
