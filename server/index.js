const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database functions
const { query, testConnection } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../build')));

// Test database connection on startup
testConnection();

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ message: 'Server and database running!', status: 'healthy' });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// Teams routes
app.get('/api/teams', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, team_name, logo_url, color, created_at 
      FROM teams 
      ORDER BY team_name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams', details: error.message });
  }
});

// Players routes
app.get('/api/players', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id, 
        p.player_name, 
        p.gamertag,
        t.team_name,
        t.color as team_color
      FROM players p
      LEFT JOIN player_seasons ps ON p.id = ps.player_id
      LEFT JOIN teams t ON ps.team_id = t.id
      ORDER BY t.team_name, p.player_name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players', details: error.message });
  }
});

// Schedule routes
app.get('/api/schedule', async (req, res) => {
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
        ht.logo_url as home_team_logo,
        at.team_name as away_team_name,
        at.color as away_team_color,
        at.logo_url as away_team_logo,
        CASE 
          WHEN g.home_score > g.away_score THEN ht.team_name
          WHEN g.away_score > g.home_score THEN at.team_name
          ELSE 'TIE'
        END as winner
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.id
      JOIN teams at ON g.away_team_id = at.id
      ORDER BY g.week, g.game_date
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule', details: error.message });
  }
});

// Standings routes
app.get('/api/standings', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        t.id,
        t.team_name,
        t.logo_url,
        t.color,
        s.wins,
        s.losses,
        s.ties,
        s.points_for,
        s.points_against,
        (s.points_for - s.points_against) as point_diff,
        ROUND((CAST(s.wins as FLOAT) / NULLIF(s.wins + s.losses + s.ties, 0)) * 100, 1) as win_percentage
      FROM standings s
      JOIN teams t ON s.team_id = t.id
      ORDER BY s.wins DESC, point_diff DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standings', details: error.message });
  }
});

// Power Rankings routes
app.get('/api/power-rankings', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pr.rank,
        pr.week,
        pr.reasoning,
        t.id as team_id,
        t.team_name,
        t.logo_url,
        t.color
      FROM power_rankings pr
      JOIN teams t ON pr.team_id = t.id
      WHERE pr.week = (SELECT MAX(week) FROM power_rankings)
      ORDER BY pr.rank
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch power rankings', details: error.message });
  }
});

// Stats routes
app.get('/api/stats', async (req, res) => {
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
        ROUND(CAST(SUM(pgs.points) as FLOAT) / NULLIF(COUNT(pgs.game_id), 0), 1) as avg_points_per_game
      FROM player_game_stats pgs
      JOIN players p ON pgs.player_id = p.id
      JOIN teams t ON pgs.team_id = t.id
      GROUP BY p.id, p.player_name, p.gamertag, t.team_name, t.color
      ORDER BY total_points DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// Test endpoint to run database tests
app.get('/api/test', async (req, res) => {
  try {
    const { testDatabaseData } = require('./test-database');
    
    // Capture console output
    const originalLog = console.log;
    let output = '';
    console.log = (...args) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };
    
    await testDatabaseData();
    console.log = originalLog;
    
    res.json({ 
      message: 'Database test completed successfully!', 
      output: output,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Catch all handler: send back React's index.html file (only for non-API routes)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Database file: ${path.join(__dirname, 'rocketleague.db')}`);
  console.log(`🔍 Test your API at: http://localhost:${PORT}/api/test`);
});