/**
 * SeasonStatsSyncService - Service to sync Google Sheets data to database
 *
 * This service fetches data from Google Sheets, transforms it using SeasonStatsSync,
 * and pushes it to the database via API endpoints.
 */

const SeasonStatsSync = require('../models/SeasonStatsSync');
const { query } = require('../../lib/database');

class SeasonStatsSyncService {
  /**
   * Sync player stats from Google Sheets data to season_stats table
   * @param {Array} sheetData - Parsed data from Google Sheets
   * @param {number} seasonId - Season ID for these stats
   * @returns {Object} Sync results with success/failure counts
   */
  async syncPlayerStats(sheetData, seasonId) {
    // Build lookup tables for players and team_seasons
    const lookupTables = await this.buildLookupTables(seasonId);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      synced: []
    };

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];

      try {
        const playerName = row['Player'];
        const teamName = row['Team'] || row['WEST'] || row['West'] || row['East'];

        if (!playerName) {
          continue; // Skip empty rows
        }

        // Resolve player ID
        const playerId = lookupTables.players.get(playerName.toLowerCase());

        if (!playerId) {
          results.errors.push({
            row: i + 1,
            player: playerName,
            error: 'Player not found in database'
          });
          results.failed++;
          continue;
        }

        // Get team_season_id from roster_memberships (don't trust sheet team names)
        const teamSeasonId = lookupTables.playerRosters.get(`${playerId}_${seasonId}`) || null;

        // Transform sheet row to database format
        const statsData = SeasonStatsSync.transformPlayerStats(row, {
          playerId,
          teamSeasonId,
          seasonId
        });

        // Validate before syncing
        const validation = SeasonStatsSync.validate(statsData);
        if (!validation.valid) {
          results.errors.push({
            row: i + 1,
            player: playerName,
            error: validation.errors.join(', ')
          });
          results.failed++;
          continue;
        }

        // Upsert to season_stats table
        await this.upsertSeasonStats(statsData);

        results.success++;
        results.synced.push({
          player: playerName,
          team: teamName,
          stats: statsData
        });
      } catch (error) {
        results.errors.push({
          row: i + 1,
          player: row['Player'],
          error: error.message
        });
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Build lookup tables for efficient ID resolution
   * @param {number} seasonId - Season ID
   * @returns {Object} { players: Map, teamSeasons: Map, playerRosters: Map }
   */
  async buildLookupTables(seasonId) {
    // Get all players
    const playersResult = await query(
      'SELECT id, player_name, gamertag FROM players'
    );

    const players = new Map();
    playersResult.rows.forEach(player => {
      // Index by lowercase name for case-insensitive lookup
      players.set(player.player_name.toLowerCase(), player.id);
      if (player.gamertag) {
        players.set(player.gamertag.toLowerCase(), player.id);
      }
    });

    // Get all team_seasons for this season
    const teamSeasonsResult = await query(
      `SELECT ts.id, ts.team_id, ts.season_id, t.team_name, ts.display_name
       FROM team_seasons ts
       JOIN teams t ON ts.team_id = t.id
       WHERE ts.season_id = $1`,
      [seasonId]
    );

    const teamSeasons = new Map();
    teamSeasonsResult.rows.forEach(ts => {
      const key = `${ts.team_name.toLowerCase()}_${ts.season_id}`;
      teamSeasons.set(key, ts.id);

      // Also index by display_name if different
      if (ts.display_name && ts.display_name !== ts.team_name) {
        const displayKey = `${ts.display_name.toLowerCase()}_${ts.season_id}`;
        teamSeasons.set(displayKey, ts.id);
      }
    });

    // Get player roster assignments for this season
    const rostersResult = await query(
      `SELECT rm.player_id, rm.team_season_id, ts.season_id
       FROM roster_memberships rm
       JOIN team_seasons ts ON rm.team_season_id = ts.id
       WHERE ts.season_id = $1`,
      [seasonId]
    );

    const playerRosters = new Map();
    rostersResult.rows.forEach(roster => {
      const key = `${roster.player_id}_${roster.season_id}`;
      playerRosters.set(key, roster.team_season_id);
    });

    return { players, teamSeasons, playerRosters };
  }

  /**
   * Determine which game to associate stats with
   * This is a smart resolver that can find the appropriate game based on context
   *
   * @param {number} playerId - Player ID
   * @param {number} teamSeasonId - Team Season ID
   * @param {number} seasonId - Season ID
   * @returns {number|null} Game ID or null
   */
  async determineGameForStats(playerId, teamSeasonId, seasonId) {
    // Strategy 1: Find the most recent game for this team in this season
    const gameResult = await query(
      `SELECT g.id
       FROM games g
       WHERE g.season_id = $1
         AND (g.home_team_season_id = $2 OR g.away_team_season_id = $2)
       ORDER BY g.game_date DESC, g.week DESC
       LIMIT 1`,
      [seasonId, teamSeasonId]
    );

    if (gameResult.rows.length > 0) {
      return gameResult.rows[0].id;
    }

    return null;
  }

  /**
   * Upsert season stats to database
   * @param {Object} statsData - Formatted stats data
   * @returns {Object} Database result
   */
  async upsertSeasonStats(statsData) {
    const result = await query(
      `INSERT INTO season_stats(
        season_id, player_id, team_season_id, player_name, team_name, conference,
        points, goals, assists, saves, shots, mvps, demos, epic_saves, games_played,
        otg, shot_percentage, epic_save_percentage, saves_per_game, demos_per_game,
        points_per_game, goals_per_game, assists_per_game, is_rookie, synced_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, CURRENT_TIMESTAMP)
      ON CONFLICT (season_id, player_id, team_season_id) DO UPDATE
        SET player_name = EXCLUDED.player_name,
            team_name = EXCLUDED.team_name,
            conference = EXCLUDED.conference,
            points = EXCLUDED.points,
            goals = EXCLUDED.goals,
            assists = EXCLUDED.assists,
            saves = EXCLUDED.saves,
            shots = EXCLUDED.shots,
            mvps = EXCLUDED.mvps,
            demos = EXCLUDED.demos,
            epic_saves = EXCLUDED.epic_saves,
            games_played = EXCLUDED.games_played,
            otg = EXCLUDED.otg,
            shot_percentage = EXCLUDED.shot_percentage,
            epic_save_percentage = EXCLUDED.epic_save_percentage,
            saves_per_game = EXCLUDED.saves_per_game,
            demos_per_game = EXCLUDED.demos_per_game,
            points_per_game = EXCLUDED.points_per_game,
            goals_per_game = EXCLUDED.goals_per_game,
            assists_per_game = EXCLUDED.assists_per_game,
            is_rookie = EXCLUDED.is_rookie,
            synced_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        statsData.season_id,
        statsData.player_id,
        statsData.team_season_id,
        statsData.player_name,
        statsData.team_name,
        statsData.conference,
        statsData.points,
        statsData.goals,
        statsData.assists,
        statsData.saves,
        statsData.shots,
        statsData.mvps,
        statsData.demos,
        statsData.epic_saves,
        statsData.games_played,
        statsData.otg,
        statsData.shot_percentage,
        statsData.epic_save_percentage,
        statsData.saves_per_game,
        statsData.demos_per_game,
        statsData.points_per_game,
        statsData.goals_per_game,
        statsData.assists_per_game,
        statsData.is_rookie
      ]
    );

    return result.rows[0];
  }

  /**
   * Fetch and sync directly from Google Sheets URL
   * @param {string} gid - Google Sheets GID
   * @param {number} seasonId - Season ID
   * @returns {Object} Sync results
   */
  async syncFromGoogleSheets(gid, seasonId) {
    // Construct CSV URL
    const baseSheetId = 'e/2PACX-1vT7NwPjIVeVvEgCfH2nmv838205PDwVaaVY9E9_gwqUzh_lxfU4AIIy7z-4BxK9Ff4p2fR__l_q6sBC';
    const url = `https://docs.google.com/spreadsheets/d/${baseSheetId}/pub?gid=${gid}&output=csv`;

    try {
      const response = await fetch(url);
      const csvText = await response.text();

      // Parse CSV (reuse the parsing logic from frontend)
      const sheetData = this.parseCSV(csvText);

      // Sync to database
      return await this.syncPlayerStats(sheetData.data, seasonId);
    } catch (error) {
      throw new Error(`Failed to fetch/sync Google Sheets data: ${error.message}`);
    }
  }

  /**
   * Parse CSV data (simplified version from frontend)
   * @param {string} csvText - Raw CSV text
   * @returns {Object} { headers: [], data: [] }
   */
  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    // Find header row
    let headerIndex = 0;
    let headers = [];

    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const potentialHeaders = this.parseCSVLine(lines[i]).map(h => h.trim().replace(/"/g, ''));
      const hasPlayerColumn = potentialHeaders.some(h => h === 'Player');
      const hasStatsColumns = potentialHeaders.some(h =>
        h === 'Points' || h === 'Goals' || h === 'Assists' || h === 'Games Played'
      );

      if (hasPlayerColumn && hasStatsColumns) {
        headers = potentialHeaders;
        headerIndex = i;
        break;
      }
    }

    if (headers.length === 0) {
      headers = this.parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
      headerIndex = 0;
    }

    // IMPORTANT: Only use the first section (player stats), ignore team stats section
    // Find the first empty column which separates player stats from team stats
    let playerStatsEndIndex = headers.length;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === '' && i > 10) {
        playerStatsEndIndex = i;
        break;
      }
    }
    // Trim headers to only include player stats section
    headers = headers.slice(0, playerStatsEndIndex);

    const data = [];
    const playerColumnIndex = headers.findIndex(h => h === 'Player');
    let currentTeamName = '';

    const skipPatterns = [
      'Average:', 'Conference Average:', 'CATEGORY LEADER:', 'WHO\'S LEADING',
      'OFFENSIVE STATS', 'DEFENSIVE STATS', 'Conference', 'Eastern Conference',
      'Western Conference'
    ];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (!values.length) continue;

      const playerValue = values[playerColumnIndex]?.trim() || '';
      const firstColumnValue = values[0]?.trim() || '';

      if (playerValue && playerValue !== '' &&
          !skipPatterns.some(pattern => playerValue.includes(pattern))) {
        if (firstColumnValue !== '-' && firstColumnValue !== '') {
          currentTeamName = firstColumnValue;
        }

        const row = {};
        headers.forEach((header, index) => {
          let value = values[index] ? values[index].trim().replace(/"/g, '') : '';
          if (index === 0 && value === '-' && currentTeamName) {
            value = currentTeamName;
          }
          row[header] = value;
        });

        data.push(row);
      }
    }

    return { headers, data };
  }

  /**
   * Parse a single CSV line
   * @param {string} line - CSV line
   * @returns {Array} Parsed values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }
}

module.exports = SeasonStatsSyncService;
