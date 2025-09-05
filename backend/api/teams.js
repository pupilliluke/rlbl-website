const express = require('express');
const router = express.Router();
const TeamsDao = require('../dao/TeamsDao');

const teamsDao = new TeamsDao();

// GET /teams - Get all teams with optional season filtering
router.get('/', async (req, res) => {
  try {
    // Handle different season parameter formats from the frontend
    const seasonParam = req.query.season || req.query.season_id;
    
    if (seasonParam && !isNaN(parseInt(seasonParam))) {
      // Return teams for specific season (team_seasons structure)
      const seasonId = parseInt(seasonParam);
      const teams = await teamsDao.getTeamsBySeason(seasonId);
      res.json(teams);
    } else if (seasonParam === 'current') {
      // Return teams for current/active season (season 3 is currently active)
      const teams = await teamsDao.getTeamsBySeason(3);
      res.json(teams);
    } else if (seasonParam === 'career') {
      // Return all teams from all seasons (career stats should include everyone)
      const teams = await teamsDao.getAllTeamsFromAllSeasons();
      res.json(teams);
    } else if (seasonParam === 'season1') {
      // Return teams for season 1
      const teams = await teamsDao.getTeamsBySeason(1);
      res.json(teams);
    } else if (seasonParam === 'season2') {
      // Return teams for season 2
      const teams = await teamsDao.getTeamsBySeason(2);
      res.json(teams);
    } else {
      // Return all base teams (original behavior)
      const teams = await teamsDao.findAll();
      res.json(teams);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams', details: error.message });
  }
});

// GET /teams/:id - Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await teamsDao.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team', details: error.message });
  }
});

// GET /teams/name/:name - Get team by name
router.get('/name/:name', async (req, res) => {
  try {
    const team = await teamsDao.findByName(req.params.name);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team by name', details: error.message });
  }
});

// GET /teams/color/:color - Get teams by color
router.get('/color/:color', async (req, res) => {
  try {
    const teams = await teamsDao.findByColor(req.params.color);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams by color', details: error.message });
  }
});

// GET /teams/with-player-count - Get teams with player counts
router.get('/with-player-count', async (req, res) => {
  try {
    const seasonId = req.query.season_id ? parseInt(req.query.season_id) : null;
    const teams = await teamsDao.getTeamsWithPlayerCount(seasonId);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams with player count', details: error.message });
  }
});

// GET /teams/:id/stats - Get team statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const seasonId = req.query.season_id ? parseInt(req.query.season_id) : null;
    const stats = await teamsDao.getTeamStats(req.params.id, seasonId);
    if (!stats) {
      return res.status(404).json({ error: 'Team stats not found' });
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team stats', details: error.message });
  }
});

// POST /teams - Create new team
router.post('/', async (req, res) => {
  try {
    const { team_name, logo_url, color, secondary_color } = req.body;
    
    if (!team_name) {
      return res.status(400).json({ error: 'team_name is required' });
    }

    const teamData = {
      team_name,
      logo_url: logo_url || null,
      color: color || null,
      secondary_color: secondary_color || null
    };

    const team = await teamsDao.create(teamData);
    res.status(201).json(team);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Team name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create team', details: error.message });
    }
  }
});

// PUT /teams/:id - Update team
router.put('/:id', async (req, res) => {
  try {
    const { team_name, logo_url, color, secondary_color } = req.body;
    
    const updateData = {};
    if (team_name !== undefined) updateData.team_name = team_name;
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (color !== undefined) updateData.color = color;
    if (secondary_color !== undefined) updateData.secondary_color = secondary_color;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const team = await teamsDao.update(req.params.id, updateData);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team', details: error.message });
  }
});

// DELETE /teams/:id - Delete team
router.delete('/:id', async (req, res) => {
  try {
    const team = await teamsDao.delete(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully', team });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team', details: error.message });
  }
});

module.exports = router;