const express = require('express');
const router = express.Router();
const SeasonsDao = require('../dao/SeasonsDao');

const seasonsDao = new SeasonsDao();

// GET /seasons - Get all seasons with pagination
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const seasons = await seasonsDao.list({ limit, offset });
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seasons', details: error.message });
  }
});

// GET /seasons/all - Get all seasons without pagination
router.get('/all', async (req, res) => {
  try {
    const seasons = await seasonsDao.findAll();
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all seasons', details: error.message });
  }
});

// GET /seasons/active - Get active season
router.get('/active', async (req, res) => {
  try {
    const activeSeason = await seasonsDao.getActive();
    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found' });
    }
    res.json(activeSeason);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active season', details: error.message });
  }
});

// GET /seasons/:id - Get season by ID
router.get('/:id', async (req, res) => {
  try {
    const season = await seasonsDao.findById(req.params.id);
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    res.json(season);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch season', details: error.message });
  }
});

// POST /seasons - Create new season
router.post('/', async (req, res) => {
  try {
    const { season_name, start_date, end_date, is_active } = req.body;
    
    if (!season_name) {
      return res.status(400).json({ error: 'season_name is required' });
    }

    const seasonData = {
      season_name,
      start_date: start_date || null,
      end_date: end_date || null,
      is_active: is_active || false
    };

    const season = await seasonsDao.create(seasonData);
    res.status(201).json(season);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create season', details: error.message });
  }
});

// PUT /seasons/:id - Update season
router.put('/:id', async (req, res) => {
  try {
    const { season_name, start_date, end_date, is_active } = req.body;
    
    const updateData = {};
    if (season_name !== undefined) updateData.season_name = season_name;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const season = await seasonsDao.update(req.params.id, updateData);
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    res.json(season);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update season', details: error.message });
  }
});

// POST /seasons/:id/activate - Set season as active
router.post('/:id/activate', async (req, res) => {
  try {
    const season = await seasonsDao.setActive(req.params.id);
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    res.json({ message: 'Season activated successfully', season });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate season', details: error.message });
  }
});

// DELETE /seasons/:id - Delete season
router.delete('/:id', async (req, res) => {
  try {
    const season = await seasonsDao.delete(req.params.id);
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    res.json({ message: 'Season deleted successfully', season });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete season', details: error.message });
  }
});

module.exports = router;