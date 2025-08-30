/*
// Test script to compare API SQL vs direct database query
require('dotenv').config({ path: '.env.local' });
const { query } = require('./server/database');

async function testSQLComparison() {
  try {
    console.log('🔍 Testing SQL Query Comparison with Live Neon DB\n');
    
    // 1. Test the exact API query
    console.log('1. TESTING API QUERY (as used in /api/team_seasons):');
    const apiQuery = `
      SELECT 
        ts.id,
        ts.team_id,
        ts.season_id,
        ts.display_name,
        ts.alt_logo_url,
        ts.primary_color,
        ts.secondary_color,
        ts.ranking,
        ts.created_at,
        ts.updated_at,
        t.team_name as original_team_name,
        t.logo_url as original_logo_url,
        t.color as original_color,
        s.season_name,
        s.is_active as season_is_active
      FROM team_seasons ts
      JOIN teams t ON ts.team_id = t.id
      JOIN seasons s ON ts.season_id = s.id
      WHERE ts.season_id = $1
      ORDER BY s.id DESC, t.team_name
    `;
    
    const apiResult = await query(apiQuery, [3]);
    console.log(`✅ API Query returned ${apiResult.rows.length} records`);
    
    if (apiResult.rows.length > 0) {
      console.log('Available fields:', Object.keys(apiResult.rows[0]));
      console.log('\nFirst record:');
      console.log('- id:', apiResult.rows[0].id);
      console.log('- display_name:', apiResult.rows[0].display_name);
      console.log('- primary_color:', apiResult.rows[0].primary_color);
      console.log('- secondary_color:', apiResult.rows[0].secondary_color);
      console.log('- ranking:', apiResult.rows[0].ranking);
    }
    
    // 2. Test simple query
    console.log('\n2. TESTING SIMPLE QUERY:');
    const simpleQuery = 'SELECT * FROM team_seasons WHERE season_id = 3 LIMIT 1';
    const simpleResult = await query(simpleQuery);
    
    if (simpleResult.rows.length > 0) {
      console.log('Simple query fields:', Object.keys(simpleResult.rows[0]));
      console.log('- secondary_color:', simpleResult.rows[0].secondary_color);
      console.log('- ranking:', simpleResult.rows[0].ranking);
    }
    
    // 3. Test if fields are being selected but not returned by API
    console.log('\n3. FIELD COMPARISON:');
    console.log('API fields has secondary_color:', 'secondary_color' in (apiResult.rows[0] || {}));
    console.log('API fields has ranking:', 'ranking' in (apiResult.rows[0] || {}));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  process.exit(0);
}

testSQLComparison();
*/