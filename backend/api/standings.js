const express = require('express');
const router = express.Router();
const StandingsDao = require('../dao/StandingsDao');

const standingsDao = new StandingsDao();

// GET /standings - Get all standings with optional season filtering
router.get('/', async (req, res) => {
  try {
    const seasonId = req.query.season_id ? parseInt(req.query.season_id) : null;
    
    if (seasonId) {
      // Use the enhanced method that includes teams data
      const standings = await standingsDao.getStandingsWithTeams(seasonId);
      res.json(standings);
    } else {
      // Return all standings
      const standings = await standingsDao.findAll();
      res.json(standings);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standings', details: error.message });
  }
});

// GET /standings/:id - Get standing by ID
router.get('/:id', async (req, res) => {
  try {
    const standing = await standingsDao.findById(req.params.id);
    if (!standing) {
      return res.status(404).json({ error: 'Standing not found' });
    }
    res.json(standing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standing', details: error.message });
  }
});

// GET /standings/season/:seasonId - Get standings table for season
router.get('/season/:seasonId', async (req, res) => {
  try {
    const seasonId = parseInt(req.params.seasonId);
    // Use the enhanced method that includes team details and colors
    const standings = await standingsDao.getStandingsWithTeams(seasonId);
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standings table', details: error.message });
  }
});

// POST /standings - Create or update standings entry
router.post('/', async (req, res) => {
  try {
    const {
      season_id,
      team_season_id,
      wins = 0,
      losses = 0,
      ties = 0,
      points_for = 0,
      points_against = 0
    } = req.body;
    
    if (!season_id || !team_season_id) {
      return res.status(400).json({ 
        error: 'season_id and team_season_id are required' 
      });
    }

    const standingsData = {
      seasonId: parseInt(season_id),
      teamSeasonId: parseInt(team_season_id),
      wins: parseInt(wins),
      losses: parseInt(losses),
      ties: parseInt(ties),
      pointsFor: parseInt(points_for),
      pointsAgainst: parseInt(points_against)
    };

    const standing = await standingsDao.upsertRow(standingsData);
    res.status(201).json(standing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create/update standings', details: error.message });
  }
});

// PUT /standings/upsert - Upsert standings entry
router.put('/upsert', async (req, res) => {
  try {
    const {
      season_id,
      team_season_id,
      wins = 0,
      losses = 0,
      ties = 0,
      points_for = 0,
      points_against = 0
    } = req.body;
    
    if (!season_id || !team_season_id) {
      return res.status(400).json({ 
        error: 'season_id and team_season_id are required' 
      });
    }

    const standingsData = {
      seasonId: parseInt(season_id),
      teamSeasonId: parseInt(team_season_id),
      wins: parseInt(wins),
      losses: parseInt(losses),
      ties: parseInt(ties),
      pointsFor: parseInt(points_for),
      pointsAgainst: parseInt(points_against)
    };

    const standing = await standingsDao.upsertRow(standingsData);
    res.json(standing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upsert standings', details: error.message });
  }
});

// PUT /standings/:id - Update standings by ID
router.put('/:id', async (req, res) => {
  try {
    const {
      wins,
      losses,
      ties,
      points_for,
      points_against
    } = req.body;
    
    const updateData = {};
    if (wins !== undefined) updateData.wins = parseInt(wins);
    if (losses !== undefined) updateData.losses = parseInt(losses);
    if (ties !== undefined) updateData.ties = parseInt(ties);
    if (points_for !== undefined) updateData.points_for = parseInt(points_for);
    if (points_against !== undefined) updateData.points_against = parseInt(points_against);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const standing = await standingsDao.update(req.params.id, updateData);
    if (!standing) {
      return res.status(404).json({ error: 'Standing not found' });
    }
    res.json(standing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update standings', details: error.message });
  }
});

// DELETE /standings/:id - Delete standing
router.delete('/:id', async (req, res) => {
  try {
    const standing = await standingsDao.delete(req.params.id);
    if (!standing) {
      return res.status(404).json({ error: 'Standing not found' });
    }
    res.json({ message: 'Standing deleted successfully', standing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete standing', details: error.message });
  }
});

module.exports = router;