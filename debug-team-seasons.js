/*
// Debug script to pull all data from team_seasons table
require('dotenv').config({ path: '.env.local' });
const { query } = require('./server/database');

async function debugTeamSeasons() {
  try {
    console.log('🔍 Debugging team_seasons table...\n');
    
    // 1. Check table schema
    console.log('1. TABLE SCHEMA:');
    const schemaQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'team_seasons'
      ORDER BY ordinal_position
    `;
    
    const schema = await query(schemaQuery);
    console.table(schema.rows);
    
    // 2. Count records
    const countResult = await query('SELECT COUNT(*) as count FROM team_seasons');
    console.log(`\n2. RECORD COUNT: ${countResult.rows[0].count} records\n`);
    
    // 3. Pull ALL data from team_seasons (raw query)
    console.log('3. RAW DATA FROM team_seasons:');
    const allData = await query('SELECT * FROM team_seasons ORDER BY season_id DESC, id LIMIT 5');
    
    if (allData.rows.length > 0) {
      console.log('Sample records:');
      allData.rows.forEach((row, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        Object.keys(row).forEach(key => {
          console.log(`${key}: ${row[key]}`);
        });
      });
    }
    
    // 4. Check specifically for secondary_color and ranking
    console.log('\n4. CHECKING FOR SECONDARY_COLOR AND RANKING:');
    try {
      const specificQuery = await query('SELECT id, display_name, secondary_color, ranking FROM team_seasons WHERE season_id = 3 LIMIT 3');
      console.log('✅ secondary_color and ranking columns exist!');
      console.table(specificQuery.rows);
    } catch (error) {
      console.log('❌ Error querying secondary_color/ranking:', error.message);
    }
    
    // 5. Check what the API query returns
    console.log('\n5. TESTING API QUERY:');
    const apiQuery = `
      SELECT 
        ts.id,
        ts.team_id,
        ts.season_id,
        ts.display_name,
        ts.primary_color,
        ts.secondary_color,
        ts.ranking,
        ts.alt_logo_url,
        ts.created_at,
        ts.updated_at
      FROM team_seasons ts
      WHERE ts.season_id = 3
      LIMIT 2
    `;
    
    try {
      const apiResult = await query(apiQuery);
      console.log('✅ API query successful!');
      console.table(apiResult.rows);
    } catch (error) {
      console.log('❌ API query failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
  
  process.exit(0);
}

debugTeamSeasons();
*/