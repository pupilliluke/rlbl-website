/*
const BaseDao = require('../../backend/dao/BaseDao');
const { query } = require('../../lib/database');

class TestBaseDao extends BaseDao {
  constructor() {
    super('teams'); // Use teams table for testing
  }
}

async function testBaseDaoMethods() {
  console.log('=== Testing BaseDao Methods ===');
  
  const dao = new TestBaseDao();
  let testTeam = null;
  
  try {
    // Test count
    console.log('\nTesting count()...');
    const initialCount = await dao.count();
    console.log(`✓ Initial teams count: ${initialCount}`);
    
    // Test findAll
    console.log('\nTesting findAll()...');
    const allTeams = await dao.findAll();
    console.log(`✓ Found ${allTeams.length} teams`);
    if (allTeams.length > 0) {
      console.log(`✓ Sample team: ${allTeams[0].team_name} (ID: ${allTeams[0].id})`);
    }
    
    // Test findById if teams exist
    if (allTeams.length > 0) {
      console.log('\nTesting findById()...');
      const team = await dao.findById(allTeams[0].id);
      if (team) {
        console.log(`✓ Found team by ID: ${team.team_name}`);
      } else {
        console.log('✗ Failed to find team by ID');
      }
      
      // Test exists
      console.log('\nTesting exists()...');
      const exists = await dao.exists(allTeams[0].id);
      console.log(`✓ Team exists: ${exists}`);
    }
    
    // Test create
    console.log('\nTesting create()...');
    const newTeamData = {
      team_name: 'Test Team DAO',
      color: '#FF0000',
      logo_url: 'https://example.com/logo.png'
    };
    
    testTeam = await dao.create(newTeamData);
    console.log(`✓ Created test team: ${testTeam.team_name} (ID: ${testTeam.id})`);
    
    // Test update
    console.log('\nTesting update()...');
    const updatedData = {
      team_name: 'Updated Test Team DAO',
      color: '#00FF00'
    };
    
    const updatedTeam = await dao.update(testTeam.id, updatedData);
    console.log(`✓ Updated team: ${updatedTeam.team_name} with color ${updatedTeam.color}`);
    
    // Test delete
    console.log('\nTesting delete()...');
    const deletedTeam = await dao.delete(testTeam.id);
    console.log(`✓ Deleted test team: ${deletedTeam.team_name}`);
    
    // Verify delete
    const deletedExists = await dao.exists(testTeam.id);
    console.log(`✓ Team deleted (exists: ${deletedExists})`);
    
    console.log('\n✓ All BaseDao tests passed');
    return true;
    
  } catch (error) {
    console.error('✗ BaseDao test failed:', error.message);
    
    // Cleanup if test team was created
    if (testTeam && testTeam.id) {
      try {
        await dao.delete(testTeam.id);
        console.log('✓ Cleaned up test team');
      } catch (cleanupError) {
        console.log('⚠ Could not clean up test team:', cleanupError.message);
      }
    }
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBaseDaoMethods()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testBaseDaoMethods };*/
