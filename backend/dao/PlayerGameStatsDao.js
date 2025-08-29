const BaseDao = require('./BaseDao');

class PlayerGameStatsDao extends BaseDao {
  constructor() {
    super('player_game_stats');
  }

  async upsertRow({ gameId, playerId, teamSeasonId, points = 0, goals = 0, assists = 0, saves = 0, shots = 0, mvps = 0, demos = 0, epicSaves = 0 }) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO player_game_stats(game_id, player_id, team_season_id, points, goals, assists, saves, shots, mvps, demos, epic_saves)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (game_id, player_id) DO UPDATE
         SET team_season_id = EXCLUDED.team_season_id,
             points = EXCLUDED.points, goals = EXCLUDED.goals, assists = EXCLUDED.assists,
             saves = EXCLUDED.saves, shots = EXCLUDED.shots, mvps = EXCLUDED.mvps,
             demos = EXCLUDED.demos, epic_saves = EXCLUDED.epic_saves
       RETURNING *`,
      [gameId, playerId, teamSeasonId, points, goals, assists, saves, shots, mvps, demos, epicSaves]
    );
    return r.rows[0];
  }

  async listByGame(gameId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT pgs.*, p.player_name, p.gamertag
         FROM player_game_stats pgs
         JOIN players p ON pgs.player_id = p.id
        WHERE pgs.game_id = $1
        ORDER BY p.player_name`,
      [gameId]
    );
    return r.rows;
  }

  async totalsForTeamSeason(teamSeasonId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT 
         SUM(points) AS points, SUM(goals) AS goals, SUM(assists) AS assists,
         SUM(saves) AS saves, SUM(shots) AS shots, SUM(mvps) AS mvps,
         SUM(demos) AS demos, SUM(epic_saves) AS epic_saves
       FROM player_game_stats WHERE team_season_id = $1`,
      [teamSeasonId]
    );
    return r.rows[0];
  }
}

module.exports = PlayerGameStatsDao;