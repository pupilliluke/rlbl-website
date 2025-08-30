/*
// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { query, testConnection } = require('./database');

async function testNeonDatabase() {
  try {
    console.log('🔍 Testing Neon Postgres Database...\n');
    
    await testConnection();
    
    // Test basic queries
    console.log('📋 Testing basic queries...');
    
    // Check if tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables created:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Test inserting a sample team
    console.log('\n🧪 Testing insert operations...');
    const teamResult = await query(`
      INSERT INTO teams (team_name, color) 
      VALUES ('Test Team', '#FF0000') 
      RETURNING id, team_name, color
    `);
    
    console.log('Sample team created:', teamResult.rows[0]);
    
    // Clean up test data
    await query('DELETE FROM teams WHERE team_name = $1', ['Test Team']);
    console.log('Test data cleaned up');
    
    console.log('\n✅ Neon Postgres database is working perfectly!');
    console.log('Your database is ready for production use.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run test
testNeonDatabase().then(() => {
  process.exit(0);
});*/
