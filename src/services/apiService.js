// API Service for Rocket League app
const API_BASE_URL = process.env.NODE_ENV === 'production' 
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

  // Teams
  getTeams: () => apiCall('/teams'),

  // Players  
  getPlayers: () => apiCall('/players'),

  // Standings
  getStandings: () => apiCall('/standings'),

  // Schedule
  getSchedule: () => apiCall('/schedule'),

  // Stats
  getStats: (season) => {
    const endpoint = season ? `/stats?season=${encodeURIComponent(season)}` : '/stats';
    return apiCall(endpoint);
  },

  // Power Rankings
  getPowerRankings: () => apiCall('/power-rankings'),

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