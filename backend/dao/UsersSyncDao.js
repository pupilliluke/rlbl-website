const BaseDao = require('./BaseDao');

class UsersSyncDao extends BaseDao {
  constructor() {
    super('neon_auth.users_sync');
  }

  async findByEmail(email) {
    const { query } = require('../../lib/database');
    const r = await query('SELECT * FROM neon_auth.users_sync WHERE LOWER(email) = LOWER($1)', [email]);
    return r.rows[0];
  }

  async list({ limit = 50, offset = 0 } = {}) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT id, name, email, created_at, updated_at, deleted_at
         FROM neon_auth.users_sync
        ORDER BY created_at DESC NULLS LAST
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return r.rows;
  }
}

module.exports = UsersSyncDao;