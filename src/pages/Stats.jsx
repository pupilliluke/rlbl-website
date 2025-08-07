import { useState, useMemo } from "react";
import { players } from "../data/players.js";
import { formatPlayerName } from "../utils/formatters.js";
import { historicalSeasons } from "../data/historicalStats.js";
import { careerStats } from "../data/careerStats.js";
import { PremiumChart, MetricCard, RadialChart } from "../components/PremiumChart.jsx";

const Stats = () => {
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("current");
  const [viewType, setViewType] = useState("players"); // players or teams
  const [showCount, setShowCount] = useState(20);

  // Get current data based on selected season
  const getCurrentData = () => {
    if (selectedSeason === "current") {
      // Season 3 hasn't started - show empty state
      return [];
    } else if (selectedSeason === "career") {
      return careerStats;
    } else if (selectedSeason === "2025") {
      return players; // If they have current season data
    } else if (historicalSeasons[selectedSeason]) {
      return historicalSeasons[selectedSeason].stats;
    } else {
      return []; // fallback to empty
    }
  };

  const currentPlayerData = getCurrentData();


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

  // Calculate team stats from current player data
  const teamStats = useMemo(() => {
    const teamMap = {};
    currentPlayerData.forEach(player => {
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
  }, [currentPlayerData]);

  // Sort and filter data
  const sortedData = useMemo(() => {
    const data = viewType === "players" ? currentPlayerData : teamStats;
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
  }, [viewType, teamStats, currentPlayerData, sortBy, sortOrder, filter, showCount]);

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

  // Generate premium analytics data
  const premiumAnalytics = useMemo(() => {
    if (currentPlayerData.length === 0) return null;
    
    const topPlayers = [...currentPlayerData].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5);
    const avgStats = {
      points: currentPlayerData.reduce((sum, p) => sum + (p.points || 0), 0) / currentPlayerData.length,
      goals: currentPlayerData.reduce((sum, p) => sum + (p.goals || 0), 0) / currentPlayerData.length,
      assists: currentPlayerData.reduce((sum, p) => sum + (p.assists || 0), 0) / currentPlayerData.length,
    };
    
    return {
      topPlayers: topPlayers.map(p => ({ label: p.player, value: p.points || 0 })),
      totalPlayers: currentPlayerData.length,
      avgStats
    };
  }, [currentPlayerData]);

  return (
    <div className="min-h-screen bg-gradient-executive relative">
      {/* Neural Background */}
      <div className="absolute inset-0 neural-bg opacity-20" />
      
      {/* Executive Header */}
      <div className="relative z-10 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black holographic mb-4">Analytics Dashboard</h1>
              <p className="text-xl text-gray-300 font-light">
                Executive-level insights and performance metrics
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="glass rounded-2xl px-6 py-4 text-center">
                <div className="text-2xl font-bold text-green-400">Live</div>
                <div className="text-xs text-gray-400">Status</div>
              </div>
              <div className="glass rounded-2xl px-6 py-4 text-center">
                <div className="text-2xl font-bold text-blue-400">AI</div>
                <div className="text-xs text-gray-400">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Premium Analytics Dashboard */}
        {premiumAnalytics && (
          <div className="mb-12">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Active Players"
                value={premiumAnalytics.totalPlayers}
                subtitle="Registered athletes"
                trend={12}
                icon="👥"
              />
              <MetricCard
                title="Avg Performance"
                value={Math.round(premiumAnalytics.avgStats.points)}
                subtitle="Points per player"
                trend={8}
                icon="📊"
              />
              <MetricCard
                title="Total Goals"
                value={currentPlayerData.reduce((sum, p) => sum + (p.goals || 0), 0)}
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
                  data={premiumAnalytics.topPlayers}
                  type="bar"
                  gradient="blue"
                />
              </div>
              <RadialChart
                title="League Activity"
                data={{ percentage: 87, label: "Active Rate" }}
              />
            </div>
          </div>
        )}

        {/* Executive Controls */}
        <div className="glass-dark rounded-2xl p-6 mb-8 shadow-executive">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Premium View Toggle */}
              <div className="glass rounded-xl overflow-hidden border border-white/10">
                <button
                  onClick={() => setViewType("players")}
                  className={`px-6 py-3 text-sm font-bold transition-all duration-300 ${
                    viewType === "players" 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-luxury" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  🏃‍♂️ Players
                </button>
                <button
                  onClick={() => setViewType("teams")}
                  className={`px-6 py-3 text-sm font-bold transition-all duration-300 ${
                    viewType === "teams" 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-luxury" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  🏆 Teams
                </button>
              </div>

              {/* Premium Season Selector */}
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-6 py-3 rounded-xl glass border border-white/10 text-sm font-medium hover:shadow-luxury transition-all duration-300"
              >
                <option value="current">🚀 Season 3 - Summer 25 (Not Started)</option>
                <option value="career">🌟 Career Stats (All-Time)</option>
                <option value="season2">🏅 Season 2 - Spring 25</option>
                <option value="season2_playoffs">🏆 Season 2 Playoffs</option>
                <option value="season1">🎯 Season 1 - Fall 24</option>
              </select>

              {/* Premium Results Count */}
              <select
                value={showCount}
                onChange={(e) => setShowCount(parseInt(e.target.value))}
                className="px-4 py-3 rounded-xl glass border border-white/10 text-sm font-medium hover:shadow-luxury transition-all duration-300"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={999}>All Players</option>
              </select>
            </div>

            {/* Premium Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={`🔍 Search ${viewType}...`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-6 py-3 pl-12 rounded-xl glass border border-white/10 text-sm min-w-[250px] focus:border-blue-400/50 focus:shadow-luxury transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Premium Empty State for Season 3 */}
        {selectedSeason === "current" && (
          <div className="glass-dark rounded-3xl p-12 shadow-executive text-center animate-luxury-fade-in">
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-20 animate-liquid-morph" />
              <div className="relative">
                <h3 className="text-4xl font-black holographic mb-4">🚀 Season 3 - Summer 25</h3>
                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-6" />
              </div>
            </div>
            
            <p className="text-xl text-gray-200 mb-8 font-light">
              Advanced analytics platform is preparing for launch
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl mb-3">🤖</div>
                <h4 className="text-lg font-bold text-blue-400 mb-3">AI-Powered Insights</h4>
                <ul className="text-sm text-gray-300 space-y-2 text-left">
                  <li>• Real-time performance analysis</li>
                  <li>• Predictive modeling</li>
                  <li>• Advanced metrics dashboard</li>
                </ul>
              </div>
              
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="text-lg font-bold text-green-400 mb-3">Executive Reporting</h4>
                <ul className="text-sm text-gray-300 space-y-2 text-left">
                  <li>• Interactive visualizations</li>
                  <li>• Custom KPI tracking</li>
                  <li>• Automated insights</li>
                </ul>
              </div>
            </div>

            {/* Status indicators */}
            <div className="mt-8 flex justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-dark">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-yellow-400 font-medium">Initializing</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-dark">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Systems Ready</span>
              </div>
            </div>
          </div>
        )}

        {/* Premium Data Table */}
        {currentPlayerData.length > 0 && (
          <div className="glass-dark rounded-3xl overflow-hidden shadow-executive">
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-white/10">
              <h3 className="text-xl font-bold holographic">Performance Data Matrix</h3>
              <p className="text-sm text-gray-400 mt-1">Real-time player analytics and metrics</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-white/10">
                <tr>
                  <th className="px-4 py-5 text-left font-bold text-white w-12 border-r border-white/5">#</th>
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
                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 hover:shadow-luxury group"
                  >
                    <td className="px-4 py-4 text-gray-400 font-mono text-sm border-r border-white/5 group-hover:text-blue-400 transition-colors">
                      <div className="flex items-center justify-center">
                        {index + 1 <= 3 ? 
                          <span className="text-lg">{index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉'}</span> : 
                          <span className="group-hover:holographic transition-all duration-300">{index + 1}</span>
                        }
                      </div>
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
        )}

        {/* Footer Info */}
        {currentPlayerData.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default Stats;