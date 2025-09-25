const { query } = require('../../lib/database');

class BaseDao {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findAll() {
    const result = await query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  async findById(id) {
    const result = await query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0];
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const result = await query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

    // Check if table has updated_at column (only add if it exists)
    const hasUpdatedAt = this.tableName !== 'games'; // Games table doesn't have updated_at
    const updateClause = hasUpdatedAt ? `${setClause}, updated_at = CURRENT_TIMESTAMP` : setClause;

    const result = await query(
      `UPDATE ${this.tableName} SET ${updateClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  }

  async count() {
    const result = await query(`SELECT COUNT(*) FROM ${this.tableName}`);
    return parseInt(result.rows[0].count);
  }

  async exists(id) {
    const result = await query(`SELECT 1 FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows.length > 0;
  }
}

module.exports = BaseDao;