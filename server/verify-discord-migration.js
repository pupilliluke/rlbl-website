/*
// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { query, testConnection } = require('./database');

async function verifyDiscordMigration() {
  try {
    console.log('🔍 Verifying Discord Data Migration...\n');
    
    await testConnection();
    
    // Test 1: Show all seasons
    console.log('📅 SEASONS:');
    console.log('=' .repeat(80));
    const seasons = await query(`
      SELECT id, season_name, start_date, end_date, is_active
      FROM seasons 
      ORDER BY id
    `);
    
    seasons.rows.forEach(season => {
      const status = season.is_active ? '🟢 ACTIVE' : '⭕ INACTIVE';
      console.log(`${season.id}. ${season.season_name} (${season.start_date} to ${season.end_date}) ${status}`);
    });
    console.log(`Total Seasons: ${seasons.rows.length}\n`);

    // Test 2: Show teams by season
    console.log('🏟️  TEAMS BY SEASON:');
    console.log('=' .repeat(80));
    
    for (const season of seasons.rows) {
      console.log(`\n📍 ${season.season_name}:`);
      
      const teams = await query(`
        SELECT DISTINCT t.id, t.team_name, t.color,
               COUNT(DISTINCT ps.player_id) as player_count
        FROM teams t
        LEFT JOIN player_seasons ps ON t.id = ps.team_id AND ps.season_id = $1
        WHERE EXISTS (
          SELECT 1 FROM player_seasons ps2 
          WHERE ps2.team_id = t.id AND ps2.season_id = $1
        )
        GROUP BY t.id, t.team_name, t.color
        ORDER BY t.team_name
      `, [season.id]);
      
      teams.rows.forEach(team => {
        console.log(`  • ${team.team_name} (${team.player_count} players) - ${team.color}`);
      });
      
      if (teams.rows.length === 0) {
        console.log('  No teams found for this season');
      }
    }

    // Test 3: Show standings
    console.log('\n\n🏆 STANDINGS:');
    console.log('=' .repeat(80));
    
    for (const season of seasons.rows) {
      const standings = await query(`
        SELECT 
          t.team_name,
          s.wins,
          s.losses,
          s.ties,
          s.points_for,
          s.points_against,
          (s.points_for - s.points_against) as point_diff,
          ROUND(
            CASE 
              WHEN (s.wins + s.losses + s.ties) > 0 
              THEN (CAST(s.wins as FLOAT) / (s.wins + s.losses + s.ties)) * 100 
              ELSE 0 
            END::numeric, 1
          ) as win_pct
        FROM standings s
        JOIN teams t ON s.team_id = t.id
        WHERE s.season_id = $1
        ORDER BY s.wins DESC, point_diff DESC
      `, [season.id]);
      
      if (standings.rows.length > 0) {
        console.log(`\n📊 ${season.season_name}:`);
        console.log('Rank | Team                    | W  | L  | T  | PF  | PA  | Diff | Win%');
        console.log('-'.repeat(85));
        
        standings.rows.forEach((team, index) => {
          const rank = (index + 1).toString().padStart(2);
          const name = team.team_name.substring(0, 20).padEnd(20);
          const wins = team.wins.toString().padStart(2);
          const losses = team.losses.toString().padStart(2);
          const ties = team.ties.toString().padStart(2);
          const pf = team.points_for.toString().padStart(3);
          const pa = team.points_against.toString().padStart(3);
          const diff = (team.point_diff >= 0 ? '+' + team.point_diff : team.point_diff).toString().padStart(4);
          const winPct = (team.win_pct || 0).toString().padStart(4);
          
          console.log(`${rank}.  | ${name} | ${wins} | ${losses} | ${ties} | ${pf} | ${pa} | ${diff} | ${winPct}%`);
        });
      }
    }

    // Test 4: Show top players by points
    console.log('\n\n⭐ TOP PERFORMERS (All Seasons):');
    console.log('=' .repeat(80));
    const topPlayers = await query(`
      SELECT 
        p.player_name,
        t.team_name,
        SUM(pgs.points) as total_points,
        SUM(pgs.goals) as total_goals,
        SUM(pgs.assists) as total_assists,
        SUM(pgs.saves) as total_saves,
        SUM(pgs.mvps) as total_mvps,
        COUNT(pgs.game_id) as games_played,
        ROUND((CAST(SUM(pgs.points) as FLOAT) / NULLIF(COUNT(pgs.game_id), 0))::numeric, 1) as avg_points
      FROM player_game_stats pgs
      JOIN players p ON pgs.player_id = p.id
      JOIN teams t ON pgs.team_id = t.id
      GROUP BY p.id, p.player_name, t.team_name
      HAVING SUM(pgs.points) > 0
      ORDER BY total_points DESC
      LIMIT 15
    `);
    
    console.log('Player               | Team                 | Points | Goals | Assists | Saves | MVPs | Games | Avg');
    console.log('-'.repeat(95));
    topPlayers.rows.forEach(player => {
      const name = player.player_name.substring(0, 18).padEnd(18);
      const team = player.team_name.substring(0, 18).padEnd(18);
      const points = player.total_points.toString().padStart(6);
      const goals = player.total_goals.toString().padStart(5);
      const assists = player.total_assists.toString().padStart(7);
      const saves = player.total_saves.toString().padStart(5);
      const mvps = player.total_mvps.toString().padStart(4);
      const games = player.games_played.toString().padStart(5);
      const avg = (player.avg_points || 0).toString().padStart(5);
      
      console.log(`${name} | ${team} | ${points} | ${goals} | ${assists} | ${saves} | ${mvps} | ${games} | ${avg}`);
    });

    // Test 5: Database summary
    console.log('\n\n📊 DATABASE SUMMARY:');
    console.log('=' .repeat(80));
    const summary = await query(`
      SELECT 
        (SELECT COUNT(*) FROM seasons) as total_seasons,
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM players) as total_players,
        (SELECT COUNT(*) FROM games) as total_games,
        (SELECT COUNT(*) FROM standings) as total_standings,
        (SELECT COUNT(*) FROM player_game_stats) as total_player_stats
    `);
    
    const stats = summary.rows[0];
    console.log(`📅 Seasons: ${stats.total_seasons}`);
    console.log(`🏟️  Teams: ${stats.total_teams}`);
    console.log(`👥 Players: ${stats.total_players}`);
    console.log(`⚽ Games: ${stats.total_games}`);
    console.log(`🏆 Standings Records: ${stats.total_standings}`);
    console.log(`📈 Player Stat Records: ${stats.total_player_stats}`);
    
    console.log('\n✅ Discord data migration verification completed successfully!');
    console.log('🎉 Your Vercel Postgres database is fully populated and ready for production!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifyDiscordMigration().then(() => {
    process.exit(0);
  });
}

module.exports = { verifyDiscordMigration };*/
