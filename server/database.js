const { Pool } = require('pg');

// Create connection pool using the same approach as working PowerShell script
const pool = new Pool({
  host: 'ep-empty-brook-adzsqif2-pooler.c-2.us-east-1.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_oQLihs3zZJV6',
  database: 'neondb',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

// Query helper function
const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
  testConnection,
};