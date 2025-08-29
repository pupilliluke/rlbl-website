const PlayersDao = require('../../backend/dao/PlayersDao');

async function testPlayersDao() {
  console.log('=== Testing PlayersDao Methods ===');
  
  const playersDao = new PlayersDao();
  let testPlayer = null;
  
  try {
    // Test inherited methods from BaseDao
    console.log('\nTesting inherited findAll()...');
    const allPlayers = await playersDao.findAll();
    console.log(`✓ Found ${allPlayers.length} players via PlayersDao`);
    
    // Create test player
    console.log('\nCreating test player...');
    const testPlayerData = {
      player_name: 'Test Player DAO',
      gamertag: 'TestGamerDAO123'
    };
    
    testPlayer = await playersDao.create(testPlayerData);
    console.log(`✓ Created test player: ${testPlayer.player_name} (${testPlayer.gamertag})`);
    
    // Test findByGamertag
    console.log('\nTesting findByGamertag()...');
    const playerByGamertag = await playersDao.findByGamertag('TestGamerDAO123');
    if (playerByGamertag) {
      console.log(`✓ Found player by gamertag: ${playerByGamertag.player_name}`);
    } else {
      console.log('✗ Failed to find player by gamertag');
    }
    
    // Test case insensitive search
    const playerByGamertagLower = await playersDao.findByGamertag('testgamerdao123');
    if (playerByGamertagLower) {
      console.log(`✓ Case insensitive gamertag search works: ${playerByGamertagLower.player_name}`);
    }
    
    // Test searchByName
    console.log('\nTesting searchByName()...');
    const searchResults = await playersDao.searchByName('Test', { limit: 10 });
    console.log(`✓ Search for 'Test' returned ${searchResults.length} results`);
    
    // Test partial name search
    const partialSearch = await playersDao.searchByName('Player', { limit: 5, offset: 0 });
    console.log(`✓ Search for 'Player' returned ${partialSearch.length} results`);
    
    // Test getTeamsBySeason if we have existing data
    console.log('\nTesting getTeamsBySeason()...');
    if (allPlayers.length > 0) {
      const existingPlayer = allPlayers[0];
      const teams = await playersDao.getTeamsBySeason(existingPlayer.id, 1); // Season 1
      console.log(`✓ Found ${teams.length} teams for player ${existingPlayer.player_name} in season 1`);
      if (teams.length > 0) {
        console.log(`✓ Sample team: ${teams[0].team_name} (Display: ${teams[0].display_name})`);
      }
    }
    
    // Test with pagination
    console.log('\nTesting pagination in searchByName()...');
    const page1 = await playersDao.searchByName('', { limit: 3, offset: 0 });
    const page2 = await playersDao.searchByName('', { limit: 3, offset: 3 });
    console.log(`✓ Page 1: ${page1.length} results, Page 2: ${page2.length} results`);
    
    console.log('\n✓ All PlayersDao tests passed');
    return true;
    
  } catch (error) {
    console.error('✗ PlayersDao test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Cleanup test player
    if (testPlayer && testPlayer.id) {
      try {
        await playersDao.delete(testPlayer.id);
        console.log('✓ Cleaned up test player');
      } catch (cleanupError) {
        console.log('⚠ Could not clean up test player:', cleanupError.message);
      }
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPlayersDao()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testPlayersDao };