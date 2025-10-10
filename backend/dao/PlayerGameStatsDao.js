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

  async getPlayerGameStat(playerId, gameId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT pgs.*, p.player_name, p.gamertag, g.week, g.game_date,
              ts_home.team_id as home_team_id, ts_away.team_id as away_team_id,
              t_home.team_name as home_team_name, t_away.team_name as away_team_name
         FROM player_game_stats pgs
         JOIN players p ON pgs.player_id = p.id
         JOIN games g ON pgs.game_id = g.id
         LEFT JOIN team_seasons ts_home ON g.home_team_season_id = ts_home.id
         LEFT JOIN team_seasons ts_away ON g.away_team_season_id = ts_away.id
         LEFT JOIN teams t_home ON ts_home.team_id = t_home.id
         LEFT JOIN teams t_away ON ts_away.team_id = t_away.id
        WHERE pgs.player_id = $1 AND pgs.game_id = $2`,
      [playerId, gameId]
    );
    return r.rows[0] || null;
  }

  async createPlayerGameStat({ gameId, playerId, teamSeasonId, points = 0, goals = 0, assists = 0, saves = 0, shots = 0, mvps = 0, demos = 0, epicSaves = 0 }) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO player_game_stats(game_id, player_id, team_season_id, points, goals, assists, saves, shots, mvps, demos, epic_saves)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [gameId, playerId, teamSeasonId, points, goals, assists, saves, shots, mvps, demos, epicSaves]
    );
    return r.rows[0];
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

  async getPlayerStatsWithTeams(seasonId = null) {
    const { query } = require('../../lib/database');

    // Get comprehensive stats from player_game_stats table with team information
    try {
      let sql = `
        WITH player_team_stats AS (
          SELECT
            p.id,
            p.player_name,
            p.gamertag,
            ts.id as team_season_id,
            t.team_name,
            t.color as team_color,
            SUM(pgs.points) as team_points,
            COUNT(pgs.game_id) as team_games
          FROM player_game_stats pgs
          JOIN players p ON pgs.player_id = p.id
          JOIN games g ON pgs.game_id = g.id
          LEFT JOIN team_seasons ts ON pgs.team_season_id = ts.id
          LEFT JOIN teams t ON ts.team_id = t.id
      `;

      const params = [];
      let whereClause = [];

      if (seasonId && seasonId !== 'career') {
        const seasonIdInt = parseInt(seasonId);
        if (!isNaN(seasonIdInt)) {
          whereClause.push('g.season_id = $' + (params.length + 1));
          params.push(seasonIdInt);
        }
      }

      if (whereClause.length > 0) {
        sql += ' WHERE ' + whereClause.join(' AND ');
      }

      sql += `
          GROUP BY p.id, p.player_name, p.gamertag, ts.id, t.team_name, t.color
        ),
        primary_teams AS (
          SELECT DISTINCT ON (id)
            id,
            team_name,
            team_color
          FROM player_team_stats
          ORDER BY id, team_points DESC, team_games DESC
        )
        SELECT
          p.id,
          p.player_name,
          p.gamertag,
          COALESCE(pt.team_name, 'Multiple Teams') as team_name,
          COALESCE(pt.team_color, '#808080') as team_color,
          SUM(pgs.points) as total_points,
          SUM(pgs.goals) as total_goals,
          SUM(pgs.assists) as total_assists,
          SUM(pgs.saves) as total_saves,
          SUM(pgs.shots) as total_shots,
          SUM(pgs.mvps) as total_mvps,
          SUM(pgs.demos) as total_demos,
          SUM(pgs.epic_saves) as total_epic_saves,
          COUNT(pgs.game_id) as games_played,
          ROUND((SUM(pgs.points)::numeric / NULLIF(COUNT(pgs.game_id), 0))::numeric, 2) as avg_points_per_game,
          ROUND((SUM(pgs.goals)::numeric / NULLIF(COUNT(pgs.game_id), 0))::numeric, 2) as avg_goals_per_game,
          ROUND((SUM(pgs.saves)::numeric / NULLIF(COUNT(pgs.game_id), 0))::numeric, 2) as avg_saves_per_game,
          ROUND(((SUM(pgs.goals) + SUM(pgs.assists))::numeric / NULLIF(COUNT(pgs.game_id), 0))::numeric, 2) as avg_goal_involvement
        FROM player_game_stats pgs
        JOIN players p ON pgs.player_id = p.id
        JOIN games g ON pgs.game_id = g.id
        LEFT JOIN primary_teams pt ON p.id = pt.id
      `;

      if (whereClause.length > 0) {
        sql += ' WHERE ' + whereClause.join(' AND ');
      }

      sql += ' GROUP BY p.id, p.player_name, p.gamertag, pt.team_name, pt.team_color ORDER BY total_points DESC';

      const result = await query(sql, params);
      
      // If we have data, return it
      if (result.rows.length > 0) {
        return result.rows;
      }
    } catch (error) {
      console.error('Player game stats query failed:', error.message);
      throw error; // Don't fall back to mock data, throw the error instead
    }
    
    // Return empty array if no data found instead of generating mock data
    return [];
  }

  async findAllWithNames(seasonId = null) {
    const { query } = require('../../lib/database');

    let sql = `SELECT
         pgs.id,
         pgs.game_id,
         pgs.player_id,
         pgs.team_season_id,
         pgs.points,
         pgs.goals,
         pgs.assists,
         pgs.saves,
         pgs.shots,
         pgs.mvps,
         pgs.demos,
         pgs.epic_saves,
         p.player_name,
         p.player_name as player_display_name,
         COALESCE(ts.display_name, t.team_name) as team_name,
         g.week as game_week,
         CONCAT('Week ', g.week, ' - Game ', COALESCE(g.series_game, 1)) as game_name
       FROM player_game_stats pgs
       JOIN players p ON pgs.player_id = p.id
       JOIN team_seasons ts ON pgs.team_season_id = ts.id
       JOIN teams t ON ts.team_id = t.id
       JOIN games g ON pgs.game_id = g.id`;

    const params = [];
    if (seasonId) {
      sql += ` WHERE g.season_id = $1`;
      params.push(parseInt(seasonId));
    }

    sql += ` ORDER BY g.week DESC, g.series_game ASC, p.player_name ASC`;

    const r = await query(sql, params);
    return r.rows;
  }

  async getAggregatedStats(seasonFilter = '') {
    const { query } = require('../../lib/database');
    
    try {
      // Try to get players with roster memberships first
      let sql = `
        SELECT 
          p.id,
          p.player_name,
          p.gamertag,
          COALESCE(t.team_name, 'Career Total') as team_name,
          COALESCE(t.color, '#999999') as team_color,
          COALESCE(SUM(pgs.points), 0) as total_points,
          COALESCE(SUM(pgs.goals), 0) as total_goals,
          COALESCE(SUM(pgs.assists), 0) as total_assists,
          COALESCE(SUM(pgs.saves), 0) as total_saves,
          COALESCE(SUM(pgs.shots), 0) as total_shots,
          COALESCE(SUM(pgs.mvps), 0) as total_mvps,
          COALESCE(SUM(pgs.demos), 0) as total_demos,
          COALESCE(SUM(pgs.epic_saves), 0) as total_epic_saves,
          COALESCE(COUNT(pgs.game_id), 0) as games_played,
          0 as avg_points_per_game,
          0 as avg_goals_per_game,
          0 as avg_saves_per_game,
          COALESCE(seasons.season_name, 'Career') as season_name
        FROM roster_memberships rm
        JOIN players p ON rm.player_id = p.id
        JOIN team_seasons ts ON rm.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        LEFT JOIN seasons ON ts.season_id = seasons.id
        LEFT JOIN player_game_stats pgs ON pgs.player_id = p.id AND pgs.team_season_id = ts.id
        WHERE 1=1 ${seasonFilter}
        GROUP BY p.id, p.player_name, p.gamertag, t.team_name, t.color, seasons.season_name
        ORDER BY total_points DESC, total_goals DESC
      `;
      
      const result = await query(sql);
      
      // If no results and we're querying a specific historical season, return all players with zero stats
      if (result.rows.length === 0 && seasonFilter.includes('Season')) {
        console.log('No roster data found for historical season, returning all players with zero stats');
        
        // Determine season name based on filter
        let seasonName = 'Career';
        if (seasonFilter.includes('Season 1')) {
          seasonName = 'Fall 2024';
        } else if (seasonFilter.includes('Season 2')) {
          seasonName = 'Summer 2025';
        }
        
        const fallbackResult = await query(`
          SELECT 
            p.id,
            p.player_name,
            p.gamertag,
            'Career Total' as team_name,
            '#999999' as team_color,
            0 as total_points,
            0 as total_goals,
            0 as total_assists,
            0 as total_saves,
            0 as total_shots,
            0 as total_mvps,
            0 as total_demos,
            0 as total_epic_saves,
            0 as games_played,
            0 as avg_points_per_game,
            0 as avg_goals_per_game,
            0 as avg_saves_per_game,
            $1 as season_name
          FROM players p
          ORDER BY p.player_name
        `, [seasonName]);
        return fallbackResult.rows;
      }
      
      return result.rows;
    } catch (error) {
      console.error('Failed to get aggregated stats:', error.message);
      console.error('Falling back to simple player query without stats aggregation');
      
      // Try simpler approach without player_game_stats table
      try {
        const simpleResult = await query(`
          SELECT 
            p.id,
            p.player_name,
            p.gamertag,
            'Career Total' as team_name,
            '#999999' as team_color,
            0 as total_points,
            0 as total_goals,
            0 as total_assists,
            0 as total_saves,
            0 as total_shots,
            0 as total_mvps,
            0 as total_demos,
            0 as total_epic_saves,
            0 as games_played,
            0 as avg_points_per_game,
            0 as avg_goals_per_game,
            0 as avg_saves_per_game,
            'Career' as season_name
          FROM players p
          ORDER BY p.player_name
        `);
        
        console.log(`Returning ${simpleResult.rows.length} players with zero stats`);
        return simpleResult.rows;
      } catch (fallbackError) {
        console.error('Even simple player query failed:', fallbackError.message);
        // Return mock data as last resort
        return this.getPlayerStatsWithTeams();
      }
    }
  }
}

module.exports = PlayerGameStatsDao;