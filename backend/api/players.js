const express = require('express');
const router = express.Router();
const PlayersDao = require('../dao/PlayersDao');

const playersDao = new PlayersDao();

// GET /players - Get all players with optional team information
router.get('/', async (req, res) => {
  try {
    const seasonId = req.query.season_id;
    
    if (seasonId) {
      // Get players with team information for specific season
      const players = await playersDao.getAllPlayersWithTeams(seasonId);
      res.json(players);
    } else {
      // Get all players with team information (current season or all-time)
      const players = await playersDao.getAllPlayersWithTeams();
      res.json(players);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players', details: error.message });
  }
});

// GET /players/:id - Get player by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await playersDao.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player', details: error.message });
  }
});

// GET /players/gamertag/:gamertag - Get player by gamertag
router.get('/gamertag/:gamertag', async (req, res) => {
  try {
    const player = await playersDao.findByGamertag(req.params.gamertag);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player by gamertag', details: error.message });
  }
});

// GET /players/search/:query - Search players by name
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const players = await playersDao.searchByName(query, { limit, offset });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search players', details: error.message });
  }
});

// GET /players/:id/teams/:seasonId - Get teams for player in specific season
router.get('/:id/teams/:seasonId', async (req, res) => {
  try {
    const teams = await playersDao.getTeamsBySeason(req.params.id, req.params.seasonId);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player teams', details: error.message });
  }
});

// POST /players - Create new player
router.post('/', async (req, res) => {
  try {
    const { player_name, gamertag } = req.body;
    
    if (!player_name || !gamertag) {
      return res.status(400).json({ error: 'player_name and gamertag are required' });
    }

    const playerData = {
      player_name,
      gamertag
    };

    const player = await playersDao.create(playerData);
    res.status(201).json(player);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Player with this gamertag already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create player', details: error.message });
    }
  }
});

// PUT /players/:id - Update player
router.put('/:id', async (req, res) => {
  try {
    const { player_name, gamertag } = req.body;
    
    const updateData = {};
    if (player_name !== undefined) updateData.player_name = player_name;
    if (gamertag !== undefined) updateData.gamertag = gamertag;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const player = await playersDao.update(req.params.id, updateData);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Player with this gamertag already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update player', details: error.message });
    }
  }
});

// DELETE /players/:id - Delete player
router.delete('/:id', async (req, res) => {
  try {
    const player = await playersDao.delete(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ message: 'Player deleted successfully', player });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player', details: error.message });
  }
});

module.exports = router;