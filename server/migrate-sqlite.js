const fs = require('fs');
const path = require('path');
const { query, run, testConnection } = require('./database-sqlite');

// Load data files using dynamic import
async function loadData() {
  const teamsModule = await import('../src/data/teams.js');
  const playersModule = await import('../src/data/players.js');
  const scheduleModule = await import('../src/data/schedule.js');
  const standingsModule = await import('../src/data/standings.js');
  const careerStatsModule = await import('../src/data/careerStats.js');
  const gameStatsModule = await import('../src/data/gameStats.js');
  const teamStatsModule = await import('../src/data/teamStats.js');
  const powerRankingsModule = await import('../src/data/powerRankings.js');

  return {
    teams: teamsModule.teams,
    players: playersModule.players,
    schedule: scheduleModule.schedule,
    standings: standingsModule.standings,
    careerStats: careerStatsModule.careerStats,
    gameStats: gameStatsModule.gameStats,
    teamStats: teamStatsModule.teamStats,
    powerRankings: powerRankingsModule.powerRankings
  };
}

async function runMigration() {
  try {
    console.log('Starting SQLite data migration...');
    
    // Test database connection first
    await testConnection();

    // Load all data files
    console.log('Loading data files...');
    const data = await loadData();
    const { teams, players, schedule, standings, careerStats, gameStats, teamStats, powerRankings } = data;

    // Get current teams (flatten the teams object structure)
    let currentTeams = [];
    if (teams && teams['2025']) {
      currentTeams = teams['2025'];
    } else {
      // Fallback to get any available teams
      const years = Object.keys(teams || {});
      if (years.length > 0) {
        currentTeams = teams[years[years.length - 1]]; // Get most recent year
      }
    }

    console.log(`Found ${currentTeams.length} teams to migrate`);

    // Run schema creation
    console.log('Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema-sqlite.sql'), 'utf8');
    // Split schema into individual statements
    const statements = schemaSQL
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement) {
        await run(statement);
      }
    }
    console.log('Schema created successfully');

    // Create a default season
    console.log('Creating default season...');
    const seasonResult = await run(`
      INSERT INTO seasons (season_name, is_active) 
      VALUES (?, ?)
    `, ['Current Season', 1]);
    const seasonId = seasonResult.lastID;

    // Migrate teams
    console.log('Migrating teams...');
    const teamIdMap = {};
    for (let i = 0; i < currentTeams.length; i++) {
      const team = currentTeams[i];
      const result = await run(`
        INSERT INTO teams (team_name, logo_url, color) 
        VALUES (?, ?, ?)
      `, [team.name || `Team ${i+1}`, team.logo || '', team.color || '#000000']);
      teamIdMap[i + 1] = result.lastID; // Use index as team ID
    }

    // Migrate players (if available)
    console.log('Migrating players...');
    const playerIdMap = {};
    if (players && Array.isArray(players)) {
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const result = await run(`
          INSERT INTO players (player_name, gamertag) 
          VALUES (?, ?)
        `, [player.name || `Player ${i+1}`, player.gamertag || player.name || `Player ${i+1}`]);
        playerIdMap[player.id || i + 1] = result.lastID;
        
        // Link player to their team for the season
        if (player.teamId && teamIdMap[player.teamId]) {
          await run(`
            INSERT INTO player_seasons (player_id, team_id, season_id) 
            VALUES (?, ?, ?)
          `, [result.lastID, teamIdMap[player.teamId], seasonId]);
        }
      }
    }

    // Migrate schedule (games) if available
    console.log('Migrating schedule...');
    const gameIdMap = {};
    if (schedule && Array.isArray(schedule)) {
      for (let i = 0; i < schedule.length; i++) {
        const game = schedule[i];
        const result = await run(`
          INSERT INTO games (season_id, home_team_id, away_team_id, home_score, away_score, game_date, week, is_playoffs) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          seasonId,
          teamIdMap[game.homeTeam?.id] || 1,
          teamIdMap[game.awayTeam?.id] || 2,
          game.homeTeam?.score || 0,
          game.awayTeam?.score || 0,
          game.date || null,
          game.week || 1,
          game.isPlayoffs ? 1 : 0
        ]);
        gameIdMap[game.id || i + 1] = result.lastID;
      }
    }

    // Migrate standings if available
    console.log('Migrating standings...');
    if (standings && Array.isArray(standings)) {
      for (const standing of standings) {
        const teamId = teamIdMap[standing.teamId] || teamIdMap[1];
        if (teamId) {
          await run(`
            INSERT INTO standings (season_id, team_id, wins, losses, ties, points_for, points_against) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            seasonId,
            teamId,
            standing.wins || 0,
            standing.losses || 0,
            standing.ties || 0,
            standing.pointsFor || 0,
            standing.pointsAgainst || 0
          ]);
        }
      }
    }

    // Migrate power rankings if available
    console.log('Migrating power rankings...');
    if (powerRankings && Array.isArray(powerRankings)) {
      for (const ranking of powerRankings) {
        const teamId = teamIdMap[ranking.teamId] || teamIdMap[1];
        if (teamId) {
          await run(`
            INSERT INTO power_rankings (season_id, team_id, week, rank, reasoning) 
            VALUES (?, ?, ?, ?, ?)
          `, [
            seasonId,
            teamId,
            ranking.week || 1,
            ranking.rank || 1,
            ranking.reasoning || ''
          ]);
        }
      }
    }

    console.log('SQLite Migration completed successfully!');
    console.log('Database is ready with all your existing data.');
    
    // Display summary
    const teamCount = await query('SELECT COUNT(*) as count FROM teams');
    const playerCount = await query('SELECT COUNT(*) as count FROM players');
    const gameCount = await query('SELECT COUNT(*) as count FROM games');
    
    console.log(`\nMigration Summary:`);
    console.log(`- Teams: ${teamCount.rows[0].count}`);
    console.log(`- Players: ${playerCount.rows[0].count}`);
    console.log(`- Games: ${gameCount.rows[0].count}`);
    
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