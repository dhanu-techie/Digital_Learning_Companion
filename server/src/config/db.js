const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const env = require('./env');

const ssl = env.DB.SSL
  ? { rejectUnauthorized: env.DB.SSL_REJECT_UNAUTHORIZED }
  : undefined;

const sharedConnection = {
  host: env.DB.HOST,
  port: env.DB.PORT,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  ssl,
  multipleStatements: true
};

const pool = mysql.createPool({
  ...sharedConnection,
  database: env.DB.NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

/**
 * Ensures database exists and executes initial schema migration if needed
 */
async function initializeDatabase() {
  try {
    // 1. Connection check without database specified
    try {
      const tempConn = await mysql.createConnection(sharedConnection);
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB.NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await tempConn.end();
    } catch (createErr) {
      console.warn('[DB] Skipping database create (managed MySQL often denies this):', createErr.message);
    }

    // 2. Test pool connection
    const conn = await pool.getConnection();
    console.log(`[DB] Connected successfully to MySQL database: ${env.DB.NAME}`);

    // 3. Check if schema file exists in skills reference and apply if tables don't exist
    const schemaPath = path.join(__dirname, '../../../.agents/skills/digital-learning-platform/references/mysql_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await conn.query(sql);
      console.log('[DB] Relational schema validated and applied.');
    }
    
    conn.release();
    return true;
  } catch (error) {
    console.error('[DB] Connection or initialization error:', error.message);
    // In demo / fallback mode, log error without crashing app startup completely
    return false;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  query: (sql, params) => pool.execute(sql, params)
};
