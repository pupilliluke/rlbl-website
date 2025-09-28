import React from "react";

const StandingsTable = ({
  standingsData,
  loading,
  selectedConference,
  seasonId,
  onEdit,
  onDelete
}) => {
  // Function to get conference for a team (database-driven)
  const getTeamConference = (team, season) => {
    // Use database conference if available
    if (team.conference) {
      return team.conference;
    }
    return null;
  };
  if (!standingsData || standingsData.length === 0) {
    return (
      <div className="bg-gray-800/90 border border-gray-600 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-2xl font-bold text-white mb-2">No Standings Available</h3>
        <p className="text-gray-300">Generate standings from game results using the Auto-Generate button above.</p>
      </div>
    );
  }

  // Group standings by conference for Season 3
  const groupedStandings = () => {
    if (seasonId === 3 && standingsData && standingsData.length > 0) {
      const grouped = { 'West': [], 'East': [], 'Other': [] };

      standingsData.forEach((team, index) => {
        const conference = getTeamConference(team, seasonId);
        const teamWithRank = { ...team, overallRank: index + 1 };

        if (conference) {
          grouped[conference].push(teamWithRank);
        } else {
          grouped['Other'].push(teamWithRank);
        }
      });

      // Sort each conference by league points (descending)
      Object.keys(grouped).forEach(conf => {
        grouped[conf].sort((a, b) => {
          if (b.league_points !== a.league_points) return b.league_points - a.league_points;
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.point_diff - a.point_diff;
        });
      });

      return grouped;
    }
    return null;
  };

  // Filter standings by conference if needed
  let displayStandings = standingsData;

  if (selectedConference && selectedConference !== 'All') {
    const grouped = groupedStandings();
    if (grouped && grouped[selectedConference]) {
      displayStandings = grouped[selectedConference];
    } else {
      displayStandings = standingsData.filter(team =>
        getTeamConference(team, seasonId) === selectedConference
      );
    }
  }

  // Sort by league_points DESC, then wins DESC, then point_diff DESC
  const sortedStandings = [...displayStandings].sort((a, b) => {
    if (b.league_points !== a.league_points) return b.league_points - a.league_points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.point_diff - a.point_diff;
  });

  if (loading) {
    return (
      <div className="bg-gray-800/90 border border-gray-600 rounded-2xl p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading standings...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/90 border border-gray-600 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700 border-b border-gray-600">
              <th className="text-left py-4 px-6 text-white font-bold">Rank</th>
              <th className="text-left py-4 px-6 text-white font-bold">Team</th>
              <th className="text-center py-4 px-6 text-white font-bold">W</th>
              <th className="text-center py-4 px-6 text-white font-bold">L</th>
              <th className="text-center py-4 px-6 text-white font-bold">OTG</th>
              <th className="text-center py-4 px-6 text-white font-bold">FF</th>
              <th className="text-center py-4 px-6 text-white font-bold">Points</th>
              <th className="text-center py-4 px-6 text-white font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((team, index) => (
              <tr
                key={team.team_season_id || team.id}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                {/* Rank */}
                <td className="py-4 px-6 text-white font-bold text-lg">
                  {index + 1}
                  {selectedConference && selectedConference !== 'All' && team.overallRank && (
                    <span className="text-xs text-gray-400 ml-2">({team.overallRank})</span>
                  )}
                </td>

                {/* Team Name */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {team.color && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-400"
                        style={{ backgroundColor: team.color }}
                      ></div>
                    )}
                    <span className="text-white font-semibold">
                      {team.team_name}
                    </span>
                  </div>
                </td>

                {/* Wins */}
                <td className="py-4 px-6 text-center text-green-400 font-bold">
                  {team.wins || 0}
                </td>

                {/* Losses */}
                <td className="py-4 px-6 text-center text-red-400 font-bold">
                  {team.losses || 0}
                </td>

                {/* Overtime Games */}
                <td className="py-4 px-6 text-center text-yellow-400 font-bold">
                  {(team.overtime_wins || 0) + (team.overtime_losses || 0)}
                </td>

                {/* Forfeits */}
                <td className="py-4 px-6 text-center text-gray-400 font-bold">
                  {team.forfeits || 0}
                </td>

                {/* League Points */}
                <td className="py-4 px-6 text-center">
                  <span className="text-blue-400 font-bold text-lg">
                    {team.league_points || 0}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit && onEdit(index)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-bold transition-all duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with point system explanation */}
      <div className="bg-gray-700 px-6 py-4 text-sm text-gray-300">
        <div className="flex flex-wrap gap-4">
          <span><strong>Point System:</strong></span>
          <span>Regulation Win: 4pts</span>
          <span>OT Win: 3pts</span>
          <span>OT Loss: 2pts</span>
          <span>Regulation Loss: 1pt</span>
          <span>Forfeit: 0pts</span>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;