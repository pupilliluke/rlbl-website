const express = require('express');
const router = express.Router();
const BracketDao = require('../dao/BracketDao');

const bracketDao = new BracketDao();

// GET /brackets - Get all brackets
router.get('/', async (req, res) => {
  try {
    const brackets = await bracketDao.findAll();
    res.json(brackets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brackets', details: error.message });
  }
});

// GET /brackets/:id - Get bracket by ID
router.get('/:id', async (req, res) => {
  try {
    const bracket = await bracketDao.findById(req.params.id);
    if (!bracket) {
      return res.status(404).json({ error: 'Bracket not found' });
    }
    res.json(bracket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bracket', details: error.message });
  }
});

// GET /brackets/season/:seasonId - Get latest bracket for season
router.get('/season/:seasonId', async (req, res) => {
  try {
    const bracket = await bracketDao.getBySeason(parseInt(req.params.seasonId));
    if (!bracket) {
      return res.status(404).json({ error: 'No bracket found for this season' });
    }
    res.json(bracket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bracket for season', details: error.message });
  }
});

// POST /brackets - Create new bracket
router.post('/', async (req, res) => {
  try {
    const {
      season_id,
      round_name,
      matchup_data
    } = req.body;
    
    if (!season_id || !matchup_data) {
      return res.status(400).json({ 
        error: 'season_id and matchup_data are required' 
      });
    }

    // Validate that matchup_data is an object
    let parsedMatchupData;
    if (typeof matchup_data === 'string') {
      try {
        parsedMatchupData = JSON.parse(matchup_data);
      } catch (parseError) {
        return res.status(400).json({ error: 'matchup_data must be valid JSON' });
      }
    } else if (typeof matchup_data === 'object') {
      parsedMatchupData = matchup_data;
    } else {
      return res.status(400).json({ error: 'matchup_data must be an object or JSON string' });
    }

    const bracketData = {
      seasonId: parseInt(season_id),
      roundName: round_name || null,
      matchupData: parsedMatchupData
    };

    const bracket = await bracketDao.setBracket(bracketData);
    res.status(201).json(bracket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bracket', details: error.message });
  }
});

// PUT /brackets/:id - Update bracket
router.put('/:id', async (req, res) => {
  try {
    const {
      round_name,
      matchup_data
    } = req.body;
    
    const updateData = {};
    if (round_name !== undefined) updateData.round_name = round_name;
    if (matchup_data !== undefined) {
      // Validate and parse matchup_data
      if (typeof matchup_data === 'string') {
        try {
          updateData.matchup_data = JSON.parse(matchup_data);
        } catch (parseError) {
          return res.status(400).json({ error: 'matchup_data must be valid JSON' });
        }
      } else if (typeof matchup_data === 'object') {
        updateData.matchup_data = matchup_data;
      } else {
        return res.status(400).json({ error: 'matchup_data must be an object or JSON string' });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const bracket = await bracketDao.update(req.params.id, updateData);
    if (!bracket) {
      return res.status(404).json({ error: 'Bracket not found' });
    }
    res.json(bracket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bracket', details: error.message });
  }
});

// POST /brackets/season/:seasonId - Create bracket for specific season
router.post('/season/:seasonId', async (req, res) => {
  try {
    const {
      round_name,
      matchup_data
    } = req.body;
    
    if (!matchup_data) {
      return res.status(400).json({ error: 'matchup_data is required' });
    }

    // Validate that matchup_data is an object
    let parsedMatchupData;
    if (typeof matchup_data === 'string') {
      try {
        parsedMatchupData = JSON.parse(matchup_data);
      } catch (parseError) {
        return res.status(400).json({ error: 'matchup_data must be valid JSON' });
      }
    } else if (typeof matchup_data === 'object') {
      parsedMatchupData = matchup_data;
    } else {
      return res.status(400).json({ error: 'matchup_data must be an object or JSON string' });
    }

    const bracketData = {
      seasonId: parseInt(req.params.seasonId),
      roundName: round_name || null,
      matchupData: parsedMatchupData
    };

    const bracket = await bracketDao.setBracket(bracketData);
    res.status(201).json(bracket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bracket for season', details: error.message });
  }
});

// DELETE /brackets/:id - Delete bracket
router.delete('/:id', async (req, res) => {
  try {
    const bracket = await bracketDao.delete(req.params.id);
    if (!bracket) {
      return res.status(404).json({ error: 'Bracket not found' });
    }
    res.json({ message: 'Bracket deleted successfully', bracket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bracket', details: error.message });
  }
});

module.exports = router;