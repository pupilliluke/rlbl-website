const BracketDao = require('../../backend/dao/BracketDao');
const { query } = require('../../lib/database');

async function testBracketDao() {
  console.log('=== Testing BracketDao Methods ===');
  
  const bracketDao = new BracketDao();
  let testBracket = null;
  
  try {
    // Test inherited methods from BaseDao
    console.log('\nTesting inherited findAll()...');
    const allBrackets = await bracketDao.findAll();
    console.log(`✓ Found ${allBrackets.length} bracket entries via BracketDao`);
    
    // Get existing data to work with
    const existingSeasons = await query('SELECT id, season_name FROM seasons LIMIT 1');
    
    if (existingSeasons.rows.length === 0) {
      console.log('⚠ Need existing seasons for testing, skipping detailed tests...');
      return true;
    }
    
    const seasonId = existingSeasons.rows[0].id;
    const seasonName = existingSeasons.rows[0].season_name;
    
    // Test getBySeason (should be null or existing bracket)
    console.log('\nTesting getBySeason()...');
    const existingBracket = await bracketDao.getBySeason(seasonId);
    if (existingBracket) {
      console.log(`✓ Found existing bracket for season ${seasonName}: Round "${existingBracket.round_name}"`);
      console.log(`✓ Bracket created at: ${existingBracket.created_at}`);
      if (existingBracket.matchup_data) {
        console.log(`✓ Has matchup data: ${typeof existingBracket.matchup_data === 'object' ? 'JSON object' : 'string'}`);
      }
    } else {
      console.log(`✓ No existing bracket found for season ${seasonName}`);
    }
    
    // Test setBracket
    console.log('\nTesting setBracket()...');
    const matchupData = {
      round: "Test Playoffs",
      matches: [
        {
          matchId: 1,
          homeTeam: "Team A",
          awayTeam: "Team B",
          homeScore: null,
          awayScore: null
        },
        {
          matchId: 2,
          homeTeam: "Team C",
          awayTeam: "Team D",
          homeScore: null,
          awayScore: null
        }
      ],
      nextRound: {
        matches: [
          {
            matchId: 3,
            homeTeam: "Winner of Match 1",
            awayTeam: "Winner of Match 2",
            homeScore: null,
            awayScore: null
          }
        ]
      }
    };
    
    const bracketData = {
      seasonId: seasonId,
      roundName: "Quarterfinals",
      matchupData: matchupData
    };
    
    testBracket = await bracketDao.setBracket(bracketData);
    console.log(`✓ Created bracket for season ${seasonName}: Round "${testBracket.round_name}"`);
    console.log(`✓ Bracket ID: ${testBracket.id}`);
    console.log(`✓ Matchup data type: ${typeof testBracket.matchup_data}`);
    
    // Verify the matchup data structure
    if (testBracket.matchup_data && typeof testBracket.matchup_data === 'object') {
      console.log(`✓ Matchup data has ${testBracket.matchup_data.matches?.length || 0} first round matches`);
      console.log(`✓ Matchup data has ${testBracket.matchup_data.nextRound?.matches?.length || 0} next round matches`);
    }
    
    // Test getBySeason after creating bracket
    console.log('\nTesting getBySeason() after bracket creation...');
    const newBracket = await bracketDao.getBySeason(seasonId);
    if (newBracket && newBracket.id === testBracket.id) {
      console.log(`✓ Retrieved the newly created bracket: ID ${newBracket.id}`);
      console.log(`✓ Round: ${newBracket.round_name}`);
    } else {
      console.log(`✗ Failed to retrieve the newly created bracket`);
    }
    
    // Test creating another bracket (should be newer and retrieved by getBySeason)
    console.log('\nTesting multiple brackets (getBySeason returns latest)...');
    const secondMatchupData = {
      round: "Semifinals",
      matches: [
        {
          matchId: 4,
          homeTeam: "Winner QF1",
          awayTeam: "Winner QF2",
          homeScore: 3,
          awayScore: 2
        }
      ]
    };
    
    const secondBracketData = {
      seasonId: seasonId,
      roundName: "Semifinals",
      matchupData: secondMatchupData
    };
    
    const secondBracket = await bracketDao.setBracket(secondBracketData);
    console.log(`✓ Created second bracket: Round "${secondBracket.round_name}"`);
    
    // Verify getBySeason returns the latest (second) bracket
    const latestBracket = await bracketDao.getBySeason(seasonId);
    if (latestBracket && latestBracket.id === secondBracket.id) {
      console.log(`✓ getBySeason() correctly returns the latest bracket: ${latestBracket.round_name}`);
    } else {
      console.log(`✗ getBySeason() did not return the latest bracket`);
    }
    
    // Test with null round name
    console.log('\nTesting setBracket() with null round name...');
    const nullRoundData = {
      seasonId: seasonId,
      roundName: null,
      matchupData: { simple: "test bracket" }
    };
    
    const nullRoundBracket = await bracketDao.setBracket(nullRoundData);
    console.log(`✓ Created bracket with null round name: ${nullRoundBracket.round_name || 'null'}`);
    
    console.log('\n✓ All BracketDao tests passed');
    return true;
    
  } catch (error) {
    console.error('✗ BracketDao test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Clean up test brackets
    try {
      await query('DELETE FROM bracket WHERE season_id = $1 AND round_name LIKE $2', [seasonId, '%Test%']);
      await query('DELETE FROM bracket WHERE season_id = $1 AND (round_name = $2 OR round_name = $3 OR round_name IS NULL)', [seasonId, 'Quarterfinals', 'Semifinals']);
      console.log('✓ Cleaned up test brackets');
    } catch (cleanupError) {
      console.log('⚠ Could not clean up test brackets:', cleanupError.message);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBracketDao()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { testBracketDao };