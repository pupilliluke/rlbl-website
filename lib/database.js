const { Pool } = require('pg');

// Create connection pool with environment variable support and fallback
const createPool = () => {
  // Use environment variable if available (for production/Vercel)
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : 
           (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
    });
  }
  
  // Fallback to hardcoded values (for local development)
  return new Pool({
    host: 'ep-empty-brook-adzsqif2-pooler.c-2.us-east-1.aws.neon.tech',
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_oQLihs3zZJV6',
    database: 'neondb',
    ssl: {
      rejectUnauthorized: false
    }
  });
};

const pool = createPool();

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