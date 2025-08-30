const BaseDao = require('./BaseDao');

class PlayersDao extends BaseDao {
  constructor() {
    super('players');
  }

  async findByGamertag(gamertag) {
    const { query } = require('../../lib/database');
    const r = await query('SELECT * FROM players WHERE LOWER(gamertag) = LOWER($1)', [gamertag]);
    return r.rows[0];
  }

  async searchByName(q, { limit = 20, offset = 0 } = {}) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT * FROM players 
       WHERE player_name ILIKE '%'||$1||'%'
       ORDER BY player_name
       LIMIT $2 OFFSET $3`,
      [q, limit, offset]
    );
    return r.rows;
  }

  async getTeamsBySeason(playerId, seasonId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT ts.*, t.team_name
         FROM roster_memberships rm
         JOIN team_seasons ts ON rm.team_season_id = ts.id
         JOIN teams t ON ts.team_id = t.id
        WHERE rm.player_id = $1 AND ts.season_id = $2
        ORDER BY t.team_name`,
      [playerId, seasonId]
    );
    return r.rows;
  }

  async getAllPlayersWithTeams(seasonId = null) {
    const { query } = require('../../lib/database');
    let sql = `
      SELECT 
        p.id, 
        p.player_name, 
        p.gamertag,
        COALESCE(t.team_name, 'No Team') as team_name,
        COALESCE(t.color, '#808080') as team_color
      FROM players p
      LEFT JOIN roster_memberships rm ON p.id = rm.player_id
      LEFT JOIN team_seasons ts ON rm.team_season_id = ts.id
      LEFT JOIN teams t ON ts.team_id = t.id
    `;
    
    const params = [];
    if (seasonId) {
      sql += ' WHERE ts.season_id = $1';
      params.push(seasonId);
    }
    
    sql += ' ORDER BY t.team_name, p.player_name';
    
    const result = await query(sql, params);
    return result.rows;
  }
}

module.exports = PlayersDao;