const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('./database');

// Import your existing data files
const teams = require('../src/data/teams.js').teams;
const players = require('../src/data/players.js').players;
const schedule = require('../src/data/schedule.js').schedule;
const standings = require('../src/data/standings.js').standings;
const careerStats = require('../src/data/careerStats.js').careerStats;
const gameStats = require('../src/data/gameStats.js').gameStats;
const teamStats = require('../src/data/teamStats.js').teamStats;
const powerRankings = require('../src/data/powerRankings.js').powerRankings;

async function runMigration() {
  try {
    console.log('Starting data migration...');
    
    // Test database connection first
    await testConnection();

    // Run schema creation
    console.log('Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    // Split schema into individual statements (skip CREATE DATABASE)
    const statements = schemaSQL
      .split(';')
      .filter(stmt => stmt.trim() && !stmt.includes('CREATE DATABASE'))
      .map(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement) {
        await query(statement);
      }
    }
    console.log('Schema created successfully');

    // Create a default season
    console.log('Creating default season...');
    const seasonResult = await query(`
      INSERT INTO seasons (season_name, is_active) 
      VALUES ('Current Season', true) 
      RETURNING id
    `);
    const seasonId = seasonResult.rows[0].id;

    // Migrate teams
    console.log('Migrating teams...');
    const teamIdMap = {};
    for (const team of teams) {
      const result = await query(`
        INSERT INTO teams (team_name, logo_url, color) 
        VALUES ($1, $2, $3) 
        RETURNING id
      `, [team.name, team.logo, team.color]);
      teamIdMap[team.id] = result.rows[0].id;
    }

    // Migrate players
    console.log('Migrating players...');
    const playerIdMap = {};
    for (const player of players) {
      const result = await query(`
        INSERT INTO players (player_name, gamertag) 
        VALUES ($1, $2) 
        RETURNING id
      `, [player.name, player.gamertag]);
      playerIdMap[player.id] = result.rows[0].id;
      
      // Link player to their team for the season
      if (player.teamId) {
        await query(`
          INSERT INTO player_seasons (player_id, team_id, season_id) 
          VALUES ($1, $2, $3)
        `, [result.rows[0].id, teamIdMap[player.teamId], seasonId]);
      }
    }

    // Migrate schedule (games)
    console.log('Migrating schedule...');
    const gameIdMap = {};
    for (const game of schedule) {
      const result = await query(`
        INSERT INTO games (season_id, home_team_id, away_team_id, home_score, away_score, game_date, week, is_playoffs) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id
      `, [
        seasonId,
        teamIdMap[game.homeTeam.id],
        teamIdMap[game.awayTeam.id],
        game.homeTeam.score || 0,
        game.awayTeam.score || 0,
        game.date ? new Date(game.date) : null,
        game.week || 1,
        game.isPlayoffs || false
      ]);
      gameIdMap[game.id] = result.rows[0].id;
    }

    // Migrate standings
    console.log('Migrating standings...');
    for (const standing of standings) {
      await query(`
        INSERT INTO standings (season_id, team_id, wins, losses, ties, points_for, points_against) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        seasonId,
        teamIdMap[standing.teamId],
        standing.wins || 0,
        standing.losses || 0,
        standing.ties || 0,
        standing.pointsFor || 0,
        standing.pointsAgainst || 0
      ]);
    }

    // Migrate power rankings
    console.log('Migrating power rankings...');
    for (const ranking of powerRankings) {
      await query(`
        INSERT INTO power_rankings (season_id, team_id, week, rank, reasoning) 
        VALUES ($1, $2, $3, $4, $5)
      `, [
        seasonId,
        teamIdMap[ranking.teamId],
        ranking.week || 1,
        ranking.rank,
        ranking.reasoning || ''
      ]);
    }

    // Migrate game stats (this is more complex as we need to match stats to games)
    console.log('Migrating game stats...');
    for (const stat of gameStats) {
      // Try to find the corresponding game based on player and team
      const gameQuery = await query(`
        SELECT g.id FROM games g 
        JOIN player_seasons ps ON (ps.team_id = g.home_team_id OR ps.team_id = g.away_team_id)
        WHERE ps.player_id = $1 AND ps.season_id = $2
        LIMIT 1
      `, [playerIdMap[stat.playerId], seasonId]);

      if (gameQuery.rows.length > 0) {
        await query(`
          INSERT INTO player_game_stats (
            game_id, player_id, team_id, points, goals, assists, saves, shots, mvps, demos, epic_saves
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          gameQuery.rows[0].id,
          playerIdMap[stat.playerId],
          teamIdMap[stat.teamId],
          stat.points || 0,
          stat.goals || 0,
          stat.assists || 0,
          stat.saves || 0,
          stat.shots || 0,
          stat.mvps || 0,
          stat.demos || 0,
          stat.epicSaves || 0
        ]);
      }
    }

    console.log('Migration completed successfully!');
    console.log('Database is ready with all your existing data.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().then(() => {
    console.log('Migration process finished');
    process.exit(0);
  });
}

module.exports = { runMigration };