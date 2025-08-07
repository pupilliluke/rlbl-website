import { useState, useMemo } from "react";
import { players } from "../data/players.js";
import { formatPlayerName } from "../utils/formatters.js";

const Stats = () => {
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("2025");
  const [viewType, setViewType] = useState("players"); // players or teams
  const [showCount, setShowCount] = useState(20);


  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return "↕";
    return sortOrder === "desc" ? "↓" : "↑";
  };

  // Calculate team stats from players
  const teamStats = useMemo(() => {
    const teamMap = {};
    players.forEach(player => {
      if (!teamMap[player.team]) {
        teamMap[player.team] = {
          team: player.team,
          players: 0,
          totalPoints: 0,
          totalGoals: 0,
          totalAssists: 0,
          totalSaves: 0,
          totalShots: 0,
          totalMVPs: 0,
          totalDemos: 0,
          totalEpicSaves: 0,
          totalGames: 0,
          avgPPG: 0,
          avgGPG: 0,
          avgAPG: 0,
          avgSVPG: 0,
          avgSH: 0
        };
      }
      const team = teamMap[player.team];
      team.players++;
      team.totalPoints += player.points;
      team.totalGoals += player.goals;
      team.totalAssists += player.assists;
      team.totalSaves += player.saves;
      team.totalShots += player.shots;
      team.totalMVPs += player.mvps;
      team.totalDemos += player.demos;
      team.totalEpicSaves += player.epicSaves;
      team.totalGames += player.gamesPlayed;
    });

    return Object.values(teamMap).map(team => ({
      ...team,
      avgPPG: team.totalGames > 0 ? (team.totalPoints / team.totalGames) : 0,
      avgGPG: team.totalGames > 0 ? (team.totalGoals / team.totalGames) : 0,
      avgAPG: team.totalGames > 0 ? (team.totalAssists / team.totalGames) : 0,
      avgSVPG: team.totalGames > 0 ? (team.totalSaves / team.totalGames) : 0,
      avgSH: team.totalShots > 0 ? ((team.totalGoals / team.totalShots) * 100) : 0
    }));
  }, []);

  // Sort and filter data
  const sortedData = useMemo(() => {
    const data = viewType === "players" ? players : teamStats;
    return data
      .filter(item => {
        const name = viewType === "players" ? item.player : item.team;
        return name.toLowerCase().includes(filter.toLowerCase());
      })
      .sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === "desc") {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      })
      .slice(0, showCount);
  }, [viewType, teamStats, sortBy, sortOrder, filter, showCount]);

  const StatHeader = ({ column, label, className = "" }) => (
    <th 
      className={`px-3 py-4 text-left font-bold text-white cursor-pointer hover:bg-blue-800 transition-colors ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-xs opacity-70">{getSortIcon(column)}</span>
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">RLBL Statistics</h1>
          <p className="text-blue-200">Complete player and team statistics for the Rocket League Business League</p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex flex-wrap gap-4">
            {/* View Type Toggle */}
            <div className="flex bg-[#2a2a3d] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType("players")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewType === "players" 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Players
              </button>
              <button
                onClick={() => setViewType("teams")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewType === "teams" 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Teams
              </button>
            </div>

            {/* Season Selector */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#2a2a3d] border border-blue-800 text-sm"
            >
              <option value="2025">2025 Season</option>
              <option value="2024">2024 Season</option>
              <option value="all">All Time</option>
            </select>

            {/* Show Count */}
            <select
              value={showCount}
              onChange={(e) => setShowCount(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg bg-[#2a2a3d] border border-blue-800 text-sm"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={999}>All</option>
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder={`Search ${viewType}...`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#2a2a3d] border border-blue-800 text-sm min-w-[200px]"
          />
        </div>

        {/* Stats Table */}
        <div className="bg-[#1f1f2e] rounded-lg overflow-hidden border border-blue-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-900 border-b border-blue-700">
                <tr>
                  <th className="px-3 py-4 text-left font-bold text-white w-8">#</th>
                  <StatHeader 
                    column={viewType === "players" ? "player" : "team"} 
                    label={viewType === "players" ? "Player" : "Team"} 
                    className="min-w-[150px]"
                  />
                  {viewType === "players" && (
                    <StatHeader column="team" label="Team" className="min-w-[120px]" />
                  )}
                  {viewType === "teams" && (
                    <StatHeader column="players" label="Players" />
                  )}
                  <StatHeader column="gamesPlayed" label="GP" />
                  <StatHeader column={viewType === "players" ? "points" : "totalPoints"} label="PTS" />
                  <StatHeader column={viewType === "players" ? "ppg" : "avgPPG"} label="PPG" />
                  <StatHeader column={viewType === "players" ? "goals" : "totalGoals"} label="G" />
                  <StatHeader column={viewType === "players" ? "gpg" : "avgGPG"} label="GPG" />
                  <StatHeader column={viewType === "players" ? "assists" : "totalAssists"} label="A" />
                  <StatHeader column={viewType === "players" ? "apg" : "avgAPG"} label="APG" />
                  <StatHeader column={viewType === "players" ? "saves" : "totalSaves"} label="SV" />
                  <StatHeader column={viewType === "players" ? "svpg" : "avgSVPG"} label="SVPG" />
                  <StatHeader column={viewType === "players" ? "shots" : "totalShots"} label="SH" />
                  <StatHeader column={viewType === "players" ? "shPercent" : "avgSH"} label="SH%" />
                  <StatHeader column={viewType === "players" ? "mvps" : "totalMVPs"} label="MVP" />
                  <StatHeader column={viewType === "players" ? "demos" : "totalDemos"} label="DEM" />
                  <StatHeader column={viewType === "players" ? "epicSaves" : "totalEpicSaves"} label="ES" />
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-700 hover:bg-[#2a2a3d] transition-colors"
                  >
                    <td className="px-3 py-3 text-gray-400 font-mono text-sm">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 font-semibold text-white">
                      {viewType === "players" ? formatPlayerName(item.player, item.gamertag) : item.team}
                    </td>
                    {viewType === "players" && (
                      <td className="px-3 py-3 text-blue-300 text-sm">{item.team}</td>
                    )}
                    {viewType === "teams" && (
                      <td className="px-3 py-3 text-center">{item.players}</td>
                    )}
                    <td className="px-3 py-3 text-center">
                      {viewType === "players" ? item.gamesPlayed : Math.round(item.totalGames / item.players)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-yellow-400">
                      {viewType === "players" ? item.points.toLocaleString() : item.totalPoints.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.ppg : item.avgPPG).toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-green-400">
                      {viewType === "players" ? item.goals : item.totalGoals}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.gpg : item.avgGPG).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-blue-400">
                      {viewType === "players" ? item.assists : item.totalAssists}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.apg : item.avgAPG).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-purple-400">
                      {viewType === "players" ? item.saves : item.totalSaves}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.svpg : item.avgSVPG).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {viewType === "players" ? item.shots : item.totalShots}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.shPercent : item.avgSH).toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-orange-400">
                      {viewType === "players" ? item.mvps : item.totalMVPs}
                    </td>
                    <td className="px-3 py-3 text-center text-red-400">
                      {viewType === "players" ? item.demos : item.totalDemos}
                    </td>
                    <td className="px-3 py-3 text-center text-cyan-400">
                      {viewType === "players" ? item.epicSaves : item.totalEpicSaves}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Showing {sortedData.length} {viewType} • Updated through Week {new Date().getWeek || 12}</p>
          <div className="flex justify-center gap-6 mt-2 text-xs">
            <span>GP = Games Played</span>
            <span>PPG = Points Per Game</span>
            <span>GPG = Goals Per Game</span>
            <span>APG = Assists Per Game</span>
            <span>SVPG = Saves Per Game</span>
            <span>SH% = Shooting %</span>
            <span>DEM = Demolitions</span>
            <span>ES = Epic Saves</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;