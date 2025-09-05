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

  async getTeamsBySeason(seasonId) {
    const { query } = require('../../lib/database');
    const result = await query(
      `SELECT 
         ts.id as team_season_id,
         t.id as team_id,
         t.team_name as original_team_name,
         COALESCE(ts.display_name, t.team_name) as team_name,
         COALESCE(ts.display_name, t.team_name) as display_name,
         t.logo_url,
         COALESCE(ts.alt_logo_url, t.logo_url) as alt_logo_url,
         COALESCE(ts.primary_color, t.color) as color,
         COALESCE(ts.primary_color, t.color) as primary_color,
         COALESCE(ts.secondary_color, t.secondary_color) as secondary_color,
         ts.ranking,
         ts.season_id,
         s.season_name
       FROM team_seasons ts
       JOIN teams t ON ts.team_id = t.id
       JOIN seasons s ON ts.season_id = s.id
       WHERE ts.season_id = $1
       ORDER BY COALESCE(ts.ranking, 999999), COALESCE(ts.display_name, t.team_name)`,
      [seasonId]
    );
    return result.rows;
  }

  async getAllTeamsFromAllSeasons() {
    const { query } = require('../../lib/database');
    const result = await query(
      `SELECT DISTINCT ON (t.team_name)
         ts.id as team_season_id,
         t.id as team_id,
         t.team_name as original_team_name,
         COALESCE(ts.display_name, t.team_name) as team_name,
         COALESCE(ts.display_name, t.team_name) as display_name,
         t.logo_url,
         COALESCE(ts.alt_logo_url, t.logo_url) as alt_logo_url,
         COALESCE(ts.primary_color, t.color) as color,
         COALESCE(ts.primary_color, t.color) as primary_color,
         COALESCE(ts.secondary_color, t.secondary_color) as secondary_color,
         ts.ranking,
         ts.season_id,
         s.season_name,
         'career' as mode
       FROM team_seasons ts
       JOIN teams t ON ts.team_id = t.id
       JOIN seasons s ON ts.season_id = s.id
       ORDER BY t.team_name, ts.season_id DESC`,
      []
    );
    return result.rows;
  }
}

module.exports = TeamsDao;