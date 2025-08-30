/*
const TeamsDao = require('../../backend/dao/TeamsDao');
const { query } = require('../../lib/database');

async function testTeamsDaoMethods() {
  console.log('=== Testing TeamsDao Methods ===');
  
  const teamsDao = new TeamsDao();
  let testTeam = null;
  
  try {
    // Test inherited methods from BaseDao
    console.log('\nTesting inherited findAll()...');
    const allTeams = await teamsDao.findAll();
    console.log(`✓ Found ${allTeams.length} teams via TeamsDao`);
    
    // Test findByName
    console.log('\nTesting findByName()...');
    if (allTeams.length > 0) {
      const teamByName = await teamsDao.findByName(allTeams[0].team_name);
      if (teamByName) {
        console.log(`✓ Found team by name: ${teamByName.team_name}`);
      } else {
        console.log('✗ Failed to find team by name');
      }
      
      // Test case insensitive search
      const teamByNameLower = await teamsDao.findByName(allTeams[0].team_name.toLowerCase());
      if (teamByNameLower) {
        console.log(`✓ Case insensitive search works: ${teamByNameLower.team_name}`);
      }
    }
    
    // Create test team for further testing
    console.log('\nCreating test team for TeamsDao tests...');
    const testTeamData = {
      team_name: 'TeamsDAO Test Squad',
      color: '#0066FF',
      secondary_color: '#FFFFFF',
      logo_url: 'https://example.com/test-logo.png'
    };
    
    testTeam = await teamsDao.create(testTeamData);
    console.log(`✓ Created test team: ${testTeam.team_name}`);
    
    // Test findByColor
    console.log('\nTesting findByColor()...');
    const teamsByColor = await teamsDao.findByColor('#0066FF');
    console.log(`✓ Found ${teamsByColor.length} teams with color #0066FF`);
    
    // Test getTeamsWithPlayerCount
    console.log('\nTesting getTeamsWithPlayerCount()...');
    const teamsWithPlayerCount = await teamsDao.getTeamsWithPlayerCount();
    console.log(`✓ Retrieved ${teamsWithPlayerCount.length} teams with player counts`);
    if (teamsWithPlayerCount.length > 0) {
      const sampleTeam = teamsWithPlayerCount[0];
      console.log(`✓ Sample: ${sampleTeam.team_name} has ${sampleTeam.player_count} players`);
    }
    
    // Test getTeamStats
    console.log('\nTesting getTeamStats()...');
    if (allTeams.length > 0) {
      const teamStats = await teamsDao.getTeamStats(allTeams[0].id);
      if (teamStats) {
        console.log(`✓ Team stats for ${teamStats.team_name}:`);
        console.log(`  Games played: ${teamStats.games_played || 0}`);
        console.log(`  Goals for: ${teamStats.goals_for || 0}`);
        console.log(`  Goals against: ${teamStats.goals_against || 0}`);
        console.log(`  Wins: ${teamStats.wins || 0}`);
        console.log(`  Losses: ${teamStats.losses || 0}`);
      } else {
        console.log('✓ No stats found for team (expected if no games played)');
      }
    }
    
    // Test with season filter (check if seasons table has data)
    console.log('\nTesting season-filtered methods...');
    const seasonsResult = await query('SELECT id FROM seasons LIMIT 1');
    if (seasonsResult.rows.length > 0) {
      const seasonId = seasonsResult.rows[0].id;
      const teamsWithPlayerCountSeason = await teamsDao.getTeamsWithPlayerCount(seasonId);
      console.log(`✓ Found ${teamsWithPlayerCountSeason.length} teams for season ${seasonId}`);
      
      if (allTeams.length > 0) {
        const teamStatsSeason = await teamsDao.getTeamStats(allTeams[0].id, seasonId);
        console.log(`✓ Retrieved season-specific stats for team`);
      }
    } else {
      console.log('✓ No seasons found, skipping season-filtered tests');
    }
    
    console.log('\n✓ All TeamsDao tests passed');
    return true;
    
  } catch (error) {
    console.error('✗ TeamsDao test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Cleanup test team
    if (testTeam && testTeam.id) {
      try {
        await teamsDao.delete(testTeam.id);
        console.log('✓ Cleaned up test team');
      } catch (cleanupError) {
        console.log('⚠ Could not clean up test team:', cleanupError.message);
      }
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testTeamsDaoMethods()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testTeamsDaoMethods };*/
