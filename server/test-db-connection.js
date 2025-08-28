require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

console.log('Environment variables loaded:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Present' : 'Missing');

// Try different connection strings
const connectionStrings = [
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
  process.env.POSTGRES_PRISMA_URL,
];

const testConnection = async (connectionString, label) => {
  if (!connectionString) {
    console.log(`${label}: No connection string found`);
    return;
  }
  
  console.log(`\nTesting ${label}:`);
  console.log('Connection string:', connectionString.substring(0, 50) + '...');
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    console.log(`✅ ${label}: Connected successfully`);
    
    // Test a simple query
    const result = await client.query('SELECT 1 as test');
    console.log(`✅ ${label}: Query test passed`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error(`❌ ${label}: ${error.message}`);
    await pool.end();
  }
};

(async () => {
  await testConnection(connectionStrings[0], 'DATABASE_URL');
  await testConnection(connectionStrings[1], 'POSTGRES_URL');
  await testConnection(connectionStrings[2], 'POSTGRES_PRISMA_URL');
})();