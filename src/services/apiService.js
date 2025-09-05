// API Service for Rocket League app - Using backend server
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Use same base URL for admin functions
const ADMIN_API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Generic API call function
const apiCall = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};


// API service functions
export const apiService = {
  // Health check
  checkHealth: () => apiCall('/health'),

  // Teams - Always use team_seasons structure for consistency
  getTeams: (season) => {
    const endpoint = season ? `/teams?season=${encodeURIComponent(season)}` : '/teams';
    return apiCall(endpoint);
  },

  // Players  
  getPlayers: () => apiCall('/players'),

  // Standings
  getStandings: (seasonId) => {
    const endpoint = seasonId ? `/standings?season_id=${encodeURIComponent(seasonId)}` : '/standings';
    return apiCall(endpoint);
  },

  // Seasons
  getSeasons: () => apiCall('/seasons'),

  // Schedule - using our new games API
  getGames: (seasonId = null) => {
    const endpoint = seasonId ? `/games/season/${seasonId}` : '/games';
    return apiCall(endpoint);
  },
  
  getGamesByWeek: (seasonId, week) => apiCall(`/games/season/${seasonId}/week/${week}`),
  
  // Legacy schedule endpoint (kept for backward compatibility)
  getSchedule: () => apiCall('/schedule'),

  // Stats
  getStats: async (season) => {
    try {
      const endpoint = season ? `/stats?season=${encodeURIComponent(season)}` : '/stats';
      const result = await apiCall(endpoint);
      console.log(`Stats API returned ${result.length} records for season:`, season);
      return result;
    } catch (error) {
      console.error('Stats API failed:', error);
      throw error;
    }
  },

  // Power Rankings
  getPowerRankings: () => apiCall('/power-rankings'),

  // Season endpoints
  getTeamSeasons: (teamId) => apiCall(`/teams/${teamId}/seasons`),
  getPlayerSeasons: (playerId) => apiCall(`/players/${playerId}/seasons`),
  getTeamStatsBySeason: (teamSlug, season = '2024') => apiCall(`/teams/${teamSlug}/stats?season=${season}`),
  
  // New team_seasons endpoint for getting teams by season
  getTeamSeasonData: (seasonId) => {
    const endpoint = seasonId ? `/team_seasons?season=${seasonId}` : '/team_seasons';
    return apiCall(endpoint);
  },

  // Roster memberships endpoint
  getRosterMemberships: (teamId, seasonId) => apiCall(`/roster-memberships/team/${teamId}/season/${seasonId}`),

  // Player Game Stats endpoints
  getPlayerGameStats: () => apiCall('/player-game-stats'),
  getPlayerGameStatsByGame: (gameId) => apiCall(`/player-game-stats/game/${gameId}`),

  // Player Game Stats CRUD operations
  createPlayerGameStats: async (statsData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/player-game-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statsData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create player game stats:', error);
      throw error;
    }
  },

  updatePlayerGameStats: async (id, statsData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/player-game-stats/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statsData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update player game stats ${id}:`, error);
      throw error;
    }
  },

  deletePlayerGameStats: async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/player-game-stats/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete player game stats ${id}:`, error);
      throw error;
    }
  },

  // Admin endpoints for data management (using separate admin server)
  updatePlayer: async (id, playerData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/players/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update player ${id}:`, error);
      throw error;
    }
  },

  createPlayer: async (playerData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create player:', error);
      throw error;
    }
  },

  deletePlayer: async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/players/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete player ${id}:`, error);
      throw error;
    }
  },

  // Teams CRUD operations
  createTeam: async (teamData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  },

  updateTeam: async (id, teamData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/teams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update team ${id}:`, error);
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/teams/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete team ${id}:`, error);
      throw error;
    }
  },

  // Standings CRUD operations
  createStanding: async (standingData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/standings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(standingData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create standing:', error);
      throw error;
    }
  },

  updateStanding: async (id, standingData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/standings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(standingData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update standing ${id}:`, error);
      throw error;
    }
  },

  deleteStanding: async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/standings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete standing ${id}:`, error);
      throw error;
    }
  },

  // Games/Schedule CRUD operations
  createGame: async (gameData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  },

  updateGame: async (id, gameData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/games/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update game ${id}:`, error);
      throw error;
    }
  },

  deleteGame: async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/games/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete game ${id}:`, error);
      throw error;
    }
  },

  // Power Rankings CRUD operations
  createPowerRanking: async (rankingData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/power-rankings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rankingData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create power ranking:', error);
      throw error;
    }
  },

  updatePowerRanking: async (id, rankingData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/power-rankings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rankingData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update power ranking ${id}:`, error);
      throw error;
    }
  },

  deletePowerRanking: async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/power-rankings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete power ranking ${id}:`, error);
      throw error;
    }
  },

  // Test endpoint
  runTest: () => apiCall('/test')
};

// Fallback data in case API is not available
export const fallbackData = {
  teams: [
    { id: 1, team_name: 'Loading...', color: '#000000', logo_url: '' }
  ],
  players: [
    { id: 1, player_name: 'Loading...', gamertag: 'Loading...', team_name: 'Loading...' }
  ],
  standings: [
    { id: 1, team_name: 'Loading...', wins: 0, losses: 0, ties: 0, points_for: 0, points_against: 0 }
  ],
  schedule: [
    { id: 1, week: 1, home_team_name: 'Loading...', away_team_name: 'Loading...', home_score: 0, away_score: 0 }
  ],
  stats: [
    { id: 1, player_name: 'Loading...', team_name: 'Loading...', total_points: 0, total_goals: 0, total_assists: 0 }
  ],
  powerRankings: [
    { rank: 1, team_name: 'Loading...', reasoning: 'Loading data...' }
  ]
};