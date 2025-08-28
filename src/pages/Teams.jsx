import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, fallbackData } from "../services/apiService";

const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("career");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching teams and players data from API...');
        
        const [teamsData, playersData] = await Promise.all([
          apiService.getTeams(selectedSeason),
          apiService.getPlayers()
        ]);
        
        console.log('Teams data received:', teamsData);
        console.log('Players data received:', playersData);
        
        setTeams(teamsData);
        setPlayers(playersData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch teams data:', err);
        console.error('Error details:', err.message);
        setError(err.message);
        // Use fallback data
        console.log('Using fallback data due to API error');
        setTeams(fallbackData.teams);
        setPlayers(fallbackData.players);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason]);

  // Group players by team
  const getPlayersForTeam = (teamName) => {
    return players.filter(player => player.team_name === teamName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white page-with-navbar">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm shadow-2xl border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">⚽ RLBL Teams</h1>
              <p className="text-blue-200 text-sm md:text-base">
                Team rosters and player lineups by season
                {error && <span className="text-red-400 ml-2">(Using cached data)</span>}
              </p>
            </div>
            
            {/* Season Dropdown */}
            <div className="flex flex-col items-start md:items-end">
              <label className="text-xs text-gray-300 mb-1">Season</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white hover:shadow-lg transition-all duration-300 focus:border-blue-400 focus:outline-none min-w-[200px]"
              >
                <option value="current" className="text-black bg-white">🚀 Season 3 - Summer 25 (Not Started)</option>
                <option value="career" className="text-black bg-white">🌟 Active Season Teams</option>
                <option value="season2" className="text-black bg-white">🏅 Season 2 - Spring 25</option>
                <option value="season2_playoffs" className="text-black bg-white">🏆 Season 2 Playoffs</option>
                <option value="season1" className="text-black bg-white">🎯 Season 1 - Fall 24</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 text-center">
            {selectedSeason === 'current' ? 'Season 3 Teams (Not Started)' :
             selectedSeason === 'career' ? 'Active Season Teams' :
             selectedSeason === 'season1' ? 'Season 1 Teams' :
             selectedSeason === 'season2' ? 'Season 2 Teams' :
             selectedSeason === 'season2_playoffs' ? 'Season 2 Playoff Teams' :
             'Teams'}
          </h2>
          
          {teams.length === 0 ? (
            <div className="text-center text-gray-400">
              {selectedSeason === 'current' ? (
                <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-600">
                  <div className="text-4xl mb-4">🚀</div>
                  <p className="text-xl text-white mb-2">Season 3 - Summer 25</p>
                  <p>No teams registered yet. Season hasn't started!</p>
                </div>
              ) : (
                <p>No teams found for this season. Make sure the API server is running.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {teams.map((team) => {
                const teamPlayers = getPlayersForTeam(team.team_name);
                
                return (
                  <Link to={`/teams/${slugify(team.team_name)}`} key={team.team_id || team.id}>
                    <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-600 transition duration-300 hover:scale-[1.02] cursor-pointer hover:border-gray-500 hover:shadow-2xl">
                      {/* Team Color Strip */}
                      <div className="flex mb-4 rounded-lg overflow-hidden h-3">
                        <div
                          className="flex-1"
                          style={{ backgroundColor: team.color }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">
                          {team.team_name}
                        </h3>
                        <div className="flex space-x-2">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: team.color }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-300 mb-3 font-medium">
                          Players ({teamPlayers.length}):
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {teamPlayers.length > 0 ? (
                            teamPlayers.map((player) => (
                              <div
                                key={player.id}
                                className="text-base text-white bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-600/50"
                              >
                                {player.player_name}
                                <span className="text-gray-400 text-sm ml-2">
                                  ({player.gamertag})
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400 text-sm">
                              No players found
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {team.logo_url && (
                        <div className="mt-4 text-center">
                          <img 
                            src={team.logo_url} 
                            alt={`${team.team_name} logo`}
                            className="h-12 w-12 mx-auto rounded-full border-2 border-gray-600"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
