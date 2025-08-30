/*
const GamesDao = require('../../backend/dao/GamesDao');

async function testGamesApi() {
  console.log('=== Testing Games API and DAO ===');
  
  const gamesDao = new GamesDao();
  
  try {
    // Test 1: Get all games
    console.log('\n1. Testing GamesDao.findAll()...');
    const allGames = await gamesDao.findAll();
    console.log(`✓ Total games in database: ${allGames.length}`);
    
    // Test 2: Get games by season
    console.log('\n2. Testing GamesDao.listBySeason(3)...');
    const season3Games = await gamesDao.listBySeason(3);
    console.log(`✓ Games in season 3: ${season3Games.length}`);
    if (season3Games.length > 0) {
      const sampleGame = season3Games[0];
      console.log(`✓ Sample game: ${sampleGame.home_display} vs ${sampleGame.away_display} (Week ${sampleGame.week})`);
    }
    
    // Test 3: Get games by week
    console.log('\n3. Testing games by week...');
    for (let week = 1; week <= 8; week++) {
      const weekGames = await gamesDao.listBySeason(3, { week });
      console.log(`✓ Week ${week}: ${weekGames.length} games`);
      if (weekGames.length > 0 && week === 1) {
        console.log('  Sample Week 1 games:');
        weekGames.forEach(game => {
          console.log(`    ${game.home_display} vs ${game.away_display}`);
        });
      }
    }
    
    // Test 4: Test setScore functionality
    console.log('\n4. Testing game score updates...');
    if (season3Games.length > 0) {
      const testGame = season3Games[0];
      console.log(`Testing score update for game: ${testGame.home_display} vs ${testGame.away_display}`);
      
      // Set a sample score
      const updatedGame = await gamesDao.setScore(testGame.id, 3, 2);
      console.log(`✓ Updated score: ${updatedGame.home_display} ${updatedGame.home_score} - ${updatedGame.away_score} ${updatedGame.away_display}`);
      
      // Update the score again
      const finalGame = await gamesDao.setScore(testGame.id, 5, 1);
      console.log(`✓ Final score: ${finalGame.home_display} ${finalGame.home_score} - ${finalGame.away_score} ${finalGame.away_display}`);
    }
    
    // Test 5: Test specific game retrieval
    console.log('\n5. Testing individual game retrieval...');
    if (season3Games.length > 0) {
      const gameId = season3Games[0].id;
      const individualGame = await gamesDao.findById(gameId);
      if (individualGame) {
        console.log(`✓ Retrieved game ${gameId}: ${individualGame.home_score || 0} - ${individualGame.away_score || 0}`);
      }
    }
    
    // Test 6: Show schedule summary
    console.log('\n6. Schedule Summary:');
    console.log('=====================================');
    for (let week = 1; week <= 8; week++) {
      console.log(`Week ${week}:`);
      const weekGames = await gamesDao.listBySeason(3, { week });
      weekGames.forEach(game => {
        const homeScore = game.home_score !== null ? game.home_score : '-';
        const awayScore = game.away_score !== null ? game.away_score : '-';
        console.log(`  ${game.home_display} ${homeScore} - ${awayScore} ${game.away_display}`);
      });
      console.log('');
    }
    
    console.log('✅ All Games DAO and API tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Games API test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGamesApi()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testGamesApi };*/
