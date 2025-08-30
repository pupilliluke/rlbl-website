/*
const { query } = require('../../lib/database');

async function showCompleteTeamSeasonsOutput() {
  console.log('=== Complete JSON Output from team_seasons Table ===');
  
  try {
    // Get all team_seasons data
    console.log('\n1. Raw team_seasons table data:');
    const teamSeasonsResult = await query('SELECT * FROM team_seasons ORDER BY id');
    console.log(JSON.stringify(teamSeasonsResult.rows, null, 2));
    
    // Get team_seasons with joined team data
    console.log('\n\n2. team_seasons joined with teams table:');
    const joinedResult = await query(`
      SELECT 
        ts.*,
        t.team_name,
        t.logo_url as team_logo_url,
        t.color as team_base_color,
        t.secondary_color as team_base_secondary_color
      FROM team_seasons ts
      JOIN teams t ON ts.team_id = t.id
      ORDER BY ts.id
    `);
    console.log(JSON.stringify(joinedResult.rows, null, 2));
    
    // Get team_seasons with season data
    console.log('\n\n3. team_seasons with season information:');
    const seasonJoinResult = await query(`
      SELECT 
        ts.*,
        t.team_name,
        s.season_name,
        s.is_active,
        s.start_date,
        s.end_date
      FROM team_seasons ts
      JOIN teams t ON ts.team_id = t.id
      JOIN seasons s ON ts.season_id = s.id
      ORDER BY ts.season_id, ts.id
    `);
    console.log(JSON.stringify(seasonJoinResult.rows, null, 2));
    
    // Get roster memberships for team_seasons
    console.log('\n\n4. team_seasons with roster memberships:');
    const rosterResult = await query(`
      SELECT 
        ts.id as team_season_id,
        ts.display_name,
        ts.season_id,
        t.team_name,
        COUNT(rm.player_id) as player_count,
        JSON_AGG(
          CASE 
            WHEN rm.player_id IS NOT NULL 
            THEN JSON_BUILD_OBJECT(
              'player_id', rm.player_id,
              'player_name', p.player_name,
              'gamertag', p.gamertag
            )
            ELSE NULL
          END
        ) FILTER (WHERE rm.player_id IS NOT NULL) as roster
      FROM team_seasons ts
      JOIN teams t ON ts.team_id = t.id
      LEFT JOIN roster_memberships rm ON ts.id = rm.team_season_id
      LEFT JOIN players p ON rm.player_id = p.id
      GROUP BY ts.id, ts.display_name, ts.season_id, t.team_name
      ORDER BY ts.season_id, ts.id
    `);
    console.log(JSON.stringify(rosterResult.rows, null, 2));
    
    console.log('\n=== Test Summary ===');
    console.log(`Total team_seasons records: ${teamSeasonsResult.rows.length}`);
    console.log(`Teams with season data: ${seasonJoinResult.rows.length}`);
    console.log(`Teams with roster data: ${rosterResult.rows.length}`);
    
    // Show unique seasons
    const uniqueSeasons = [...new Set(teamSeasonsResult.rows.map(row => row.season_id))];
    console.log(`Unique seasons represented: ${uniqueSeasons.join(', ')}`);
    
    // Show unique teams
    const uniqueTeams = [...new Set(teamSeasonsResult.rows.map(row => row.team_id))];
    console.log(`Unique teams represented: ${uniqueTeams.length} teams`);
    
  } catch (error) {
    console.error('Error fetching team_seasons data:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run if executed directly
if (require.main === module) {
  showCompleteTeamSeasonsOutput()
    .then(() => {
      console.log('\n✓ Complete team_seasons output displayed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to show team_seasons output:', error);
      process.exit(1);
    });
}

module.exports = { showCompleteTeamSeasonsOutput };*/
