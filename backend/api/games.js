const express = require('express');
const router = express.Router();
const GamesDao = require('../dao/GamesDao');

const gamesDao = new GamesDao();

// GET /games - Get all games
router.get('/', async (req, res) => {
  try {
    const games = await gamesDao.findAll();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games', details: error.message });
  }
});

// GET /games/:id - Get game by ID
router.get('/:id', async (req, res) => {
  try {
    const game = await gamesDao.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game', details: error.message });
  }
});

// GET /games/season/:seasonId - Get games for a season
router.get('/season/:seasonId', async (req, res) => {
  try {
    const seasonId = parseInt(req.params.seasonId);
    const week = req.query.week ? parseInt(req.query.week) : null;
    const limit = parseInt(req.query.limit) || 200;
    const offset = parseInt(req.query.offset) || 0;
    
    const options = { week, limit, offset };
    const games = await gamesDao.listBySeason(seasonId, options);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games for season', details: error.message });
  }
});

// GET /games/season/:seasonId/week/:week - Get games for specific week
router.get('/season/:seasonId/week/:week', async (req, res) => {
  try {
    const seasonId = parseInt(req.params.seasonId);
    const week = parseInt(req.params.week);
    const limit = parseInt(req.query.limit) || 200;
    const offset = parseInt(req.query.offset) || 0;
    
    const games = await gamesDao.listBySeason(seasonId, { week, limit, offset });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games for week', details: error.message });
  }
});

// POST /games - Create new game
router.post('/', async (req, res) => {
  try {
    const { 
      season_id, 
      home_team_season_id, 
      away_team_season_id, 
      game_date, 
      week, 
      is_playoffs 
    } = req.body;
    
    if (!season_id || !home_team_season_id || !away_team_season_id) {
      return res.status(400).json({ 
        error: 'season_id, home_team_season_id, and away_team_season_id are required' 
      });
    }

    const gameData = {
      seasonId: parseInt(season_id),
      homeTeamSeasonId: parseInt(home_team_season_id),
      awayTeamSeasonId: parseInt(away_team_season_id),
      gameDate: game_date || null,
      week: week ? parseInt(week) : null,
      isPlayoffs: is_playoffs || false
    };

    const game = await gamesDao.createGame(gameData);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game', details: error.message });
  }
});

// PUT /games/:id - Update game
router.put('/:id', async (req, res) => {
  try {
    const { game_date, week, is_playoffs, home_team_forfeit, away_team_forfeit, incomplete } = req.body;

    const updateData = {};
    if (game_date !== undefined) updateData.game_date = game_date;
    if (week !== undefined) updateData.week = week;
    if (is_playoffs !== undefined) updateData.is_playoffs = is_playoffs;
    if (home_team_forfeit !== undefined) updateData.home_team_forfeit = home_team_forfeit;
    if (away_team_forfeit !== undefined) updateData.away_team_forfeit = away_team_forfeit;
    if (incomplete !== undefined) updateData.incomplete = incomplete;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const game = await gamesDao.update(req.params.id, updateData);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update game', details: error.message });
  }
});

// PUT /games/:id/score - Update game score
router.put('/:id/score', async (req, res) => {
  try {
    const { home_score, away_score } = req.body;

    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({ error: 'home_score and away_score are required' });
    }

    const game = await gamesDao.setScore(
      req.params.id,
      parseInt(home_score),
      parseInt(away_score)
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update game score', details: error.message });
  }
});

// PUT /games/:id/notes - Update game notes
router.put('/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;

    if (notes === undefined) {
      return res.status(400).json({ error: 'notes field is required' });
    }

    const game = await gamesDao.updateNotes(req.params.id, notes);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update game notes', details: error.message });
  }
});

// DELETE /games/:id - Delete game
router.delete('/:id', async (req, res) => {
  try {
    const game = await gamesDao.delete(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ message: 'Game deleted successfully', game });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game', details: error.message });
  }
});

// POST /games/series - Create new game in existing series
router.post('/series', async (req, res) => {
  try {
    const { 
      season_id, 
      home_team_season_id, 
      away_team_season_id, 
      game_date, 
      week, 
      is_playoffs 
    } = req.body;
    
    if (!season_id || !home_team_season_id || !away_team_season_id || !week) {
      return res.status(400).json({ 
        error: 'season_id, home_team_season_id, away_team_season_id, and week are required' 
      });
    }

    const gameData = {
      seasonId: parseInt(season_id),
      homeTeamSeasonId: parseInt(home_team_season_id),
      awayTeamSeasonId: parseInt(away_team_season_id),
      gameDate: game_date || null,
      week: parseInt(week),
      isPlayoffs: is_playoffs || false
    };

    const game = await gamesDao.createSeriesGame(gameData);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create series game', details: error.message });
  }
});

// GET /games/series/:seasonId/:week/:homeTeamSeasonId/:awayTeamSeasonId - Get all games in a series
router.get('/series/:seasonId/:week/:homeTeamSeasonId/:awayTeamSeasonId', async (req, res) => {
  try {
    const seasonId = parseInt(req.params.seasonId);
    const week = parseInt(req.params.week);
    const homeTeamSeasonId = parseInt(req.params.homeTeamSeasonId);
    const awayTeamSeasonId = parseInt(req.params.awayTeamSeasonId);
    
    const games = await gamesDao.getSeriesGames(seasonId, week, homeTeamSeasonId, awayTeamSeasonId);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch series games', details: error.message });
  }
});

// DELETE /games/season/:seasonId - Delete all games for a season
router.delete('/season/:seasonId', async (req, res) => {
  try {
    await gamesDao.deleteBySeason(parseInt(req.params.seasonId));
    res.json({ message: 'All games for season deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete games for season', details: error.message });
  }
});

module.exports = router;