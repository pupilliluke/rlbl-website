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
      SELECT DISTINCT
        p.id,
        p.player_name,
        p.gamertag,
        t.team_name,
        t.color as team_color,
        s.season_name,
        p.created_at
      FROM players p
      LEFT JOIN player_seasons ps ON p.id = ps.player_id
      LEFT JOIN teams t ON ps.team_id = t.id
      LEFT JOIN seasons s ON ps.season_id = s.id
      WHERE s.is_active = true OR s.id IS NULL
      ORDER BY t.team_name, p.player_name
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch players:', error);
    res.status(500).json({ 
      error: 'Failed to fetch players', 
      details: error.message 
    });
  }
}