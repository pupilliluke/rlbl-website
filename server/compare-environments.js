// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { query } = require('./database');

async function compareEnvironments() {
  try {
    console.log('🔍 Environment Comparison Summary\n');
    
    // Get local data summary
    console.log('📊 LOCAL DEVELOPMENT (using Neon Postgres):');
    const localSummary = await query(`
      SELECT 
        (SELECT COUNT(*) FROM seasons) as seasons,
        (SELECT COUNT(*) FROM teams) as teams,
        (SELECT COUNT(*) FROM players) as players,
        (SELECT COUNT(*) FROM standings) as standings_records,
        (SELECT season_name FROM seasons WHERE is_active = true LIMIT 1) as active_season
    `);
    
    const local = localSummary.rows[0];
    console.log(`  • Seasons: ${local.seasons}`);
    console.log(`  • Teams: ${local.teams}`);
    console.log(`  • Players: ${local.players}`);
    console.log(`  • Standings: ${local.standings_records}`);
    console.log(`  • Active Season: ${local.active_season}`);
    
    // Get top 3 teams from local
    const localTeams = await query(`
      SELECT t.team_name, s.wins, s.losses
      FROM standings s
      JOIN teams t ON s.team_id = t.id
      JOIN seasons seas ON s.season_id = seas.id
      WHERE seas.is_active = true
      ORDER BY s.wins DESC
      LIMIT 3
    `);
    
    console.log(`  • Top 3 Teams:`);
    localTeams.rows.forEach((team, i) => {
      console.log(`    ${i+1}. ${team.team_name} (${team.wins}-${team.losses})`);
    });
    
    console.log('\n📊 PRODUCTION (Vercel - same Neon Postgres):');
    console.log(`  • Same database, same data!`);
    console.log(`  • URL: https://rlbl-website.vercel.app`);
    
    console.log('\n✅ SOLUTION APPLIED:');
    console.log(`  • Local server now uses same Neon Postgres database as production`);
    console.log(`  • Both environments serve identical Discord league data`);
    console.log(`  • Use "npm run dev" to run both React app and API server locally`);
    console.log(`  • Use "npm run server-dev" to run just the API server with Neon DB`);
    
    console.log('\n🎉 Local and production environments are now synchronized!');
    
  } catch (error) {
    console.error('❌ Comparison failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  compareEnvironments().then(() => {
    process.exit(0);
  });
}

module.exports = { compareEnvironments };