import React, { useState, useEffect } from "react";

const GameEditModal = ({ 
  show, 
  game,
  loading, 
  onCancel, 
  onSave, 
  onDelete,
  apiService
}) => {
  const [players, setPlayers] = useState([]);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Load players when modal opens
  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (!show || !game) return;
      
      try {
        setLoadingPlayers(true);
        
        // Get all players and roster memberships for both teams
        const [allPlayers, homeRoster, awayRoster] = await Promise.all([
          apiService.getPlayers(),
          apiService.getRosterMembershipsByTeamSeason(game.home_team_season_id),
          apiService.getRosterMembershipsByTeamSeason(game.away_team_season_id)
        ]);

        setPlayers(allPlayers);
        
        // Filter players by team roster
        const homePlayers = allPlayers.filter(player => 
          homeRoster.some(roster => roster.player_id === player.id)
        );
        const awayPlayers = allPlayers.filter(player => 
          awayRoster.some(roster => roster.player_id === player.id)
        );
        
        setHomeTeamPlayers(homePlayers);
        setAwayTeamPlayers(awayPlayers);
        
      } catch (error) {
        console.error('Failed to load team players:', error);
      } finally {
        setLoadingPlayers(false);
      }
    };

    loadTeamPlayers();
  }, [show, game, apiService]);

  if (!show || !game) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" tabIndex="-1">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-600 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-600">
          <h3 className="text-xl font-bold text-white font-mono">
            Edit Game: {game.home_display} vs {game.away_display}
          </h3>
          <p className="text-gray-400 text-sm font-mono">
            Week {game.week} • Game {game.series_game || 1} • {game.game_date || 'No date set'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingPlayers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400">Loading team rosters...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              {/* Home Team */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-200 font-mono border-b border-gray-600 pb-2">
                  🏠 {game.home_display}
                </h4>
                <div className="space-y-3">
                  {homeTeamPlayers.length > 0 ? (
                    homeTeamPlayers.map((player, index) => (
                      <div key={player.id} className="bg-gray-700 p-3 rounded border border-gray-600">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-mono text-sm text-gray-300">
                              Player {index + 1}
                            </div>
                            <div className="font-bold text-white">
                              {player.display_name || player.player_name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 font-mono">STATS</div>
                            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                              <div>G: <span className="text-yellow-400">0</span></div>
                              <div>A: <span className="text-blue-400">0</span></div>
                              <div>S: <span className="text-green-400">0</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4 font-mono">
                      No players found for this team
                    </div>
                  )}
                </div>
              </div>

              {/* Away Team */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-200 font-mono border-b border-gray-600 pb-2">
                  ✈️ {game.away_display}
                </h4>
                <div className="space-y-3">
                  {awayTeamPlayers.length > 0 ? (
                    awayTeamPlayers.map((player, index) => (
                      <div key={player.id} className="bg-gray-700 p-3 rounded border border-gray-600">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-mono text-sm text-gray-300">
                              Player {index + 1}
                            </div>
                            <div className="font-bold text-white">
                              {player.display_name || player.player_name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 font-mono">STATS</div>
                            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                              <div>G: <span className="text-yellow-400">0</span></div>
                              <div>A: <span className="text-blue-400">0</span></div>
                              <div>S: <span className="text-green-400">0</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4 font-mono">
                      No players found for this team
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-600 px-6 py-4 flex gap-3 justify-between">
          <div className="flex gap-3">
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-300"
            >
              Delete Game
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEditModal;