const BaseDao = require('./BaseDao');

class SeasonsDao extends BaseDao {
  constructor() {
    super('seasons');
  }

  async getActive() {
    const { query } = require('../../lib/database');
    const r = await query('SELECT * FROM seasons WHERE is_active = true ORDER BY start_date DESC LIMIT 1', []);
    return r.rows[0];
  }

  async list({ limit = 50, offset = 0 } = {}) {
    const { query } = require('../../lib/database');
    const r = await query(
      'SELECT * FROM seasons ORDER BY start_date DESC NULLS LAST LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return r.rows;
  }

  async setActive(seasonId) {
    const { query } = require('../../lib/database');
    await query('UPDATE seasons SET is_active = false WHERE is_active = true');
    const r = await query('UPDATE seasons SET is_active = true WHERE id = $1 RETURNING *', [seasonId]);
    return r.rows[0];
  }
}

module.exports = SeasonsDao;