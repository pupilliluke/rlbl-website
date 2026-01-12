const express = require('express');
const router = express.Router();
const PlayerGameStatsDao = require('../dao/PlayerGameStatsDao');

const playerGameStatsDao = new PlayerGameStatsDao();

// Helper function to check MVP count for a game
async function checkMVPCount(gameId) {
  const { query } = require('../../lib/database');
  const result = await query(
    'SELECT SUM(mvps) as total_mvps FROM player_game_stats WHERE game_id = $1',
    [gameId]
  );
  const totalMVPs = parseInt(result.rows[0]?.total_mvps) || 0;

  if (totalMVPs === 0) {
    return { valid: false, warning: 'No MVP assigned for this game', total_mvps: totalMVPs };
  } else if (totalMVPs > 1) {
    return { valid: false, warning: `Multiple MVPs (${totalMVPs}) assigned for this game`, total_mvps: totalMVPs };
  }
  return { valid: true, total_mvps: totalMVPs };
}

// GET /player-game-stats - Get all player game stats with names
router.get('/', async (req, res) => {
  try {
    const { season_id } = req.query;
    const stats = await playerGameStatsDao.findAllWithNames(season_id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player game stats', details: error.message });
  }
});

// GET /player-game-stats/:id - Get player game stat by ID
router.get('/:id', async (req, res) => {
  try {
    const stat = await playerGameStatsDao.findById(req.params.id);
    if (!stat) {
      return res.status(404).json({ error: 'Player game stat not found' });
    }
    res.json(stat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player game stat', details: error.message });
  }
});

// GET /player-game-stats/game/:gameId - Get all player stats for a game
router.get('/game/:gameId', async (req, res) => {
  try {
    const stats = await playerGameStatsDao.listByGame(parseInt(req.params.gameId));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player stats for game', details: error.message });
  }
});

// GET /player-game-stats/player/:playerId/game/:gameId - Get specific player's stats for a game
router.get('/player/:playerId/game/:gameId', async (req, res) => {
  try {
    const stat = await playerGameStatsDao.getPlayerGameStat(parseInt(req.params.playerId), parseInt(req.params.gameId));
    if (!stat) {
      return res.status(404).json({ error: 'Player game stat not found' });
    }
    res.json(stat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player game stat', details: error.message });
  }
});

// GET /player-game-stats/team-season/:teamSeasonId/totals - Get totals for team season
router.get('/team-season/:teamSeasonId/totals', async (req, res) => {
  try {
    const totals = await playerGameStatsDao.totalsForTeamSeason(parseInt(req.params.teamSeasonId));
    if (!totals) {
      return res.status(404).json({ error: 'No stats found for team season' });
    }
    res.json(totals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team season totals', details: error.message });
  }
});

// GET /player-game-stats/mvp-validation/:seasonId - Validate MVP assignments for all games in a season
router.get('/mvp-validation/:seasonId', async (req, res) => {
  try {
    const { query } = require('../../lib/database');
    const seasonId = parseInt(req.params.seasonId);

    // Find all games with incorrect MVP counts (not exactly 1)
    const result = await query(`
      SELECT
        g.id as game_id,
        g.week,
        g.series_game,
        hts.display_name as home_team,
        ats.display_name as away_team,
        COALESCE(mvp_counts.total_mvps, 0) as total_mvps,
        CASE
          WHEN COALESCE(mvp_counts.total_mvps, 0) = 0 THEN 'no_mvp'
          WHEN COALESCE(mvp_counts.total_mvps, 0) > 1 THEN 'multiple_mvps'
          ELSE 'valid'
        END as status
      FROM games g
      JOIN team_seasons hts ON g.home_team_season_id = hts.id
      JOIN team_seasons ats ON g.away_team_season_id = ats.id
      LEFT JOIN (
        SELECT game_id, SUM(mvps) as total_mvps
        FROM player_game_stats
        GROUP BY game_id
      ) mvp_counts ON mvp_counts.game_id = g.id
      WHERE g.season_id = $1
        AND COALESCE(mvp_counts.total_mvps, 0) != 1
      ORDER BY g.week, g.series_game
    `, [seasonId]);

    const issues = result.rows;
    const summary = {
      total_games_with_issues: issues.length,
      no_mvp: issues.filter(i => i.status === 'no_mvp').length,
      multiple_mvps: issues.filter(i => i.status === 'multiple_mvps').length
    };

    res.json({
      summary,
      issues
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate MVPs', details: error.message });
  }
});

// POST /player-game-stats - Create or update player game stats
router.post('/', async (req, res) => {
  try {
    const {
      game_id,
      player_id,
      team_season_id,
      points = 0,
      goals = 0,
      assists = 0,
      saves = 0,
      shots = 0,
      mvps = 0,
      demos = 0,
      epic_saves = 0
    } = req.body;
    
    if (!game_id || !player_id || !team_season_id) {
      return res.status(400).json({ 
        error: 'game_id, player_id, and team_season_id are required' 
      });
    }

    // VALIDATION: Check if player is actually on this team's roster
    try {
      const { query } = require('../../lib/database');
      const rosterCheck = await query(
        `SELECT rm.id 
         FROM roster_memberships rm 
         WHERE rm.player_id = $1 AND rm.team_season_id = $2`,
        [player_id, team_season_id]
      );
      
      if (rosterCheck.rows.length === 0) {
        // Get player and team names for better error message
        const [playerInfo, teamInfo] = await Promise.all([
          query('SELECT player_name FROM players WHERE id = $1', [player_id]),
          query('SELECT ts.display_name FROM team_seasons ts WHERE ts.id = $1', [team_season_id])
        ]);
        
        const playerName = playerInfo.rows[0]?.player_name || `Player ${player_id}`;
        const teamName = teamInfo.rows[0]?.display_name || `Team ${team_season_id}`;
        
        return res.status(400).json({ 
          error: `Validation failed: ${playerName} is not on ${teamName}'s roster for this season. Please check roster memberships.`,
          player_id,
          team_season_id,
          validation: 'roster_membership_required'
        });
      }
    } catch (validationError) {
      console.error('Roster validation error:', validationError);
      return res.status(500).json({ 
        error: 'Failed to validate roster membership', 
        details: validationError.message 
      });
    }

    const statsData = {
      gameId: parseInt(game_id),
      playerId: parseInt(player_id),
      teamSeasonId: parseInt(team_season_id),
      points: parseInt(points),
      goals: parseInt(goals),
      assists: parseInt(assists),
      saves: parseInt(saves),
      shots: parseInt(shots),
      mvps: parseInt(mvps),
      demos: parseInt(demos),
      epicSaves: parseInt(epic_saves)
    };

    const stats = await playerGameStatsDao.upsertRow(statsData);

    // Check MVP count after upserting
    const mvpCheck = await checkMVPCount(parseInt(game_id));

    res.status(201).json({
      ...stats,
      mvp_validation: mvpCheck
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create/update player game stats', details: error.message });
  }
});

// PUT /player-game-stats/upsert - Alternative upsert endpoint
router.put('/upsert', async (req, res) => {
  try {
    const {
      game_id,
      player_id,
      team_season_id,
      points = 0,
      goals = 0,
      assists = 0,
      saves = 0,
      shots = 0,
      mvps = 0,
      demos = 0,
      epic_saves = 0
    } = req.body;
    
    if (!game_id || !player_id || !team_season_id) {
      return res.status(400).json({ 
        error: 'game_id, player_id, and team_season_id are required' 
      });
    }

    // VALIDATION: Check if player is actually on this team's roster
    try {
      const { query } = require('../../lib/database');
      const rosterCheck = await query(
        `SELECT rm.id 
         FROM roster_memberships rm 
         WHERE rm.player_id = $1 AND rm.team_season_id = $2`,
        [player_id, team_season_id]
      );
      
      if (rosterCheck.rows.length === 0) {
        // Get player and team names for better error message
        const [playerInfo, teamInfo] = await Promise.all([
          query('SELECT player_name FROM players WHERE id = $1', [player_id]),
          query('SELECT ts.display_name FROM team_seasons ts WHERE ts.id = $1', [team_season_id])
        ]);
        
        const playerName = playerInfo.rows[0]?.player_name || `Player ${player_id}`;
        const teamName = teamInfo.rows[0]?.display_name || `Team ${team_season_id}`;
        
        return res.status(400).json({ 
          error: `Validation failed: ${playerName} is not on ${teamName}'s roster for this season. Please check roster memberships.`,
          player_id,
          team_season_id,
          validation: 'roster_membership_required'
        });
      }
    } catch (validationError) {
      console.error('Roster validation error:', validationError);
      return res.status(500).json({ 
        error: 'Failed to validate roster membership', 
        details: validationError.message 
      });
    }

    const statsData = {
      gameId: parseInt(game_id),
      playerId: parseInt(player_id),
      teamSeasonId: parseInt(team_season_id),
      points: parseInt(points),
      goals: parseInt(goals),
      assists: parseInt(assists),
      saves: parseInt(saves),
      shots: parseInt(shots),
      mvps: parseInt(mvps),
      demos: parseInt(demos),
      epicSaves: parseInt(epic_saves)
    };

    const stats = await playerGameStatsDao.upsertRow(statsData);

    // Check MVP count after upserting
    const mvpCheck = await checkMVPCount(parseInt(game_id));

    res.json({
      ...stats,
      mvp_validation: mvpCheck
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upsert player game stats', details: error.message });
  }
});

// PUT /player-game-stats/:id - Update player game stats by ID
router.put('/:id', async (req, res) => {
  try {
    const {
      points,
      goals,
      assists,
      saves,
      shots,
      mvps,
      demos,
      epic_saves
    } = req.body;
    
    const updateData = {};
    if (points !== undefined) updateData.points = parseInt(points);
    if (goals !== undefined) updateData.goals = parseInt(goals);
    if (assists !== undefined) updateData.assists = parseInt(assists);
    if (saves !== undefined) updateData.saves = parseInt(saves);
    if (shots !== undefined) updateData.shots = parseInt(shots);
    if (mvps !== undefined) updateData.mvps = parseInt(mvps);
    if (demos !== undefined) updateData.demos = parseInt(demos);
    if (epic_saves !== undefined) updateData.epic_saves = parseInt(epic_saves);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Use custom update query since player_game_stats doesn't have updated_at column
    const { query } = require('../../lib/database');
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    
    const result = await query(
      `UPDATE player_game_stats SET ${setClause} WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player game stats not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player game stats', details: error.message });
  }
});

// DELETE /player-game-stats/:id - Delete player game stats
router.delete('/:id', async (req, res) => {
  try {
    const stats = await playerGameStatsDao.delete(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'Player game stats not found' });
    }
    res.json({ message: 'Player game stats deleted successfully', stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player game stats', details: error.message });
  }
});

module.exports = router;