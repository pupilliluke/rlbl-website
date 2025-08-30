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
    // First try to get actual power rankings
    let result = await query(`
      SELECT 
        pr.rank,
        pr.week,
        pr.reasoning,
        t.team_name,
        t.color as team_color,
        seasons.season_name
      FROM power_rankings pr
      JOIN teams t ON pr.team_id = t.id
      JOIN seasons ON pr.season_id = seasons.id
      WHERE seasons.is_active = true 
        AND pr.week = (
          SELECT MAX(week) 
          FROM power_rankings pr2 
          JOIN seasons s2 ON pr2.season_id = s2.id 
          WHERE s2.is_active = true
        )
      ORDER BY pr.rank
    `);

    // If no power rankings exist, generate them from standings
    if (result.rows.length === 0) {
      result = await query(`
        SELECT 
          ROW_NUMBER() OVER (ORDER BY s.wins DESC, (s.points_for - s.points_against) DESC) as rank,
          1 as week,
          CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY s.wins DESC, (s.points_for - s.points_against) DESC) = 1 
              THEN 'Leading the pack with strong performance'
            WHEN ROW_NUMBER() OVER (ORDER BY s.wins DESC, (s.points_for - s.points_against) DESC) <= 3 
              THEN 'Consistent top-tier team'
            WHEN ROW_NUMBER() OVER (ORDER BY s.wins DESC, (s.points_for - s.points_against) DESC) <= 6 
              THEN 'Solid middle-tier performance'
            ELSE 'Working to improve standings'
          END as reasoning,
          t.team_name,
          t.color as team_color,
          seasons.season_name
        FROM standings s
        JOIN teams t ON s.team_id = t.id
        JOIN seasons ON s.season_id = seasons.id
        WHERE seasons.is_active = true
        ORDER BY s.wins DESC, (s.points_for - s.points_against) DESC
      `);
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch power rankings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch power rankings', 
      details: error.message 
    });
  }
}