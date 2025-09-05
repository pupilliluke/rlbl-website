const express = require('express');
const router = express.Router();

// Import all API route modules
const teamsRouter = require('./teams');
const playersRouter = require('./players');
const seasonsRouter = require('./seasons');
const teamSeasonsRouter = require('./teamSeasons');
const rosterMembershipsRouter = require('./rosterMemberships');
const gamesRouter = require('./games');
const playerGameStatsRouter = require('./playerGameStats');
const standingsRouter = require('./standings');
const powerRankingsRouter = require('./powerRankings');
const bracketsRouter = require('./brackets');
const usersRouter = require('./users');
const statsRouter = require('./stats');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rocket League API is running',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Rocket League Backend API',
    version: '1.0.0',
    description: 'RESTful API for Rocket League league management system',
    endpoints: {
      teams: '/api/teams',
      players: '/api/players', 
      seasons: '/api/seasons',
      teamSeasons: '/api/team-seasons',
      rosterMemberships: '/api/roster-memberships',
      games: '/api/games',
      playerGameStats: '/api/player-game-stats',
      standings: '/api/standings',
      powerRankings: '/api/power-rankings',
      brackets: '/api/brackets',
      users: '/api/users',
      stats: '/api/stats'
    },
    health: '/api/health'
  });
});

// Mount all route modules
router.use('/teams', teamsRouter);
router.use('/players', playersRouter);
router.use('/seasons', seasonsRouter);
router.use('/team-seasons', teamSeasonsRouter);
router.use('/team_seasons', teamSeasonsRouter); // Alias for frontend compatibility
router.use('/roster-memberships', rosterMembershipsRouter);
router.use('/games', gamesRouter);
router.use('/player-game-stats', playerGameStatsRouter);
router.use('/standings', standingsRouter);
router.use('/power-rankings', powerRankingsRouter);
router.use('/brackets', bracketsRouter);
router.use('/users', usersRouter);
router.use('/stats', statsRouter);

// 404 handler for undefined API routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: {
      teams: '/api/teams',
      players: '/api/players',
      seasons: '/api/seasons',
      teamSeasons: '/api/team-seasons',
      rosterMemberships: '/api/roster-memberships',
      games: '/api/games',
      playerGameStats: '/api/player-game-stats',
      standings: '/api/standings',
      powerRankings: '/api/power-rankings',
      brackets: '/api/brackets',
      users: '/api/users',
      stats: '/api/stats'
    }
  });
});

module.exports = router;