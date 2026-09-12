const app = require('./src/app');
const env = require('./src/config/env');
const { initializeDatabase } = require('./src/config/db');

async function startServer() {
  try {
    // Attempt database initialization
    await initializeDatabase();

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(` 🚀 Digital Learning Backend Running on Port ${env.PORT}`);
      console.log(` 🌍 Environment: ${env.NODE_ENV}`);
      console.log(` 🔗 API Base URL: http://localhost:${env.PORT}/api/v1`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('[SERVER] Closed remaining connections.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('[FATAL] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
