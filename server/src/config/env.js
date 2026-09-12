const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || 'root',
    NAME: process.env.DB_NAME || 'digital_learning_db',
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'super_secret_digital_learning_jwt_key_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super_secret_digital_learning_refresh_key_2026',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  CORS: {
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(','),
  }
};
