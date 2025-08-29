const BaseDao = require('./BaseDao');

class StandingsDao extends BaseDao {
  constructor() {
    super('standings');
  }

  async upsertRow({ seasonId, teamSeasonId, wins = 0, losses = 0, ties = 0, pointsFor = 0, pointsAgainst = 0 }) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO standings(season_id, team_season_id, wins, losses, ties, points_for, points_against)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (season_id, team_season_id) DO UPDATE
         SET wins = EXCLUDED.wins, losses = EXCLUDED.losses, ties = EXCLUDED.ties,
             points_for = EXCLUDED.points_for, points_against = EXCLUDED.points_against
       RETURNING *`,
      [seasonId, teamSeasonId, wins, losses, ties, pointsFor, pointsAgainst]
    );
    return r.rows[0];
  }

  async table(seasonId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT s.*, ts.display_name, t.team_name
         FROM standings s
         JOIN team_seasons ts ON s.team_season_id = ts.id
         JOIN teams t ON ts.team_id = t.id
        WHERE s.season_id = $1
        ORDER BY s.wins DESC, (s.points_for - s.points_against) DESC, t.team_name`,
      [seasonId]
    );
    return r.rows;
  }
}

module.exports = StandingsDao;