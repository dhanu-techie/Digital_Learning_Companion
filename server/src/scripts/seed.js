const { seedDemoContent } = require('./demoContent');
const { initializeDatabase } = require('../config/db');

async function run() {
  try {
    await initializeDatabase();
    await seedDemoContent();
    process.exit(0);
  } catch (error) {
    console.error('[SEED ERROR]', error.message);
    process.exit(1);
  }
}

run();
