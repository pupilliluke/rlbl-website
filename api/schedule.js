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
    const result = await query(`
      SELECT 
        g.id,
        g.week,
        g.game_date,
        g.home_score,
        g.away_score,
        g.is_playoffs,
        ht.team_name as home_team_name,
        ht.color as home_team_color,
        at.team_name as away_team_name,
        at.color as away_team_color,
        CASE 
          WHEN g.home_score > g.away_score THEN ht.team_name
          WHEN g.away_score > g.home_score THEN at.team_name
          WHEN g.home_score = g.away_score AND g.home_score > 0 THEN 'TIE'
          ELSE null
        END as winner,
        seasons.season_name
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.id
      JOIN teams at ON g.away_team_id = at.id
      JOIN seasons ON g.season_id = seasons.id
      WHERE seasons.is_active = true
      ORDER BY g.week DESC, g.game_date DESC, g.id DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    res.status(500).json({ 
      error: 'Failed to fetch schedule', 
      details: error.message 
    });
  }
}