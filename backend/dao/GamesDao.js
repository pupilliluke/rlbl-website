const BaseDao = require('./BaseDao');

class GamesDao extends BaseDao {
  constructor() {
    super('games');
  }

  async listBySeason(seasonId, { week = null, limit = 200, offset = 0 } = {}) {
    const { query } = require('../../lib/database');
    const params = [seasonId];
    let sql = `
      SELECT g.*,
             hts.display_name AS home_display, ats.display_name AS away_display
        FROM games g
        JOIN team_seasons hts ON g.home_team_season_id = hts.id
        JOIN team_seasons ats ON g.away_team_season_id = ats.id
       WHERE g.season_id = $1`;
    if (week !== null) { params.push(week); sql += ` AND g.week = $${params.length}`; }
    params.push(limit, offset);
    sql += ` ORDER BY g.game_date ASC NULLS LAST LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const r = await query(sql, params);
    return r.rows;
  }

  async createGame({ seasonId, homeTeamSeasonId, awayTeamSeasonId, gameDate = null, week = null, isPlayoffs = false }) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO games(season_id, home_team_season_id, away_team_season_id, game_date, week, is_playoffs)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [seasonId, homeTeamSeasonId, awayTeamSeasonId, gameDate, week, isPlayoffs]
    );
    return r.rows[0];
  }

  async setScore(gameId, homeScore, awayScore) {
    const { query } = require('../../lib/database');
    const r = await query(
      `UPDATE games SET home_score = $2, away_score = $3 WHERE id = $1 RETURNING *`,
      [gameId, homeScore, awayScore]
    );
    return r.rows[0];
  }

  async deleteBySeason(seasonId) {
    const { query } = require('../../lib/database');
    await query('DELETE FROM games WHERE season_id = $1', [seasonId]);
  }
}

module.exports = GamesDao;