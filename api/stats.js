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

  const { season } = req.query;
  let seasonCondition = '';
  
  if (season && season !== 'career') {
    if (season === 'current') {
      seasonCondition = 'AND seasons.is_active = true';
    } else if (season && season.startsWith('season')) {
      const seasonNumber = season.replace('season', '');
      seasonCondition = `AND seasons.season_name ILIKE '%Season ${seasonNumber}%'`;
    } else if (season === 'season2_playoffs') {
      seasonCondition = `AND seasons.season_name ILIKE '%Season 2%playoff%'`;
    }
  } else if (!season || season === 'current') {
    seasonCondition = 'AND seasons.is_active = true';
  }
  // For 'career' or no season, show all data (no additional filter)

  try {
    const result = await query(`
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
        ROUND((CAST(SUM(pgs.points) as FLOAT) / NULLIF(COUNT(pgs.game_id), 0))::numeric, 1) as avg_points_per_game,
        ROUND((CAST(SUM(pgs.goals) as FLOAT) / NULLIF(COUNT(pgs.game_id), 0))::numeric, 1) as avg_goals_per_game,
        ROUND((CAST(SUM(pgs.saves) as FLOAT) / NULLIF(COUNT(pgs.game_id), 0))::numeric, 1) as avg_saves_per_game,
        seasons.season_name
      FROM player_game_stats pgs
      JOIN players p ON pgs.player_id = p.id
      JOIN games g ON pgs.game_id = g.id
      JOIN seasons ON g.season_id = seasons.id
      JOIN player_seasons ps ON ps.player_id = p.id AND ps.season_id = seasons.id
      JOIN teams t ON ps.team_id = t.id
      WHERE 1=1 ${seasonCondition}
      GROUP BY p.id, p.player_name, p.gamertag, t.team_name, t.color, seasons.season_name
      HAVING SUM(pgs.points) > 0
      ORDER BY total_points DESC, total_goals DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats', 
      details: error.message 
    });
  }
}