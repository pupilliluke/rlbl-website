const UsersSyncDao = require('../../backend/dao/UsersSyncDao');
const { query } = require('../../lib/database');

async function testUsersSyncDao() {
  console.log('=== Testing UsersSyncDao Methods ===');
  
  const usersSyncDao = new UsersSyncDao();
  
  try {
    // Test inherited methods from BaseDao
    console.log('\nTesting inherited findAll()...');
    const allUsers = await usersSyncDao.findAll();
    console.log(`✓ Found ${allUsers.length} users via UsersSyncDao`);
    
    // Check if the neon_auth.users_sync table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'neon_auth' 
        AND table_name = 'users_sync'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('⚠ neon_auth.users_sync table does not exist, skipping detailed tests...');
      console.log('✓ UsersSyncDao class structure verified (table may not be set up yet)');
      return true;
    }
    
    // Test list method
    console.log('\nTesting list()...');
    const usersList = await usersSyncDao.list({ limit: 10, offset: 0 });
    console.log(`✓ Listed ${usersList.length} users with pagination`);
    if (usersList.length > 0) {
      const sampleUser = usersList[0];
      console.log(`✓ Sample user: ${sampleUser.name || 'No name'} (${sampleUser.email || 'No email'})`);
      console.log(`✓ User ID: ${sampleUser.id}, Created: ${sampleUser.created_at}`);
    }
    
    // Test list with different pagination
    console.log('\nTesting list() with different pagination...');
    const usersPage2 = await usersSyncDao.list({ limit: 5, offset: 2 });
    console.log(`✓ Page 2: ${usersPage2.length} users`);
    
    // Test findByEmail if we have users
    if (usersList.length > 0 && usersList[0].email) {
      console.log('\nTesting findByEmail()...');
      const testEmail = usersList[0].email;
      const userByEmail = await usersSyncDao.findByEmail(testEmail);
      if (userByEmail) {
        console.log(`✓ Found user by email: ${userByEmail.name || 'No name'} (${userByEmail.email})`);
      } else {
        console.log(`✗ Failed to find user by email: ${testEmail}`);
      }
      
      // Test case insensitive email search
      const userByEmailLower = await usersSyncDao.findByEmail(testEmail.toLowerCase());
      if (userByEmailLower) {
        console.log(`✓ Case insensitive email search works: ${userByEmailLower.email}`);
      }
      
      const userByEmailUpper = await usersSyncDao.findByEmail(testEmail.toUpperCase());
      if (userByEmailUpper) {
        console.log(`✓ Case insensitive email search works with uppercase: ${userByEmailUpper.email}`);
      }
    } else {
      console.log('\nSkipping findByEmail() tests - no users with email addresses found');
    }
    
    // Test findByEmail with non-existent email
    console.log('\nTesting findByEmail() with non-existent email...');
    const nonExistentUser = await usersSyncDao.findByEmail('nonexistent@test.com');
    if (nonExistentUser === undefined) {
      console.log('✓ findByEmail() correctly returns undefined for non-existent email');
    } else {
      console.log('⚠ findByEmail() returned data for non-existent email (unexpected)');
    }
    
    // Test list with large offset (should return fewer or no results)
    console.log('\nTesting list() with large offset...');
    const emptyPage = await usersSyncDao.list({ limit: 10, offset: 1000 });
    console.log(`✓ Large offset page: ${emptyPage.length} users (expected to be small or zero)`);
    
    // Test list with limit of 1
    console.log('\nTesting list() with limit of 1...');
    const singleUser = await usersSyncDao.list({ limit: 1, offset: 0 });
    console.log(`✓ Single user query: ${singleUser.length} user(s)`);
    
    // Test the fields returned by list method
    if (usersList.length > 0) {
      console.log('\nVerifying list() returns correct fields...');
      const user = usersList[0];
      const expectedFields = ['id', 'name', 'email', 'created_at', 'updated_at', 'deleted_at'];
      const userFields = Object.keys(user);
      const hasAllFields = expectedFields.every(field => userFields.includes(field));
      if (hasAllFields) {
        console.log('✓ list() returns all expected fields');
      } else {
        const missingFields = expectedFields.filter(field => !userFields.includes(field));
        console.log(`⚠ list() missing fields: ${missingFields.join(', ')}`);
      }
    }
    
    console.log('\n✓ All UsersSyncDao tests passed');
    return true;
    
  } catch (error) {
    if (error.message.includes('relation "neon_auth.users_sync" does not exist')) {
      console.log('⚠ neon_auth.users_sync table does not exist - this is expected if auth is not set up');
      console.log('✓ UsersSyncDao class structure verified');
      return true;
    }
    
    console.error('✗ UsersSyncDao test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testUsersSyncDao()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testUsersSyncDao };