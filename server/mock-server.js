const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Setting up API routes...');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server running in mock mode!', status: 'healthy' });
});

// Update player data (MOCK VERSION)
app.put('/api/players/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { player_name, gamertag, team_id } = req.body;
    
    console.log(`✅ Mock player update: ID ${id}, Name: ${player_name}, Gamertag: ${gamertag}`);
    
    const mockUpdatedPlayer = {
      id: parseInt(id),
      player_name,
      gamertag,
      team_id: team_id || null,
      updated_at: new Date().toISOString()
    };
    
    res.status(200).json({ 
      message: 'Player updated successfully (mock)', 
      player: mockUpdatedPlayer,
      success: true
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player', details: error.message });
  }
});

// Add new player (MOCK VERSION)
app.post('/api/players', (req, res) => {
  try {
    const { player_name, gamertag, team_id } = req.body;
    
    console.log(`✅ Mock player creation: Name: ${player_name}, Gamertag: ${gamertag}`);
    
    const mockNewPlayer = {
      id: Math.floor(Math.random() * 1000) + 100, // Random ID
      player_name,
      gamertag,
      team_id: team_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    res.status(201).json({ 
      message: 'Player created successfully (mock)', 
      player: mockNewPlayer,
      success: true
    });
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ error: 'Failed to create player', details: error.message });
  }
});

// Delete player (MOCK VERSION)
app.delete('/api/players/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`✅ Mock player deletion: ID ${id}`);
    
    res.status(200).json({ 
      message: 'Player deleted successfully (mock)', 
      player: { id: parseInt(id) },
      success: true
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player', details: error.message });
  }
});

// Basic endpoints for testing
app.get('/api/players', (req, res) => {
  res.json([
    { id: 1, player_name: 'Dylan', gamertag: 'Dylan', team_name: 'Non Chalant' },
    { id: 2, player_name: 'Tyler', gamertag: 'Tyler', team_name: 'MJ' },
    { id: 3, player_name: 'Mason', gamertag: 'Mason', team_name: 'Mid Boost' }
  ]);
});

app.get('/api/teams', (req, res) => {
  res.json([
    { id: 1, team_name: 'Non Chalant', color: '#3B82F6' },
    { id: 2, team_name: 'MJ', color: '#EF4444' },
    { id: 3, team_name: 'Mid Boost', color: '#10B981' }
  ]);
});

// Catch-all for unhandled routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/players',
      'GET /api/teams',
      'PUT /api/players/:id',
      'POST /api/players',
      'DELETE /api/players/:id'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`🔄 Server ready in MOCK mode (no database required)`);
  console.log(`\n🔗 Test your API endpoints:`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/players`);
  console.log(`   http://localhost:${PORT}/api/teams`);
  console.log(`\n📝 Player endpoints:`);
  console.log(`   PUT  http://localhost:${PORT}/api/players/1`);
  console.log(`   POST http://localhost:${PORT}/api/players`);
  console.log(`   DELETE http://localhost:${PORT}/api/players/1`);
  console.log(`\n✅ Server will stay running - press Ctrl+C to stop`);
});