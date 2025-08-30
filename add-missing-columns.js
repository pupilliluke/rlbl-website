/*
// Migration script to add missing columns to live Neon database
require('dotenv').config({ path: '.env.local' });
const { query } = require('./server/database');

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to team_seasons table in live Neon database...\n');
    
    // Check current schema
    console.log('1. CURRENT SCHEMA:');
    const currentSchema = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'team_seasons'
      ORDER BY ordinal_position
    `);
    console.table(currentSchema.rows);
    
    // Check if columns already exist
    const hasSecondaryColor = currentSchema.rows.some(col => col.column_name === 'secondary_color');
    const hasRanking = currentSchema.rows.some(col => col.column_name === 'ranking');
    
    console.log(`\n2. COLUMN STATUS:`);
    console.log(`secondary_color exists: ${hasSecondaryColor ? '✅' : '❌'}`);
    console.log(`ranking exists: ${hasRanking ? '✅' : '❌'}`);
    
    // Add secondary_color if missing
    if (!hasSecondaryColor) {
      console.log('\n3. ADDING secondary_color column...');
      await query('ALTER TABLE team_seasons ADD COLUMN secondary_color VARCHAR(7)');
      console.log('✅ Added secondary_color column');
    } else {
      console.log('\n3. secondary_color column already exists');
    }
    
    // Add ranking if missing
    if (!hasRanking) {
      console.log('\n4. ADDING ranking column...');
      await query('ALTER TABLE team_seasons ADD COLUMN ranking INTEGER');
      console.log('✅ Added ranking column');
    } else {
      console.log('\n4. ranking column already exists');
    }
    
    // Test query with new columns
    console.log('\n5. TESTING QUERY WITH NEW COLUMNS:');
    const testQuery = await query('SELECT id, display_name, primary_color, secondary_color, ranking FROM team_seasons WHERE season_id = 3 LIMIT 3');
    console.table(testQuery.rows);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

addMissingColumns();
*/