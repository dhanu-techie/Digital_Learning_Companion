const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const apiRoutes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (env.CORS.ALLOWED_ORIGINS.includes(origin)) return true;
  return env.NODE_ENV === 'production' && /^https:\/\/[\w-]+\.onrender\.com$/.test(origin);
}

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    data: null,
    error: 'TOO_MANY_REQUESTS'
  }
});
app.use('/api/', limiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API v1 Routes
app.use('/api/v1', apiRoutes);

// Root fallback route
app.get('/', (req, res) => {
  res.json({
    name: 'Digital & Smart Learning Platform API',
    version: '1.0.0',
    status: 'ONLINE',
    documentation: '/api/v1/health'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'digital-learning-backend',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
