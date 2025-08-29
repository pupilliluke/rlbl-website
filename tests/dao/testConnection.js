const { testConnection, query } = require('../../lib/database');

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    await testConnection();
    console.log('✓ Database connection test passed');
    
    // Test basic query
    const result = await query('SELECT current_database(), version()');
    console.log('✓ Database name:', result.rows[0].current_database);
    console.log('✓ Database version:', result.rows[0].version.split(' ')[0]);
    
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

async function testTableExistence() {
  console.log('\nTesting table existence...');
  
  const tables = ['teams', 'players', 'team_seasons'];
  
  try {
    for (const table of tables) {
      const result = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`✓ Table '${table}' exists`);
      } else {
        console.log(`✗ Table '${table}' does not exist`);
      }
    }
    return true;
  } catch (error) {
    console.error('✗ Table existence check failed:', error.message);
    return false;
  }
}

async function runConnectionTests() {
  console.log('=== Database Connection Tests ===');
  
  const connectionTest = await testDatabaseConnection();
  const tableTest = await testTableExistence();
  
  if (connectionTest && tableTest) {
    console.log('\n✓ All connection tests passed');
    process.exit(0);
  } else {
    console.log('\n✗ Some connection tests failed');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runConnectionTests();
}

module.exports = {
  testDatabaseConnection,
  testTableExistence
};