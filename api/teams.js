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
        t.id,
        t.team_name,
        t.logo_url,
        t.color,
        t.created_at,
        COUNT(DISTINCT ps.player_id) as player_count
      FROM teams t
      LEFT JOIN player_seasons ps ON t.id = ps.team_id
      GROUP BY t.id, t.team_name, t.logo_url, t.color, t.created_at
      ORDER BY t.team_name
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    res.status(500).json({ 
      error: 'Failed to fetch teams', 
      details: error.message 
    });
  }
}