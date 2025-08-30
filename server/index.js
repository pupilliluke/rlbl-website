const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import DAO layer instead of direct database access
const {
  TeamsDao,
  PlayersDao,
  StandingsDao,
  PowerRankingsDao,
  PlayerGameStatsDao,
  GamesDao,
  SeasonsDao,
  RosterMembershipsDao
} = require('../backend/index');

// Initialize DAO instances
const teamsDao = new TeamsDao();
const playersDao = new PlayersDao();
const standingsDao = new StandingsDao();
const powerRankingsDao = new PowerRankingsDao();
const playerGameStatsDao = new PlayerGameStatsDao();
const gamesDao = new GamesDao();
const seasonsDao = new SeasonsDao();
const rosterMembershipsDao = new RosterMembershipsDao();

// Import database functions for health check only
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
    const teams = await teamsDao.findAll();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams', details: error.message });
  }
});

// Players routes
app.get('/api/players', async (req, res) => {
  try {
    const seasonId = req.query.season_id;
    const players = await playersDao.getAllPlayersWithTeams(seasonId);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players', details: error.message });
  }
});

// Schedule routes
app.get('/api/schedule', async (req, res) => {
  try {
    const schedule = await gamesDao.getScheduleWithTeams();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule', details: error.message });
  }
});

// Standings routes
app.get('/api/standings', async (req, res) => {
  try {
    const seasonId = req.query.season_id;
    const standings = await standingsDao.getStandingsWithTeams(seasonId);
    
    // Check for duplicate team names and add warnings
    const teamNameCounts = {};
    const duplicateWarnings = [];
    
    standings.forEach(team => {
      const name = team.team_name.toLowerCase().trim();
      teamNameCounts[name] = (teamNameCounts[name] || 0) + 1;
    });
    
    Object.keys(teamNameCounts).forEach(name => {
      if (teamNameCounts[name] > 1) {
        duplicateWarnings.push(`Duplicate team name detected: "${name}" (${teamNameCounts[name]} instances)`);
      }
    });
    
    // Add metadata to response
    const response = {
      standings: standings,
      metadata: {
        season_id: seasonId,
        total_teams: standings.length,
        duplicate_warnings: duplicateWarnings,
        has_duplicates: duplicateWarnings.length > 0
      }
    };
    
    // Log warnings to console for debugging
    if (duplicateWarnings.length > 0) {
      console.warn('⚠️  Duplicate team names found:', duplicateWarnings);
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standings', details: error.message });
  }
});

// Power Rankings routes
app.get('/api/power-rankings', async (req, res) => {
  try {
    const rankings = await powerRankingsDao.getLatestRankings();
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch power rankings', details: error.message });
  }
});

// Stats routes
app.get('/api/stats', async (req, res) => {
  try {
    const season = req.query.season;
    const stats = await playerGameStatsDao.getPlayerStatsWithTeams(season);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// Games/Schedule routes
app.get('/api/games', async (req, res) => {
  try {
    const seasonId = req.query.season_id;
    if (seasonId) {
      const games = await gamesDao.listBySeason(seasonId);
      res.json(games);
    } else {
      // For all games, use the schedule method
      const games = await gamesDao.getScheduleWithTeams();
      res.json(games);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games', details: error.message });
  }
});

app.get('/api/games/season/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;
    const games = await gamesDao.listBySeason(seasonId);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games for season', details: error.message });
  }
});

// Seasons routes
app.get('/api/seasons', async (req, res) => {
  try {
    const seasons = await seasonsDao.findAll();
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seasons', details: error.message });
  }
});

// Roster memberships routes
app.get('/api/roster-memberships/team/:teamId/season/:seasonId', async (req, res) => {
  try {
    const { teamId, seasonId } = req.params;
    
    // First, we need to get the team_season_id from the team_seasons table
    const teamSeasonResult = await query(
      'SELECT id FROM team_seasons WHERE team_id = $1 AND season_id = $2',
      [teamId, seasonId]
    );
    
    if (teamSeasonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team season combination not found' });
    }
    
    const teamSeasonId = teamSeasonResult.rows[0].id;
    const roster = await rosterMembershipsDao.listByTeamSeason(teamSeasonId);
    res.json(roster);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roster memberships', details: error.message });
  }
});

// Diagnostic endpoint to check data
app.get('/api/diagnostic', async (req, res) => {
  try {
    // Check table record counts
    const tables = ['teams', 'players', 'games', 'player_game_stats', 'standings'];
    const results = {};
    
    for (const table of tables) {
      try {
        const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
        results[table] = result.rows[0].count;
      } catch (error) {
        results[table] = `Error: ${error.message}`;
      }
    }
    
    // Check specific player_game_stats sample
    try {
      const sampleStats = await query('SELECT * FROM player_game_stats LIMIT 3');
      results.player_game_stats_sample = sampleStats.rows;
    } catch (error) {
      results.player_game_stats_sample = `Error: ${error.message}`;
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Diagnostic failed', details: error.message });
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