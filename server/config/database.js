const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'Voltron',
  database: process.env.DB_DATABASE || 'FabTracker',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERTIFICATE !== 'false',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
};

let pool = null;

async function getPool() {
  if (pool) {
    // Check if pool is still connected
    try {
      if (pool.connected) {
        return pool;
      }
    } catch (err) {
      // Pool is in bad state, close and reconnect
      console.log('Pool in bad state, reconnecting...');
      try {
        await pool.close();
      } catch (e) {
        // Ignore close errors
      }
      pool = null;
    }
  }

  try {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server');

    // Handle pool errors
    pool.on('error', err => {
      console.error('SQL Pool Error:', err);
      pool = null;
    });

    return pool;
  } catch (err) {
    console.error('Failed to connect to SQL Server:', err);
    pool = null;
    throw err;
  }
}

async function query(queryString, params = {}) {
  let retries = 2;

  while (retries > 0) {
    try {
      const poolInstance = await getPool();
      const request = poolInstance.request();

      // Add parameters
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
      }

      return await request.query(queryString);
    } catch (err) {
      retries--;
      if (err.code === 'ECONNRESET' || err.code === 'ESOCKET' || err.code === 'ECONNCLOSED') {
        console.log(`Connection error, retrying... (${retries} left)`);
        pool = null; // Force reconnect
        if (retries === 0) throw err;
      } else {
        throw err;
      }
    }
  }
}

module.exports = {
  sql,
  getPool,
  query,
  config
};
