const express = require('express');
const router = express.Router();
const PlayerGameStatsDao = require('../dao/PlayerGameStatsDao');

const playerGameStatsDao = new PlayerGameStatsDao();

// GET /stats - Get aggregated player statistics
router.get('/', async (req, res) => {
  try {
    const { season, playoffs } = req.query;

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

    // Parse playoffs parameter
    let isPlayoffs = null;
    if (playoffs === 'true') {
      isPlayoffs = true;
    } else if (playoffs === 'false') {
      isPlayoffs = false;
    }

    const stats = await playerGameStatsDao.getPlayerStatsWithTeams(seasonId, isPlayoffs);
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

// GET /stats/export/:seasonId - Export stats as CSV
router.get('/export/:seasonId', async (req, res) => {
  try {
    const seasonId = parseInt(req.params.seasonId);
    const { playoffs } = req.query;

    // Parse playoffs parameter
    let isPlayoffs = null;
    if (playoffs === 'true') {
      isPlayoffs = true;
    } else if (playoffs === 'false') {
      isPlayoffs = false;
    }

    const stats = await playerGameStatsDao.getPlayerStatsWithTeams(seasonId, isPlayoffs);

    // Generate CSV matching Excel framework exactly
    const csvRows = [];

    // Header row 1 - Category headers
    csvRows.push(',,,OFFENSIVE STATS,,,,,,,DEFENSIVE STATS,,,,,DEMOS,,PER GAME / EFFICIENCY,,,');

    // Header row 2 - Column headers
    const headers = [
      'Player',
      'Team',
      'Points',
      'Goals',
      'Assists',
      'Shots',
      'MVP',
      'OTG',
      'SH%',
      'Saves',
      'Epic Saves',
      'Epic Save %',
      'SVPG',
      'Demos',
      'Demo/Game',
      'PPG',
      'GPG',
      'APG',
      'Games Played'
    ];
    csvRows.push(headers.join(','));

    // Data rows
    stats.forEach(player => {
      const shotsValue = parseInt(player.total_shots) || 0;
      const goalsValue = parseInt(player.total_goals) || 0;
      const savesValue = parseInt(player.total_saves) || 0;
      const epicSavesValue = parseInt(player.total_epic_saves) || 0;
      const demosValue = parseInt(player.total_demos) || 0;
      const gamesPlayed = parseInt(player.games_played) || 1;

      // Calculate percentages
      const shootingPct = shotsValue > 0 ? ((goalsValue / shotsValue) * 100).toFixed(1) + '%' : '0.0%';
      const epicSavePct = savesValue > 0 ? ((epicSavesValue / savesValue) * 100).toFixed(2) + '%' : '0.00%';

      // Calculate per-game stats
      const svpg = (savesValue / gamesPlayed).toFixed(2);
      const demoPerGame = (demosValue / gamesPlayed).toFixed(2);
      const ppg = parseFloat(player.avg_points_per_game || 0).toFixed(2);
      const gpg = parseFloat(player.avg_goals_per_game || 0).toFixed(2);
      const apg = parseFloat(player.avg_assists_per_game || 0).toFixed(2);

      const row = [
        `"${player.player_name}"`,
        `"${player.team_name}"`,
        player.total_points || 0,
        player.total_goals || 0,
        player.total_assists || 0,
        player.total_shots || 0,
        player.total_mvps || 0,
        0, // OTG (overtime goals) - not currently tracked
        shootingPct,
        player.total_saves || 0,
        player.total_epic_saves || 0,
        epicSavePct,
        svpg,
        player.total_demos || 0,
        demoPerGame,
        ppg,
        gpg,
        apg,
        player.games_played || 0
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="season_${seasonId}_stats.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Failed to export stats:', error);
    res.status(500).json({ error: 'Failed to export stats', details: error.message });
  }
});

module.exports = router;