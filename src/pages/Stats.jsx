import { useState, useMemo, useEffect } from "react";
import { apiService, fallbackData } from "../services/apiService";
import { formatPlayerName } from "../utils/formatters.js";
import { PremiumChart, MetricCard, RadialChart } from "../components/PremiumChart.jsx";

const Stats = () => {
  const [sortBy, setSortBy] = useState("total_points");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [viewType, setViewType] = useState("players");
  const [showCount, setShowCount] = useState(20);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("career");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('Fetching stats data from API for season:', selectedSeason);
        const statsData = await apiService.getStats(selectedSeason);
        console.log('Stats data received:', statsData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        console.error('Error details:', err.message);
        setError(err.message);
        console.log('Using fallback data due to API error');
        setStats(fallbackData.stats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedSeason]);

  // Process stats data to add calculated fields
  const processedStats = useMemo(() => {
    return stats.map(player => {
      const gamesPlayed = parseInt(player.games_played) || 1;
      return {
        ...player,
        // Convert to numbers
        total_points: parseInt(player.total_points) || 0,
        total_goals: parseInt(player.total_goals) || 0,
        total_assists: parseInt(player.total_assists) || 0,
        total_saves: parseInt(player.total_saves) || 0,
        total_shots: parseInt(player.total_shots) || 0,
        total_mvps: parseInt(player.total_mvps) || 0,
        total_demos: parseInt(player.total_demos) || 0,
        total_epic_saves: parseInt(player.total_epic_saves) || 0,
        games_played: gamesPlayed,
        // Calculated fields
        ppg: (parseInt(player.total_points) || 0) / gamesPlayed,
        gpg: (parseInt(player.total_goals) || 0) / gamesPlayed,
        apg: (parseInt(player.total_assists) || 0) / gamesPlayed,
        svpg: (parseInt(player.total_saves) || 0) / gamesPlayed,
        shPercent: parseInt(player.total_shots) > 0 ? ((parseInt(player.total_goals) || 0) / parseInt(player.total_shots)) * 100 : 0
      };
    });
  }, [stats]);

  // Calculate team stats from current player data
  const teamStats = useMemo(() => {
    const teamMap = {};
    processedStats.forEach(player => {
      if (!teamMap[player.team_name]) {
        teamMap[player.team_name] = {
          team: player.team_name,
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
      const team = teamMap[player.team_name];
      team.players++;
      team.totalPoints += player.total_points;
      team.totalGoals += player.total_goals;
      team.totalAssists += player.total_assists;
      team.totalSaves += player.total_saves;
      team.totalShots += player.total_shots;
      team.totalMVPs += player.total_mvps;
      team.totalDemos += player.total_demos;
      team.totalEpicSaves += player.total_epic_saves;
      team.totalGames += player.games_played;
    });

    return Object.values(teamMap).map(team => ({
      ...team,
      avgPPG: team.totalGames > 0 ? (team.totalPoints / team.totalGames).toFixed(1) : 0,
      avgGPG: team.totalGames > 0 ? (team.totalGoals / team.totalGames).toFixed(1) : 0,
      avgAPG: team.totalGames > 0 ? (team.totalAssists / team.totalGames).toFixed(1) : 0,
      avgSVPG: team.totalGames > 0 ? (team.totalSaves / team.totalGames).toFixed(1) : 0,
      avgSH: team.totalShots > 0 ? ((team.totalGoals / team.totalShots) * 100).toFixed(1) : 0
    }));
  }, [processedStats]);

  // Sort and filter data
  const sortedData = useMemo(() => {
    const data = viewType === "players" ? processedStats : teamStats;
    return data
      .filter(item => {
        const name = viewType === "players" ? item.player_name : item.team;
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
  }, [viewType, teamStats, processedStats, sortBy, sortOrder, filter, showCount]);

  // Generate premium statistics data
  const premiumStatistics = useMemo(() => {
    if (processedStats.length === 0) return null;
    
    const topPlayers = [...processedStats].sort((a, b) => b.total_points - a.total_points).slice(0, 5);
    const avgStats = {
      points: processedStats.reduce((sum, p) => sum + p.total_points, 0) / processedStats.length,
      goals: processedStats.reduce((sum, p) => sum + p.total_goals, 0) / processedStats.length,
      assists: processedStats.reduce((sum, p) => sum + p.total_assists, 0) / processedStats.length,
    };
    
    return {
      topPlayers: topPlayers.map(p => ({ label: p.player_name, value: p.total_points })),
      totalPlayers: processedStats.length,
      avgStats
    };
  }, [processedStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading player statistics...</p>
        </div>
      </div>
    );
  }


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

  const StatHeader = ({ column, label, className = "" }) => (
    <th 
      className={`px-4 py-5 text-left font-bold text-white cursor-pointer hover:bg-white/5 transition-all duration-300 hover:shadow-luxury border-r border-white/5 last:border-r-0 ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2 group">
        <span className="group-hover:holographic transition-all duration-300">{label}</span>
        <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">
          {getSortIcon(column)}
        </span>
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-gradient-executive relative page-with-navbar">
      {/* Neural Background */}
      <div className="absolute inset-0 neural-bg opacity-20" />
      
      {/* Executive Header */}
      <div className="relative z-10 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-white mb-4">Statistics Dashboard</h1>
              <p className="text-xl text-white font-light">
                Executive-level insights and performance metrics
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-gray-600">
                <div className="text-2xl font-bold text-orange-400">S3</div>
                <div className="text-xs text-white">Season</div>
              </div>
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-gray-600">
                <div className="text-2xl font-bold text-blue-400">⚽</div>
                <div className="text-xs text-white">League</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Premium Statistics Dashboard */}
        {premiumStatistics && (
          <div className="mb-12">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Active Players"
                value={premiumStatistics.totalPlayers}
                subtitle="Registered Players"
                trend={12}
                icon="👥"
              />
              <MetricCard
                title="Avg Performance"
                value={Math.round(premiumStatistics.avgStats.points)}
                subtitle="Points per player"
                trend={8}
                icon="📊"
              />
              <MetricCard
                title="Total Goals"
                value={processedStats.reduce((sum, p) => sum + p.total_goals, 0)}
                subtitle="Season aggregate"
                trend={-3}
                icon="⚽"
              />
              <MetricCard
                title="Engagement"
                value="94.2%"
                subtitle="Player activity"
                trend={5}
                icon="🎯"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <PremiumChart
                  title="Top Performers"
                  data={premiumStatistics.topPlayers}
                  type="bar"
                  gradient="blue"
                />
              </div>
              <RadialChart
                title="Close Match Rate"
                data={{ percentage: 87, label: "Rate" }}
              />
            </div>
          </div>
        )}

        {/* Executive Controls */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-600">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Premium View Toggle */}
              <div className="bg-gray-700/80 rounded-xl overflow-hidden border border-gray-500">
                <button
                  onClick={() => setViewType("players")}
                  className={`px-6 py-3 text-sm font-bold transition-all duration-300 ${
                    viewType === "players" 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-luxury" 
                      : "text-white hover:text-blue-300 hover:bg-gray-600"
                  }`}
                >
                  🏃‍♂️ Players
                </button>
                <button
                  onClick={() => setViewType("teams")}
                  className={`px-6 py-3 text-sm font-bold transition-all duration-300 ${
                    viewType === "teams" 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-luxury" 
                      : "text-white hover:text-blue-300 hover:bg-gray-600"
                  }`}
                >
                  🏆 Teams
                </button>
              </div>

              {/* Premium Season Selector */}
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-6 py-3 rounded-xl bg-gray-700/80 border border-gray-500 text-sm font-medium text-white hover:shadow-luxury transition-all duration-300"
              >
                <option value="current" className="text-black bg-white">🚀 Season 3 - Summer 25 (Not Started)</option>
                <option value="career" className="text-black bg-white">🌟 Career Stats (All-Time)</option>
                <option value="season2" className="text-black bg-white">🏅 Season 2 - Spring 25</option>
                <option value="season2_playoffs" className="text-black bg-white">🏆 Season 2 Playoffs</option>
                <option value="season1" className="text-black bg-white">🎯 Season 1 - Fall 24</option>
              </select>

              {/* Premium Results Count */}
              <select
                value={showCount}
                onChange={(e) => setShowCount(parseInt(e.target.value))}
                className="px-4 py-3 rounded-xl bg-gray-700/80 border border-gray-500 text-sm font-medium text-white hover:shadow-luxury transition-all duration-300"
              >
                <option value={10} className="text-black bg-white">Top 10</option>
                <option value={20} className="text-black bg-white">Top 20</option>
                <option value={50} className="text-black bg-white">Top 50</option>
                <option value={999} className="text-black bg-white">All Players</option>
              </select>
            </div>

            {/* Premium Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={`🔍 Search ${viewType}...`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-6 py-3 pl-12 rounded-xl bg-gray-700/80 border border-gray-500 text-sm min-w-[250px] text-white placeholder-gray-300 focus:border-blue-400/50 focus:shadow-luxury transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* High-Contrast Empty State for Season 3 */}
        {selectedSeason === "current" && (
          <div className="bg-gray-800/90 border border-gray-600 rounded-3xl p-12 shadow-executive text-center animate-luxury-fade-in">
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-20 animate-liquid-morph" />
              <div className="relative">
                <h3 className="text-4xl font-black text-white mb-4">🚀 Season 3 - Summer 25</h3>
                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-6" />
              </div>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 font-light">
              Advanced statistics platform is preparing for launch
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-gray-700/80 border border-gray-500 rounded-2xl p-6">
                <div className="text-3xl mb-3">🤖</div>
                <h4 className="text-lg font-bold text-blue-400 mb-3">AI-Powered Insights</h4>
                <ul className="text-sm text-white space-y-2 text-left">
                  <li>• Real-time performance analysis</li>
                  <li>• Predictive modeling</li>
                  <li>• Advanced metrics dashboard</li>
                </ul>
              </div>
              
              <div className="bg-gray-700/80 border border-gray-500 rounded-2xl p-6">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="text-lg font-bold text-green-400 mb-3">Executive Reporting</h4>
                <ul className="text-sm text-white space-y-2 text-left">
                  <li>• Interactive visualizations</li>
                  <li>• Custom KPI tracking</li>
                  <li>• Automated insights</li>
                </ul>
              </div>
            </div>

            {/* Status indicators */}
            <div className="mt-8 flex justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/90 border border-gray-600">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-yellow-400 font-medium">Initializing</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/90 border border-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Systems Ready</span>
              </div>
            </div>
          </div>
        )}

        {/* High-Contrast Data Table */}
        {processedStats.length > 0 && selectedSeason !== "current" && (
          <div className="bg-gray-800/90 border border-gray-600 rounded-3xl overflow-hidden shadow-executive">
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-600">
              <h3 className="text-xl font-bold text-white">Performance Data Matrix</h3>
              <p className="text-sm text-gray-300 mt-1">Real-time player statistics and metrics</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-600">
                <tr>
                  <th className="px-4 py-5 text-left font-bold text-white w-12 border-r border-white/5">#</th>
                  <StatHeader 
                    column={viewType === "players" ? "player_name" : "team"} 
                    label={viewType === "players" ? "Player" : "Team"} 
                    className="min-w-[150px]"
                  />
                  {viewType === "players" && (
                    <StatHeader column="team_name" label="Team" className="min-w-[120px]" />
                  )}
                  {viewType === "teams" && (
                    <StatHeader column="players" label="Players" />
                  )}
                  <StatHeader column={viewType === "players" ? "games_played" : "totalGames"} label="GP" />
                  <StatHeader column={viewType === "players" ? "total_points" : "totalPoints"} label="PTS" />
                  <StatHeader column={viewType === "players" ? "ppg" : "avgPPG"} label="PPG" />
                  <StatHeader column={viewType === "players" ? "total_goals" : "totalGoals"} label="G" />
                  <StatHeader column={viewType === "players" ? "gpg" : "avgGPG"} label="GPG" />
                  <StatHeader column={viewType === "players" ? "total_assists" : "totalAssists"} label="A" />
                  <StatHeader column={viewType === "players" ? "apg" : "avgAPG"} label="APG" />
                  <StatHeader column={viewType === "players" ? "total_saves" : "totalSaves"} label="SV" />
                  <StatHeader column={viewType === "players" ? "svpg" : "avgSVPG"} label="SVPG" />
                  <StatHeader column={viewType === "players" ? "total_shots" : "totalShots"} label="SH" />
                  <StatHeader column={viewType === "players" ? "shPercent" : "avgSH"} label="SH%" />
                  <StatHeader column={viewType === "players" ? "total_mvps" : "totalMVPs"} label="MVP" />
                  <StatHeader column={viewType === "players" ? "total_demos" : "totalDemos"} label="DEM" />
                  <StatHeader column={viewType === "players" ? "total_epic_saves" : "totalEpicSaves"} label="ES" />
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-600 hover:bg-gray-700/50 transition-all duration-300 hover:shadow-luxury group"
                  >
                    <td className="px-4 py-4 text-white font-mono text-sm border-r border-gray-600 group-hover:text-blue-400 transition-colors">
                      <div className="flex items-center justify-center">
                        {index + 1 <= 3 ? 
                          <span className="text-lg">{index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉'}</span> : 
                          <span className="group-hover:text-blue-400 transition-all duration-300">{index + 1}</span>
                        }
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-white">
                      {viewType === "players" ? formatPlayerName(item.player_name, item.gamertag) : item.team}
                    </td>
                    {viewType === "players" && (
                      <td className="px-3 py-3 text-blue-300 text-sm">{item.team_name}</td>
                    )}
                    {viewType === "teams" && (
                      <td className="px-3 py-3 text-center">{item.players}</td>
                    )}
                    <td className="px-3 py-3 text-center">
                      {viewType === "players" ? item.games_played : Math.round(item.totalGames / item.players)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-yellow-400">
                      {viewType === "players" ? item.total_points.toLocaleString() : item.totalPoints.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.ppg : item.avgPPG).toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-green-400">
                      {viewType === "players" ? item.total_goals : item.totalGoals}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.gpg : item.avgGPG).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-blue-400">
                      {viewType === "players" ? item.total_assists : item.totalAssists}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.apg : item.avgAPG).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-purple-400">
                      {viewType === "players" ? item.total_saves : item.totalSaves}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.svpg : item.avgSVPG).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {viewType === "players" ? item.total_shots : item.totalShots}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(viewType === "players" ? item.shPercent : item.avgSH).toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-orange-400">
                      {viewType === "players" ? item.total_mvps : item.totalMVPs}
                    </td>
                    <td className="px-3 py-3 text-center text-red-400">
                      {viewType === "players" ? item.total_demos : item.totalDemos}
                    </td>
                    <td className="px-3 py-3 text-center text-cyan-400">
                      {viewType === "players" ? item.total_epic_saves : item.totalEpicSaves}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Info */}
        {processedStats.length > 0 && selectedSeason !== "current" && (
          <div className="mt-6 text-center text-white text-sm">
            <p>Showing {sortedData.length} {viewType} • Updated through Week {new Date().getWeek || 12}</p>
          <div className="flex justify-center gap-6 mt-2 text-xs text-gray-300">
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
        )}
      </div>
    </div>
  );
};

export default Stats;