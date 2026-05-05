import React, { useState, useEffect } from "react";

const TeamsRostersTable = ({ selectedSeason, apiService }) => {
  const [teams, setTeams] = useState([]);
  const [allBaseTeams, setAllBaseTeams] = useState([]); // All base teams from teams table
  const [players, setPlayers] = useState([]);
  const [rosters, setRosters] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingRoster, setEditingRoster] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedConference, setSelectedConference] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'conference', 'playerCount'
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [selectedTeamToAdd, setSelectedTeamToAdd] = useState('');
  const [newTeamDisplayName, setNewTeamDisplayName] = useState('');
  const [newTeamConference, setNewTeamConference] = useState('');

  useEffect(() => {
    if (selectedSeason) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, playersData, baseTeamsData] = await Promise.all([
        selectedSeason.is_active ? apiService.getTeams('current') : apiService.getTeams(selectedSeason.id),
        apiService.getPlayers(),
        // Get all base teams (without season filter) to allow adding teams to this season
        apiService.getTeams()
      ]);

      setTeams(teamsData);
      setPlayers(playersData);
      setAllBaseTeams(baseTeamsData);

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

  // Get teams that can be added to this season (not already in season)
  const getAvailableTeamsToAdd = () => {
    const existingTeamIds = teams.map(t => t.team_id);
    return allBaseTeams.filter(t => !existingTeamIds.includes(t.id));
  };

  const handleAddTeamToSeason = async () => {
    if (!selectedTeamToAdd || !selectedSeason) return;

    try {
      setLoading(true);
      const selectedBaseTeam = allBaseTeams.find(t => t.id === parseInt(selectedTeamToAdd));

      const teamSeasonData = {
        season_id: selectedSeason.id,
        team_id: parseInt(selectedTeamToAdd),
        display_name: newTeamDisplayName || selectedBaseTeam?.team_name || '',
        primary_color: selectedBaseTeam?.color || null,
        secondary_color: selectedBaseTeam?.secondary_color || null,
        conference: newTeamConference || null
      };

      await apiService.createTeamSeason(teamSeasonData);

      // Reset form and reload data
      setShowAddTeamModal(false);
      setSelectedTeamToAdd('');
      setNewTeamDisplayName('');
      setNewTeamConference('');
      await loadData();
    } catch (error) {
      console.error('Failed to add team to season:', error);
      alert('Failed to add team to season: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeamFromSeason = async (teamSeasonId, teamName) => {
    if (!window.confirm(`Are you sure you want to remove ${teamName} from this season? This will also remove all roster memberships for this team.`)) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteTeamSeason(teamSeasonId);
      await loadData();
    } catch (error) {
      console.error('Failed to remove team from season:', error);
      alert('Failed to remove team from season: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort teams based on selected criteria
  const sortTeams = (teamsToSort) => {
    return [...teamsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.display_name || a.team_name).localeCompare(b.display_name || b.team_name);
        case 'conference':
          if (a.conference && b.conference) {
            if (a.conference !== b.conference) {
              return a.conference.localeCompare(b.conference);
            }
          }
          // If same conference or missing conference, sort by name
          return (a.display_name || a.team_name).localeCompare(b.display_name || b.team_name);
        case 'playerCount':
          const aCount = (rosters[a.team_season_id] || []).length;
          const bCount = (rosters[b.team_season_id] || []).length;
          if (aCount !== bCount) {
            return bCount - aCount; // Descending order
          }
          // If same player count, sort by name
          return (a.display_name || a.team_name).localeCompare(b.display_name || b.team_name);
        default:
          return 0;
      }
    });
  };

  // Team card renderer function
  const renderTeamCard = (team) => {
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
              <>
                <button
                  onClick={() => handleEditRoster(team.team_season_id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-all duration-300"
                  disabled={loading}
                >
                  ✏️ Edit Roster
                </button>
                <button
                  onClick={() => handleRemoveTeamFromSeason(team.team_season_id, team.display_name || team.team_name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-all duration-300"
                  disabled={loading}
                  title="Remove team from this season"
                >
                  🗑️
                </button>
              </>
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
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Teams & Rosters</h2>
          <p className="text-gray-400">Season: {selectedSeason?.season_name || selectedSeason?.name}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Add Team to Season Button */}
          <button
            onClick={() => setShowAddTeamModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
            disabled={loading}
          >
            <span>➕</span> Add Team to Season
          </button>
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="name">Team Name</option>
              <option value="conference">Conference</option>
              <option value="playerCount">Player Count</option>
            </select>
          </div>

          {/* Conference Filter - Only show for Season 3 */}
          {selectedSeason?.id === 3 && (
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">Conference:</label>
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Conferences</option>
                <option value="East">East Conference</option>
                <option value="West">West Conference</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Conference-grouped display for Season 3 when showing all */}
      {selectedSeason?.id === 3 && selectedConference === 'all' ? (
        <div className="space-y-8">
          {['East', 'West'].map(conference => {
            const conferenceTeams = teams.filter(team => team.conference === conference);
            if (conferenceTeams.length === 0) return null;

            const sortedConferenceTeams = sortTeams(conferenceTeams);

            return (
              <div key={conference}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">🛡️</div>
                  <h3 className="text-xl font-bold text-white">{conference} Conference</h3>
                  <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
                    {sortedConferenceTeams.length} teams
                  </span>
                </div>
                <div className="grid gap-6">
                  {sortedConferenceTeams.map((team) => renderTeamCard(team))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6">
          {sortTeams(
            teams.filter(team => selectedConference === 'all' || team.conference === selectedConference)
          ).map((team) => renderTeamCard(team))}
        </div>
      )}

      {teams.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No teams found for this season</p>
          <button
            onClick={() => setShowAddTeamModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
          >
            ➕ Add Your First Team
          </button>
        </div>
      )}

      {/* Add Team to Season Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-600">
            <h3 className="text-xl font-bold text-white mb-4">Add Team to Season</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Select a team to add to {selectedSeason?.season_name || selectedSeason?.name}
            </p>

            <div className="space-y-4">
              {/* Team Selection */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Select Team</label>
                <select
                  value={selectedTeamToAdd}
                  onChange={(e) => {
                    setSelectedTeamToAdd(e.target.value);
                    // Auto-fill display name from base team
                    const team = allBaseTeams.find(t => t.id === parseInt(e.target.value));
                    if (team) {
                      setNewTeamDisplayName(team.team_name);
                    }
                  }}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a team...</option>
                  {getAvailableTeamsToAdd().map(team => (
                    <option key={team.id} value={team.id}>
                      {team.team_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Display Name (for this season)</label>
                <input
                  type="text"
                  value={newTeamDisplayName}
                  onChange={(e) => setNewTeamDisplayName(e.target.value)}
                  placeholder="e.g., Team Name S4"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Conference */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Conference (optional)</label>
                <select
                  value={newTeamConference}
                  onChange={(e) => setNewTeamConference(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select conference...</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="homer">Homer</option>
                  <option value="garfield">Garfield</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTeamToSeason}
                disabled={!selectedTeamToAdd || loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                {loading ? 'Adding...' : 'Add Team'}
              </button>
              <button
                onClick={() => {
                  setShowAddTeamModal(false);
                  setSelectedTeamToAdd('');
                  setNewTeamDisplayName('');
                  setNewTeamConference('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Cancel
              </button>
            </div>

            {getAvailableTeamsToAdd().length === 0 && (
              <p className="text-yellow-400 text-sm mt-4">
                All existing teams have been added to this season. Create new base teams in the "Teams" tab first.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsRostersTable;