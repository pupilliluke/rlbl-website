const BaseDao = require('./BaseDao');

class BracketDao extends BaseDao {
  constructor() {
    super('bracket');
  }

  async getBySeason(seasonId) {
    const { query } = require('../../lib/database');
    const r = await query('SELECT * FROM bracket WHERE season_id = $1 ORDER BY id DESC LIMIT 1', [seasonId]);
    return r.rows[0];
  }

  async setBracket({ seasonId, roundName = null, matchupData }) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO bracket(season_id, round_name, matchup_data)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [seasonId, roundName, matchupData]  // matchupData should be a JS object; rely on pg driver to json encode or JSON.stringify before passing
    );
    return r.rows[0];
  }
}

module.exports = BracketDao;