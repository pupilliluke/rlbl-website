// Load environment variables
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('./database');

async function createSchema() {
  try {
    console.log('Testing connection to Neon Postgres...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    await testConnection();
    
    console.log('Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Split schema into individual statements (skip CREATE DATABASE)
    const statements = schemaSQL
      .split(';')
      .filter(stmt => stmt.trim() && !stmt.includes('CREATE DATABASE'))
      .map(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await query(statement);
      }
    }
    
    console.log('✅ Schema created successfully!');
    console.log('Your Neon Postgres database is ready.');
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createSchema().then(() => {
    process.exit(0);
  });
}

module.exports = { createSchema };