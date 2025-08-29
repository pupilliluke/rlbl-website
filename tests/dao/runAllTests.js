const { testDatabaseConnection, testTableExistence } = require('./testConnection');
const { testBaseDaoMethods } = require('./testBaseDao');
const { testTeamsDaoMethods } = require('./testTeamsDao');

async function runAllDaoTests() {
  console.log('========================================');
  console.log('    Running All DAO Layer Tests');
  console.log('========================================');
  
  let allPassed = true;
  
  try {
    // Test 1: Database Connection
    console.log('\n1. Testing Database Connection...');
    const connectionPassed = await testDatabaseConnection();
    if (!connectionPassed) {
      allPassed = false;
      console.log('❌ Database connection tests failed - stopping');
      return;
    }
    
    // Test 2: Table Existence
    console.log('\n2. Testing Table Existence...');
    const tablesPassed = await testTableExistence();
    if (!tablesPassed) {
      allPassed = false;
      console.log('❌ Table existence tests failed - stopping');
      return;
    }
    
    // Test 3: BaseDao Methods
    console.log('\n3. Testing BaseDao Methods...');
    const baseDaoPassed = await testBaseDaoMethods();
    if (!baseDaoPassed) {
      allPassed = false;
    }
    
    // Test 4: TeamsDao Methods
    console.log('\n4. Testing TeamsDao Methods...');
    const teamsDaoPassed = await testTeamsDaoMethods();
    if (!teamsDaoPassed) {
      allPassed = false;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during tests:', error.message);
    allPassed = false;
  }
  
  console.log('\n========================================');
  if (allPassed) {
    console.log('🎉 ALL DAO TESTS PASSED!');
    console.log('✓ Database connection working');
    console.log('✓ All required tables exist');
    console.log('✓ BaseDao CRUD operations working');
    console.log('✓ TeamsDao custom methods working');
    console.log('✓ DAO layer successfully receiving responses from database');
  } else {
    console.log('❌ SOME DAO TESTS FAILED');
    console.log('Check the output above for specific failures');
  }
  console.log('========================================');
  
  process.exit(allPassed ? 0 : 1);
}

// Run all tests
runAllDaoTests();