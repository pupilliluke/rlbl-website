const BaseDao = require('./BaseDao');

class GamesDao extends BaseDao {
  constructor() {
    super('games');
  }

  async listBySeason(seasonId, { week = null, limit = 200, offset = 0 } = {}) {
    const { query } = require('../../lib/database');
    const params = [seasonId];
    let sql = `
      SELECT g.*,
             hts.display_name AS home_display, ats.display_name AS away_display
        FROM games g
        JOIN team_seasons hts ON g.home_team_season_id = hts.id
        JOIN team_seasons ats ON g.away_team_season_id = ats.id
       WHERE g.season_id = $1`;
    if (week !== null) { params.push(week); sql += ` AND g.week = $${params.length}`; }
    params.push(limit, offset);
    sql += ` ORDER BY g.week ASC, g.series_game ASC, g.game_date ASC NULLS LAST LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const r = await query(sql, params);
    return r.rows;
  }

  async createGame({ seasonId, homeTeamSeasonId, awayTeamSeasonId, gameDate = null, week = null, isPlayoffs = false }) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO games(season_id, home_team_season_id, away_team_season_id, game_date, week, is_playoffs)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [seasonId, homeTeamSeasonId, awayTeamSeasonId, gameDate, week, isPlayoffs]
    );
    return r.rows[0];
  }

  async createSeriesGame({ seasonId, homeTeamSeasonId, awayTeamSeasonId, gameDate = null, week = null, isPlayoffs = false }) {
    const { query } = require('../../lib/database');
    
    // Find the highest series_game number for this matchup in this week
    const maxSeriesGameResult = await query(
      `SELECT COALESCE(MAX(series_game), 0) as max_series_game 
       FROM games 
       WHERE season_id = $1 
       AND week = $2 
       AND ((home_team_season_id = $3 AND away_team_season_id = $4) 
            OR (home_team_season_id = $4 AND away_team_season_id = $3))`,
      [seasonId, week, homeTeamSeasonId, awayTeamSeasonId]
    );
    
    const nextSeriesGame = maxSeriesGameResult.rows[0].max_series_game + 1;
    
    // Create the new game with the incremented series_game number
    const r = await query(
      `INSERT INTO games(season_id, home_team_season_id, away_team_season_id, game_date, week, is_playoffs, series_game)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [seasonId, homeTeamSeasonId, awayTeamSeasonId, gameDate, week, isPlayoffs, nextSeriesGame]
    );
    return r.rows[0];
  }

  async getSeriesGames(seasonId, week, homeTeamSeasonId, awayTeamSeasonId) {
    const { query } = require('../../lib/database');
    const r = await query(
      `SELECT g.*, 
             hts.display_name AS home_display, 
             ats.display_name AS away_display
       FROM games g
       JOIN team_seasons hts ON g.home_team_season_id = hts.id
       JOIN team_seasons ats ON g.away_team_season_id = ats.id
       WHERE g.season_id = $1 
       AND g.week = $2 
       AND ((g.home_team_season_id = $3 AND g.away_team_season_id = $4) 
            OR (g.home_team_season_id = $4 AND g.away_team_season_id = $3))
       ORDER BY g.series_game ASC`,
      [seasonId, week, homeTeamSeasonId, awayTeamSeasonId]
    );
    return r.rows;
  }

  async setScore(gameId, homeScore, awayScore) {
    const { query } = require('../../lib/database');
    const r = await query(
      `UPDATE games SET home_score = $2, away_score = $3 WHERE id = $1 RETURNING *`,
      [gameId, homeScore, awayScore]
    );
    return r.rows[0];
  }

  async updateNotes(gameId, notes) {
    const { query } = require('../../lib/database');
    const r = await query(
      `UPDATE games SET notes = $2 WHERE id = $1 RETURNING *`,
      [gameId, notes]
    );
    return r.rows[0];
  }

  async deleteBySeason(seasonId) {
    const { query } = require('../../lib/database');
    await query('DELETE FROM games WHERE season_id = $1', [seasonId]);
  }

  async getScheduleWithTeams() {
    const { query } = require('../../lib/database');
    try {
      // Try the team_seasons approach first
      const r = await query(`
        SELECT 
          g.id,
          g.week,
          g.game_date,
          g.home_score,
          g.away_score,
          g.is_playoffs,
          hts.display_name as home_team_name,
          ht.color as home_team_color,
          ht.logo_url as home_team_logo,
          ats.display_name as away_team_name,
          at.color as away_team_color,
          at.logo_url as away_team_logo,
          CASE 
            WHEN g.home_score > g.away_score THEN hts.display_name
            WHEN g.away_score > g.home_score THEN ats.display_name
            ELSE 'TIE'
          END as winner
        FROM games g
        JOIN team_seasons hts ON g.home_team_season_id = hts.id
        JOIN team_seasons ats ON g.away_team_season_id = ats.id
        JOIN teams ht ON hts.team_id = ht.id
        JOIN teams at ON ats.team_id = at.id
        ORDER BY g.week, g.game_date
      `);
      return r.rows;
    } catch (error) {
      // If team_seasons doesn't exist, return empty schedule
      return [];
    }
  }
}

module.exports = GamesDao;