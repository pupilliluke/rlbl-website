import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { apiService } from '../services/apiService';

// Mock the Admin component since we're testing Game Stats functionality
const MockAdmin = () => {
  const [gameStatsData, setGameStatsData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadGameStats = async () => {
    try {
      setLoading(true);
      const stats = await apiService.getAggregatedGameStats();
      setGameStatsData(stats);
    } catch (error) {
      setError('Failed to load game stats data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadGameStats();
  }, []);

  const renderGameStatsTable = () => {
    if (loading) {
      return <div data-testid="loading">Loading...</div>;
    }

    if (error) {
      return <div data-testid="error">{error}</div>;
    }

    if (!gameStatsData || gameStatsData.length === 0) {
      return (
        <div data-testid="no-stats">
          <h3>No Game Stats Available</h3>
          <p>Player game statistics will appear here once games are recorded.</p>
        </div>
      );
    }

    return (
      <div data-testid="game-stats-table">
        {/* Stats Summary Cards */}
        <div className="stats-summary">
          <div data-testid="total-players">Total Players: {gameStatsData.length}</div>
          <div data-testid="total-points">
            Total Points: {gameStatsData.reduce((sum, player) => sum + (player.total_points || 0), 0)}
          </div>
          <div data-testid="active-players">
            Active Players: {gameStatsData.filter(player => (player.games_played || 0) > 0).length}
          </div>
        </div>

        {/* Game Stats Table */}
        <table data-testid="player-stats-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th>GP</th>
              <th>Points</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>Saves</th>
              <th>PPG</th>
            </tr>
          </thead>
          <tbody>
            {gameStatsData.map((player, index) => (
              <tr key={player.id || index} data-testid={`player-row-${index}`}>
                <td data-testid={`player-name-${index}`}>{player.player_name}</td>
                <td data-testid={`team-name-${index}`}>{player.team_name}</td>
                <td data-testid={`games-played-${index}`}>{player.games_played || 0}</td>
                <td data-testid={`total-points-${index}`}>{player.total_points || 0}</td>
                <td data-testid={`total-goals-${index}`}>{player.total_goals || 0}</td>
                <td data-testid={`total-assists-${index}`}>{player.total_assists || 0}</td>
                <td data-testid={`total-saves-${index}`}>{player.total_saves || 0}</td>
                <td data-testid={`avg-points-${index}`}>
                  {player.games_played > 0 ? (player.avg_points_per_game || 0).toFixed(1) : '0.0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1>Game Stats Test Component</h1>
      {renderGameStatsTable()}
    </div>
  );
};

// Mock the API service
jest.mock('../services/apiService', () => ({
  apiService: {
    getAggregatedGameStats: jest.fn(),
    getTopPerformers: jest.fn(),
    getGameStatsSummary: jest.fn(),
    createPlayerGameStats: jest.fn(),
    updatePlayerGameStats: jest.fn(),
    deletePlayerGameStats: jest.fn(),
  }
}));

describe('Game Stats Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state initially', async () => {
    // Mock API to return data after a delay
    apiService.getAggregatedGameStats.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(<MockAdmin />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('displays empty state when no game stats available', async () => {
    apiService.getAggregatedGameStats.mockResolvedValue([]);

    render(<MockAdmin />);

    await waitFor(() => {
      expect(screen.getByTestId('no-stats')).toBeInTheDocument();
    });

    expect(screen.getByText('No Game Stats Available')).toBeInTheDocument();
    expect(screen.getByText('Player game statistics will appear here once games are recorded.')).toBeInTheDocument();
  });

  test('displays game stats data correctly', async () => {
    const mockGameStats = [
      {
        id: 1,
        player_name: 'Test Player 1',
        gamertag: 'testplayer1',
        team_name: 'Test Team',
        team_color: '#FF0000',
        games_played: 5,
        total_points: 250,
        total_goals: 15,
        total_assists: 10,
        total_saves: 20,
        avg_points_per_game: 50.0
      },
      {
        id: 2,
        player_name: 'Test Player 2',
        gamertag: 'testplayer2',
        team_name: 'Another Team',
        team_color: '#00FF00',
        games_played: 3,
        total_points: 180,
        total_goals: 8,
        total_assists: 12,
        total_saves: 15,
        avg_points_per_game: 60.0
      }
    ];

    apiService.getAggregatedGameStats.mockResolvedValue(mockGameStats);

    render(<MockAdmin />);

    await waitFor(() => {
      expect(screen.getByTestId('game-stats-table')).toBeInTheDocument();
    });

    // Check summary cards
    expect(screen.getByTestId('total-players')).toHaveTextContent('Total Players: 2');
    expect(screen.getByTestId('total-points')).toHaveTextContent('Total Points: 430');
    expect(screen.getByTestId('active-players')).toHaveTextContent('Active Players: 2');

    // Check player data in table
    expect(screen.getByTestId('player-name-0')).toHaveTextContent('Test Player 1');
    expect(screen.getByTestId('team-name-0')).toHaveTextContent('Test Team');
    expect(screen.getByTestId('games-played-0')).toHaveTextContent('5');
    expect(screen.getByTestId('total-points-0')).toHaveTextContent('250');
    expect(screen.getByTestId('total-goals-0')).toHaveTextContent('15');
    expect(screen.getByTestId('avg-points-0')).toHaveTextContent('50.0');

    expect(screen.getByTestId('player-name-1')).toHaveTextContent('Test Player 2');
    expect(screen.getByTestId('team-name-1')).toHaveTextContent('Another Team');
    expect(screen.getByTestId('games-played-1')).toHaveTextContent('3');
    expect(screen.getByTestId('total-points-1')).toHaveTextContent('180');
  });

  test('handles API errors gracefully', async () => {
    apiService.getAggregatedGameStats.mockRejectedValue(new Error('API Error'));

    render(<MockAdmin />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load game stats data')).toBeInTheDocument();
  });

  test('calculates stats correctly for players with zero games', async () => {
    const mockGameStats = [
      {
        id: 1,
        player_name: 'Inactive Player',
        team_name: 'Test Team',
        games_played: 0,
        total_points: 0,
        total_goals: 0,
        total_assists: 0,
        total_saves: 0,
        avg_points_per_game: 0
      }
    ];

    apiService.getAggregatedGameStats.mockResolvedValue(mockGameStats);

    render(<MockAdmin />);

    await waitFor(() => {
      expect(screen.getByTestId('game-stats-table')).toBeInTheDocument();
    });

    expect(screen.getByTestId('active-players')).toHaveTextContent('Active Players: 0');
    expect(screen.getByTestId('avg-points-0')).toHaveTextContent('0.0');
  });
});

// Test API service methods
describe('Game Stats API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('getAggregatedGameStats calls correct endpoint', async () => {
    const mockResponse = [{ id: 1, player_name: 'Test' }];
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    // Import the actual service to test
    const { apiService: realApiService } = jest.requireActual('../services/apiService');
    
    const result = await realApiService.getAggregatedGameStats();
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/player-game-stats/aggregated')
    );
  });

  test('getTopPerformers calls correct endpoint with parameters', async () => {
    const mockResponse = [{ player_name: 'Top Player', total_points: 500 }];
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const { apiService: realApiService } = jest.requireActual('../services/apiService');
    
    const result = await realApiService.getTopPerformers('points', 5, 3);
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/player-game-stats/top/points?limit=5&season=3')
    );
  });
});