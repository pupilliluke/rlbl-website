const BaseDao = require('./BaseDao');

class TeamsDao extends BaseDao {
  constructor() {
    super('teams');
  }

  async findByName(teamName) {
    const { query } = require('../../lib/database');
    const result = await query(
      'SELECT * FROM teams WHERE LOWER(team_name) = LOWER($1)',
      [teamName]
    );
    return result.rows[0];
  }

  async findByColor(color) {
    const { query } = require('../../lib/database');
    const result = await query(
      'SELECT * FROM teams WHERE color = $1',
      [color]
    );
    return result.rows;
  }

  async getTeamsWithPlayerCount(seasonId = null) {
    const { query } = require('../../lib/database');
    let sql = `
      SELECT 
        t.*,
        COUNT(rm.player_id) as player_count
      FROM teams t
      LEFT JOIN team_seasons ts ON t.id = ts.team_id
      LEFT JOIN roster_memberships rm ON ts.id = rm.team_season_id
    `;
    
    const params = [];
    if (seasonId) {
      sql += ' WHERE ts.season_id = $1';
      params.push(seasonId);
    }
    
    sql += ' GROUP BY t.id ORDER BY t.team_name';
    
    const result = await query(sql, params);
    return result.rows;
  }

  async getTeamStats(teamId, seasonId = null) {
    const { query } = require('../../lib/database');
    let sql = `
      SELECT 
        t.team_name,
        COUNT(g.id) as games_played,
        SUM(CASE WHEN g.home_team_season_id = ts.id THEN g.home_score ELSE g.away_score END) as goals_for,
        SUM(CASE WHEN g.home_team_season_id = ts.id THEN g.away_score ELSE g.home_score END) as goals_against,
        SUM(CASE 
          WHEN (g.home_team_season_id = ts.id AND g.home_score > g.away_score) OR 
               (g.away_team_season_id = ts.id AND g.away_score > g.home_score) 
          THEN 1 ELSE 0 END) as wins,
        SUM(CASE 
          WHEN (g.home_team_season_id = ts.id AND g.home_score < g.away_score) OR 
               (g.away_team_season_id = ts.id AND g.away_score < g.home_score) 
          THEN 1 ELSE 0 END) as losses
      FROM teams t
      LEFT JOIN team_seasons ts ON t.id = ts.team_id
      LEFT JOIN games g ON (ts.id = g.home_team_season_id OR ts.id = g.away_team_season_id)
      WHERE t.id = $1
    `;
    
    const params = [teamId];
    if (seasonId) {
      sql += ' AND ts.season_id = $2';
      params.push(seasonId);
    }
    
    sql += ' GROUP BY t.id, t.team_name';
    
    const result = await query(sql, params);
    return result.rows[0];
  }
}

module.exports = TeamsDao;