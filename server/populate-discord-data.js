// Load environment variables
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('./database');

// Parse CSV data helper function
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length && values[0]) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || null;
      });
      data.push(row);
    }
  }
  
  return data;
}

// Data extraction functions
async function createSeasons() {
  console.log('📅 Creating seasons...');
  
  const seasons = [
    { name: 'Season 1 - Fall 24', startDate: '2024-09-01', endDate: '2024-12-31', isActive: false },
    { name: 'Season 2 - Spring 25', startDate: '2025-01-01', endDate: '2025-04-30', isActive: true },
    { name: 'Season 3 - Summer 25', startDate: '2025-05-01', endDate: '2025-08-31', isActive: false }
  ];
  
  const seasonIds = {};
  
  for (const season of seasons) {
    const result = await query(`
      INSERT INTO seasons (season_name, start_date, end_date, is_active) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `, [season.name, season.startDate, season.endDate, season.isActive]);
    
    seasonIds[season.name] = result.rows[0].id;
    console.log(`  ✓ Created ${season.name} (ID: ${result.rows[0].id})`);
  }
  
  return seasonIds;
}

async function createTeamsAndPlayers(seasonIds) {
  console.log('🏟️  Creating teams and players...');
  
  const teamIds = {};
  const playerIds = {};
  
  // Season 1 teams (from standings data)
  const season1Teams = [
    { name: 'John & Tyler', players: ['JohnnyG', 'Tyler'] },
    { name: 'Style Boyz', players: ['Jack W', 'Vince'] },
    { name: 'Lebron James', players: ['Stan', 'Big Nick'] },
    { name: 'Drunken Goats', players: ['Matt S', 'Dundee'] },
    { name: 'Wolverines', players: ['Dylan', 'Ben'] },
    { name: 'Corner Boost', players: ['Nathan', 'Austin'] },
    { name: 'Chopped Trees', players: ['Jared', 'Mason'] },
    { name: 'Shock', players: ['Jax', 'Robert'] },
    { name: 'Super Sonics', players: ['Quinn', 'Alex'] }
  ];
  
  // Season 2 teams (from standings data)
  const season2Teams = [
    { name: 'Drunken Goats', players: ['Matt S', 'Dundee'] },
    { name: 'MJ', players: ['Mason', 'JohnnyG'] },
    { name: 'Non Chalant', players: ['Jack W', 'A Rob'] },
    { name: 'Overdosed Otters', players: ['Dylan', 'Ben'] },
    { name: 'Chicken Jockeys', players: ['Vince', 'Jax'] },
    { name: 'Pen15 Club', players: ['Erica', 'John C'] },
    { name: 'Jakeing It', players: ['Jake W', 'Jake C'] },
    { name: 'Mid Boost', players: ['Austin', 'Keough'] },
    { name: 'Backdoor Bandits', players: ['Sam', 'Gup'] },
    { name: 'Double Bogey', players: ['Nick B', 'Quinn'] },
    { name: 'Bronny James', players: ['Robert', 'Stan'] },
    { name: 'Nick Al Nite', players: ['Big Nick', 'Alex'] }
  ];
  
  // Create teams for each season
  for (const [seasonName, teams] of [['Season 1 - Fall 24', season1Teams], ['Season 2 - Spring 25', season2Teams]]) {
    const seasonId = seasonIds[seasonName];
    
    for (const team of teams) {
      // Create or get team
      let teamResult = await query('SELECT id FROM teams WHERE team_name = $1', [team.name]);
      let teamId;
      
      if (teamResult.rows.length === 0) {
        teamResult = await query(`
          INSERT INTO teams (team_name, color) 
          VALUES ($1, $2) 
          RETURNING id
        `, [team.name, '#' + Math.floor(Math.random()*16777215).toString(16)]);
        teamId = teamResult.rows[0].id;
        console.log(`  ✓ Created team: ${team.name}`);
      } else {
        teamId = teamResult.rows[0].id;
      }
      
      teamIds[team.name] = teamId;
      
      // Create players and link to team for this season
      for (const playerName of team.players) {
        let playerResult = await query('SELECT id FROM players WHERE player_name = $1', [playerName]);
        let playerId;
        
        if (playerResult.rows.length === 0) {
          playerResult = await query(`
            INSERT INTO players (player_name, gamertag) 
            VALUES ($1, $2) 
            RETURNING id
          `, [playerName, playerName]);
          playerId = playerResult.rows[0].id;
          console.log(`    ✓ Created player: ${playerName}`);
        } else {
          playerId = playerResult.rows[0].id;
        }
        
        playerIds[playerName] = playerId;
        
        // Link player to team for this season
        await query(`
          INSERT INTO player_seasons (player_id, team_id, season_id) 
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [playerId, teamId, seasonId]);
      }
    }
  }
  
  return { teamIds, playerIds };
}

async function populateStandings(seasonIds, teamIds) {
  console.log('🏆 Populating standings...');
  
  // Season 1 standings data
  const season1Standings = [
    { team: 'John & Tyler', wins: 19, losses: 4, ties: 0, pointsFor: 118, pointsAgainst: 52 },
    { team: 'Style Boyz', wins: 17, losses: 5, ties: 1, pointsFor: 120, pointsAgainst: 51 },
    { team: 'Lebron James', wins: 14, losses: 8, ties: 0, pointsFor: 102, pointsAgainst: 58 },
    { team: 'Drunken Goats', wins: 13, losses: 9, ties: 2, pointsFor: 104, pointsAgainst: 77 },
    { team: 'Wolverines', wins: 12, losses: 11, ties: 1, pointsFor: 84, pointsAgainst: 75 },
    { team: 'Corner Boost', wins: 10, losses: 11, ties: 1, pointsFor: 80, pointsAgainst: 63 },
    { team: 'Chopped Trees', wins: 10, losses: 12, ties: 2, pointsFor: 82, pointsAgainst: 62 },
    { team: 'Shock', wins: 6, losses: 17, ties: 0, pointsFor: 54, pointsAgainst: 90 },
    { team: 'Super Sonics', wins: 0, losses: 24, ties: 0, pointsFor: 23, pointsAgainst: 238 }
  ];
  
  // Season 2 standings data  
  const season2Standings = [
    { team: 'Jakeing It', wins: 17, losses: 5, ties: 1, pointsFor: 98, pointsAgainst: 59 },
    { team: 'Drunken Goats', wins: 15, losses: 5, ties: 1, pointsFor: 94, pointsAgainst: 62 },
    { team: 'Mid Boost', wins: 14, losses: 6, ties: 3, pointsFor: 78, pointsAgainst: 55 },
    { team: 'MJ', wins: 14, losses: 6, ties: 4, pointsFor: 107, pointsAgainst: 77 },
    { team: 'Backdoor Bandits', wins: 11, losses: 9, ties: 0, pointsFor: 85, pointsAgainst: 63 },
    { team: 'Non Chalant', wins: 12, losses: 10, ties: 1, pointsFor: 89, pointsAgainst: 96 },
    { team: 'Double Bogey', wins: 10, losses: 12, ties: 1, pointsFor: 67, pointsAgainst: 89 },
    { team: 'Bronny James', wins: 9, losses: 13, ties: 0, pointsFor: 63, pointsAgainst: 80 },
    { team: 'Overdosed Otters', wins: 9, losses: 13, ties: 2, pointsFor: 74, pointsAgainst: 82 },
    { team: 'Chicken Jockeys', wins: 6, losses: 15, ties: 1, pointsFor: 68, pointsAgainst: 90 },
    { team: 'Nick Al Nite', wins: 4, losses: 16, ties: 1, pointsFor: 60, pointsAgainst: 98 },
    { team: 'Pen15 Club', wins: 4, losses: 15, ties: 4, pointsFor: 69, pointsAgainst: 99 }
  ];
  
  for (const [seasonName, standings] of [['Season 1 - Fall 24', season1Standings], ['Season 2 - Spring 25', season2Standings]]) {
    const seasonId = seasonIds[seasonName];
    
    for (const standing of standings) {
      if (teamIds[standing.team]) {
        await query(`
          INSERT INTO standings (season_id, team_id, wins, losses, ties, points_for, points_against) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          seasonId,
          teamIds[standing.team],
          standing.wins,
          standing.losses,
          standing.ties,
          standing.pointsFor,
          standing.pointsAgainst
        ]);
        console.log(`  ✓ Added standings for ${standing.team} in ${seasonName}`);
      }
    }
  }
}

async function populatePlayerStats(seasonIds, playerIds, teamIds) {
  console.log('⚽ Populating player stats...');
  
  // Get the first two team IDs for dummy games
  const teamIdValues = Object.values(teamIds);
  if (teamIdValues.length < 2) {
    console.log('  ⚠️  Skipping player stats - need at least 2 teams');
    return;
  }
  
  const homeTeamId = teamIdValues[0];
  const awayTeamId = teamIdValues[1];
  
  // Read Season 1 player stats
  const season1StatsPath = path.join(__dirname, '..', 'discord', 'season 1', 'The%20Stats%20(New)__S1.txt');
  const season1Content = fs.readFileSync(season1StatsPath, 'utf8');
  const season1Stats = parseCSV(season1Content);
  
  // Read Season 2 player stats  
  const season2StatsPath = path.join(__dirname, '..', 'discord', 'season 2', 'The%20Stats%20(New)__S2.txt');
  const season2Content = fs.readFileSync(season2StatsPath, 'utf8');
  const season2Stats = parseCSV(season2Content);
  
  // Process Season 1 stats (first 18 rows are individual players)
  const seasonId1 = seasonIds['Season 1 - Fall 24'];
  for (let i = 0; i < Math.min(18, season1Stats.length); i++) {
    const stat = season1Stats[i];
    if (stat.Player && playerIds[stat.Player]) {
      // Create a dummy game for these stats
      const gameResult = await query(`
        INSERT INTO games (season_id, home_team_id, away_team_id, home_score, away_score, week) 
        VALUES ($1, $2, $3, 0, 0, 1) 
        RETURNING id
      `, [seasonId1, homeTeamId, awayTeamId]);
      
      await query(`
        INSERT INTO player_game_stats (
          game_id, player_id, team_id, points, goals, assists, saves, shots, mvps, demos, epic_saves
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        gameResult.rows[0].id,
        playerIds[stat.Player],
        homeTeamId, // Use actual team ID
        Math.round(parseFloat(stat.Points) || 0),
        parseInt(stat.Goals) || 0,
        parseInt(stat.Assists) || 0,
        parseInt(stat.Saves) || 0,
        parseInt(stat.Shots) || 0,
        parseInt(stat.MVP) || 0,
        parseInt(stat.Demos) || 0,
        parseInt(stat['Epic Saves']) || 0
      ]);
      console.log(`  ✓ Added Season 1 stats for ${stat.Player}`);
    }
  }
  
  // Process Season 2 stats (first 24 rows are individual players)
  const seasonId2 = seasonIds['Season 2 - Spring 25'];
  for (let i = 0; i < Math.min(24, season2Stats.length); i++) {
    const stat = season2Stats[i];
    if (stat.Player && playerIds[stat.Player]) {
      // Create a dummy game for these stats
      const gameResult = await query(`
        INSERT INTO games (season_id, home_team_id, away_team_id, home_score, away_score, week) 
        VALUES ($1, $2, $3, 0, 0, 1) 
        RETURNING id
      `, [seasonId2, homeTeamId, awayTeamId]);
      
      await query(`
        INSERT INTO player_game_stats (
          game_id, player_id, team_id, points, goals, assists, saves, shots, mvps, demos, epic_saves
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        gameResult.rows[0].id,
        playerIds[stat.Player],
        homeTeamId, // Use actual team ID
        Math.round(parseFloat(stat.Points) || 0),
        parseInt(stat.Goals) || 0,
        parseInt(stat.Assists) || 0,
        parseInt(stat.Saves) || 0,
        parseInt(stat.Shots) || 0,
        parseInt(stat.MVP) || 0,
        parseInt(stat.Demos) || 0,
        parseInt(stat['Epic Saves']) || 0
      ]);
      console.log(`  ✓ Added Season 2 stats for ${stat.Player}`);
    }
  }
}

// Main migration function
async function migrateDiscordData() {
  try {
    console.log('🚀 Starting Discord data migration...');
    
    // Test connection
    await testConnection();
    
    // Create seasons
    const seasonIds = await createSeasons();
    
    // Create teams and players
    const { teamIds, playerIds } = await createTeamsAndPlayers(seasonIds);
    
    // Populate standings
    await populateStandings(seasonIds, teamIds);
    
    // Populate player stats
    await populatePlayerStats(seasonIds, playerIds, teamIds);
    
    console.log('');
    console.log('✅ Discord data migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`  - Seasons created: ${Object.keys(seasonIds).length}`);
    console.log(`  - Teams created: ${Object.keys(teamIds).length}`);
    console.log(`  - Players created: ${Object.keys(playerIds).length}`);
    console.log('');
    console.log('🎉 Your database is now populated with Discord data!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDiscordData().then(() => {
    process.exit(0);
  });
}

module.exports = { migrateDiscordData };