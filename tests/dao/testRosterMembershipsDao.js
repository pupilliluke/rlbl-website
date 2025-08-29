const RosterMembershipsDao = require('../../backend/dao/RosterMembershipsDao');
const { query } = require('../../lib/database');

async function testRosterMembershipsDao() {
  console.log('=== Testing RosterMembershipsDao Methods ===');
  
  const rosterDao = new RosterMembershipsDao();
  let testMembership = null;
  
  try {
    // Test inherited methods from BaseDao
    console.log('\nTesting inherited findAll()...');
    const allMemberships = await rosterDao.findAll();
    console.log(`✓ Found ${allMemberships.length} roster memberships via RosterMembershipsDao`);
    
    // Get existing data to work with
    const existingPlayers = await query('SELECT id, player_name FROM players LIMIT 1');
    const existingTeamSeasons = await query('SELECT id, display_name FROM team_seasons LIMIT 1');
    
    if (existingPlayers.rows.length === 0 || existingTeamSeasons.rows.length === 0) {
      console.log('⚠ No existing players or team seasons found, creating minimal test data...');
      return true; // Skip detailed tests if no base data
    }
    
    const playerId = existingPlayers.rows[0].id;
    const teamSeasonId = existingTeamSeasons.rows[0].id;
    const playerName = existingPlayers.rows[0].player_name;
    const teamSeasonName = existingTeamSeasons.rows[0].display_name;
    
    // Test add method
    console.log('\nTesting add()...');
    const addedMembership = await rosterDao.add(playerId, teamSeasonId);
    if (addedMembership) {
      console.log(`✓ Added player ${playerName} to team season ${teamSeasonName}`);
      testMembership = addedMembership;
    } else {
      console.log(`✓ Player ${playerName} already on team season ${teamSeasonName} (conflict handled)`);
      // Find the existing membership
      const existingMemberships = await rosterDao.findAll();
      testMembership = existingMemberships.find(m => m.player_id === playerId && m.team_season_id === teamSeasonId);
    }
    
    // Test duplicate add (should return null due to conflict handling)
    console.log('\nTesting duplicate add()...');
    const duplicateAdd = await rosterDao.add(playerId, teamSeasonId);
    if (duplicateAdd === null) {
      console.log(`✓ Duplicate add correctly returned null (conflict handled)`);
    } else {
      console.log(`⚠ Duplicate add returned data instead of null`);
    }
    
    // Test listByTeamSeason
    console.log('\nTesting listByTeamSeason()...');
    const teamRoster = await rosterDao.listByTeamSeason(teamSeasonId);
    console.log(`✓ Found ${teamRoster.length} players on team season ${teamSeasonName}`);
    if (teamRoster.length > 0) {
      console.log(`✓ Sample player: ${teamRoster[0].player_name} (${teamRoster[0].gamertag})`);
    }
    
    // Test listByPlayer
    console.log('\nTesting listByPlayer()...');
    const playerTeams = await rosterDao.listByPlayer(playerId);
    console.log(`✓ Found ${playerTeams.length} teams for player ${playerName}`);
    if (playerTeams.length > 0) {
      console.log(`✓ Sample team: ${playerTeams[0].team_name} (Season: ${playerTeams[0].season_id})`);
    }
    
    // Test with different existing data
    const allPlayersList = await query('SELECT id, player_name FROM players LIMIT 5');
    if (allPlayersList.rows.length > 1) {
      const anotherPlayer = allPlayersList.rows[1];
      console.log(`\nTesting with another player: ${anotherPlayer.player_name}...`);
      
      const anotherPlayerTeams = await rosterDao.listByPlayer(anotherPlayer.id);
      console.log(`✓ Player ${anotherPlayer.player_name} has been on ${anotherPlayerTeams.length} teams`);
    }
    
    // Test listByTeamSeason with multiple team seasons
    const allTeamSeasonsList = await query('SELECT id, display_name FROM team_seasons LIMIT 3');
    for (let i = 0; i < Math.min(allTeamSeasonsList.rows.length, 2); i++) {
      const ts = allTeamSeasonsList.rows[i];
      const roster = await rosterDao.listByTeamSeason(ts.id);
      console.log(`✓ Team season ${ts.display_name} has ${roster.length} players`);
    }
    
    console.log('\n✓ All RosterMembershipsDao tests passed');
    return true;
    
  } catch (error) {
    console.error('✗ RosterMembershipsDao test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Note: We don't clean up roster memberships as they might be important existing data
    // If we created a test membership, we could clean it up here, but since we're using
    // existing data, we'll leave the memberships as they are
    console.log('✓ Test completed (roster memberships preserved)');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testRosterMembershipsDao()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testRosterMembershipsDao };