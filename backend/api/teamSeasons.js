const express = require('express');
const router = express.Router();
const TeamSeasonsDao = require('../dao/TeamSeasonsDao');

const teamSeasonsDao = new TeamSeasonsDao();

// GET /team-seasons - Get all team seasons with optional season filtering
router.get('/', async (req, res) => {
  try {
    const seasonParam = req.query.season || req.query.season_id;
    
    if (seasonParam && !isNaN(parseInt(seasonParam))) {
      // Return team seasons for specific season
      const seasonId = parseInt(seasonParam);
      const teamSeasons = await teamSeasonsDao.listBySeason(seasonId);
      res.json(teamSeasons);
    } else {
      // Return all team seasons
      const teamSeasons = await teamSeasonsDao.findAll();
      res.json(teamSeasons);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team seasons', details: error.message });
  }
});

// GET /team-seasons/:id - Get team season by ID
router.get('/:id', async (req, res) => {
  try {
    const teamSeason = await teamSeasonsDao.findById(req.params.id);
    if (!teamSeason) {
      return res.status(404).json({ error: 'Team season not found' });
    }
    res.json(teamSeason);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team season', details: error.message });
  }
});

// GET /team-seasons/season/:seasonId - Get all teams in a season
router.get('/season/:seasonId', async (req, res) => {
  try {
    const teamSeasons = await teamSeasonsDao.listBySeason(req.params.seasonId);
    res.json(teamSeasons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams for season', details: error.message });
  }
});

// GET /team-seasons/season/:seasonId/team/:teamId - Get specific team season
router.get('/season/:seasonId/team/:teamId', async (req, res) => {
  try {
    const teamSeason = await teamSeasonsDao.findBySeasonAndTeam(req.params.seasonId, req.params.teamId);
    if (!teamSeason) {
      return res.status(404).json({ error: 'Team season combination not found' });
    }
    res.json(teamSeason);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team season', details: error.message });
  }
});

// POST /team-seasons - Create new team season
router.post('/', async (req, res) => {
  try {
    const { season_id, team_id, display_name, primary_color, secondary_color, alt_logo_url, ranking } = req.body;
    
    if (!season_id || !team_id) {
      return res.status(400).json({ error: 'season_id and team_id are required' });
    }

    const teamSeasonData = {
      season_id: parseInt(season_id),
      team_id: parseInt(team_id),
      display_name: display_name || null,
      primary_color: primary_color || null,
      secondary_color: secondary_color || null,
      alt_logo_url: alt_logo_url || null,
      ranking: ranking ? parseInt(ranking) : 0
    };

    const teamSeason = await teamSeasonsDao.create(teamSeasonData);
    res.status(201).json(teamSeason);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Team season combination already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create team season', details: error.message });
    }
  }
});

// PUT /team-seasons/:id - Update team season
router.put('/:id', async (req, res) => {
  try {
    const { display_name, primary_color, secondary_color, alt_logo_url, ranking } = req.body;
    
    const updateData = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (primary_color !== undefined) updateData.primary_color = primary_color;
    if (secondary_color !== undefined) updateData.secondary_color = secondary_color;
    if (alt_logo_url !== undefined) updateData.alt_logo_url = alt_logo_url;
    if (ranking !== undefined) updateData.ranking = ranking;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const teamSeason = await teamSeasonsDao.update(req.params.id, updateData);
    if (!teamSeason) {
      return res.status(404).json({ error: 'Team season not found' });
    }
    res.json(teamSeason);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team season', details: error.message });
  }
});

// PUT /team-seasons/:id/ranking - Update team season ranking
router.put('/:id/ranking', async (req, res) => {
  try {
    const { ranking } = req.body;
    
    if (ranking === undefined || ranking === null) {
      return res.status(400).json({ error: 'ranking is required' });
    }

    const teamSeason = await teamSeasonsDao.updateRanking(req.params.id, parseInt(ranking));
    if (!teamSeason) {
      return res.status(404).json({ error: 'Team season not found' });
    }
    res.json(teamSeason);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ranking', details: error.message });
  }
});

// DELETE /team-seasons/:id - Delete team season
router.delete('/:id', async (req, res) => {
  try {
    const teamSeason = await teamSeasonsDao.delete(req.params.id);
    if (!teamSeason) {
      return res.status(404).json({ error: 'Team season not found' });
    }
    res.json({ message: 'Team season deleted successfully', teamSeason });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team season', details: error.message });
  }
});

module.exports = router;