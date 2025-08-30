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
    // Test database connection
    const result = await query('SELECT NOW() as current_time, COUNT(*) as teams FROM teams');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      database: 'connected',
      teams_count: parseInt(result.rows[0].teams)
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      database: 'disconnected'
    });
  }
}