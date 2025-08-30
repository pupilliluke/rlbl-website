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
    
    try {
      let sql = `
        SELECT 
          t.id,
          t.team_name,
          t.logo_url,
          t.color,
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
          ${seasonId || 0} as season_id
        FROM teams t
        LEFT JOIN (
          SELECT ts.*, s.wins, s.losses, s.ties, s.points_for, s.points_against, s.season_id
          FROM team_seasons ts
          LEFT JOIN standings s ON s.team_season_id = ts.id
          ${seasonId ? 'WHERE ts.season_id = $1' : ''}
        ) s ON s.team_id = t.id
      `;
      
      const params = [];
      if (seasonId) {
        params.push(seasonId);
      }
      
      sql += ` ORDER BY COALESCE(s.wins, 0) DESC, COALESCE((s.points_for - s.points_against), 0) DESC, t.team_name`;
      
      const r = await query(sql, params);
      return r.rows;
    } catch (error) {
      console.log('Standings query failed, trying fallback:', error.message);
      
      // Try simpler approach - show all teams with zero stats if no standings data
      try {
        let fallbackSql = `
          SELECT 
            t.id,
            t.team_name,
            t.logo_url,
            t.color,
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
            ${seasonId || 0} as season_id
          FROM teams t
          LEFT JOIN standings s ON t.id = s.team_id ${seasonId ? 'AND s.season_id = $1' : ''}
        `;
        
        const fallbackParams = [];
        if (seasonId) {
          fallbackParams.push(seasonId);
        }
        
        fallbackSql += ' ORDER BY COALESCE(s.wins, 0) DESC, COALESCE((s.points_for - s.points_against), 0) DESC, t.team_name';
        
        const r = await query(fallbackSql, fallbackParams);
        return r.rows;
      } catch (fallbackError) {
        console.log('Fallback standings query also failed:', fallbackError.message);
        // Return empty array if everything fails
        return [];
      }
    }
  }
}

module.exports = StandingsDao;