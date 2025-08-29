const express = require('express');
const router = express.Router();
const RosterMembershipsDao = require('../dao/RosterMembershipsDao');

const rosterMembershipsDao = new RosterMembershipsDao();

// GET /roster-memberships - Get all roster memberships
router.get('/', async (req, res) => {
  try {
    const memberships = await rosterMembershipsDao.findAll();
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roster memberships', details: error.message });
  }
});

// GET /roster-memberships/:id - Get roster membership by ID
router.get('/:id', async (req, res) => {
  try {
    const membership = await rosterMembershipsDao.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ error: 'Roster membership not found' });
    }
    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roster membership', details: error.message });
  }
});

// GET /roster-memberships/team-season/:teamSeasonId - Get roster for team season
router.get('/team-season/:teamSeasonId', async (req, res) => {
  try {
    const roster = await rosterMembershipsDao.listByTeamSeason(req.params.teamSeasonId);
    res.json(roster);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team roster', details: error.message });
  }
});

// GET /roster-memberships/player/:playerId - Get all teams for a player
router.get('/player/:playerId', async (req, res) => {
  try {
    const teams = await rosterMembershipsDao.listByPlayer(req.params.playerId);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player teams', details: error.message });
  }
});

// POST /roster-memberships - Add player to team roster
router.post('/', async (req, res) => {
  try {
    const { player_id, team_season_id } = req.body;
    
    if (!player_id || !team_season_id) {
      return res.status(400).json({ error: 'player_id and team_season_id are required' });
    }

    const membership = await rosterMembershipsDao.add(parseInt(player_id), parseInt(team_season_id));
    
    if (!membership) {
      return res.status(409).json({ error: 'Player already on this team roster' });
    }
    
    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add player to roster', details: error.message });
  }
});

// POST /roster-memberships/create - Create roster membership (alternative endpoint)
router.post('/create', async (req, res) => {
  try {
    const { player_id, team_season_id } = req.body;
    
    if (!player_id || !team_season_id) {
      return res.status(400).json({ error: 'player_id and team_season_id are required' });
    }

    const membershipData = {
      player_id: parseInt(player_id),
      team_season_id: parseInt(team_season_id)
    };

    const membership = await rosterMembershipsDao.create(membershipData);
    res.status(201).json(membership);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Player already on this team roster' });
    } else {
      res.status(500).json({ error: 'Failed to create roster membership', details: error.message });
    }
  }
});

// DELETE /roster-memberships/:id - Remove player from roster
router.delete('/:id', async (req, res) => {
  try {
    const membership = await rosterMembershipsDao.delete(req.params.id);
    if (!membership) {
      return res.status(404).json({ error: 'Roster membership not found' });
    }
    res.json({ message: 'Player removed from roster successfully', membership });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove player from roster', details: error.message });
  }
});

// DELETE /roster-memberships/player/:playerId/team-season/:teamSeasonId - Remove specific player from team
router.delete('/player/:playerId/team-season/:teamSeasonId', async (req, res) => {
  try {
    // First find the membership
    const memberships = await rosterMembershipsDao.findAll();
    const membership = memberships.find(m => 
      m.player_id == req.params.playerId && m.team_season_id == req.params.teamSeasonId
    );
    
    if (!membership) {
      return res.status(404).json({ error: 'Roster membership not found' });
    }
    
    const deleted = await rosterMembershipsDao.delete(membership.id);
    res.json({ message: 'Player removed from team roster successfully', membership: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove player from team roster', details: error.message });
  }
});

module.exports = router;