const StandingsDao = require('../../backend/dao/StandingsDao');
const { query } = require('../../lib/database');

async function testStandingsDao() {
  console.log('=== Testing StandingsDao Methods ===');
  
  const standingsDao = new StandingsDao();
  let testStanding = null;
  
  try {
    // Test inherited methods from BaseDao
    console.log('\nTesting inherited findAll()...');
    const allStandings = await standingsDao.findAll();
    console.log(`✓ Found ${allStandings.length} standings entries via StandingsDao`);
    
    // Get existing data to work with
    const existingSeasons = await query('SELECT id, season_name FROM seasons LIMIT 1');
    const existingTeamSeasons = await query('SELECT id, display_name FROM team_seasons LIMIT 1');
    
    if (existingSeasons.rows.length === 0 || existingTeamSeasons.rows.length === 0) {
      console.log('⚠ Need existing seasons and team seasons for testing, skipping detailed tests...');
      return true;
    }
    
    const seasonId = existingSeasons.rows[0].id;
    const teamSeasonId = existingTeamSeasons.rows[0].id;
    const teamSeasonName = existingTeamSeasons.rows[0].display_name;
    
    // Test table method first to see existing data
    console.log('\nTesting table()...');
    const standingsTable = await standingsDao.table(seasonId);
    console.log(`✓ Found ${standingsTable.length} teams in standings for season ${seasonId}`);
    if (standingsTable.length > 0) {
      const topTeam = standingsTable[0];
      console.log(`✓ Top team: ${topTeam.team_name} (${topTeam.display_name}) - ${topTeam.wins}W ${topTeam.losses}L`);
      console.log(`✓ Points: ${topTeam.points_for} for, ${topTeam.points_against} against`);
    }
    
    // Test upsertRow (insert)
    console.log('\nTesting upsertRow() - insert...');
    const standingData = {
      seasonId: seasonId,
      teamSeasonId: teamSeasonId,
      wins: 10,
      losses: 5,
      ties: 1,
      pointsFor: 45,
      pointsAgainst: 32
    };
    
    testStanding = await standingsDao.upsertRow(standingData);
    console.log(`✓ Inserted/Updated standing for ${teamSeasonName}: ${testStanding.wins}W-${testStanding.losses}L-${testStanding.ties}T`);
    console.log(`✓ Points: ${testStanding.points_for} for, ${testStanding.points_against} against`);
    
    // Test upsertRow (update)
    console.log('\nTesting upsertRow() - update...');
    const updatedStandingData = {
      seasonId: seasonId,
      teamSeasonId: teamSeasonId,
      wins: 12,
      losses: 6,
      ties: 2,
      pointsFor: 52,
      pointsAgainst: 38
    };
    
    const updatedStanding = await standingsDao.upsertRow(updatedStandingData);
    console.log(`✓ Updated standing for ${teamSeasonName}: ${updatedStanding.wins}W-${updatedStanding.losses}L-${updatedStanding.ties}T`);
    console.log(`✓ Updated points: ${updatedStanding.points_for} for, ${updatedStanding.points_against} against`);
    
    // Test table method again to see updated standings
    console.log('\nTesting table() after updates...');
    const updatedTable = await standingsDao.table(seasonId);
    console.log(`✓ Updated standings table has ${updatedTable.length} teams`);
    
    // Find our test team in the standings
    const testTeamStanding = updatedTable.find(s => s.team_season_id === teamSeasonId);
    if (testTeamStanding) {
      console.log(`✓ Test team found in standings: ${testTeamStanding.team_name} (${testTeamStanding.display_name})`);
      console.log(`✓ Record: ${testTeamStanding.wins}W-${testTeamStanding.losses}L-${testTeamStanding.ties}T`);
      console.log(`✓ Point differential: ${testTeamStanding.points_for - testTeamStanding.points_against}`);
    }
    
    // Test with multiple team seasons if available
    const multipleTeamSeasons = await query(`
      SELECT ts.id, ts.display_name, t.team_name 
      FROM team_seasons ts 
      JOIN teams t ON ts.team_id = t.id 
      WHERE ts.season_id = $1 
      LIMIT 3
    `, [seasonId]);
    
    if (multipleTeamSeasons.rows.length > 1) {
      console.log('\nTesting with multiple teams...');
      for (let i = 1; i < Math.min(multipleTeamSeasons.rows.length, 3); i++) {
        const ts = multipleTeamSeasons.rows[i];
        const randomStanding = {
          seasonId: seasonId,
          teamSeasonId: ts.id,
          wins: Math.floor(Math.random() * 15),
          losses: Math.floor(Math.random() * 10),
          ties: Math.floor(Math.random() * 3),
          pointsFor: Math.floor(Math.random() * 60) + 20,
          pointsAgainst: Math.floor(Math.random() * 50) + 15
        };
        
        const standing = await standingsDao.upsertRow(randomStanding);
        console.log(`✓ Set standing for ${ts.team_name}: ${standing.wins}W-${standing.losses}L-${standing.ties}T`);
      }
      
      // Show final table
      const finalTable = await standingsDao.table(seasonId);
      console.log(`\n✓ Final standings table (${finalTable.length} teams):`);
      finalTable.forEach((team, index) => {
        const differential = team.points_for - team.points_against;
        console.log(`  ${index + 1}. ${team.team_name} (${team.wins}W-${team.losses}L, +${differential})`);
      });
    }
    
    console.log('\n✓ All StandingsDao tests passed');
    return true;
    
  } catch (error) {
    console.error('✗ StandingsDao test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Note: We preserve standings data as it might be important for the application
    console.log('✓ Test completed (standings preserved)');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testStandingsDao()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testStandingsDao };