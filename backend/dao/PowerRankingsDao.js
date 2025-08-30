const BaseDao = require('./BaseDao');

class PowerRankingsDao extends BaseDao {
  constructor() {
    super('power_rankings');
  }

  async listByWeek(seasonId, week) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT pr.*, ts.display_name, t.team_name
         FROM power_rankings pr
         JOIN team_seasons ts ON pr.team_season_id = ts.id
         JOIN teams t ON ts.team_id = t.id
        WHERE pr.season_id = $1 AND pr.week = $2
        ORDER BY pr.rank ASC`,
      [seasonId, week]
    );
    return r.rows;
  }

  async upsertRow({ seasonId, week, teamSeasonId, rank, reasoning = null }) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO power_rankings(season_id, week, team_season_id, rank, reasoning)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (season_id, week, team_season_id) DO UPDATE
         SET rank = EXCLUDED.rank, reasoning = EXCLUDED.reasoning
       RETURNING *`,
      [seasonId, week, teamSeasonId, rank, reasoning]
    );
    return r.rows[0];
  }

  async getLatestRankings() {
    const { query } = require('../../lib/database');
    try {
      const r = await query(`
        SELECT 
          pr.rank,
          pr.week,
          pr.reasoning,
          t.id as team_id,
          t.team_name,
          t.logo_url,
          t.color
        FROM power_rankings pr
        JOIN team_seasons ts ON pr.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        WHERE pr.week = (SELECT MAX(week) FROM power_rankings)
        ORDER BY pr.rank
      `);
      return r.rows;
    } catch (error) {
      // If power_rankings doesn't exist or is empty, return empty array
      return [];
    }
  }
}

module.exports = PowerRankingsDao;