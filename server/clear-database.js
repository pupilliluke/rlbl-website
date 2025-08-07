// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { query, testConnection } = require('./database');

async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...');
    
    await testConnection();
    
    // Delete in reverse order due to foreign key constraints
    await query('DELETE FROM player_game_stats');
    await query('DELETE FROM power_rankings');
    await query('DELETE FROM bracket');
    await query('DELETE FROM standings');
    await query('DELETE FROM games');
    await query('DELETE FROM player_seasons');
    await query('DELETE FROM players');
    await query('DELETE FROM teams');
    await query('DELETE FROM seasons');
    
    console.log('✅ Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  clearDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = { clearDatabase };