const BaseDao = require('./BaseDao');

class RosterMembershipsDao extends BaseDao {
  constructor() {
    super('roster_memberships');
  }

  async add(playerId, teamSeasonId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO roster_memberships(player_id, team_season_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
      [playerId, teamSeasonId]
    );
    return r.rows[0] || null; // null if already exists
  }

  async listByTeamSeason(teamSeasonId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT rm.*, p.player_name, p.gamertag
         FROM roster_memberships rm
         JOIN players p ON rm.player_id = p.id
        WHERE rm.team_season_id = $1
        ORDER BY p.player_name`,
      [teamSeasonId]
    );
    return r.rows;
  }

  async listByPlayer(playerId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT rm.*, ts.season_id, t.team_name
         FROM roster_memberships rm
         JOIN team_seasons ts ON rm.team_season_id = ts.id
         JOIN teams t ON ts.team_id = t.id
        WHERE rm.player_id = $1
        ORDER BY ts.season_id DESC, t.team_name`,
      [playerId]
    );
    return r.rows;
  }

  async deleteByPlayerAndSeason(playerId, seasonId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `DELETE FROM roster_memberships rm
        USING team_seasons ts
        WHERE rm.team_season_id = ts.id
          AND rm.player_id = $1
          AND ts.season_id = $2
       RETURNING rm.id`,
      [playerId, seasonId]
    );
    return r.rows;
  }
}

module.exports = RosterMembershipsDao;