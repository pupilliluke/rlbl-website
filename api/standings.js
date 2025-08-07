// Load environment variables
const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Query helper function
const query = (text, params) => {
  return pool.query(text, params);
};

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
        seasons.season_name
      FROM standings s
      JOIN teams t ON s.team_id = t.id
      JOIN seasons ON s.season_id = seasons.id
      WHERE seasons.is_active = true
      ORDER BY s.wins DESC, point_differential DESC, t.team_name
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch standings', 
      details: error.message 
    });
  }
}