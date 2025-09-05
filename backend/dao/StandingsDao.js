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

  async getStandingsWithTeams(seasonId = null) {
    const { query } = require('../../lib/database');
    
    if (!seasonId) {
      // If no season specified, return empty array or default to latest season
      return [];
    }
    
    try {
      // Get teams for the specific season with standings data
      let sql = `
        SELECT 
          ts.id as team_season_id,
          t.id,
          COALESCE(ts.display_name, t.team_name) as team_name,
          t.logo_url,
          COALESCE(ts.primary_color, t.color) as color,
          ts.secondary_color,
          COALESCE(s.wins, 0) as wins,
          COALESCE(s.losses, 0) as losses,
          COALESCE(s.ties, 0) as ties,
          COALESCE(s.points_for, 0) as points_for,
          COALESCE(s.points_against, 0) as points_against,
          COALESCE((s.points_for - s.points_against), 0) as point_diff,
          CASE 
            WHEN (COALESCE(s.wins, 0) + COALESCE(s.losses, 0) + COALESCE(s.ties, 0)) > 0 
            THEN CAST(COALESCE(s.wins, 0) AS FLOAT) / (COALESCE(s.wins, 0) + COALESCE(s.losses, 0) + COALESCE(s.ties, 0)) * 100 
            ELSE 0 
          END as win_percentage,
          $1 as season_id
        FROM team_seasons ts
        JOIN teams t ON ts.team_id = t.id
        LEFT JOIN standings s ON s.team_season_id = ts.id AND s.season_id = $1
        WHERE ts.season_id = $1
        ORDER BY COALESCE(s.wins, 0) DESC, COALESCE((s.points_for - s.points_against), 0) DESC, COALESCE(ts.display_name, t.team_name)
      `;
      
      const r = await query(sql, [seasonId]);
      return r.rows;
    } catch (error) {
      console.log('Standings query failed:', error.message);
      // Return empty array if query fails
      return [];
    }
  }
}

module.exports = StandingsDao;