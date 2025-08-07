const fs = require('fs');
const path = require('path');
const { query, run, testConnection } = require('./database-sqlite');

// Sample test data based on your existing structure
const testData = {
  teams: [
    { id: 1, name: "The Chopped Trees", logo: "/assets/chopped-trees-logo.png", color: "#8B4513" },
    { id: 2, name: "Ballistic Boomers", logo: "/assets/ballistic-boomers-logo.png", color: "#FF4500" },
    { id: 3, name: "Rocket Rascals", logo: "/assets/rocket-rascals-logo.png", color: "#1E90FF" },
    { id: 4, name: "Speed Demons", logo: "/assets/speed-demons-logo.png", color: "#FF0000" },
    { id: 5, name: "Sky Strikers", logo: "/assets/sky-strikers-logo.png", color: "#32CD32" },
    { id: 6, name: "Turbo Titans", logo: "/assets/turbo-titans-logo.png", color: "#9400D3" }
  ],
  players: [
    { id: 1, name: "Dylan", gamertag: "Dylan_RL", teamId: 1 },
    { id: 2, name: "Mason", gamertag: "MasonPlays", teamId: 1 },
    { id: 3, name: "Jared", gamertag: "JaredGamer", teamId: 2 },
    { id: 4, name: "Luke", gamertag: "LukePupilli", teamId: 2 },
    { id: 5, name: "Alex", gamertag: "AlexRL", teamId: 3 },
    { id: 6, name: "Sam", gamertag: "SamTheMan", teamId: 3 },
    { id: 7, name: "Chris", gamertag: "ChrisBoosts", teamId: 4 },
    { id: 8, name: "Jordan", gamertag: "JordanAerial", teamId: 4 },
    { id: 9, name: "Taylor", gamertag: "TaylorSaves", teamId: 5 },
    { id: 10, name: "Morgan", gamertag: "MorganShots", teamId: 5 },
    { id: 11, name: "Casey", gamertag: "CaseyDemo", teamId: 6 },
    { id: 12, name: "Riley", gamertag: "RileyMVP", teamId: 6 }
  ],
  standings: [
    { teamId: 1, wins: 8, losses: 2, ties: 0, pointsFor: 156, pointsAgainst: 98 },
    { teamId: 2, wins: 7, losses: 3, ties: 0, pointsFor: 142, pointsAgainst: 110 },
    { teamId: 3, wins: 6, losses: 4, ties: 0, pointsFor: 128, pointsAgainst: 125 },
    { teamId: 4, wins: 5, losses: 5, ties: 0, pointsFor: 115, pointsAgainst: 130 },
    { teamId: 5, wins: 3, losses: 7, ties: 0, pointsFor: 95, pointsAgainst: 145 },
    { teamId: 6, wins: 1, losses: 9, ties: 0, pointsFor: 85, pointsAgainst: 163 }
  ],
  games: [
    { id: 1, homeTeamId: 1, awayTeamId: 2, homeScore: 4, awayScore: 2, week: 1, date: "2025-01-15" },
    { id: 2, homeTeamId: 3, awayTeamId: 4, homeScore: 3, awayScore: 3, week: 1, date: "2025-01-15" },
    { id: 3, homeTeamId: 5, awayTeamId: 6, homeScore: 2, awayScore: 1, week: 1, date: "2025-01-15" },
    { id: 4, homeTeamId: 2, awayTeamId: 3, homeScore: 5, awayScore: 1, week: 2, date: "2025-01-22" },
    { id: 5, homeTeamId: 4, awayTeamId: 5, homeScore: 2, awayScore: 4, week: 2, date: "2025-01-22" },
    { id: 6, homeTeamId: 6, awayTeamId: 1, homeScore: 1, awayScore: 6, week: 2, date: "2025-01-22" }
  ],
  powerRankings: [
    { teamId: 1, week: 1, rank: 1, reasoning: "Dominant performance with strong offensive play" },
    { teamId: 2, week: 1, rank: 2, reasoning: "Consistent scoring and solid defense" },
    { teamId: 3, week: 1, rank: 3, reasoning: "Balanced team with good chemistry" },
    { teamId: 4, week: 1, rank: 4, reasoning: "Shows potential but needs consistency" },
    { teamId: 5, week: 1, rank: 5, reasoning: "Improving but struggles with finishing" },
    { teamId: 6, week: 1, rank: 6, reasoning: "Rebuilding season with young talent" }
  ],
  playerStats: [
    { playerId: 1, gameId: 1, teamId: 1, points: 450, goals: 2, assists: 1, saves: 3 },
    { playerId: 2, gameId: 1, teamId: 1, points: 380, goals: 1, assists: 2, saves: 2 },
    { playerId: 3, gameId: 1, teamId: 2, points: 320, goals: 1, assists: 0, saves: 4 },
    { playerId: 4, gameId: 1, teamId: 2, points: 285, goals: 1, assists: 1, saves: 1 },
    { playerId: 5, gameId: 2, teamId: 3, points: 350, goals: 2, assists: 0, saves: 2 },
    { playerId: 6, gameId: 2, teamId: 3, points: 310, goals: 1, assists: 1, saves: 3 }
  ]
};

async function runSimpleMigration() {
  try {
    console.log('Starting simple SQLite data migration...');
    
    // Test database connection first
    await testConnection();

    // Run schema creation
    console.log('Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema-sqlite.sql'), 'utf8');
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
    `, ['Season 3 - Summer 2025', 1]);
    const seasonId = seasonResult.lastID;

    // Migrate teams
    console.log('Migrating teams...');
    const teamIdMap = {};
    for (const team of testData.teams) {
      const result = await run(`
        INSERT INTO teams (team_name, logo_url, color) 
        VALUES (?, ?, ?)
      `, [team.name, team.logo, team.color]);
      teamIdMap[team.id] = result.lastID;
    }

    // Migrate players
    console.log('Migrating players...');
    const playerIdMap = {};
    for (const player of testData.players) {
      const result = await run(`
        INSERT INTO players (player_name, gamertag) 
        VALUES (?, ?)
      `, [player.name, player.gamertag]);
      playerIdMap[player.id] = result.lastID;
      
      // Link player to their team for the season
      await run(`
        INSERT INTO player_seasons (player_id, team_id, season_id) 
        VALUES (?, ?, ?)
      `, [result.lastID, teamIdMap[player.teamId], seasonId]);
    }

    // Migrate games
    console.log('Migrating games...');
    const gameIdMap = {};
    for (const game of testData.games) {
      const result = await run(`
        INSERT INTO games (season_id, home_team_id, away_team_id, home_score, away_score, game_date, week, is_playoffs) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        seasonId,
        teamIdMap[game.homeTeamId],
        teamIdMap[game.awayTeamId],
        game.homeScore,
        game.awayScore,
        game.date,
        game.week,
        0
      ]);
      gameIdMap[game.id] = result.lastID;
    }

    // Migrate standings
    console.log('Migrating standings...');
    for (const standing of testData.standings) {
      await run(`
        INSERT INTO standings (season_id, team_id, wins, losses, ties, points_for, points_against) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        seasonId,
        teamIdMap[standing.teamId],
        standing.wins,
        standing.losses,
        standing.ties,
        standing.pointsFor,
        standing.pointsAgainst
      ]);
    }

    // Migrate power rankings
    console.log('Migrating power rankings...');
    for (const ranking of testData.powerRankings) {
      await run(`
        INSERT INTO power_rankings (season_id, team_id, week, rank, reasoning) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        seasonId,
        teamIdMap[ranking.teamId],
        ranking.week,
        ranking.rank,
        ranking.reasoning
      ]);
    }

    // Migrate player stats
    console.log('Migrating player stats...');
    for (const stat of testData.playerStats) {
      await run(`
        INSERT INTO player_game_stats (
          game_id, player_id, team_id, points, goals, assists, saves, shots, mvps, demos, epic_saves
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        gameIdMap[stat.gameId],
        playerIdMap[stat.playerId],
        teamIdMap[stat.teamId],
        stat.points,
        stat.goals,
        stat.assists,
        stat.saves,
        stat.shots || 0,
        stat.mvps || 0,
        stat.demos || 0,
        stat.epicSaves || 0
      ]);
    }

    console.log('SQLite Migration completed successfully!');
    
    // Display summary
    const teamCount = await query('SELECT COUNT(*) as count FROM teams');
    const playerCount = await query('SELECT COUNT(*) as count FROM players');
    const gameCount = await query('SELECT COUNT(*) as count FROM games');
    const standingCount = await query('SELECT COUNT(*) as count FROM standings');
    
    console.log(`\n✅ Migration Summary:`);
    console.log(`- Teams: ${teamCount.rows[0].count}`);
    console.log(`- Players: ${playerCount.rows[0].count}`);
    console.log(`- Games: ${gameCount.rows[0].count}`);
    console.log(`- Standings: ${standingCount.rows[0].count}`);
    console.log(`\nDatabase file created at: ${path.join(__dirname, 'rocketleague.db')}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runSimpleMigration().then(() => {
    console.log('Migration process finished');
    process.exit(0);
  });
}

module.exports = { runSimpleMigration };