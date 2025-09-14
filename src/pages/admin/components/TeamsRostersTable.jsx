import React, { useState, useEffect } from "react";

const TeamsRostersTable = ({ selectedSeason, apiService }) => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosters, setRosters] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingRoster, setEditingRoster] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');

  useEffect(() => {
    if (selectedSeason) {
      loadData();
    }
  }, [selectedSeason]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, playersData] = await Promise.all([
        apiService.getTeams(selectedSeason.id),
        apiService.getPlayers()
      ]);

      setTeams(teamsData);
      setPlayers(playersData);

      const rostersData = {};
      for (const team of teamsData) {
        if (team.team_season_id) {
          try {
            const roster = await apiService.getRosterMembershipsByTeamSeason(team.team_season_id);
            rostersData[team.team_season_id] = roster.map(r => {
              const player = playersData.find(p => p.id === r.player_id);
              return {
                ...r,
                player_name: player?.player_name || 'Unknown',
                display_name: player?.display_name || player?.player_name || 'Unknown'
              };
            });
          } catch (error) {
            console.error(`Failed to load roster for team ${team.team_name}:`, error);
            rostersData[team.team_season_id] = [];
          }
        }
      }
      setRosters(rostersData);

    } catch (error) {
      console.error('Failed to load teams and rosters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoster = (teamSeasonId) => {
    setEditingRoster(teamSeasonId);
    
    const currentRoster = rosters[teamSeasonId] || [];
    const currentPlayerIds = currentRoster.map(r => r.player_id);
    const available = players.filter(p => !currentPlayerIds.includes(p.id));
    setAvailablePlayers(available);
    setSelectedPlayer('');
  };

  const handleAddPlayerToRoster = async (teamSeasonId) => {
    if (!selectedPlayer) return;

    try {
      setLoading(true);
      await apiService.createRosterMembership({
        player_id: parseInt(selectedPlayer),
        team_season_id: teamSeasonId
      });

      await loadData();
      setEditingRoster(null);
      setSelectedPlayer('');
    } catch (error) {
      console.error('Failed to add player to roster:', error);
      alert('Failed to add player to roster: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlayerFromRoster = async (membershipId, teamSeasonId) => {
    if (!window.confirm('Are you sure you want to remove this player from the roster?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteRosterMembership(membershipId);
      await loadData();
    } catch (error) {
      console.error('Failed to remove player from roster:', error);
      alert('Failed to remove player from roster: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEditing = () => {
    setEditingRoster(null);
    setSelectedPlayer('');
    setAvailablePlayers([]);
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading teams and rosters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Teams & Rosters</h2>
        <p className="text-gray-400">Season: {selectedSeason?.name}</p>
      </div>

      <div className="grid gap-6">
        {teams.map((team) => {
          const teamRoster = rosters[team.team_season_id] || [];
          const isEditing = editingRoster === team.team_season_id;

          return (
            <div key={team.id} className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
              {/* Team Header */}
              <div 
                className="p-4 border-b border-gray-600 flex items-center justify-between"
                style={{ 
                  background: team.color ? `linear-gradient(135deg, ${team.color}20, ${team.color}10)` : 'transparent',
                  borderLeft: team.color ? `4px solid ${team.color}` : 'none'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {team.display_name || team.team_name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {team.conference?.toUpperCase()} Conference
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">
                    {teamRoster.length} players
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => handleEditRoster(team.team_season_id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-all duration-300"
                      disabled={loading}
                    >
                      ✏️ Edit Roster
                    </button>
                  )}
                </div>
              </div>

              {/* Roster Content */}
              <div className="p-4">
                {teamRoster.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No players on roster
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamRoster.map((member) => (
                      <div 
                        key={member.id} 
                        className="bg-gray-800 rounded p-3 flex items-center justify-between border border-gray-600"
                      >
                        <div>
                          <div className="font-medium text-white">
                            {member.display_name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Player ID: {member.player_id}
                          </div>
                        </div>
                        
                        {isEditing && (
                          <button
                            onClick={() => handleRemovePlayerFromRoster(member.id, team.team_season_id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-all duration-300"
                            disabled={loading}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Player Section */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex items-center gap-3">
                      <select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        disabled={loading}
                      >
                        <option value="">Select player to add...</option>
                        {availablePlayers.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.display_name || player.player_name}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => handleAddPlayerToRoster(team.team_season_id)}
                        disabled={!selectedPlayer || loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-all duration-300"
                      >
                        ➕ Add Player
                      </button>
                      
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-all duration-300"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {teams.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No teams found for this season
        </div>
      )}
    </div>
  );
};

export default TeamsRostersTable;