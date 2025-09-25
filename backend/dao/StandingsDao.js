const BaseDao = require('./BaseDao');
const StandingsCalculator = require('../utils/standingsCalculator');

class StandingsDao extends BaseDao {
  constructor() {
    super('standings');
  }

  async upsertRow({
    seasonId,
    teamSeasonId,
    wins = 0,
    losses = 0,
    pointsFor = 0,
    pointsAgainst = 0,
    leaguePoints = 0,
    regulationWins = 0,
    overtimeWins = 0,
    overtimeLosses = 0,
    regulationLosses = 0,
    forfeits = 0
  }) {
    const { query } = require('../../lib/database');
    const r = await query(
      `INSERT INTO standings(
        season_id, team_season_id, wins, losses,
        points_for, points_against, league_points,
        regulation_wins, overtime_wins, overtime_losses, regulation_losses, forfeits
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (season_id, team_season_id) DO UPDATE
         SET wins = EXCLUDED.wins, losses = EXCLUDED.losses,
             points_for = EXCLUDED.points_for, points_against = EXCLUDED.points_against,
             league_points = EXCLUDED.league_points,
             regulation_wins = EXCLUDED.regulation_wins,
             overtime_wins = EXCLUDED.overtime_wins,
             overtime_losses = EXCLUDED.overtime_losses,
             regulation_losses = EXCLUDED.regulation_losses,
             forfeits = EXCLUDED.forfeits
       RETURNING *`,
      [seasonId, teamSeasonId, wins, losses, pointsFor, pointsAgainst, leaguePoints,
       regulationWins, overtimeWins, overtimeLosses, regulationLosses, forfeits]
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
          ts.conference,
          COALESCE(s.wins, 0) as wins,
          COALESCE(s.losses, 0) as losses,
          COALESCE(s.points_for, 0) as points_for,
          COALESCE(s.points_against, 0) as points_against,
          COALESCE(s.league_points, 0) as league_points,
          COALESCE(s.regulation_wins, 0) as regulation_wins,
          COALESCE(s.overtime_wins, 0) as overtime_wins,
          COALESCE(s.overtime_losses, 0) as overtime_losses,
          COALESCE(s.regulation_losses, 0) as regulation_losses,
          COALESCE(s.forfeits, 0) as forfeits,
          COALESCE((s.points_for - s.points_against), 0) as point_diff,
          CASE
            WHEN (COALESCE(s.wins, 0) + COALESCE(s.losses, 0)) > 0
            THEN CAST(COALESCE(s.wins, 0) AS FLOAT) / (COALESCE(s.wins, 0) + COALESCE(s.losses, 0)) * 100
            ELSE 0
          END as win_percentage,
          $1 as season_id
        FROM team_seasons ts
        JOIN teams t ON ts.team_id = t.id
        LEFT JOIN standings s ON s.team_season_id = ts.id AND s.season_id = $1
        WHERE ts.season_id = $1
        ORDER BY COALESCE(s.league_points, 0) DESC, COALESCE(s.wins, 0) DESC, COALESCE((s.points_for - s.points_against), 0) DESC, COALESCE(ts.display_name, t.team_name)
      `;
      
      const r = await query(sql, [seasonId]);
      return r.rows;
    } catch (error) {
      console.log('Standings query failed:', error.message);
      // Return empty array if query fails
      return [];
    }
  }

  /**
   * Auto-generate standings from game results for a season
   * @param {number} seasonId - Season ID to generate standings for
   * @returns {Promise<Array>} Generated standings
   */
  async autoGenerateStandings(seasonId) {
    try {
      const database = require('../../lib/database');

      // Generate standings using the calculator
      const generatedStandings = await StandingsCalculator.generateStandings(seasonId, database);

      // Update the standings table with calculated values
      const updatedStandings = [];
      for (const standing of generatedStandings) {
        const updatedStanding = await this.upsertRow({
          seasonId: seasonId,
          teamSeasonId: standing.teamSeasonId,
          wins: standing.wins,
          losses: standing.losses,
          pointsFor: standing.pointsFor,
          pointsAgainst: standing.pointsAgainst,
          leaguePoints: standing.leaguePoints,
          regulationWins: standing.regulationWins,
          overtimeWins: standing.overtimeWins,
          overtimeLosses: standing.overtimeLosses,
          regulationLosses: standing.regulationLosses,
          forfeits: standing.forfeits
        });
        updatedStandings.push(updatedStanding);
      }

      return updatedStandings;
    } catch (error) {
      console.error('Failed to auto-generate standings:', error);
      throw error;
    }
  }

  /**
   * Get league points breakdown for a specific team in a season
   * @param {number} seasonId - Season ID
   * @param {number} teamSeasonId - Team Season ID
   * @returns {Promise<Array>} Array of games with league points breakdown
   */
  async getLeaguePointsBreakdown(seasonId, teamSeasonId) {
    const { query } = require('../../lib/database');

    try {
      // Get all games for this team in the season with opponent info and calculated goal totals
      const gamesResult = await query(`
        SELECT
          g.*,
          COALESCE(home_goals.total, 0) as total_home_goals,
          COALESCE(away_goals.total, 0) as total_away_goals,
          CASE
            WHEN g.home_team_season_id = $2 THEN 'home'
            ELSE 'away'
          END as team_position,
          CASE
            WHEN g.home_team_season_id = $2 THEN COALESCE(home_goals.total, 0)
            ELSE COALESCE(away_goals.total, 0)
          END as team_score,
          CASE
            WHEN g.home_team_season_id = $2 THEN COALESCE(away_goals.total, 0)
            ELSE COALESCE(home_goals.total, 0)
          END as opponent_score,
          CASE
            WHEN g.home_team_season_id = $2 THEN ats.display_name
            ELSE hts.display_name
          END as opponent_name,
          CASE
            WHEN g.home_team_season_id = $2 THEN g.away_team_forfeit
            ELSE g.home_team_forfeit
          END as opponent_forfeited,
          CASE
            WHEN g.home_team_season_id = $2 THEN g.home_team_forfeit
            ELSE g.away_team_forfeit
          END as team_forfeited
        FROM games g
        JOIN team_seasons hts ON g.home_team_season_id = hts.id
        JOIN team_seasons ats ON g.away_team_season_id = ats.id
        LEFT JOIN (
          SELECT
            pgs.game_id,
            pgs.team_season_id,
            SUM(pgs.goals) as total
          FROM player_game_stats pgs
          GROUP BY pgs.game_id, pgs.team_season_id
        ) home_goals ON home_goals.game_id = g.id AND home_goals.team_season_id = g.home_team_season_id
        LEFT JOIN (
          SELECT
            pgs.game_id,
            pgs.team_season_id,
            SUM(pgs.goals) as total
          FROM player_game_stats pgs
          GROUP BY pgs.game_id, pgs.team_season_id
        ) away_goals ON away_goals.game_id = g.id AND away_goals.team_season_id = g.away_team_season_id
        WHERE g.season_id = $1
          AND (g.home_team_season_id = $2 OR g.away_team_season_id = $2)
        ORDER BY g.week, g.series_game
      `, [seasonId, teamSeasonId]);

      // Get player game stats for overtime detection
      const statsResult = await query(`
        SELECT pgs.*
        FROM player_game_stats pgs
        JOIN games g ON pgs.game_id = g.id
        WHERE g.season_id = $1
          AND (g.home_team_season_id = $2 OR g.away_team_season_id = $2)
      `, [seasonId, teamSeasonId]);

      const games = gamesResult.rows;
      const playerStats = statsResult.rows;
      const breakdown = [];

      for (const game of games) {
        const teamScore = game.team_score || 0;
        const opponentScore = game.opponent_score || 0;

        // Skip unplayed games (0-0 with no forfeits)
        if (teamScore === 0 && opponentScore === 0 && !game.team_forfeited && !game.opponent_forfeited) {
          continue;
        }

        // Get player stats for this game to detect overtime
        const gameStats = playerStats.filter(stat => stat.game_id === game.id);
        const hasOvertime = gameStats.some(stat => stat.otg && stat.otg > 0);

        let points = 0;
        let gameType = '';

        // Calculate points using same logic as StandingsCalculator
        if (game.team_forfeited) {
          points = 0;
          gameType = 'forfeit';
        } else if (game.opponent_forfeited) {
          points = 4;
          gameType = 'regulation_win';
        } else if (teamScore > opponentScore) {
          // Win
          points = hasOvertime ? 3 : 4;
          gameType = hasOvertime ? 'overtime_win' : 'regulation_win';
        } else if (teamScore < opponentScore) {
          // Loss
          points = hasOvertime ? 2 : 1;
          gameType = hasOvertime ? 'overtime_loss' : 'regulation_loss';
        } else {
          // This shouldn't happen in Rocket League
          points = 0;
          gameType = 'tie';
        }

        breakdown.push({
          game_id: game.id,
          week_number: game.week,
          opponent_name: game.opponent_name,
          team_score: teamScore,
          opponent_score: opponentScore,
          points: points,
          game_type: gameType,
          has_overtime: hasOvertime
        });
      }

      return breakdown;
    } catch (error) {
      console.error('Failed to get league points breakdown:', error);
      throw error;
    }
  }
}

module.exports = StandingsDao;