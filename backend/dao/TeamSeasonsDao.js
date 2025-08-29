const BaseDao = require('./BaseDao');

class TeamSeasonsDao extends BaseDao {
  constructor() {
    super('team_seasons');
  }

  async findBySeasonAndTeam(seasonId, teamId) {
    const { query } = require('../../lib/database');
    const r = await query(
      'SELECT * FROM team_seasons WHERE season_id = $1 AND team_id = $2',
      [seasonId, teamId]
    );
    return r.rows[0];
  }

  async listBySeason(seasonId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT ts.*, t.team_name
         FROM team_seasons ts
         JOIN teams t ON ts.team_id = t.id
        WHERE ts.season_id = $1
        ORDER BY COALESCE(ts.ranking, 999999), t.team_name`,
      [seasonId]
    );
    return r.rows;
  }

  async updateRanking(tsId, ranking) {
    const { query } = require('../../lib/database');
    const r = await query('UPDATE team_seasons SET ranking = $2 WHERE id = $1 RETURNING *', [tsId, ranking]);
    return r.rows[0];
  }
}

module.exports = TeamSeasonsDao;