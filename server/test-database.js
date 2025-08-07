const { query, testConnection } = require('./database-sqlite');

// Test functions to display database data
async function testDatabaseData() {
  try {
    console.log('🔍 Testing Database Data...\n');
    
    await testConnection();
    
    // Test 1: Show all teams
    console.log('📋 TEAMS:');
    console.log('=' .repeat(80));
    const teams = await query(`
      SELECT id, team_name, color, logo_url 
      FROM teams 
      ORDER BY team_name
    `);
    
    teams.rows.forEach(team => {
      console.log(`ID: ${team.id} | Name: ${team.team_name} | Color: ${team.color}`);
    });
    console.log(`Total Teams: ${teams.rows.length}\n`);

    // Test 2: Show all players with their teams
    console.log('👥 PLAYERS:');
    console.log('=' .repeat(80));
    const players = await query(`
      SELECT p.id, p.player_name, p.gamertag, t.team_name
      FROM players p
      LEFT JOIN player_seasons ps ON p.id = ps.player_id
      LEFT JOIN teams t ON ps.team_id = t.id
      ORDER BY t.team_name, p.player_name
    `);
    
    players.rows.forEach(player => {
      console.log(`${player.player_name} (${player.gamertag}) - Team: ${player.team_name || 'No Team'}`);
    });
    console.log(`Total Players: ${players.rows.length}\n`);

    // Test 3: Show current standings
    console.log('🏆 STANDINGS:');
    console.log('=' .repeat(80));
    const standings = await query(`
      SELECT 
        t.team_name,
        s.wins,
        s.losses,
        s.ties,
        s.points_for,
        s.points_against,
        (s.points_for - s.points_against) as point_diff,
        ROUND((CAST(s.wins as FLOAT) / (s.wins + s.losses + s.ties)) * 100, 1) as win_pct
      FROM standings s
      JOIN teams t ON s.team_id = t.id
      ORDER BY s.wins DESC, point_diff DESC
    `);
    
    console.log('Team                    | W  | L  | T  | PF  | PA  | Diff | Win%');
    console.log('-'.repeat(80));
    standings.rows.forEach((team, index) => {
      const rank = index + 1;
      const name = team.team_name.padEnd(20);
      const wins = team.wins.toString().padStart(2);
      const losses = team.losses.toString().padStart(2);
      const ties = team.ties.toString().padStart(2);
      const pf = team.points_for.toString().padStart(3);
      const pa = team.points_against.toString().padStart(3);
      const diff = (team.point_diff >= 0 ? '+' + team.point_diff : team.point_diff).toString().padStart(4);
      const winPct = (team.win_pct || 0).toString().padStart(4);
      
      console.log(`${rank}. ${name} | ${wins} | ${losses} | ${ties} | ${pf} | ${pa} | ${diff} | ${winPct}%`);
    });
    console.log('');

    // Test 4: Show recent games
    console.log('⚽ RECENT GAMES:');
    console.log('=' .repeat(80));
    const games = await query(`
      SELECT 
        g.week,
        g.game_date,
        ht.team_name as home_team,
        g.home_score,
        at.team_name as away_team,
        g.away_score,
        CASE 
          WHEN g.home_score > g.away_score THEN ht.team_name
          WHEN g.away_score > g.home_score THEN at.team_name
          ELSE 'TIE'
        END as winner
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.id
      JOIN teams at ON g.away_team_id = at.id
      ORDER BY g.week DESC, g.game_date DESC
      LIMIT 10
    `);
    
    games.rows.forEach(game => {
      const homeTeam = game.home_team.padEnd(20);
      const awayTeam = game.away_team.padEnd(20);
      const winner = game.winner === 'TIE' ? 'TIE' : `Winner: ${game.winner}`;
      console.log(`Week ${game.week}: ${homeTeam} ${game.home_score} - ${game.away_score} ${awayTeam} (${winner})`);
    });
    console.log('');

    // Test 5: Show power rankings
    console.log('🔥 POWER RANKINGS:');
    console.log('=' .repeat(80));
    const powerRankings = await query(`
      SELECT 
        pr.rank,
        t.team_name,
        pr.reasoning,
        pr.week
      FROM power_rankings pr
      JOIN teams t ON pr.team_id = t.id
      WHERE pr.week = (SELECT MAX(week) FROM power_rankings)
      ORDER BY pr.rank
    `);
    
    powerRankings.rows.forEach(ranking => {
      console.log(`${ranking.rank}. ${ranking.team_name}`);
      console.log(`   ${ranking.reasoning}`);
      console.log('');
    });

    // Test 6: Show top performers
    console.log('⭐ TOP PERFORMERS:');
    console.log('=' .repeat(80));
    const topScorers = await query(`
      SELECT 
        p.player_name,
        t.team_name,
        SUM(pgs.points) as total_points,
        SUM(pgs.goals) as total_goals,
        SUM(pgs.assists) as total_assists,
        SUM(pgs.saves) as total_saves,
        COUNT(pgs.game_id) as games_played,
        ROUND(CAST(SUM(pgs.points) as FLOAT) / COUNT(pgs.game_id), 1) as avg_points
      FROM player_game_stats pgs
      JOIN players p ON pgs.player_id = p.id
      JOIN teams t ON pgs.team_id = t.id
      GROUP BY p.id, p.player_name, t.team_name
      ORDER BY total_points DESC
      LIMIT 10
    `);
    
    console.log('Player               | Team                 | Points | Goals | Assists | Saves | Games | Avg');
    console.log('-'.repeat(90));
    topScorers.rows.forEach(player => {
      const name = player.player_name.padEnd(18);
      const team = player.team_name.padEnd(18);
      const points = player.total_points.toString().padStart(6);
      const goals = player.total_goals.toString().padStart(5);
      const assists = player.total_assists.toString().padStart(7);
      const saves = player.total_saves.toString().padStart(5);
      const games = player.games_played.toString().padStart(5);
      const avg = player.avg_points.toString().padStart(5);
      
      console.log(`${name} | ${team} | ${points} | ${goals} | ${assists} | ${saves} | ${games} | ${avg}`);
    });
    console.log('');

    // Summary stats
    console.log('📊 DATABASE SUMMARY:');
    console.log('=' .repeat(80));
    const summary = await query(`
      SELECT 
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM players) as total_players,
        (SELECT COUNT(*) FROM games) as total_games,
        (SELECT COUNT(*) FROM player_game_stats) as total_stats,
        (SELECT COUNT(*) FROM seasons WHERE is_active = 1) as active_seasons
    `);
    
    const stats = summary.rows[0];
    console.log(`Teams: ${stats.total_teams}`);
    console.log(`Players: ${stats.total_players}`);
    console.log(`Games: ${stats.total_games}`);
    console.log(`Player Stats Records: ${stats.total_stats}`);
    console.log(`Active Seasons: ${stats.active_seasons}`);
    
    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Individual test functions
async function testTeams() {
  const teams = await query('SELECT * FROM teams ORDER BY team_name');
  console.log('Teams:', teams.rows);
  return teams.rows;
}

async function testPlayers() {
  const players = await query(`
    SELECT p.*, t.team_name 
    FROM players p 
    LEFT JOIN player_seasons ps ON p.id = ps.player_id 
    LEFT JOIN teams t ON ps.team_id = t.id
  `);
  console.log('Players:', players.rows);
  return players.rows;
}

async function testStandings() {
  const standings = await query(`
    SELECT s.*, t.team_name 
    FROM standings s 
    JOIN teams t ON s.team_id = t.id 
    ORDER BY s.wins DESC
  `);
  console.log('Standings:', standings.rows);
  return standings.rows;
}

async function testGames() {
  const games = await query(`
    SELECT g.*, ht.team_name as home_team, at.team_name as away_team
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    ORDER BY g.week, g.game_date
  `);
  console.log('Games:', games.rows);
  return games.rows;
}

// Export functions
module.exports = {
  testDatabaseData,
  testTeams,
  testPlayers,
  testStandings,
  testGames
};

// Run test if called directly
if (require.main === module) {
  testDatabaseData().then(() => {
    process.exit(0);
  });
}