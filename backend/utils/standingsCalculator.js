/**
 * Standings Calculator - Auto-generates standings from game results
 *
 * Point System:
 * - 4 points: Regulation Win
 * - 3 points: Overtime Win
 * - 2 points: Overtime Loss
 * - 1 point: Regulation Loss
 * - 0 points: Forfeit (if point differential < 5 and game marked incomplete)
 */

class StandingsCalculator {
  /**
   * Calculate league points and game type for a team in a specific game
   * @param {Object} game - Game object with scores and details
   * @param {Object} teamStats - Team's stats for this game
   * @param {boolean} isHomeTeam - Whether this team was home
   * @param {Array} allTeamStats - All team stats for this game (to check for OT)
   * @returns {Object} { points: number, gameType: string }
   */
  static calculateGamePoints(game, teamStats, isHomeTeam, allTeamStats) {
    const homeScore = game.total_home_goals || 0;
    const awayScore = game.total_away_goals || 0;
    const teamScore = isHomeTeam ? homeScore : awayScore;
    const opponentScore = isHomeTeam ? awayScore : homeScore;

    // Check if this specific team forfeited
    const teamForfeited = isHomeTeam ? game.home_team_forfeit : game.away_team_forfeit;
    const opponentForfeited = isHomeTeam ? game.away_team_forfeit : game.home_team_forfeit;

    if (teamForfeited) {
      // This team forfeited - gets 0 points regardless of score
      return {
        points: 0,
        gameType: 'forfeit'
      };
    } else if (opponentForfeited) {
      // This team won against a forfeit - gets 4 points
      return {
        points: 4,
        gameType: 'regulation_win'
      };
    }

    // Fallback: if game marked incomplete but no specific forfeit flags, use old logic
    if (game.incomplete) {
      const scoreDiff = Math.abs(teamScore - opponentScore);
      if (scoreDiff > 5) {
        // The team with significantly fewer goals forfeited
        const inferredTeamForfeited = teamScore < opponentScore;

        if (inferredTeamForfeited) {
          // This team forfeited - gets 0 points
          return {
            points: 0,
            gameType: 'forfeit'
          };
        } else {
          // This team won against a forfeit - gets 4 points
          return {
            points: 4,
            gameType: 'regulation_win'
          };
        }
      }
      // If score diff <= 5, treat as a normal completed game despite being marked incomplete
    }

    // Check for overtime by looking for OTG in any player's stats
    const hasOvertime = allTeamStats.some(playerStats =>
      playerStats.otg && playerStats.otg > 0
    );

    if (teamScore > opponentScore) {
      // Win
      return {
        points: hasOvertime ? 3 : 4,
        gameType: hasOvertime ? 'overtime_win' : 'regulation_win'
      };
    } else if (teamScore < opponentScore) {
      // Loss
      return {
        points: hasOvertime ? 2 : 1,
        gameType: hasOvertime ? 'overtime_loss' : 'regulation_loss'
      };
    } else {
      // This should never happen in Rocket League - no ties possible
      throw new Error(`Invalid game state: tie score ${teamScore}-${opponentScore} in game`);
    }
  }

  /**
   * Generate standings for a season from game results
   * @param {number} seasonId - Season ID
   * @param {Object} database - Database query function
   * @returns {Promise<Array>} Array of team standings
   */
  static async generateStandings(seasonId, database) {
    const { query } = database;

    try {
      // Get all games for the season with team info
      const gamesResult = await query(`
        SELECT
          g.*,
          hts.display_name as home_display,
          ats.display_name as away_display
        FROM games g
        JOIN team_seasons hts ON g.home_team_season_id = hts.id
        JOIN team_seasons ats ON g.away_team_season_id = ats.id
        WHERE g.season_id = $1
      `, [seasonId]);

      // Get all player game stats for the season
      const statsResult = await query(`
        SELECT pgs.*
        FROM player_game_stats pgs
        JOIN games g ON pgs.game_id = g.id
        WHERE g.season_id = $1
      `, [seasonId]);

      // Get all teams for the season
      const teamsResult = await query(`
        SELECT ts.id as team_season_id
        FROM team_seasons ts
        WHERE ts.season_id = $1
      `, [seasonId]);

      const games = gamesResult.rows;
      const playerStats = statsResult.rows;
      const teams = teamsResult.rows;

      // Initialize standings for all teams
      const standings = {};
      teams.forEach(team => {
        standings[team.team_season_id] = {
          teamSeasonId: team.team_season_id,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          leaguePoints: 0,
          regulationWins: 0,
          overtimeWins: 0,
          overtimeLosses: 0,
          regulationLosses: 0,
          forfeits: 0
        };
      });

      // Process each game
      games.forEach(game => {
        const homeScore = game.total_home_goals || 0;
        const awayScore = game.total_away_goals || 0;

        // Get player stats for this game
        const gameStats = playerStats.filter(stat => stat.game_id === game.id);
        const homeTeamStats = gameStats.filter(stat => stat.team_season_id === game.home_team_season_id);
        const awayTeamStats = gameStats.filter(stat => stat.team_season_id === game.away_team_season_id);
        const allGameStats = [...homeTeamStats, ...awayTeamStats];

        // Calculate goals from player stats (more accurate)
        const homeGoalsFromStats = homeTeamStats.reduce((sum, stat) => sum + (stat.goals || 0), 0);
        const awayGoalsFromStats = awayTeamStats.reduce((sum, stat) => sum + (stat.goals || 0), 0);

        // Use stats-based goals if they exist, otherwise use game scores
        const finalHomeScore = homeGoalsFromStats || homeScore;
        const finalAwayScore = awayGoalsFromStats || awayScore;

        // Skip unplayed games (0-0 scores with no forfeits)
        if (finalHomeScore === 0 && finalAwayScore === 0 &&
            !game.home_team_forfeit && !game.away_team_forfeit) {
          return; // Skip this game - 0-0 with no forfeits means unplayed
        }

        // Update game object with calculated scores
        const updatedGame = {
          ...game,
          total_home_goals: finalHomeScore,
          total_away_goals: finalAwayScore
        };

        // Calculate league points and game types
        const homeResult = this.calculateGamePoints(updatedGame, homeTeamStats, true, allGameStats);
        const awayResult = this.calculateGamePoints(updatedGame, awayTeamStats, false, allGameStats);

        // Update standings for home team
        if (standings[game.home_team_season_id]) {
          const homeStanding = standings[game.home_team_season_id];
          homeStanding.pointsFor += finalHomeScore;
          homeStanding.pointsAgainst += finalAwayScore;
          homeStanding.leaguePoints += homeResult.points;

          // Update detailed breakdown
          switch (homeResult.gameType) {
            case 'regulation_win':
              homeStanding.wins++;
              homeStanding.regulationWins++;
              break;
            case 'overtime_win':
              homeStanding.wins++;
              homeStanding.overtimeWins++;
              break;
            case 'regulation_loss':
              homeStanding.losses++;
              homeStanding.regulationLosses++;
              break;
            case 'overtime_loss':
              homeStanding.losses++;
              homeStanding.overtimeLosses++;
              break;
            case 'forfeit':
              homeStanding.forfeits++;
              homeStanding.losses++; // Forfeiting team always gets a loss
              break;
          }
        }

        // Update standings for away team
        if (standings[game.away_team_season_id]) {
          const awayStanding = standings[game.away_team_season_id];
          awayStanding.pointsFor += finalAwayScore;
          awayStanding.pointsAgainst += finalHomeScore;
          awayStanding.leaguePoints += awayResult.points;

          // Update detailed breakdown
          switch (awayResult.gameType) {
            case 'regulation_win':
              awayStanding.wins++;
              awayStanding.regulationWins++;
              break;
            case 'overtime_win':
              awayStanding.wins++;
              awayStanding.overtimeWins++;
              break;
            case 'regulation_loss':
              awayStanding.losses++;
              awayStanding.regulationLosses++;
              break;
            case 'overtime_loss':
              awayStanding.losses++;
              awayStanding.overtimeLosses++;
              break;
            case 'forfeit':
              awayStanding.forfeits++;
              awayStanding.losses++; // Forfeiting team always gets a loss
              break;
          }
        }
      });

      return Object.values(standings);

    } catch (error) {
      console.error('Error generating standings:', error);
      throw error;
    }
  }
}

module.exports = StandingsCalculator;