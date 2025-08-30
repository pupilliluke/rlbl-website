/*
// Import shared database configuration
const { query } = require('../lib/database');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get database summary
    const summary = await query(`
      SELECT 
        (SELECT COUNT(*) FROM seasons) as total_seasons,
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM players) as total_players,
        (SELECT COUNT(*) FROM games) as total_games,
        (SELECT COUNT(*) FROM standings) as total_standings,
        (SELECT COUNT(*) FROM player_game_stats) as total_player_stats,
        NOW() as current_time
    `);

    // Get active season info
    const activeSeason = await query(`
      SELECT season_name, start_date, end_date 
      FROM seasons 
      WHERE is_active = true 
      LIMIT 1
    `);

    // Get top 5 teams
    const topTeams = await query(`
      SELECT t.team_name, s.wins, s.losses, s.ties
      FROM standings s
      JOIN teams t ON s.team_id = t.id
      JOIN seasons seas ON s.season_id = seas.id
      WHERE seas.is_active = true
      ORDER BY s.wins DESC, (s.points_for - s.points_against) DESC
      LIMIT 5
    `);

    const testResults = {
      status: 'success',
      timestamp: summary.rows[0].current_time,
      database_summary: {
        seasons: parseInt(summary.rows[0].total_seasons),
        teams: parseInt(summary.rows[0].total_teams),
        players: parseInt(summary.rows[0].total_players),
        games: parseInt(summary.rows[0].total_games),
        standings_records: parseInt(summary.rows[0].total_standings),
        player_stats_records: parseInt(summary.rows[0].total_player_stats)
      },
      active_season: activeSeason.rows[0] || null,
      top_teams: topTeams.rows,
      api_endpoints_available: [
        '/api/health',
        '/api/teams', 
        '/api/players',
        '/api/standings',
        '/api/schedule',
        '/api/stats',
        '/api/power-rankings',
        '/api/test'
      ]
    };

    res.status(200).json(testResults);
  } catch (error) {
    console.error('Test endpoint failed:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Test endpoint failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}*/
