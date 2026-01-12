/**
 * SeasonStatsSync - Middle-man model to transform Google Sheets data to database format
 *
 * This model handles the transformation of raw CSV data from Google Sheets into
 * the format required by the database API endpoints for player_game_stats.
 */

class SeasonStatsSync {
  /**
   * Transform a single player stats row from Google Sheets to season_stats table format
   * @param {Object} sheetRow - Raw row from Google Sheets CSV
   * @param {Object} mappings - Object containing { playerId, teamSeasonId, seasonId }
   * @returns {Object} Formatted stats object ready for database insertion
   */
  static transformPlayerStats(sheetRow, mappings) {
    const { playerId, teamSeasonId, seasonId } = mappings;

    if (!playerId || !seasonId) {
      throw new Error('Missing required mappings: playerId, seasonId');
    }

    return {
      season_id: parseInt(seasonId),
      player_id: parseInt(playerId),
      team_season_id: teamSeasonId ? parseInt(teamSeasonId) : null,
      player_name: sheetRow['Player'] || '',
      team_name: null, // Don't use team name from sheets - will be derived from team_season_id
      conference: sheetRow['Conference'] || null,
      points: this.parseStatValue(sheetRow['Points']),
      goals: this.parseStatValue(sheetRow['Goals']),
      assists: this.parseStatValue(sheetRow['Assists']),
      saves: this.parseStatValue(sheetRow['Saves']),
      shots: this.parseStatValue(sheetRow['Shots']),
      mvps: this.parseStatValue(sheetRow['MVPs'] || sheetRow['MVP']),
      demos: this.parseStatValue(sheetRow['Demos']),
      epic_saves: this.parseStatValue(sheetRow['Epic Saves']),
      games_played: this.parseStatValue(sheetRow['Games Played']),
      otg: this.parseStatValue(sheetRow['OTG']),
      shot_percentage: this.parseDecimalValue(sheetRow['SH%']),
      epic_save_percentage: this.parseDecimalValue(sheetRow['Epic Save %']),
      saves_per_game: this.parseDecimalValue(sheetRow['SVPG']),
      demos_per_game: this.parseDecimalValue(sheetRow['Demo/Game']),
      points_per_game: this.parseDecimalValue(sheetRow['PPG']),
      goals_per_game: this.parseDecimalValue(sheetRow['GPG']),
      assists_per_game: this.parseDecimalValue(sheetRow['APG']),
      is_rookie: sheetRow['Player']?.includes('*') || false
    };
  }

  /**
   * Parse a stat value from sheet format (may have commas, be empty, etc.)
   * @param {string|number} value - Raw value from sheet
   * @returns {number} Parsed integer value
   */
  static parseStatValue(value) {
    if (value === null || value === undefined || value === '' || value === '-') {
      return 0;
    }

    // Remove commas and convert to number
    const parsed = typeof value === 'string'
      ? parseInt(value.replace(/,/g, ''))
      : parseInt(value);

    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Parse a decimal value from sheet format (percentages, averages)
   * @param {string|number} value - Raw value from sheet
   * @returns {number|null} Parsed decimal value or null
   */
  static parseDecimalValue(value) {
    if (value === null || value === undefined || value === '' || value === '-') {
      return null;
    }

    // Remove commas and % signs, convert to number
    const cleaned = typeof value === 'string'
      ? value.replace(/,/g, '').replace(/%/g, '')
      : value;

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Batch transform multiple player stats rows
   * @param {Array} sheetData - Array of sheet rows
   * @param {Function} mappingResolver - Function that takes a sheet row and returns { playerId, teamSeasonId, gameId }
   * @returns {Array} Array of transformed stats objects
   */
  static transformBatch(sheetData, mappingResolver) {
    const results = [];
    const errors = [];

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];

      try {
        const mappings = mappingResolver(row, i);

        if (mappings) {
          const transformed = this.transformPlayerStats(row, mappings);
          results.push(transformed);
        }
      } catch (error) {
        errors.push({
          rowIndex: i,
          playerName: row['Player'],
          error: error.message
        });
      }
    }

    return { results, errors };
  }

  /**
   * Validate a transformed stats object before sending to database
   * @param {Object} statsObject - Transformed stats object
   * @returns {Object} { valid: boolean, errors: Array }
   */
  static validate(statsObject) {
    const errors = [];
    const required = ['season_id', 'player_id', 'player_name'];

    // Check required fields
    required.forEach(field => {
      if (!statsObject[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate numeric fields
    const numericFields = ['points', 'goals', 'assists', 'saves', 'shots', 'mvps', 'demos', 'epic_saves', 'games_played'];
    numericFields.forEach(field => {
      if (statsObject[field] !== undefined && statsObject[field] !== null && isNaN(statsObject[field])) {
        errors.push(`Invalid numeric value for ${field}: ${statsObject[field]}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a mapping resolver helper for aggregated season stats
   * @param {Object} lookupTables - { players: Map, teamSeasons: Map }
   * @param {number} seasonId - Season ID for these stats
   * @returns {Function} Resolver function
   */
  static createSeasonStatsResolver(lookupTables, seasonId) {
    const { players, teamSeasons } = lookupTables;

    return (sheetRow, rowIndex) => {
      const playerName = sheetRow['Player'];
      const teamName = sheetRow['Team'] || sheetRow['WEST'] || sheetRow['West'] || sheetRow['East'];

      if (!playerName) {
        return null; // Skip rows without player
      }

      // Find player ID
      const playerId = players.get(playerName?.toLowerCase());
      if (!playerId) {
        console.warn(`Player not found in database: ${playerName}`);
        return null;
      }

      // Find team season ID (optional - player might not have team)
      let teamSeasonId = null;
      if (teamName) {
        const teamSeasonKey = `${teamName.toLowerCase()}_${seasonId}`;
        teamSeasonId = teamSeasons.get(teamSeasonKey);
        if (!teamSeasonId) {
          console.warn(`Team season not found: ${teamName} for season ${seasonId}`);
        }
      }

      return {
        playerId,
        teamSeasonId,
        seasonId
      };
    };
  }
}

module.exports = SeasonStatsSync;
