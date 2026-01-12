const express = require('express');
const router = express.Router();
const SeasonStatsSyncService = require('../services/SeasonStatsSyncService');

const syncService = new SeasonStatsSyncService();

/**
 * POST /season-stats-sync/sync
 * Sync stats from provided sheet data to database
 *
 * Body:
 * {
 *   sheetData: Array of player stat rows from Google Sheets,
 *   seasonId: number,
 *   gameId?: number (optional)
 * }
 */
router.post('/sync', async (req, res) => {
  try {
    const { sheetData, seasonId, gameId } = req.body;

    if (!sheetData || !Array.isArray(sheetData)) {
      return res.status(400).json({
        error: 'sheetData must be provided as an array'
      });
    }

    if (!seasonId) {
      return res.status(400).json({
        error: 'seasonId is required'
      });
    }

    const results = await syncService.syncPlayerStats(
      sheetData,
      parseInt(seasonId)
    );

    res.json({
      message: 'Sync completed',
      ...results
    });
  } catch (error) {
    console.error('Season stats sync error:', error);
    res.status(500).json({
      error: 'Failed to sync season stats',
      details: error.message
    });
  }
});

/**
 * POST /season-stats-sync/sync-from-sheets
 * Fetch data directly from Google Sheets and sync to database
 *
 * Body:
 * {
 *   gid: string (Google Sheets GID),
 *   seasonId: number,
 *   gameId?: number (optional)
 * }
 */
router.post('/sync-from-sheets', async (req, res) => {
  try {
    const { gid, seasonId, gameId } = req.body;

    if (!gid) {
      return res.status(400).json({
        error: 'gid (Google Sheets GID) is required'
      });
    }

    if (!seasonId) {
      return res.status(400).json({
        error: 'seasonId is required'
      });
    }

    const results = await syncService.syncFromGoogleSheets(
      gid,
      parseInt(seasonId)
    );

    res.json({
      message: 'Sync from Google Sheets completed',
      ...results
    });
  } catch (error) {
    console.error('Google Sheets sync error:', error);
    res.status(500).json({
      error: 'Failed to sync from Google Sheets',
      details: error.message
    });
  }
});

/**
 * GET /season-stats-sync/validate
 * Validate a stats object before syncing
 *
 * Query params: Pass stats data as JSON string
 */
router.get('/validate', async (req, res) => {
  try {
    const statsData = JSON.parse(req.query.data || '{}');
    const SeasonStatsSync = require('../models/SeasonStatsSync');
    const validation = SeasonStatsSync.validate(statsData);

    res.json(validation);
  } catch (error) {
    res.status(400).json({
      error: 'Invalid request',
      details: error.message
    });
  }
});

/**
 * GET /season-stats-sync/preview
 * Preview what would be synced without actually syncing
 *
 * Query params:
 * - gid: Google Sheets GID
 * - seasonId: Season ID
 */
router.get('/preview', async (req, res) => {
  try {
    const { gid, seasonId } = req.query;

    if (!gid || !seasonId) {
      return res.status(400).json({
        error: 'gid and seasonId are required'
      });
    }

    const baseSheetId = 'e/2PACX-1vT7NwPjIVeVvEgCfH2nmv838205PDwVaaVY9E9_gwqUzh_lxfU4AIIy7z-4BxK9Ff4p2fR__l_q6sBC';
    const url = `https://docs.google.com/spreadsheets/d/${baseSheetId}/pub?gid=${gid}&output=csv`;

    const response = await fetch(url);
    const csvText = await response.text();
    const sheetData = syncService.parseCSV(csvText);

    // Build lookup tables to show what would be matched
    const lookupTables = await syncService.buildLookupTables(parseInt(seasonId));

    const preview = sheetData.data.map((row, index) => {
      const playerName = row['Player'];
      const teamName = row['Team'];
      const playerId = lookupTables.players.get(playerName?.toLowerCase());
      const teamSeasonKey = `${teamName?.toLowerCase()}_${seasonId}`;
      const teamSeasonId = lookupTables.teamSeasons.get(teamSeasonKey);

      return {
        rowIndex: index + 1,
        player: playerName,
        team: teamName,
        playerId: playerId || null,
        teamSeasonId: teamSeasonId || null,
        matched: !!(playerId && teamSeasonId),
        stats: {
          points: row['Points'],
          goals: row['Goals'],
          assists: row['Assists'],
          saves: row['Saves'],
          shots: row['Shots']
        }
      };
    });

    const summary = {
      totalRows: preview.length,
      matched: preview.filter(p => p.matched).length,
      unmatched: preview.filter(p => !p.matched).length
    };

    res.json({
      summary,
      preview: preview.slice(0, 50), // Limit preview to first 50 rows
      sheetHeaders: sheetData.headers
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      error: 'Failed to generate preview',
      details: error.message
    });
  }
});

module.exports = router;
