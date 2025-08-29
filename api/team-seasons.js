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
    const { season } = req.query;
    
    let sqlQuery = `
      SELECT 
        ts.team_season_id,
        ts.team_id,
        ts.season_id,
        t.team_name,
        t.logo_url,
        t.color,
        ts.created_at,
        s.season_name
      FROM team_seasons ts
      JOIN teams t ON ts.team_id = t.id
      JOIN seasons s ON ts.season_id = s.id
    `;
    
    let queryParams = [];
    
    if (season) {
      sqlQuery += ` WHERE ts.season_id = $1`;
      queryParams.push(season);
    }
    
    sqlQuery += ` ORDER BY s.id DESC, t.team_name`;

    const result = await query(sqlQuery, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch team seasons:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team seasons', 
      details: error.message 
    });
  }
}