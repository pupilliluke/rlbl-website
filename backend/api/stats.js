const express = require('express');
const router = express.Router();
const PlayerGameStatsDao = require('../dao/PlayerGameStatsDao');

const playerGameStatsDao = new PlayerGameStatsDao();

// GET /stats - Get aggregated player statistics
router.get('/', async (req, res) => {
  try {
    const { season } = req.query;
    
    // Convert season parameter to seasonId for getPlayerStatsWithTeams
    let seasonId = null;
    if (season && season !== 'career') {
      if (season === 'current') {
        seasonId = 3; // Current season
      } else if (season && season.startsWith('season')) {
        const seasonNumber = season.replace('season', '');
        seasonId = parseInt(seasonNumber);
      } else if (season === 'season2_playoffs') {
        seasonId = 2; // Season 2 for playoffs
      }
    }
    // For 'career' or no season, seasonId stays null to show all data

    const stats = await playerGameStatsDao.getPlayerStatsWithTeams(seasonId);
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// GET /stats/player/:playerId - Get stats for specific player
router.get('/player/:playerId', async (req, res) => {
  try {
    const { season } = req.query;
    const stats = await playerGameStatsDao.getPlayerStats(parseInt(req.params.playerId), season);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player stats', details: error.message });
  }
});

// GET /stats/team/:teamId - Get stats for specific team
router.get('/team/:teamId', async (req, res) => {
  try {
    const { season } = req.query;
    const stats = await playerGameStatsDao.getTeamStats(parseInt(req.params.teamId), season);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team stats', details: error.message });
  }
});

module.exports = router;