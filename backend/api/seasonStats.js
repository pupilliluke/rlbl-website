const express = require('express');
const router = express.Router();
const { query } = require('../../lib/database');

/**
 * GET /season-stats
 * Get season stats with proper team names from database relationships
 * Query params:
 * - season_id: Filter by season (optional)
 * - player_id: Filter by player (optional)
 */
router.get('/', async (req, res) => {
  try {
    const { season_id, player_id } = req.query;

    let sql = `
      SELECT
        ss.id,
        ss.season_id,
        ss.player_id,
        ss.team_season_id,
        ss.player_name,
        COALESCE(ts.display_name, t.team_name, 'Free Agent') as team_name,
        t.color as team_color,
        ss.conference,
        ss.points,
        ss.goals,
        ss.assists,
        ss.saves,
        ss.shots,
        ss.mvps,
        ss.demos,
        ss.epic_saves,
        ss.games_played,
        ss.otg,
        ss.shot_percentage,
        ss.epic_save_percentage,
        ss.saves_per_game,
        ss.demos_per_game,
        ss.points_per_game,
        ss.goals_per_game,
        ss.assists_per_game,
        ss.is_rookie,
        ss.synced_at,
        s.season_name
      FROM season_stats ss
      LEFT JOIN team_seasons ts ON ss.team_season_id = ts.id
      LEFT JOIN teams t ON ts.team_id = t.id
      LEFT JOIN seasons s ON ss.season_id = s.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (season_id) {
      sql += ` AND ss.season_id = $${paramIndex}`;
      params.push(parseInt(season_id));
      paramIndex++;
    }

    if (player_id) {
      sql += ` AND ss.player_id = $${paramIndex}`;
      params.push(parseInt(player_id));
      paramIndex++;
    }

    sql += ` ORDER BY ss.points DESC, ss.goals DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch season stats:', error);
    res.status(500).json({
      error: 'Failed to fetch season stats',
      details: error.message
    });
  }
});

/**
 * GET /season-stats/:id
 * Get a specific season stat record by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT
        ss.id,
        ss.season_id,
        ss.player_id,
        ss.team_season_id,
        ss.player_name,
        COALESCE(ts.display_name, t.team_name, 'Free Agent') as team_name,
        t.color as team_color,
        ss.conference,
        ss.points,
        ss.goals,
        ss.assists,
        ss.saves,
        ss.shots,
        ss.mvps,
        ss.demos,
        ss.epic_saves,
        ss.games_played,
        ss.otg,
        ss.shot_percentage,
        ss.epic_save_percentage,
        ss.saves_per_game,
        ss.demos_per_game,
        ss.points_per_game,
        ss.goals_per_game,
        ss.assists_per_game,
        ss.is_rookie,
        ss.synced_at,
        s.season_name
      FROM season_stats ss
      LEFT JOIN team_seasons ts ON ss.team_season_id = ts.id
      LEFT JOIN teams t ON ts.team_id = t.id
      LEFT JOIN seasons s ON ss.season_id = s.id
      WHERE ss.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season stat record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch season stat:', error);
    res.status(500).json({
      error: 'Failed to fetch season stat',
      details: error.message
    });
  }
});

/**
 * DELETE /season-stats/season/:seasonId
 * Delete all stats for a specific season (useful before re-syncing)
 */
router.delete('/season/:seasonId', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM season_stats WHERE season_id = $1 RETURNING *',
      [req.params.seasonId]
    );

    res.json({
      message: `Deleted ${result.rows.length} season stat records`,
      deleted_count: result.rows.length
    });
  } catch (error) {
    console.error('Failed to delete season stats:', error);
    res.status(500).json({
      error: 'Failed to delete season stats',
      details: error.message
    });
  }
});

module.exports = router;
