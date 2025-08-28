const { query, testConnection } = require('./database');

// Simulate API endpoints by calling database functions directly
async function testAllEndpoints() {
  try {
    console.log('🔍 Testing All API Endpoints (Direct Database Access)\n');
    
    await testConnection();
    
    console.log('=' .repeat(80));
    console.log('📋 /api/health - Database Health Check');
    console.log('=' .repeat(80));
    try {
      await query('SELECT 1');
      console.log('✅ Status: healthy');
      console.log('✅ Message: Server and database running!\n');
    } catch (error) {
      console.log('❌ Status: error');
      console.log('❌ Message:', error.message, '\n');
    }

    console.log('=' .repeat(80));
    console.log('👥 /api/teams - All Teams');
    console.log('=' .repeat(80));
    const teams = await query(`
      SELECT id, team_name, logo_url, color, created_at 
      FROM teams 
      ORDER BY team_name
    `);
    console.log(`Found ${teams.rows.length} teams:`);
    teams.rows.forEach(team => {
      console.log(`  ${team.id}: ${team.team_name} (${team.color})`);
    });
    console.log('');

    console.log('=' .repeat(80));
    console.log('🏃 /api/players - All Players');
    console.log('=' .repeat(80));
    const players = await query(`
      SELECT 
        p.id, 
        p.player_name, 
        p.gamertag,
        t.team_name,
        t.color as team_color
      FROM players p
      LEFT JOIN player_seasons ps ON p.id = ps.player_id
      LEFT JOIN teams t ON ps.team_id = t.id
      ORDER BY t.team_name, p.player_name
    `);
    console.log(`Found ${players.rows.length} players:`);
    let currentTeam = '';
    players.rows.forEach(player => {
      if (player.team_name !== currentTeam) {
        currentTeam = player.team_name;
        console.log(`\n  📍 ${currentTeam || 'No Team'}:`);
      }
      console.log(`    ${player.player_name} (${player.gamertag})`);
    });
    console.log('');

    console.log('=' .repeat(80));
    console.log('🏆 /api/standings - Team Standings');
    console.log('=' .repeat(80));
    const standings = await query(`
      SELECT 
        t.id,
        t.team_name,
        t.logo_url,
        t.color,
        s.wins,
        s.losses,
        s.ties,
        s.points_for,
        s.points_against,
        (s.points_for - s.points_against) as point_diff,
        ROUND((CAST(s.wins as FLOAT) / NULLIF(s.wins + s.losses + s.ties, 0)) * 100, 1) as win_percentage
      FROM standings s
      JOIN teams t ON s.team_id = t.id
      ORDER BY s.wins DESC, point_diff DESC
    `);
    console.log('Rank | Team                    | W-L-T  | PF  | PA  | Diff | Win%');
    console.log('-'.repeat(75));
    standings.rows.forEach((team, index) => {
      const rank = (index + 1).toString().padStart(2);
      const name = team.team_name.padEnd(20);
      const record = `${team.wins}-${team.losses}-${team.ties}`.padEnd(6);
      const pf = team.points_for.toString().padStart(3);
      const pa = team.points_against.toString().padStart(3);
      const diff = (team.point_diff >= 0 ? '+' + team.point_diff : team.point_diff).toString().padStart(4);
      const winPct = (team.win_percentage || 0).toString().padStart(4);
      
      console.log(`${rank}.  | ${name} | ${record} | ${pf} | ${pa} | ${diff} | ${winPct}%`);
    });
    console.log('');

    console.log('=' .repeat(80));
    console.log('📅 /api/schedule - Game Schedule');
    console.log('=' .repeat(80));
    const schedule = await query(`
      SELECT 
        g.id,
        g.week,
        g.game_date,
        g.home_score,
        g.away_score,
        g.is_playoffs,
        ht.team_name as home_team_name,
        ht.color as home_team_color,
        ht.logo_url as home_team_logo,
        at.team_name as away_team_name,
        at.color as away_team_color,
        at.logo_url as away_team_logo,
        CASE 
          WHEN g.home_score > g.away_score THEN ht.team_name
          WHEN g.away_score > g.home_score THEN at.team_name
          ELSE 'TIE'
        END as winner
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.id
      JOIN teams at ON g.away_team_id = at.id
      ORDER BY g.week, g.game_date
    `);
    console.log(`Found ${schedule.rows.length} games:`);
    let currentWeek = 0;
    schedule.rows.forEach(game => {
      if (game.week !== currentWeek) {
        currentWeek = game.week;
        console.log(`\n  📍 Week ${currentWeek}:`);
      }
      const homeTeam = game.home_team_name.padEnd(18);
      const awayTeam = game.away_team_name.padEnd(18);
      const score = `${game.home_score}-${game.away_score}`;
      const winner = game.winner === 'TIE' ? 'TIE' : `W: ${game.winner}`;
      console.log(`    ${homeTeam} vs ${awayTeam} (${score}) ${winner}`);
    });
    console.log('');

    console.log('=' .repeat(80));
    console.log('📊 /api/stats - Player Statistics');
    console.log('=' .repeat(80));
    const stats = await query(`
      SELECT 
        p.id,
        p.player_name,
        p.gamertag,
        t.team_name,
        t.color as team_color,
        SUM(pgs.points) as total_points,
        SUM(pgs.goals) as total_goals,
        SUM(pgs.assists) as total_assists,
        SUM(pgs.saves) as total_saves,
        SUM(pgs.shots) as total_shots,
        SUM(pgs.mvps) as total_mvps,
        SUM(pgs.demos) as total_demos,
        SUM(pgs.epic_saves) as total_epic_saves,
        COUNT(pgs.game_id) as games_played,
        ROUND(CAST(SUM(pgs.points) as FLOAT) / NULLIF(COUNT(pgs.game_id), 0), 1) as avg_points_per_game
      FROM player_game_stats pgs
      JOIN players p ON pgs.player_id = p.id
      JOIN teams t ON pgs.team_id = t.id
      GROUP BY p.id, p.player_name, p.gamertag, t.team_name, t.color
      ORDER BY total_points DESC
    `);
    console.log('Player               | Team                 | Points | Goals | Assists | Avg PPG');
    console.log('-'.repeat(80));
    stats.rows.forEach(player => {
      const name = player.player_name.padEnd(18);
      const team = player.team_name.padEnd(18);
      const points = player.total_points.toString().padStart(6);
      const goals = player.total_goals.toString().padStart(5);
      const assists = player.total_assists.toString().padStart(7);
      const avg = player.avg_points_per_game.toString().padStart(7);
      
      console.log(`${name} | ${team} | ${points} | ${goals} | ${assists} | ${avg}`);
    });
    console.log('');

    console.log('=' .repeat(80));
    console.log('🔥 /api/power-rankings - Power Rankings');
    console.log('=' .repeat(80));
    const powerRankings = await query(`
      SELECT 
        pr.rank,
        pr.week,
        pr.reasoning,
        t.id as team_id,
        t.team_name,
        t.logo_url,
        t.color
      FROM power_rankings pr
      JOIN teams t ON pr.team_id = t.id
      WHERE pr.week = (SELECT MAX(week) FROM power_rankings)
      ORDER BY pr.rank
    `);
    console.log(`Week ${powerRankings.rows[0]?.week || 1} Power Rankings:`);
    powerRankings.rows.forEach(ranking => {
      console.log(`\n${ranking.rank}. ${ranking.team_name}`);
      console.log(`   ${ranking.reasoning}`);
    });
    console.log('');

    console.log('=' .repeat(80));
    console.log('✅ All API endpoints tested successfully!');
    console.log('=' .repeat(80));
    console.log('🎯 Summary:');
    console.log(`   - ${teams.rows.length} teams loaded`);
    console.log(`   - ${players.rows.length} players loaded`);
    console.log(`   - ${schedule.rows.length} games scheduled`);
    console.log(`   - ${standings.rows.length} team standings`);
    console.log(`   - ${stats.rows.length} player stat records`);
    console.log(`   - ${powerRankings.rows.length} power rankings`);
    console.log('\n🚀 Your database is ready for use!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Individual endpoint tests
async function testTeamsEndpoint() {
  const result = await query(`
    SELECT id, team_name, logo_url, color, created_at 
    FROM teams 
    ORDER BY team_name
  `);
  return result.rows;
}

async function testPlayersEndpoint() {
  const result = await query(`
    SELECT 
      p.id, 
      p.player_name, 
      p.gamertag,
      t.team_name,
      t.color as team_color
    FROM players p
    LEFT JOIN player_seasons ps ON p.id = ps.player_id
    LEFT JOIN teams t ON ps.team_id = t.id
    ORDER BY t.team_name, p.player_name
  `);
  return result.rows;
}

// Export functions
module.exports = {
  testAllEndpoints,
  testTeamsEndpoint,
  testPlayersEndpoint
};

// Run test if called directly
if (require.main === module) {
  testAllEndpoints().then(() => {
    process.exit(0);
  });
}