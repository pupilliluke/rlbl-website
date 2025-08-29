const express = require('express');
const router = express.Router();
const PowerRankingsDao = require('../dao/PowerRankingsDao');

const powerRankingsDao = new PowerRankingsDao();

// GET /power-rankings - Get all power rankings
router.get('/', async (req, res) => {
  try {
    const rankings = await powerRankingsDao.findAll();
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch power rankings', details: error.message });
  }
});

// GET /power-rankings/:id - Get power ranking by ID
router.get('/:id', async (req, res) => {
  try {
    const ranking = await powerRankingsDao.findById(req.params.id);
    if (!ranking) {
      return res.status(404).json({ error: 'Power ranking not found' });
    }
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch power ranking', details: error.message });
  }
});

// GET /power-rankings/season/:seasonId/week/:week - Get power rankings for specific week
router.get('/season/:seasonId/week/:week', async (req, res) => {
  try {
    const seasonId = parseInt(req.params.seasonId);
    const week = parseInt(req.params.week);
    
    const rankings = await powerRankingsDao.listByWeek(seasonId, week);
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch power rankings for week', details: error.message });
  }
});

// POST /power-rankings - Create or update power ranking
router.post('/', async (req, res) => {
  try {
    const {
      season_id,
      week,
      team_season_id,
      rank,
      reasoning
    } = req.body;
    
    if (!season_id || week === undefined || !team_season_id || rank === undefined) {
      return res.status(400).json({ 
        error: 'season_id, week, team_season_id, and rank are required' 
      });
    }

    const rankingData = {
      seasonId: parseInt(season_id),
      week: parseInt(week),
      teamSeasonId: parseInt(team_season_id),
      rank: parseInt(rank),
      reasoning: reasoning || null
    };

    const ranking = await powerRankingsDao.upsertRow(rankingData);
    res.status(201).json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create/update power ranking', details: error.message });
  }
});

// PUT /power-rankings/upsert - Upsert power ranking
router.put('/upsert', async (req, res) => {
  try {
    const {
      season_id,
      week,
      team_season_id,
      rank,
      reasoning
    } = req.body;
    
    if (!season_id || week === undefined || !team_season_id || rank === undefined) {
      return res.status(400).json({ 
        error: 'season_id, week, team_season_id, and rank are required' 
      });
    }

    const rankingData = {
      seasonId: parseInt(season_id),
      week: parseInt(week),
      teamSeasonId: parseInt(team_season_id),
      rank: parseInt(rank),
      reasoning: reasoning || null
    };

    const ranking = await powerRankingsDao.upsertRow(rankingData);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upsert power ranking', details: error.message });
  }
});

// PUT /power-rankings/:id - Update power ranking by ID
router.put('/:id', async (req, res) => {
  try {
    const {
      rank,
      reasoning
    } = req.body;
    
    const updateData = {};
    if (rank !== undefined) updateData.rank = parseInt(rank);
    if (reasoning !== undefined) updateData.reasoning = reasoning;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const ranking = await powerRankingsDao.update(req.params.id, updateData);
    if (!ranking) {
      return res.status(404).json({ error: 'Power ranking not found' });
    }
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update power ranking', details: error.message });
  }
});

// DELETE /power-rankings/:id - Delete power ranking
router.delete('/:id', async (req, res) => {
  try {
    const ranking = await powerRankingsDao.delete(req.params.id);
    if (!ranking) {
      return res.status(404).json({ error: 'Power ranking not found' });
    }
    res.json({ message: 'Power ranking deleted successfully', ranking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete power ranking', details: error.message });
  }
});

module.exports = router;