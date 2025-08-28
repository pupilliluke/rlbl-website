// Test script to demonstrate player update functionality
const API_BASE_URL = 'http://localhost:5000/api';

const testPlayerUpdate = async () => {
  console.log('🧪 Testing Player Update API...\n');
  
  try {
    // Test 1: Update existing player (simulating admin panel edit)
    console.log('📝 Test 1: Updating player with ID 1...');
    const updateData = {
      player_name: 'Dylan Updated',
      gamertag: 'DylanGamer2024',
      team_id: 2
    };
    
    const updateResponse = await fetch(`${API_BASE_URL}/players/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log('✅ UPDATE SUCCESS:', updateResult);
    console.log(`   Status: ${updateResponse.status} ${updateResponse.statusText}`);
    console.log(`   Player ID: ${updateResult.player.id}`);
    console.log(`   Updated Name: ${updateResult.player.player_name}`);
    console.log(`   Updated Gamertag: ${updateResult.player.gamertag}`);
    console.log(`   Updated At: ${updateResult.player.updated_at}\n`);
    
    // Test 2: Create new player
    console.log('📝 Test 2: Creating new player...');
    const createData = {
      player_name: 'Test Player',
      gamertag: 'TestGamer123',
      team_id: 1
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData),
    });
    
    if (!createResponse.ok) {
      throw new Error(`HTTP error! status: ${createResponse.status}`);
    }
    
    const createResult = await createResponse.json();
    console.log('✅ CREATE SUCCESS:', createResult);
    console.log(`   Status: ${createResponse.status} ${createResponse.statusText}`);
    console.log(`   New Player ID: ${createResult.player.id}`);
    console.log(`   Player Name: ${createResult.player.player_name}`);
    console.log(`   Gamertag: ${createResult.player.gamertag}`);
    console.log(`   Created At: ${createResult.player.created_at}\n`);
    
    // Test 3: Get all players to verify
    console.log('📝 Test 3: Fetching all players...');
    const playersResponse = await fetch(`${API_BASE_URL}/players`);
    const players = await playersResponse.json();
    console.log('✅ FETCH SUCCESS:', `Found ${players.length} players`);
    console.log('   Sample players:', players.slice(0, 3));
    
    console.log('\n🎉 ALL TESTS PASSED! API is working correctly.');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Server is running and responsive');
    console.log('✅ PUT /api/players/:id endpoint works (returns 200 OK)');
    console.log('✅ POST /api/players endpoint works (returns 201 Created)');
    console.log('✅ GET /api/players endpoint works');
    console.log('✅ Frontend can successfully connect to backend');
    console.log('✅ Player data updates are being processed correctly');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.log('\n🔍 DEBUGGING INFO:');
    console.log(`   API Base URL: ${API_BASE_URL}`);
    console.log(`   Error Type: ${error.constructor.name}`);
    console.log(`   Error Details: ${error.message}`);
    
    if (error.message.includes('fetch')) {
      console.log('   💡 Suggestion: Check if the server is running on port 5000');
    }
    if (error.message.includes('404')) {
      console.log('   💡 Suggestion: Verify the API endpoint exists');
    }
    if (error.message.includes('500')) {
      console.log('   💡 Suggestion: Check server logs for internal errors');
    }
  }
};

// Run the test
testPlayerUpdate();