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
    // Get season filter from query params
    const seasonId = req.query.season_id;
    
    // Build WHERE clause based on season filter
    let whereClause = '';
    let queryParams = [];
    
    if (seasonId) {
      whereClause = 'WHERE seasons.id = $1';
      queryParams = [seasonId];
    } else {
      whereClause = 'WHERE seasons.is_active = true';
    }

    const result = await query(`
      WITH ranked_standings AS (
        SELECT 
          s.id,
          t.team_name,
          t.color as team_color,
          s.wins,
          s.losses,
          s.ties,
          s.points_for,
          s.points_against,
          (s.points_for - s.points_against) as point_differential,
          (s.wins + s.losses + s.ties) as games_played,
          ROUND(
            CASE 
              WHEN (s.wins + s.losses + s.ties) > 0 
              THEN (CAST(s.wins as FLOAT) / (s.wins + s.losses + s.ties)) * 100 
              ELSE 0 
            END::numeric, 1
          ) as win_percentage,
          seasons.season_name,
          s.season_id,
          ROW_NUMBER() OVER (
            PARTITION BY t.team_name, s.season_id 
            ORDER BY s.id DESC
          ) as rn
        FROM standings s
        JOIN teams t ON s.team_id = t.id
        JOIN seasons ON s.season_id = seasons.id
        ${whereClause}
      )
      SELECT 
        id,
        team_name,
        team_color,
        wins,
        losses,
        ties,
        points_for,
        points_against,
        point_differential,
        games_played,
        win_percentage,
        season_name,
        season_id
      FROM ranked_standings 
      WHERE rn = 1
      ORDER BY wins DESC, point_differential DESC, team_name
    `, queryParams);

    // Process standings data
    const standings = result.rows;

    // Create metadata object
    const metadata = {
      total_teams: standings.length,
      has_duplicates: false,
      duplicate_warnings: [],
      season_id: seasonId || null
    };

    // Return standings with metadata
    res.status(200).json({
      standings: standings.map(team => ({
        id: team.id,
        team_name: team.team_name,
        color: team.team_color,
        wins: team.wins,
        losses: team.losses,
        ties: team.ties,
        points_for: team.points_for,
        points_against: team.points_against,
        point_diff: team.point_differential,
        games_played: team.games_played,
        win_percentage: team.win_percentage,
        season_name: team.season_name
      })),
      metadata
    });
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch standings', 
      details: error.message 
    });
  }
}