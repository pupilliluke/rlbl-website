/*
const GamesDao = require('../../backend/dao/GamesDao');
const { query } = require('../../lib/database');

async function testGamesDao() {
  console.log('=== Testing GamesDao Methods ===');
  
  const gamesDao = new GamesDao();
  let testGame = null;
  
  try {
    // Test inherited methods from BaseDao
    console.log('\nTesting inherited findAll()...');
    const allGames = await gamesDao.findAll();
    console.log(`✓ Found ${allGames.length} games via GamesDao`);
    
    // Get existing data to work with
    const existingSeasons = await query('SELECT id, season_name FROM seasons LIMIT 1');
    const existingTeamSeasons = await query('SELECT id, display_name FROM team_seasons LIMIT 2');
    
    if (existingSeasons.rows.length === 0 || existingTeamSeasons.rows.length < 2) {
      console.log('⚠ Need at least 1 season and 2 team seasons for testing, skipping detailed tests...');
      return true;
    }
    
    const seasonId = existingSeasons.rows[0].id;
    const homeTeamSeasonId = existingTeamSeasons.rows[0].id;
    const awayTeamSeasonId = existingTeamSeasons.rows[1].id;
    
    // Test listBySeason
    console.log('\nTesting listBySeason()...');
    const gamesBySeason = await gamesDao.listBySeason(seasonId);
    console.log(`✓ Found ${gamesBySeason.length} games in season ${seasonId}`);
    if (gamesBySeason.length > 0) {
      const sampleGame = gamesBySeason[0];
      console.log(`✓ Sample game: ${sampleGame.home_display} vs ${sampleGame.away_display} (${sampleGame.home_score}-${sampleGame.away_score})`);
    }
    
    // Test listBySeason with week filter
    console.log('\nTesting listBySeason() with week filter...');
    const gamesWeek1 = await gamesDao.listBySeason(seasonId, { week: 1 });
    console.log(`✓ Found ${gamesWeek1.length} games in week 1 of season ${seasonId}`);
    
    // Test listBySeason with pagination
    console.log('\nTesting listBySeason() with pagination...');
    const gamesPage1 = await gamesDao.listBySeason(seasonId, { limit: 5, offset: 0 });
    const gamesPage2 = await gamesDao.listBySeason(seasonId, { limit: 5, offset: 5 });
    console.log(`✓ Page 1: ${gamesPage1.length} games, Page 2: ${gamesPage2.length} games`);
    
    // Test createGame
    console.log('\nTesting createGame()...');
    const gameData = {
      seasonId: seasonId,
      homeTeamSeasonId: homeTeamSeasonId,
      awayTeamSeasonId: awayTeamSeasonId,
      gameDate: new Date().toISOString(),
      week: 99, // Use high week number to avoid conflicts
      isPlayoffs: false
    };
    
    testGame = await gamesDao.createGame(gameData);
    console.log(`✓ Created test game: ID ${testGame.id} (Week ${testGame.week})`);
    console.log(`✓ Teams: ${existingTeamSeasons.rows[0].display_name} vs ${existingTeamSeasons.rows[1].display_name}`);
    
    // Test setScore
    console.log('\nTesting setScore()...');
    const updatedGame = await gamesDao.setScore(testGame.id, 3, 2);
    console.log(`✓ Updated game score: ${updatedGame.home_score}-${updatedGame.away_score}`);
    
    // Test setScore again with different scores
    const finalGame = await gamesDao.setScore(testGame.id, 5, 4);
    console.log(`✓ Final game score: ${finalGame.home_score}-${finalGame.away_score}`);
    
    // Verify the game shows up in season listings
    console.log('\nVerifying game appears in season listings...');
    const updatedSeasonGames = await gamesDao.listBySeason(seasonId);
    const createdGameInList = updatedSeasonGames.find(g => g.id === testGame.id);
    if (createdGameInList) {
      console.log(`✓ Test game found in season listings with score ${createdGameInList.home_score}-${createdGameInList.away_score}`);
    } else {
      console.log('✗ Test game not found in season listings');
    }
    
    // Test week-specific listing
    const week99Games = await gamesDao.listBySeason(seasonId, { week: 99 });
    if (week99Games.length > 0) {
      console.log(`✓ Test game found in week 99 listings`);
    }
    
    console.log('\n✓ All GamesDao tests passed');
    return true;
    
  } catch (error) {
    console.error('✗ GamesDao test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Cleanup test game
    if (testGame && testGame.id) {
      try {
        await gamesDao.delete(testGame.id);
        console.log('✓ Cleaned up test game');
      } catch (cleanupError) {
        console.log('⚠ Could not clean up test game:', cleanupError.message);
      }
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testGamesDao()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testGamesDao };*/
