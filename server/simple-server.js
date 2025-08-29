const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
const { query, testConnection } = require('./database');

// Gracefully handle database connection issues
let databaseConnected = false;
const initializeDatabase = async () => {
  try {
    await testConnection();
    console.log('📊 Database connected and ready');
    databaseConnected = true;
  } catch (error) {
    console.warn('⚠️  Database connection failed, running in mock mode');
    databaseConnected = false;
  }
};

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
testConnection();

console.log('Setting up API routes...');

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ message: 'Server and database running!', status: 'healthy' });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const season = req.query.season || null;
    console.log('Teams API called with season:', season);
    
    // Handle current season (Season 3 - not started)
    if (season === 'current') {
      console.log('Returning empty array for current season teams');
      return res.json([]);
    }
    
    let teamsQuery;
    let params = [];
    
    if (season) {
      // Map season names to season IDs or conditions
      let seasonCondition;
      
      if (season === 'season1') {
        seasonCondition = "(s.season_name = 'Season 1' OR s.season_name = 'Fall 2024')";
      } else if (season === 'season2') {
        seasonCondition = "(s.season_name = 'Season 2' OR s.season_name = 'Spring 2025')";
      } else if (season === 'season2_playoffs') {
        seasonCondition = "(s.season_name = 'Season 2' OR s.season_name = 'Spring 2025')";
        // Note: For playoffs, we might want additional filtering if playoff teams are tracked differently
      } else if (season === 'career') {
        // For career, show active season teams
        seasonCondition = "s.is_active = true";
      } else {
        seasonCondition = "s.is_active = true";
      }
      
      // Always pull from team_seasons table for consistency - include all fields
      teamsQuery = `
        SELECT 
          ts.id as team_season_id,
          ts.team_id,
          ts.season_id,
          COALESCE(ts.display_name, t.team_name) as team_name,
          ts.display_name,
          COALESCE(ts.alt_logo_url, t.logo_url) as logo_url,
          ts.alt_logo_url,
          COALESCE(ts.primary_color, t.color) as primary_color,
          COALESCE(ts.primary_color, t.color) as color,
          ts.secondary_color,
          ts.ranking,
          ts.created_at,
          ts.updated_at,
          t.team_name as original_team_name,
          t.logo_url as original_logo_url,
          t.color as original_color,
          s.season_name,
          s.is_active as season_is_active
        FROM team_seasons ts
        INNER JOIN teams t ON ts.team_id = t.id
        INNER JOIN seasons s ON ts.season_id = s.id
        WHERE ${seasonCondition}
        ORDER BY COALESCE(ts.ranking, 999), COALESCE(ts.display_name, t.team_name)
      `;
      console.log('Using seasonal query:', teamsQuery);
    } else {
      // Get teams for active season (default) - always use team_seasons structure with all fields
      teamsQuery = `
        SELECT 
          ts.id as team_season_id,
          ts.team_id,
          ts.season_id,
          COALESCE(ts.display_name, t.team_name) as team_name,
          ts.display_name,
          COALESCE(ts.alt_logo_url, t.logo_url) as logo_url,
          ts.alt_logo_url,
          COALESCE(ts.primary_color, t.color) as primary_color,
          COALESCE(ts.primary_color, t.color) as color,
          ts.secondary_color,
          ts.ranking,
          ts.created_at,
          ts.updated_at,
          t.team_name as original_team_name,
          t.logo_url as original_logo_url,
          t.color as original_color,
          s.season_name,
          s.is_active as season_is_active
        FROM team_seasons ts
        INNER JOIN teams t ON ts.team_id = t.id
        INNER JOIN seasons s ON ts.season_id = s.id
        WHERE s.is_active = true
        ORDER BY COALESCE(ts.ranking, 999), COALESCE(ts.display_name, t.team_name)
      `;
    }
    
    const result = await query(teamsQuery, params);
    console.log(`Teams API: Fetched ${result.rows.length} teams for season ${season || 'active'}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Teams API Error:', error);
    res.status(500).json({ error: 'Failed to fetch teams', details: error.message });
  }
});

app.get('/api/players', async (req, res) => {
  try {
    const seasonId = req.query.season || null;
    
    // Build query dynamically to avoid template string issues
    let baseQuery = `
      SELECT 
        p.id, 
        p.player_name, 
        p.gamertag,
        t.id as team_id,
        ts.id as team_season_id,
        COALESCE(ts.display_name, t.team_name, 'Free Agent') as team_name,
        COALESCE(ts.primary_color, t.color, '#808080') as team_color,
        ts.season_id,
        ts.alt_logo_url
      FROM players p
      LEFT JOIN roster_memberships rm ON p.id = rm.player_id
      LEFT JOIN team_seasons ts ON rm.team_season_id = ts.id
      LEFT JOIN teams t ON ts.team_id = t.id`;
    
    let params = [];
    
    if (seasonId && seasonId !== 'current') {
      baseQuery += ' WHERE (ts.season_id = $1 OR ts.season_id IS NULL)';
      params = [seasonId];
    } else {
      baseQuery += ' WHERE (ts.season_id = (SELECT id FROM seasons WHERE is_active = true) OR ts.season_id IS NULL)';
    }
    
    baseQuery += `
      ORDER BY 
        CASE WHEN ts.display_name IS NULL THEN 1 ELSE 0 END,
        ts.display_name, 
        p.player_name`;

    const result = await query(baseQuery, params);
    
    console.log(`Players API: Fetched ${result.rows.length} players for season ${seasonId || 'current'}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Players API Error:', error);
    res.status(500).json({ error: 'Failed to fetch players', details: error.message });
  }
});

app.get('/api/standings', async (req, res) => {
  try {
    const seasonId = req.query.season || null;
    
    let baseQuery = `
      SELECT 
        t.id,
        ts.display_name as team_name,
        ts.alt_logo_url as logo_url,
        ts.primary_color as color,
        s.wins,
        s.losses,
        s.ties,
        s.points_for,
        s.points_against,
        (s.points_for - s.points_against) as point_diff,
        ROUND(((CAST(s.wins as FLOAT) / NULLIF(s.wins + s.losses + s.ties, 0)) * 100)::numeric, 1) as win_percentage
      FROM standings s
      JOIN team_seasons ts ON s.team_season_id = ts.id
      JOIN teams t ON ts.team_id = t.id`;
    
    let params = [];
    
    if (seasonId && seasonId !== 'current') {
      baseQuery += ' WHERE ts.season_id = $1';
      params = [seasonId];
    } else {
      baseQuery += ' WHERE ts.season_id = (SELECT id FROM seasons WHERE is_active = true)';
    }
    
    baseQuery += ' ORDER BY s.wins DESC, point_diff DESC';
    
    const result = await query(baseQuery, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standings', details: error.message });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const seasonId = req.query.season || null;
    
    let baseQuery = `
      SELECT 
        g.id,
        g.week,
        g.game_date,
        g.home_score,
        g.away_score,
        g.is_playoffs,
        hts.display_name as home_team_name,
        hts.primary_color as home_team_color,
        hts.alt_logo_url as home_team_logo,
        ats.display_name as away_team_name,
        ats.primary_color as away_team_color,
        ats.alt_logo_url as away_team_logo,
        CASE 
          WHEN g.home_score > g.away_score THEN hts.display_name
          WHEN g.away_score > g.home_score THEN ats.display_name
          ELSE 'TIE'
        END as winner
      FROM games g
      JOIN team_seasons hts ON g.home_team_season_id = hts.id
      JOIN team_seasons ats ON g.away_team_season_id = ats.id`;
    
    let params = [];
    
    if (seasonId && seasonId !== 'current') {
      baseQuery += ' WHERE g.season_id = $1';
      params = [seasonId];
    } else {
      baseQuery += ' WHERE g.season_id = (SELECT id FROM seasons WHERE is_active = true)';
    }
    
    baseQuery += ' ORDER BY g.week, g.game_date';
    
    const result = await query(baseQuery, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule', details: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const season = req.query.season;
    console.log('Fetching stats for season:', season);
    
    // Handle current season (Season 3 - not started)
    if (season === 'current') {
      console.log('Returning empty array for current season');
      return res.json([]);
    }
    
    let statsQuery;
    let params = [];
    
    // Handle career stats (all seasons aggregate)
    if (season === 'career') {
      console.log('Fetching career stats from database');
      statsQuery = `
        SELECT 
          p.id,
          p.player_name,
          p.gamertag,
          'Career Total' as team_name,
          '#999999' as team_color,
          COALESCE(SUM(pgs.points), 0) as total_points,
          COALESCE(SUM(pgs.goals), 0) as total_goals,
          COALESCE(SUM(pgs.assists), 0) as total_assists,
          COALESCE(SUM(pgs.saves), 0) as total_saves,
          COALESCE(SUM(pgs.shots), 0) as total_shots,
          COALESCE(SUM(pgs.mvps), 0) as total_mvps,
          COALESCE(SUM(pgs.demos), 0) as total_demos,
          COALESCE(SUM(pgs.epic_saves), 0) as total_epic_saves,
          COALESCE(COUNT(DISTINCT pgs.game_id), 0) as games_played,
          COALESCE(ROUND((CAST(COALESCE(SUM(pgs.points), 0) as FLOAT) / NULLIF(COUNT(DISTINCT pgs.game_id), 0))::numeric, 1), 0) as avg_points_per_game
        FROM players p
        LEFT JOIN player_game_stats pgs ON pgs.player_id = p.id
        GROUP BY p.id, p.player_name, p.gamertag
        ORDER BY total_points DESC
      `;
    }
    // Handle specific seasons
    else if (season) {
      console.log('Fetching season-specific stats from database for:', season);
      
      // Map season names to season IDs
      let seasonCondition;
      if (season === 'season1') {
        seasonCondition = "s.season_name = 'Season 1' OR s.season_name = 'Fall 2024'";
      } else if (season === 'season2') {
        seasonCondition = "s.season_name = 'Season 2' OR s.season_name = 'Spring 2025'";
      } else if (season === 'season2_playoffs') {
        seasonCondition = "(s.season_name = 'Season 2' OR s.season_name = 'Spring 2025') AND g.is_playoffs = true";
      } else {
        seasonCondition = "s.is_active = true";
      }
      
      statsQuery = `
        SELECT 
          p.id,
          p.player_name,
          p.gamertag,
          COALESCE(ts.display_name, t.team_name, 'Free Agent') as team_name,
          COALESCE(ts.primary_color, t.color, '#666666') as team_color,
          COALESCE(SUM(pgs.points), 0) as total_points,
          COALESCE(SUM(pgs.goals), 0) as total_goals,
          COALESCE(SUM(pgs.assists), 0) as total_assists,
          COALESCE(SUM(pgs.saves), 0) as total_saves,
          COALESCE(SUM(pgs.shots), 0) as total_shots,
          COALESCE(SUM(pgs.mvps), 0) as total_mvps,
          COALESCE(SUM(pgs.demos), 0) as total_demos,
          COALESCE(SUM(pgs.epic_saves), 0) as total_epic_saves,
          COALESCE(COUNT(DISTINCT pgs.game_id), 0) as games_played,
          COALESCE(ROUND((CAST(COALESCE(SUM(pgs.points), 0) as FLOAT) / NULLIF(COUNT(DISTINCT pgs.game_id), 0))::numeric, 1), 0) as avg_points_per_game
        FROM players p
        LEFT JOIN player_game_stats pgs ON pgs.player_id = p.id
        LEFT JOIN games g ON pgs.game_id = g.id
        LEFT JOIN seasons s ON g.season_id = s.id
        LEFT JOIN team_seasons ts ON pgs.team_season_id = ts.id
        LEFT JOIN teams t ON ts.team_id = t.id
        WHERE (${seasonCondition} OR pgs.player_id IS NULL)
        GROUP BY p.id, p.player_name, p.gamertag, ts.display_name, t.team_name, ts.primary_color, t.color
        ORDER BY total_points DESC
      `;
    }
    // Default: return current database stats
    else {
      console.log('Fetching current season stats from database');
      statsQuery = `
        SELECT 
          p.id,
          p.player_name,
          p.gamertag,
          COALESCE(ts.display_name, t.team_name, 'Free Agent') as team_name,
          COALESCE(ts.primary_color, t.color, '#666666') as team_color,
          COALESCE(SUM(pgs.points), 0) as total_points,
          COALESCE(SUM(pgs.goals), 0) as total_goals,
          COALESCE(SUM(pgs.assists), 0) as total_assists,
          COALESCE(SUM(pgs.saves), 0) as total_saves,
          COALESCE(SUM(pgs.shots), 0) as total_shots,
          COALESCE(SUM(pgs.mvps), 0) as total_mvps,
          COALESCE(SUM(pgs.demos), 0) as total_demos,
          COALESCE(SUM(pgs.epic_saves), 0) as total_epic_saves,
          COALESCE(COUNT(DISTINCT pgs.game_id), 0) as games_played,
          COALESCE(ROUND((CAST(COALESCE(SUM(pgs.points), 0) as FLOAT) / NULLIF(COUNT(DISTINCT pgs.game_id), 0))::numeric, 1), 0) as avg_points_per_game
        FROM players p
        LEFT JOIN player_game_stats pgs ON pgs.player_id = p.id
        LEFT JOIN games g ON pgs.game_id = g.id
        LEFT JOIN seasons s ON g.season_id = s.id
        LEFT JOIN team_seasons ts ON pgs.team_season_id = ts.id
        LEFT JOIN teams t ON ts.team_id = t.id
        WHERE (s.is_active = true OR pgs.player_id IS NULL)
        GROUP BY p.id, p.player_name, p.gamertag, ts.display_name, t.team_name, ts.primary_color, t.color
        ORDER BY total_points DESC
      `;
    }
    
    const result = await query(statsQuery, params);
    console.log(`Fetched ${result.rows.length} player stats from database`);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch stats from database:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

app.get('/api/power-rankings', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pr.rank,
        pr.week,
        pr.reasoning,
        t.id as team_id,
        ts.display_name as team_name,
        ts.alt_logo_url as logo_url,
        ts.primary_color as color
      FROM power_rankings pr
      JOIN team_seasons ts ON pr.team_season_id = ts.id
      JOIN teams t ON ts.team_id = t.id
      WHERE pr.week = (SELECT MAX(week) FROM power_rankings)
        AND ts.season_id = (SELECT id FROM seasons WHERE is_active = true)
      ORDER BY pr.rank
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch power rankings', details: error.message });
  }
});

// Games API endpoints
app.get('/api/games', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        g.id,
        g.week,
        g.game_date,
        g.home_score,
        g.away_score,
        g.is_playoffs,
        g.season_id,
        hts.display_name as home_display,
        hts.primary_color as home_team_color,
        hts.alt_logo_url as home_team_logo,
        ats.display_name as away_display,
        ats.primary_color as away_team_color,
        ats.alt_logo_url as away_team_logo
      FROM games g
      JOIN team_seasons hts ON g.home_team_season_id = hts.id
      JOIN team_seasons ats ON g.away_team_season_id = ats.id
      ORDER BY g.season_id DESC, g.week, g.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games', details: error.message });
  }
});

app.get('/api/games/season/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;
    const result = await query(`
      SELECT 
        g.id,
        g.week,
        g.game_date,
        g.home_score,
        g.away_score,
        g.is_playoffs,
        g.season_id,
        hts.display_name as home_display,
        hts.primary_color as home_team_color,
        hts.alt_logo_url as home_team_logo,
        ats.display_name as away_display,
        ats.primary_color as away_team_color,
        ats.alt_logo_url as away_team_logo
      FROM games g
      JOIN team_seasons hts ON g.home_team_season_id = hts.id
      JOIN team_seasons ats ON g.away_team_season_id = ats.id
      WHERE g.season_id = $1
      ORDER BY g.week, g.id
    `, [seasonId]);
    console.log(`Games API: Fetched ${result.rows.length} games for season ${seasonId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Games API Error:', error);
    res.status(500).json({ error: 'Failed to fetch games', details: error.message });
  }
});

app.get('/api/games/season/:seasonId/week/:week', async (req, res) => {
  try {
    const { seasonId, week } = req.params;
    const result = await query(`
      SELECT 
        g.id,
        g.week,
        g.game_date,
        g.home_score,
        g.away_score,
        g.is_playoffs,
        g.season_id,
        hts.display_name as home_display,
        hts.primary_color as home_team_color,
        hts.alt_logo_url as home_team_logo,
        ats.display_name as away_display,
        ats.primary_color as away_team_color,
        ats.alt_logo_url as away_team_logo
      FROM games g
      JOIN team_seasons hts ON g.home_team_season_id = hts.id
      JOIN team_seasons ats ON g.away_team_season_id = ats.id
      WHERE g.season_id = $1 AND g.week = $2
      ORDER BY g.id
    `, [seasonId, week]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games', details: error.message });
  }
});

// Simple test route
app.get('/api/test-simple', (req, res) => {
  res.json({ message: 'Simple test works!' });
});

// Get team-seasons data (hyphenated version)
app.get('/api/team-seasons', async (req, res) => {
  console.log('Team-seasons endpoint called');
  try {
    const seasonId = req.query.season || null;
    
    let baseQuery = `
      SELECT 
        ts.id as team_season_id,
        ts.team_id,
        ts.season_id,
        ts.display_name,
        ts.primary_color,
        ts.secondary_color,
        ts.alt_logo_url,
        ts.ranking,
        ts.created_at,
        ts.updated_at,
        t.team_name as original_team_name,
        t.logo_url as original_logo_url,
        t.color as original_color,
        s.season_name,
        s.is_active as season_is_active
      FROM team_seasons ts
      JOIN teams t ON ts.team_id = t.id
      JOIN seasons s ON ts.season_id = s.id`;
    
    let params = [];
    
    if (seasonId) {
      baseQuery += ' WHERE ts.season_id = $1';
      params.push(seasonId);
    }
    
    baseQuery += ' ORDER BY s.id DESC, t.team_name';
    
    const result = await query(baseQuery, params);
    console.log(`Team-seasons API: Fetched ${result.rows.length} team_seasons records for season ${seasonId || 'all'}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Team-seasons API Error:', error);
    res.status(500).json({ error: 'Failed to fetch team-seasons', details: error.message });
  }
});

// Get team_seasons data
app.get('/api/team_seasons', async (req, res) => {
  console.log('Team_seasons endpoint called');
  try {
    const seasonId = req.query.season || null;
    const teamId = req.query.team || null;
    
    let baseQuery = `
      SELECT 
        ts.id,
        ts.team_id,
        ts.season_id,
        ts.display_name,
        ts.alt_logo_url,
        ts.primary_color,
        ts.secondary_color,
        ts.ranking,
        ts.created_at,
        ts.updated_at,
        t.team_name as original_team_name,
        t.logo_url as original_logo_url,
        t.color as original_color,
        s.season_name,
        s.is_active as season_is_active
      FROM team_seasons ts
      JOIN teams t ON ts.team_id = t.id
      JOIN seasons s ON ts.season_id = s.id`;
    
    let params = [];
    let whereConditions = [];
    
    if (seasonId) {
      whereConditions.push('ts.season_id = $' + (params.length + 1));
      params.push(seasonId);
    }
    
    if (teamId) {
      whereConditions.push('ts.team_id = $' + (params.length + 1));
      params.push(teamId);
    }
    
    if (whereConditions.length > 0) {
      baseQuery += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    baseQuery += ' ORDER BY s.id DESC, t.team_name';
    
    // Log the exact SQL being executed
    console.log('🔍 EXECUTING SQL QUERY:');
    console.log('Query:', baseQuery);
    console.log('Params:', params);
    
    const result = await query(baseQuery, params);
    console.log(`Team_seasons API: Fetched ${result.rows.length} team_seasons records`);
    
    // Log first record to see what fields are returned
    if (result.rows.length > 0) {
      console.log('🔍 FIRST RECORD FIELDS:');
      console.log('Available fields:', Object.keys(result.rows[0]));
      console.log('Sample record:', JSON.stringify(result.rows[0], null, 2));
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Team_seasons API Error:', error);
    res.status(500).json({ error: 'Failed to fetch team_seasons', details: error.message });
  }
});

// Get seasons a team has participated in
app.get('/api/teams/:teamId/seasons', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // For now, return mock data based on team
    const teamSeasonData = {
      '1': ['2024', '2023', '2022'], // Non Chalant
      '2': ['2024', '2023'], // Pen15 Club
      '3': ['2024', '2023', '2022'], // MJ
      '4': ['2024', '2023'], // Drunken Goats
      '5': ['2024'], // Chicken Jockey
      '6': ['2024', '2023', '2022'], // Backdoor Bandits
      '7': ['2024', '2023'], // Jakeing It
      '8': ['2024', '2023', '2022'], // Mid Boost
      '9': ['2024'], // Nick Al Nite
      '10': ['2024', '2023'], // Double Bogey
      '11': ['2024'], // Bronny James
      '12': ['2024', '2023'], // The Chopped Trees
      '13': ['2024'] // The Shock
    };
    
    const seasons = teamSeasonData[teamId] || ['2024'];
    res.json({ teamId, seasons });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team seasons', details: error.message });
  }
});

// Get seasons a player has participated in
app.get('/api/players/:playerId/seasons', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // For now, return mock data - most players active in recent seasons
    const seasons = ['2024', '2023', '2022'];
    res.json({ playerId, seasons });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player seasons', details: error.message });
  }
});

// Get team stats for a specific season
app.get('/api/teams/:teamSlug/stats', async (req, res) => {
  try {
    const { teamSlug } = req.params;
    const { season = '2024' } = req.query;
    
    // Mock season-specific data
    const seasonData = {
      '2024': {
        wins: 8, losses: 4, ties: 1,
        pointsFor: 45, pointsAgainst: 32,
        goalsFor: 38, goalsAgainst: 25
      },
      '2023': {
        wins: 6, losses: 6, ties: 2,
        pointsFor: 38, pointsAgainst: 38,
        goalsFor: 30, goalsAgainst: 30
      },
      '2022': {
        wins: 4, losses: 8, ties: 0,
        pointsFor: 28, pointsAgainst: 48,
        goalsFor: 22, goalsAgainst: 40
      }
    };
    
    const stats = seasonData[season] || seasonData['2024'];
    res.json({ teamSlug, season, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team stats', details: error.message });
  }
});

// Update player data
app.put('/api/players/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { player_name, gamertag, team_id } = req.body;
    
    // For now, simulate a successful update since we have database connection issues
    // In production with proper database, this would update the actual database
    console.log(`Simulating player update: ID ${id}, Name: ${player_name}, Gamertag: ${gamertag}`);
    
    const mockUpdatedPlayer = {
      id: parseInt(id),
      player_name,
      gamertag,
      team_id: team_id || null,
      updated_at: new Date().toISOString()
    };
    
    res.json({ 
      message: 'Player updated successfully (simulated)', 
      player: mockUpdatedPlayer 
    });
    
    // Uncomment below for actual database implementation:
    /*
    const result = await query(`
      UPDATE players 
      SET player_name = $1, gamertag = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [player_name, gamertag, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // If team_id is provided, update the roster_memberships table
    if (team_id) {
      await query(`
        UPDATE roster_memberships rm
        SET team_season_id = (
          SELECT ts.id FROM team_seasons ts 
          WHERE ts.team_id = $1 AND ts.season_id = (SELECT id FROM seasons WHERE is_active = true)
        )
        WHERE rm.player_id = $2
      `, [team_id, id]);
    }
    
    res.json({ 
      message: 'Player updated successfully', 
      player: result.rows[0] 
    });
    */
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player', details: error.message });
  }
});

// Add new player
app.post('/api/players', async (req, res) => {
  try {
    const { player_name, gamertag, team_id } = req.body;
    
    const result = await query(`
      INSERT INTO players (player_name, gamertag, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `, [player_name, gamertag]);
    
    const newPlayer = result.rows[0];
    
    // Add to roster_memberships if team_id provided
    if (team_id) {
      await query(`
        INSERT INTO roster_memberships (player_id, team_season_id)
        SELECT $1, ts.id 
        FROM team_seasons ts 
        WHERE ts.team_id = $2 AND ts.season_id = (SELECT id FROM seasons WHERE is_active = true)
      `, [newPlayer.id, team_id]);
    }
    
    res.json({ 
      message: 'Player created successfully', 
      player: newPlayer 
    });
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ error: 'Failed to create player', details: error.message });
  }
});

// Delete player
app.delete('/api/players/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete related records
    await query('DELETE FROM player_game_stats WHERE player_id = $1', [id]);
    await query('DELETE FROM roster_memberships WHERE player_id = $1', [id]);
    
    const result = await query('DELETE FROM players WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ 
      message: 'Player deleted successfully', 
      player: result.rows[0] 
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player', details: error.message });
  }
});

app.get('/api/test', async (req, res) => {
  try {
    const { testDatabaseData } = require('./test-database');
    
    // Capture console output
    const originalLog = console.log;
    let output = '';
    console.log = (...args) => {
      output += args.join(' ') + '\n';
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

// Raw database inspection endpoint
app.get('/api/inspect-team-seasons', async (req, res) => {
  try {
    console.log('🔍 Inspecting team_seasons table...');
    
    // Check table schema
    const schemaQuery = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'team_seasons'
      ORDER BY ordinal_position
    `);
    
    // Get raw data
    const rawData = await query('SELECT * FROM team_seasons WHERE season_id = 3 LIMIT 3');
    
    // Test specific columns
    let secondaryColorTest = null;
    try {
      secondaryColorTest = await query('SELECT id, display_name, secondary_color, ranking FROM team_seasons WHERE season_id = 3 LIMIT 1');
    } catch (error) {
      secondaryColorTest = { error: error.message };
    }
    
    res.json({
      schema: schemaQuery.rows,
      rawData: rawData.rows,
      secondaryColorTest: secondaryColorTest.error || secondaryColorTest.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Inspection failed:', error);
    res.status(500).json({ error: 'Inspection failed', details: error.message });
  }
});

app.get('/api/debug', async (req, res) => {
  try {
    console.log('🔍 Debug endpoint called - checking data availability');
    
    // Check seasons
    const seasons = await query('SELECT * FROM seasons ORDER BY id');
    console.log('Seasons found:', seasons.rows.length);
    
    // Check active season
    const activeSeason = await query('SELECT * FROM seasons WHERE is_active = true');
    console.log('Active season:', activeSeason.rows.length ? activeSeason.rows[0] : 'None');
    
    // Check data counts
    const standingsCount = await query('SELECT COUNT(*) as count FROM standings');
    const gamesCount = await query('SELECT COUNT(*) as count FROM games');
    const statsCount = await query('SELECT COUNT(*) as count FROM player_game_stats');
    const powerRankingsCount = await query('SELECT COUNT(*) as count FROM power_rankings');
    
    res.json({
      seasons: seasons.rows,
      activeSeason: activeSeason.rows[0] || null,
      dataCounts: {
        standings: standingsCount.rows[0].count,
        games: gamesCount.rows[0].count,
        playerGameStats: statsCount.rows[0].count,
        powerRankings: powerRankingsCount.rows[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Debug failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Initialize database in background without blocking server startup
  initializeDatabase().finally(() => {
    console.log(`🔄 Server ready with ${databaseConnected ? 'database' : 'mock'} mode`);
    console.log(`\n🔗 Test your API endpoints:`);
    console.log(`   http://localhost:${PORT}/api/health`);
    console.log(`   http://localhost:${PORT}/api/teams`);
    console.log(`   http://localhost:${PORT}/api/players`);
    console.log(`   http://localhost:${PORT}/api/standings`);
    console.log(`   http://localhost:${PORT}/api/schedule`);
    console.log(`   http://localhost:${PORT}/api/stats`);
    console.log(`   http://localhost:${PORT}/api/power-rankings`);
    console.log(`   http://localhost:${PORT}/api/test`);
  });
});