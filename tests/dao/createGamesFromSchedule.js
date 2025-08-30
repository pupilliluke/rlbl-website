/*
const GamesDao = require('../../backend/dao/GamesDao');
const { query } = require('../../lib/database');

async function createGamesFromSchedule() {
  console.log('=== Creating Games from Schedule ===');
  
  const gamesDao = new GamesDao();
  
  try {
    // Step 1: Get all team_seasons for season 3
    console.log('\n1. Getting team_seasons for season 3...');
    const teamSeasonsResult = await query(`
      SELECT ts.id, ts.display_name, t.team_name 
      FROM team_seasons ts 
      JOIN teams t ON ts.team_id = t.id 
      WHERE ts.season_id = 3 
      ORDER BY t.team_name
    `);
    
    console.log(`✓ Found ${teamSeasonsResult.rows.length} teams in season 3`);
    
    // Create mapping of team names to team_season_ids
    const teamMapping = {};
    teamSeasonsResult.rows.forEach(row => {
      const teamName = row.display_name || row.team_name;
      teamMapping[teamName] = row.id;
      console.log(`  ${teamName} -> team_season_id: ${row.id}`);
    });
    
    // Handle team name variations
    const nameMapping = {
      'A-Arob': teamMapping['A-Arob'],
      'Brain Aneurysm': teamMapping['Brain Aneurysm'],
      'Cancun Baboons': teamMapping['Cancun Baboons'],
      'Double Bogey': teamMapping['Double Bogey'],
      'LeJohn James': teamMapping['LeJohn James'],
      'Alcoholics Anonymous (AA)': teamMapping['Demo Daddies'], // Assuming this is Demo Daddies
      'Mid Boost': teamMapping['Mid Boost'],
      'MJ': teamMapping['MJ'],
      'Otters': teamMapping['Otters'],
      'Demo Daddies': teamMapping['Demo Daddies'],
      'Backdoor Bandits': teamMapping['Backdoor Bandits'],
      'Jakeing It!': teamMapping['Jakeing It!'],
      'Nukes': teamMapping['Nukes'],
      'Vince Owen': teamMapping['Vince Owen'],
      'Collin and Erica': teamMapping['Demo Daddies'] // Need to check if this team exists
    };
    
    console.log('\n2. Team name mapping created');
    
    // Define the schedule
    const schedule = [
      // Week 1
      { week: 1, home: 'A-Arob', away: 'Brain Aneurysm' },
      { week: 1, home: 'Cancun Baboons', away: 'Double Bogey' },
      { week: 1, home: 'LeJohn James', away: 'Alcoholics Anonymous (AA)' },
      { week: 1, home: 'Mid Boost', away: 'MJ' },
      { week: 1, home: 'Otters', away: 'Demo Daddies' },
      { week: 1, home: 'Backdoor Bandits', away: 'Jakeing It!' },
      { week: 1, home: 'Nukes', away: 'Vince Owen' },
      
      // Week 2
      { week: 2, home: 'A-Arob', away: 'Jakeing It!' },
      { week: 2, home: 'Brain Aneurysm', away: 'Backdoor Bandits' },
      { week: 2, home: 'Nukes', away: 'Double Bogey' },
      { week: 2, home: 'Otters', away: 'Vince Owen' },
      { week: 2, home: 'Cancun Baboons', away: 'MJ' },
      { week: 2, home: 'LeJohn James', away: 'Collin and Erica' },
      { week: 2, home: 'Mid Boost', away: 'Alcoholics Anonymous (AA)' },
      
      // Week 3
      { week: 3, home: 'A-Arob', away: 'Cancun Baboons' },
      { week: 3, home: 'Otters', away: 'Alcoholics Anonymous (AA)' },
      { week: 3, home: 'LeJohn James', away: 'Double Bogey' },
      { week: 3, home: 'MJ', away: 'Vince Owen' },
      { week: 3, home: 'Brain Aneurysm', away: 'Jakeing It!' },
      { week: 3, home: 'Backdoor Bandits', away: 'Nukes' },
      { week: 3, home: 'Mid Boost', away: 'Collin and Erica' },
      
      // Week 4
      { week: 4, home: 'Cancun Baboons', away: 'Otters' },
      { week: 4, home: 'MJ', away: 'Alcoholics Anonymous (AA)' },
      { week: 4, home: 'Vince Owen', away: 'Brain Aneurysm' },
      { week: 4, home: 'A-Arob', away: 'Double Bogey' },
      { week: 4, home: 'Backdoor Bandits', away: 'Collin and Erica' },
      { week: 4, home: 'Jakeing It!', away: 'Mid Boost' },
      { week: 4, home: 'Nukes', away: 'LeJohn James' },
      
      // Week 5
      { week: 5, home: 'A-Arob', away: 'Otters' },
      { week: 5, home: 'Brain Aneurysm', away: 'Cancun Baboons' },
      { week: 5, home: 'Vince Owen', away: 'Alcoholics Anonymous (AA)' },
      { week: 5, home: 'MJ', away: 'LeJohn James' },
      { week: 5, home: 'Collin and Erica', away: 'Double Bogey' },
      { week: 5, home: 'Backdoor Bandits', away: 'Mid Boost' },
      { week: 5, home: 'Jakeing It!', away: 'Nukes' },
      
      // Week 6
      { week: 6, home: 'Brain Aneurysm', away: 'MJ' },
      { week: 6, home: 'A-Arob', away: 'Alcoholics Anonymous (AA)' },
      { week: 6, home: 'Vince Owen', away: 'Cancun Baboons' },
      { week: 6, home: 'Otters', away: 'Nukes' },
      { week: 6, home: 'Backdoor Bandits', away: 'Double Bogey' },
      { week: 6, home: 'Jakeing It!', away: 'Collin and Erica' },
      { week: 6, home: 'LeJohn James', away: 'Mid Boost' },
      
      // Week 7
      { week: 7, home: 'A-Arob', away: 'MJ' },
      { week: 7, home: 'Otters', away: 'Brain Aneurysm' },
      { week: 7, home: 'Cancun Baboons', away: 'Alcoholics Anonymous (AA)' },
      { week: 7, home: 'Vince Owen', away: 'Backdoor Bandits' },
      { week: 7, home: 'Mid Boost', away: 'Double Bogey' },
      { week: 7, home: 'Collin and Erica', away: 'Nukes' },
      { week: 7, home: 'LeJohn James', away: 'Jakeing It!' },
      
      // Week 8
      { week: 8, home: 'Otters', away: 'MJ' },
      { week: 8, home: 'A-Arob', away: 'Vince Owen' },
      { week: 8, home: 'Brain Aneurysm', away: 'Alcoholics Anonymous (AA)' },
      { week: 8, home: 'Collin and Erica', away: 'Cancun Baboons' },
      { week: 8, home: 'Nukes', away: 'Mid Boost' },
      { week: 8, home: 'Double Bogey', away: 'Jakeing It!' },
      { week: 8, home: 'Backdoor Bandits', away: 'LeJohn James' }
    ];
    
    console.log(`\n3. Creating ${schedule.length} games...`);
    
    let createdGames = 0;
    let errors = [];
    
    for (const game of schedule) {
      try {
        const homeTeamSeasonId = nameMapping[game.home];
        const awayTeamSeasonId = nameMapping[game.away];
        
        if (!homeTeamSeasonId) {
          errors.push(`Could not find team_season_id for home team: ${game.home}`);
          continue;
        }
        
        if (!awayTeamSeasonId) {
          errors.push(`Could not find team_season_id for away team: ${game.away}`);
          continue;
        }
        
        const gameData = {
          seasonId: 3,
          homeTeamSeasonId: homeTeamSeasonId,
          awayTeamSeasonId: awayTeamSeasonId,
          gameDate: null,
          week: game.week,
          isPlayoffs: false
        };
        
        const createdGame = await gamesDao.createGame(gameData);
        console.log(`✓ Week ${game.week}: ${game.home} vs ${game.away} (Game ID: ${createdGame.id})`);
        createdGames++;
        
      } catch (error) {
        errors.push(`Week ${game.week} - ${game.home} vs ${game.away}: ${error.message}`);
      }
    }
    
    console.log(`\n4. Game creation summary:`);
    console.log(`✓ Successfully created: ${createdGames} games`);
    if (errors.length > 0) {
      console.log(`✗ Errors: ${errors.length}`);
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Verify games were created
    console.log('\n5. Verifying games in database...');
    const allGames = await gamesDao.listBySeason(3);
    console.log(`✓ Total games in season 3: ${allGames.length}`);
    
    // Show games by week
    for (let week = 1; week <= 8; week++) {
      const weekGames = await gamesDao.listBySeason(3, { week });
      console.log(`  Week ${week}: ${weekGames.length} games`);
    }
    
    return { createdGames, errors, totalGames: allGames.length };
    
  } catch (error) {
    console.error('✗ Failed to create games:', error.message);
    console.error('Stack trace:', error.stack);
    return { error: error.message };
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createGamesFromSchedule()
    .then(result => {
      if (result.error) {
        process.exit(1);
      } else {
        console.log('\n🎉 Game creation completed!');
        process.exit(0);
      }
    });
}

module.exports = { createGamesFromSchedule };*/
