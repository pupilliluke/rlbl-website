import { useState, useMemo, useEffect } from "react";
import { apiService, fallbackData } from "../services/apiService";
import { formatPlayerName } from "../utils/formatters.js";
import { PremiumChart, MetricCard, RadialChart } from "../components/PremiumChart.jsx";

const Stats = () => {
  // Function to get conference for a team/player (database-driven)
  const getItemConference = (item) => {
    // Use database conference if available
    if (item.conference) {
      return item.conference;
    }
    return null;
  };

  const [sortBy, setSortBy] = useState("total_points");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [viewType, setViewType] = useState("players");
  const [showCount, setShowCount] = useState(20);
  const [stats, setStats] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("career");
  const [selectedConference, setSelectedConference] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching stats and teams data from API for season:', selectedSeason);

        const [statsData, teamsData] = await Promise.all([
          apiService.getStats(selectedSeason),
          apiService.getTeams(selectedSeason)
        ]);

        console.log('Stats data received:', statsData);
        console.log('Teams data received:', teamsData);
        setStats(statsData);
        setTeams(teamsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        console.error('Error details:', err.message);
        setError(err.message);
        console.log('API error - no fallback data, showing empty state');
        setStats([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        total_otg: parseInt(player.total_otg) || 0,
        games_played: gamesPlayed,
        // Calculated fields
        ppg: (parseInt(player.total_points) || 0) / gamesPlayed,
        gpg: (parseInt(player.total_goals) || 0) / gamesPlayed,
        apg: (parseInt(player.total_assists) || 0) / gamesPlayed,
        svpg: (parseInt(player.total_saves) || 0) / gamesPlayed,
        shPercent: parseInt(player.total_shots) > 0 ? ((parseInt(player.total_goals) || 0) / parseInt(player.total_shots)) * 100 : 0,
        epicSavePercent: parseInt(player.total_saves) > 0 ? ((parseInt(player.total_epic_saves) || 0) / parseInt(player.total_saves)) * 100 : 0,
        demoPerGame: (parseInt(player.total_demos) || 0) / gamesPlayed
      };
    });
  }, [stats]);

  // Calculate team stats - use team data from API for current season, player aggregation for historical seasons
  const teamStats = useMemo(() => {
    const teamMap = {};
    
    // For current season or career, use teams from API since they may not have game stats yet
    const currentSeasonModes = ['current', 'career', 'season3'];
    const isCurrentSeason = currentSeasonModes.includes(selectedSeason);
    
    if (isCurrentSeason && teams.length > 0) {
      // Use teams from the API (for Season 3 and current season)
      teams.forEach(team => {
        const teamName = team.display_name || team.team_name;
        teamMap[teamName] = {
          team: teamName,
          teamId: team.team_id || team.id,
          color: team.color || '#808080',
          logo_url: team.logo_url || team.alt_logo_url,
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
      });
    }

    // Add player statistics to teams
    processedStats.forEach(player => {
      let teamName = player.team_name || 'Free Agent';

      // Skip Free Agent players
      if (teamName === 'Free Agent' || teamName === 'Career Total') {
        return;
      }

      // For current season, match against our team list
      if (isCurrentSeason && !teamMap[teamName]) {
        // Try to find team with similar name
        const matchingTeam = Object.keys(teamMap).find(t =>
          t.toLowerCase().includes(teamName.toLowerCase()) ||
          teamName.toLowerCase().includes(t.toLowerCase())
        );
        if (matchingTeam) {
          // Use the matched team name instead
          teamName = matchingTeam;
        } else {
          // Skip if no matching team found for current season
          return;
        }
      }

      // If team doesn't exist in teamMap, create it (for historical seasons)
      if (!teamMap[teamName]) {
        teamMap[teamName] = {
          team: teamName,
          teamId: player.team_id || null,
          color: player.team_color || '#808080',
          logo_url: null,
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
          totalShotsAllowed: 0,
          totalGoalsAllowed: 0,
          avgPPG: 0,
          avgGPG: 0,
          avgAPG: 0,
          avgSVPG: 0,
          avgSH: 0,
          eastRecord: '0-0',
          westRecord: '0-0',
          last6: '0-0-0'
        };
      }

      const team = teamMap[teamName];
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
      team.totalShotsAllowed += parseInt(player.total_shots_allowed) || 0;
      team.totalGoalsAllowed += parseInt(player.total_goals_allowed) || 0;
    });

    // For current season, show all teams even with 0 games. For historical seasons, filter out teams with no games.
    const teamsArray = Object.values(teamMap);
    const filteredTeams = isCurrentSeason ? teamsArray : teamsArray.filter(team => team.totalGames > 0);

    return filteredTeams.map(team => ({
      ...team,
      // Team averages per game (total team stats divided by games played)
      avgPPG: team.totalGames > 0 ? (team.totalPoints / team.totalGames) : 0,
      avgGPG: team.totalGames > 0 ? (team.totalGoals / team.totalGames) : 0,
      avgAPG: team.totalGames > 0 ? (team.totalAssists / team.totalGames) : 0,
      avgSVPG: team.totalGames > 0 ? (team.totalSaves / team.totalGames) : 0,
      avgSH: team.totalShots > 0 ? ((team.totalGoals / team.totalShots) * 100) : 0,
      avgEpicSavePercent: team.totalSaves > 0 ? ((team.totalEpicSaves / team.totalSaves) * 100) : 0,
      avgDemoPerGame: team.totalGames > 0 ? (team.totalDemos / team.totalGames) : 0,
      // New defensive stats
      avgShotsAllowedPerGame: team.totalGames > 0 ? (team.totalShotsAllowed / team.totalGames) : 0,
      avgGoalsAllowedPerGame: team.totalGames > 0 ? (team.totalGoalsAllowed / team.totalGames) : 0,
      goalsAllowedPerShot: team.totalShotsAllowed > 0 ? ((team.totalGoalsAllowed / team.totalShotsAllowed) * 100) : 0,
      savesPerShotsAgainst: team.totalShotsAllowed > 0 ? ((team.totalSaves / team.totalShotsAllowed) * 100) : 0,
      avgEpicSavePerGame: team.totalGames > 0 ? (team.totalEpicSaves / team.totalGames) : 0,
      avgShotsPerGame: team.totalGames > 0 ? (team.totalShots / team.totalGames) : 0,
      avgPointsPerGame: team.totalGames > 0 ? (team.totalPoints / team.totalGames) : 0,
      // Display total games as team games (not divided by players)
      displayGames: team.totalGames > 0 ? Math.round(team.totalGames / team.players) : 0
    }));
  }, [teams, processedStats, selectedSeason]);

  // Sort and filter data
  const sortedData = useMemo(() => {
    const data = viewType === "players" ? processedStats : teamStats;
    return data
      .filter(item => {
        const name = viewType === "players"
          ? (item.player_name || item.name || item.display_name || 'Unknown Player')
          : item.team;
        const nameMatch = name.toLowerCase().includes(filter.toLowerCase());

        // Conference filter
        if (selectedConference !== "all" && selectedSeason === 'current') {
          const itemConference = getItemConference(item);
          return nameMatch && itemConference === selectedConference;
        }

        return nameMatch;
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
  }, [viewType, teamStats, processedStats, sortBy, sortOrder, filter, showCount, selectedConference, selectedSeason]);

  // Generate premium statistics data
  const premiumStatistics = useMemo(() => {
    if (processedStats.length === 0) return null;

    const topPointPlayers = [...processedStats].sort((a, b) => b.total_points - a.total_points).slice(0, 5);
    const topGoalPlayers = [...processedStats].sort((a, b) => b.total_goals - a.total_goals).slice(0, 5);
    const topAssistPlayers = [...processedStats].sort((a, b) => b.total_assists - a.total_assists).slice(0, 5);
    const topSavePlayers = [...processedStats].sort((a, b) => b.total_saves - a.total_saves).slice(0, 5);
    const topMVPPlayers = [...processedStats].sort((a, b) => b.total_mvps - a.total_mvps).slice(0, 5);

    const avgStats = {
      points: processedStats.reduce((sum, p) => sum + p.total_points, 0) / processedStats.length,
      goals: processedStats.reduce((sum, p) => sum + p.total_goals, 0) / processedStats.length,
      assists: processedStats.reduce((sum, p) => sum + p.total_assists, 0) / processedStats.length,
    };

    const avgPerGameStats = {
      points: processedStats.reduce((sum, p) => sum + p.ppg, 0) / processedStats.length,
      goals: processedStats.reduce((sum, p) => sum + p.gpg, 0) / processedStats.length,
      assists: processedStats.reduce((sum, p) => sum + p.apg, 0) / processedStats.length,
    };

    return {
      topPlayers: topPointPlayers.map(p => ({
        label: formatPlayerName(p.player_name || p.name || p.display_name || 'Unknown Player', p.gamertag),
        value: p.total_points,
        team: p.team_name || 'Free Agent'
      })),
      topGoalScorers: topGoalPlayers.map(p => ({
        label: formatPlayerName(p.player_name || p.name || p.display_name || 'Unknown Player', p.gamertag),
        value: p.total_goals,
        team: p.team_name || 'Free Agent'
      })),
      topPlaymakers: topAssistPlayers.map(p => ({
        label: formatPlayerName(p.player_name || p.name || p.display_name || 'Unknown Player', p.gamertag),
        value: p.total_assists,
        team: p.team_name || 'Free Agent'
      })),
      topGuardians: topSavePlayers.map(p => ({
        label: formatPlayerName(p.player_name || p.name || p.display_name || 'Unknown Player', p.gamertag),
        value: p.total_saves,
        team: p.team_name || 'Free Agent'
      })),
      topMVPs: topMVPPlayers.map(p => ({
        label: formatPlayerName(p.player_name || p.name || p.display_name || 'Unknown Player', p.gamertag),
        value: p.total_mvps,
        team: p.team_name || 'Free Agent'
      })),
      totalPlayers: processedStats.length,
      avgStats,
      avgPerGameStats
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
      className={`px-2 py-5 text-center font-bold text-white cursor-pointer hover:bg-white/5 transition-all duration-300 hover:shadow-luxury border-r border-white/5 last:border-r-0 ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center justify-center gap-1 group">
        <span className="group-hover:holographic transition-all duration-300 text-xs">{label}</span>
        <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">
          {getSortIcon(column)}
        </span>
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-gradient-executive relative page-with-navbar overflow-x-hidden">
      {/* Neural Background */}
      <div className="absolute inset-0 neural-bg opacity-20" />
      
      {/* Executive Header */}
      <div className="relative z-10 glass-dark border-b border-white/10 pt-20">
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
                <div className="text-2xl font-bold text-blue-400">RL</div>
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
            {/* KPI Cards Infinite Loop Carousel */}
            <div className="relative mb-8">
              <style jsx>{`
                @keyframes infiniteScroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-200%); }
                }
                .infinite-scroll {
                  animation: infiniteScroll 60s linear infinite;
                }
              `}</style>
              <div className="overflow-hidden">
                <div className="flex infinite-scroll gap-8">
                  {/* Slide 1 - Original */}
                  <div className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <MetricCard
                        title="Total Goals"
                        value={processedStats.reduce((sum, p) => sum + p.total_goals, 0)}
                        subtitle="Season aggregate"
                        trend={10}
                        icon=""
                      />
                      <MetricCard
                        title="Total Assists"
                        value={processedStats.reduce((sum, p) => sum + p.total_assists, 0)}
                        subtitle="Season aggregate"
                        trend={8}
                        icon=""
                      />
                      <MetricCard
                        title="Top Player"
                        value={processedStats.length > 0 ?
                          (processedStats[0].player_name || processedStats[0].name || processedStats[0].display_name || 'Unknown').split(' ')[0]
                          : 'N/A'}
                        subtitle={`${processedStats.length > 0 ? processedStats[0].total_points.toLocaleString() : 0} points`}
                        trend={15}
                        icon=""
                      />
                      <MetricCard
                        title="Top Team"
                        value={(() => {
                          if (teamStats.length === 0) return 'N/A';
                          const topTeam = teamStats.reduce((max, team) =>
                            team.totalPoints > max.totalPoints ? team : max
                          );
                          return topTeam.team;
                        })()}
                        subtitle={(() => {
                          if (teamStats.length === 0) return '0 points';
                          const topTeam = teamStats.reduce((max, team) =>
                            team.totalPoints > max.totalPoints ? team : max
                          );
                          return `${topTeam.totalPoints.toLocaleString()} points`;
                        })()}
                        trend={12}
                        icon=""
                      />
                    </div>
                  </div>

                  {/* Slide 2 - Original */}
                  <div className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <MetricCard
                        title="Total Demos"
                        value={processedStats.reduce((sum, p) => sum + p.total_demos, 0)}
                        subtitle="Season aggregate"
                        trend={6}
                        icon=""
                      />
                      <MetricCard
                        title="Best SH% Team"
                        value={(() => {
                          if (teamStats.length === 0) return 'N/A';
                          const bestSHTeam = teamStats.reduce((max, team) =>
                            team.avgSH > max.avgSH ? team : max
                          );
                          return bestSHTeam.team;
                        })()}
                        subtitle={(() => {
                          if (teamStats.length === 0) return '0%';
                          const bestSHTeam = teamStats.reduce((max, team) =>
                            team.avgSH > max.avgSH ? team : max
                          );
                          return `${bestSHTeam.avgSH.toFixed(1)}%`;
                        })()}
                        trend={9}
                        icon=""
                      />
                      <MetricCard
                        title="Most Demos/Game"
                        value={(() => {
                          if (teamStats.length === 0) return 'N/A';
                          const mostDemosTeam = teamStats.reduce((max, team) =>
                            team.avgDemoPerGame > max.avgDemoPerGame ? team : max
                          );
                          return mostDemosTeam.team;
                        })()}
                        subtitle={(() => {
                          if (teamStats.length === 0) return '0 demos/game';
                          const mostDemosTeam = teamStats.reduce((max, team) =>
                            team.avgDemoPerGame > max.avgDemoPerGame ? team : max
                          );
                          return `${mostDemosTeam.avgDemoPerGame.toFixed(1)} demos/game`;
                        })()}
                        trend={7}
                        icon=""
                      />
                      <MetricCard
                        title="Most Saves/Game"
                        value={(() => {
                          if (teamStats.length === 0) return 'N/A';
                          const mostSavesTeam = teamStats.reduce((max, team) =>
                            team.avgSVPG > max.avgSVPG ? team : max
                          );
                          return mostSavesTeam.team;
                        })()}
                        subtitle={(() => {
                          if (teamStats.length === 0) return '0 saves/game';
                          const mostSavesTeam = teamStats.reduce((max, team) =>
                            team.avgSVPG > max.avgSVPG ? team : max
                          );
                          return `${mostSavesTeam.avgSVPG.toFixed(1)} saves/game`;
                        })()}
                        trend={11}
                        icon=""
                      />
                    </div>
                  </div>

                  {/* Slide 1 - Duplicate for seamless loop */}
                  <div className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <MetricCard
                        title="Total Goals"
                        value={processedStats.reduce((sum, p) => sum + p.total_goals, 0)}
                        subtitle="Season aggregate"
                        trend={10}
                        icon=""
                      />
                      <MetricCard
                        title="Total Assists"
                        value={processedStats.reduce((sum, p) => sum + p.total_assists, 0)}
                        subtitle="Season aggregate"
                        trend={8}
                        icon=""
                      />
                      <MetricCard
                        title="Top Player"
                        value={processedStats.length > 0 ?
                          (processedStats[0].player_name || processedStats[0].name || processedStats[0].display_name || 'Unknown').split(' ')[0]
                          : 'N/A'}
                        subtitle={`${processedStats.length > 0 ? processedStats[0].total_points.toLocaleString() : 0} points`}
                        trend={15}
                        icon=""
                      />
                      <MetricCard
                        title="Top Team"
                        value={(() => {
                          if (teamStats.length === 0) return 'N/A';
                          const topTeam = teamStats.reduce((max, team) =>
                            team.totalPoints > max.totalPoints ? team : max
                          );
                          return topTeam.team;
                        })()}
                        subtitle={(() => {
                          if (teamStats.length === 0) return '0 points';
                          const topTeam = teamStats.reduce((max, team) =>
                            team.totalPoints > max.totalPoints ? team : max
                          );
                          return `${topTeam.totalPoints.toLocaleString()} points`;
                        })()}
                        trend={12}
                        icon=""
                      />
                    </div>
                  </div>

                  {/* Slide 2 - Duplicate for seamless loop */}
                  <div className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <MetricCard
                        title="Total Demos"
                        value={processedStats.reduce((sum, p) => sum + p.total_demos, 0)}
                        subtitle="Season aggregate"
                        trend={6}
                        icon=""
                      />
                      <MetricCard
                        title="Best SH% Team"
                        value={(() => {
                          if (teamStats.length === 0) return 'N/A';
                          const bestSHTeam = teamStats.reduce((max, team) =>
                            team.avgSH > max.avgSH ? team : max
                          );
                          return bestSHTeam.team;
                        })()}
                        subtitle={(() => {
                          if (teamStats.length === 0) return '0%';
                          const bestSHTeam = teamStats.reduce((max, team) =>
                            team.avgSH > max.avgSH ? team : max
                          );
                          return `${bestSHTeam.avgSH.toFixed(1)}%`;
                        })()}
                        trend={9}
                        icon=""
                      />
                      <MetricCard
                        title="Most Demos/Game"
                        value={(() => {
                          if (teamStats.length === 0) return 'N/A';
                          const mostDemosTeam = teamStats.reduce((max, team) =>
                            team.avgDemoPerGame > max.avgDemoPerGame ? team : max
                          );
                          return mostDemosTeam.team;
                        })()}
                        subtitle={(() => {
                          if (teamStats.length === 0) return '0 demos/game';
                          const mostDemosTeam = teamStats.reduce((max, team) =>
                            team.avgDemoPerGame > max.avgDemoPerGame ? team : max
                          );
                          return `${mostDemosTeam.avgDemoPerGame.toFixed(1)} demos/game`;
                        })()}
                        trend={7}
                        icon=""
                      />
                      <MetricCard
                        title="Most Saves/Game"
                        value={(() => {
                          if (teamStats.length === 0) return 'N/A';
                          const mostSavesTeam = teamStats.reduce((max, team) =>
                            team.avgSVPG > max.avgSVPG ? team : max
                          );
                          return mostSavesTeam.team;
                        })()}
                        subtitle={(() => {
                          if (teamStats.length === 0) return '0 saves/game';
                          const mostSavesTeam = teamStats.reduce((max, team) =>
                            team.avgSVPG > max.avgSVPG ? team : max
                          );
                          return `${mostSavesTeam.avgSVPG.toFixed(1)} saves/game`;
                        })()}
                        trend={11}
                        icon=""
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Charts Section - Enhanced Top Performers */}
            <div className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <PremiumChart
                  title="Top Point Leaders"
                  data={premiumStatistics.topPlayers}
                  type="bar"
                  gradient="blue"
                />
                <PremiumChart
                  title="Top Goal Scorers"
                  data={premiumStatistics.topGoalScorers}
                  type="bar"
                  gradient="green"
                />
                <PremiumChart
                  title="Top Assists Leaders"
                  data={premiumStatistics.topPlaymakers}
                  type="bar"
                  gradient="purple"
                />
                <PremiumChart
                  title="Top Guardians"
                  data={premiumStatistics.topGuardians}
                  type="bar"
                  gradient="orange"
                />
                <PremiumChart
                  title="Most Valuable Players"
                  data={premiumStatistics.topMVPs}
                  type="bar"
                  gradient="red"
                />
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-600">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    League Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Active Players</span>
                      <span className="text-white font-bold text-lg">28</span>
                    </div>

                    <div>
                      <div className="text-gray-300 text-sm mb-2">Top 3 SH% Teams</div>
                      <div className="space-y-1">
                        {(() => {
                          if (teamStats.length === 0) return <div className="text-orange-400 text-xs">N/A</div>;
                          const top3SH = [...teamStats]
                            .sort((a, b) => b.avgSH - a.avgSH)
                            .slice(0, 3);
                          return top3SH.map((team, index) => (
                            <div key={team.team} className="flex justify-between items-center">
                              <span className="text-gray-400 text-xs">
                                {index + 1}. {team.team}
                              </span>
                              <span className="text-orange-400 font-bold text-xs">
                                {team.avgSH.toFixed(1)}%
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-300 text-sm mb-2">Top 3 SVPG Teams</div>
                      <div className="space-y-1">
                        {(() => {
                          if (teamStats.length === 0) return <div className="text-cyan-400 text-xs">N/A</div>;
                          const top3SVPG = [...teamStats]
                            .sort((a, b) => b.avgSVPG - a.avgSVPG)
                            .slice(0, 3);
                          return top3SVPG.map((team, index) => (
                            <div key={team.team} className="flex justify-between items-center">
                              <span className="text-gray-400 text-xs">
                                {index + 1}. {team.team}
                              </span>
                              <span className="text-cyan-400 font-bold text-xs">
                                {team.avgSVPG.toFixed(1)}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  Players
                </button>
                <button
                  onClick={() => setViewType("teams")}
                  className={`px-6 py-3 text-sm font-bold transition-all duration-300 ${
                    viewType === "teams" 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-luxury" 
                      : "text-white hover:text-blue-300 hover:bg-gray-600"
                  }`}
                >
                  Teams
                </button>
              </div>

              {/* Premium Season Selector */}
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-6 py-3 rounded-xl bg-gray-700/80 border border-gray-500 text-sm font-medium text-white hover:shadow-luxury transition-all duration-300"
              >
                <option value="current" className="text-black bg-white">Season 3 (Current)</option>
                <option value="career" className="text-black bg-white">Career Stats (All-Time)</option>
                <option value="season2" className="text-black bg-white">Season 2 - Spring 25</option>
                <option value="season2_playoffs" className="text-black bg-white">Season 2 Playoffs</option>
                <option value="season1" className="text-black bg-white">Season 1 - Fall 24</option>
              </select>

              {/* Conference Filter - Only show for Season 3 */}
              {selectedSeason === 'current' && (
                <select
                  value={selectedConference}
                  onChange={(e) => setSelectedConference(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-gray-700/80 border border-gray-500 text-sm font-medium text-white hover:shadow-luxury transition-all duration-300"
                >
                  <option value="all" className="text-black bg-white">All Conferences</option>
                  <option value="West" className="text-black bg-white">West</option>
                  <option value="East" className="text-black bg-white">East</option>
                </select>
              )}

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
                placeholder={`Search ${viewType}...`}
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


        {/* Error State */}
        {!loading && processedStats.length === 0 && (
          <div className="bg-gray-800/90 border border-gray-600 rounded-3xl p-12 shadow-executive text-center animate-luxury-fade-in">
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-full blur-2xl opacity-20 animate-liquid-morph" />
              <div className="relative">
                <h3 className="text-4xl font-black text-white mb-4">No Statistics Available</h3>
                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-red-400 to-transparent mb-6" />
              </div>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 font-light">
              Unable to retrieve statistics from the database
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-gray-700/80 border border-gray-500 rounded-2xl p-6">
                <div className="text-3xl mb-3">DB</div>
                <h4 className="text-lg font-bold text-blue-400 mb-3">Database Connection</h4>
                <ul className="text-sm text-white space-y-2 text-left">
                  <li>• Check backend server status</li>
                  <li>• Verify database connection</li>
                  <li>• Ensure API endpoints are working</li>
                </ul>
              </div>
              
              <div className="bg-gray-700/80 border border-gray-500 rounded-2xl p-6">
                <div className="text-3xl mb-3">DATA</div>
                <h4 className="text-lg font-bold text-red-400 mb-3">Data Status</h4>
                <ul className="text-sm text-white space-y-2 text-left">
                  <li>• No fallback data available</li>
                  <li>• Only real database stats shown</li>
                  <li>• Try refreshing the page</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* High-Contrast Data Table */}
        {processedStats.length > 0 && (
          <div className="bg-gray-800/90 border border-gray-600 rounded-3xl overflow-hidden shadow-executive w-full">
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-600">
              <h3 className="text-xl font-bold text-white">Performance Data Matrix</h3>
              <p className="text-sm text-gray-300 mt-1">Real-time player statistics and metrics</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-600">
                <tr>
                  <th className="px-2 py-5 text-center font-bold text-white w-12 border-r border-white/5">#</th>
                  <StatHeader
                    column={viewType === "players" ? "player_name" : "team"}
                    label={viewType === "players" ? "Player" : "Team"}
                    className="min-w-[120px] sm:min-w-[150px]"
                  />
                  <StatHeader column={viewType === "players" ? "total_points" : "totalPoints"} label="Points" className="w-16 sm:w-20" />
                  {viewType === "teams" && <StatHeader column="avgPointsPerGame" label="Pts/GM" className="hidden lg:table-cell w-16 sm:w-20" />}
                  <StatHeader column={viewType === "players" ? "total_goals" : "totalGoals"} label="Goals" className="w-12 sm:w-16" />
                  <StatHeader column={viewType === "players" ? "total_shots" : "totalShots"} label="Shots" className="hidden md:table-cell w-12 sm:w-16" />
                  <StatHeader column={viewType === "players" ? "shPercent" : "avgSH"} label="SH%" className="hidden md:table-cell w-12 sm:w-16" />
                  {viewType === "teams" && <StatHeader column="avgGPG" label="G/GM" className="hidden lg:table-cell w-12 sm:w-16" />}
                  {viewType === "teams" && <StatHeader column="avgShotsPerGame" label="Shots/GM" className="hidden lg:table-cell w-16 sm:w-20" />}
                  <StatHeader column={viewType === "players" ? "total_assists" : "totalAssists"} label="Assists" className="w-12 sm:w-16" />
                  <StatHeader column={viewType === "players" ? "total_mvps" : "totalMVPs"} label="MVP" className="w-12 sm:w-16" />
                  <StatHeader column={viewType === "players" ? "total_otg" : "totalOTG"} label="OTG" className="hidden lg:table-cell w-12 sm:w-16" />
                  <StatHeader column={viewType === "players" ? "total_saves" : "totalSaves"} label="Saves" className="hidden sm:table-cell w-12 sm:w-16" />
                  <StatHeader column={viewType === "players" ? "total_epic_saves" : "totalEpicSaves"} label="Epic Saves" className="hidden lg:table-cell w-16 sm:w-20" />
                  <StatHeader column={viewType === "players" ? "epicSavePercent" : "avgEpicSavePercent"} label="Epic Save %" className="hidden lg:table-cell w-16 sm:w-20" />
                  {viewType === "teams" && <StatHeader column="avgEpicSavePerGame" label="Epic SV/GM" className="hidden lg:table-cell w-16 sm:w-20" />}
                  <StatHeader column={viewType === "players" ? "svpg" : "avgSVPG"} label="Saves/GM" className="hidden lg:table-cell w-12 sm:w-16" />
                  {viewType === "teams" && <StatHeader column="savesPerShotsAgainst" label="Saves/SA" className="hidden lg:table-cell w-16 sm:w-20" />}
                  {viewType === "teams" && <StatHeader column="totalShotsAllowed" label="SA" className="hidden lg:table-cell w-12 sm:w-16" />}
                  {viewType === "teams" && <StatHeader column="avgShotsAllowedPerGame" label="SA/GM" className="hidden lg:table-cell w-16 sm:w-20" />}
                  {viewType === "teams" && <StatHeader column="totalGoalsAllowed" label="GA" className="hidden lg:table-cell w-12 sm:w-16" />}
                  {viewType === "teams" && <StatHeader column="avgGoalsAllowedPerGame" label="GA/GM" className="hidden lg:table-cell w-16 sm:w-20" />}
                  {viewType === "teams" && <StatHeader column="goalsAllowedPerShot" label="GA/Shot" className="hidden lg:table-cell w-16 sm:w-20" />}
                  <StatHeader column={viewType === "players" ? "total_demos" : "totalDemos"} label="Demos" className="hidden md:table-cell w-12 sm:w-16" />
                  <StatHeader column={viewType === "players" ? "demoPerGame" : "avgDemoPerGame"} label="Demo/GM" className="hidden lg:table-cell w-16 sm:w-20" />
                  {viewType === "players" && <StatHeader column="ppg" label="PPG" className="hidden lg:table-cell w-12 sm:w-16" />}
                  {viewType === "players" && <StatHeader column="gpg" label="GPG" className="hidden lg:table-cell w-12 sm:w-16" />}
                  {viewType === "players" && <StatHeader column="apg" label="APG" className="hidden lg:table-cell w-12 sm:w-16" />}
                  <StatHeader column={viewType === "players" ? "games_played" : "displayGames"} label="Games" className="w-16 sm:w-20" />
                  {viewType === "teams" && <StatHeader column="eastRecord" label="East Rec" className="hidden xl:table-cell w-20" />}
                  {viewType === "teams" && <StatHeader column="westRecord" label="West Rec" className="hidden xl:table-cell w-20" />}
                  {viewType === "teams" && <StatHeader column="last6" label="Last 6" className="hidden xl:table-cell w-20" />}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-600 hover:bg-gray-700/50 transition-all duration-300 hover:shadow-luxury group"
                  >
                    <td className="px-1 py-3 text-white font-mono text-sm border-r border-gray-600 group-hover:text-blue-400 transition-colors">
                      <div className="flex items-center justify-center">
                        {index + 1 <= 3 ?
                          <span className="text-sm">{index + 1 === 1 ? '1st' : index + 1 === 2 ? '2nd' : '3rd'}</span> :
                          <span className="group-hover:text-blue-400 transition-all duration-300 text-xs">{index + 1}</span>
                        }
                      </div>
                    </td>
                    <td className="px-2 py-3 font-semibold text-white text-left text-sm truncate">
                      {viewType === "players" ? (
                        formatPlayerName(
                          item.player_name || item.name || item.display_name || 'Unknown Player',
                          item.gamertag
                        )
                      ) : item.team}
                    </td>
                    <td className="px-1 py-3 text-center font-bold text-yellow-400 text-sm">
                      {viewType === "players" ? item.total_points.toLocaleString() : item.totalPoints.toLocaleString()}
                    </td>
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.avgPointsPerGame || 0).toFixed(1)}</td>}
                    <td className="px-1 py-3 text-center font-semibold text-green-400 text-sm">
                      {viewType === "players" ? item.total_goals : item.totalGoals}
                    </td>
                    <td className="hidden md:table-cell px-1 py-3 text-center text-sm">
                      {viewType === "players" ? item.total_shots : item.totalShots}
                    </td>
                    <td className="hidden md:table-cell px-1 py-3 text-center text-sm">
                      {(viewType === "players" ? item.shPercent : item.avgSH || 0).toFixed(1)}%
                    </td>
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.avgGPG || 0).toFixed(2)}</td>}
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.avgShotsPerGame || 0).toFixed(1)}</td>}
                    <td className="px-1 py-3 text-center font-semibold text-blue-400 text-sm">
                      {viewType === "players" ? item.total_assists : item.totalAssists}
                    </td>
                    <td className="px-1 py-3 text-center font-bold text-orange-400 text-sm">
                      {viewType === "players" ? item.total_mvps : item.totalMVPs}
                    </td>
                    <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">
                      {viewType === "players" ? (item.total_otg || 0) : (item.totalOTG || 0)}
                    </td>
                    <td className="hidden sm:table-cell px-1 py-3 text-center font-semibold text-purple-400 text-sm">
                      {viewType === "players" ? item.total_saves : item.totalSaves}
                    </td>
                    <td className="hidden lg:table-cell px-1 py-3 text-center text-cyan-400 text-sm">
                      {viewType === "players" ? item.total_epic_saves : item.totalEpicSaves}
                    </td>
                    <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">
                      {(viewType === "players" ? item.epicSavePercent : item.avgEpicSavePercent || 0).toFixed(1)}%
                    </td>
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.avgEpicSavePerGame || 0).toFixed(2)}</td>}
                    <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">
                      {(viewType === "players" ? item.svpg : item.avgSVPG || 0).toFixed(2)}
                    </td>
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.savesPerShotsAgainst || 0).toFixed(1)}%</td>}
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{item.totalShotsAllowed || 0}</td>}
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.avgShotsAllowedPerGame || 0).toFixed(1)}</td>}
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{item.totalGoalsAllowed || 0}</td>}
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.avgGoalsAllowedPerGame || 0).toFixed(2)}</td>}
                    {viewType === "teams" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.goalsAllowedPerShot || 0).toFixed(1)}%</td>}
                    <td className="hidden md:table-cell px-1 py-3 text-center text-red-400 text-sm">
                      {viewType === "players" ? item.total_demos : item.totalDemos}
                    </td>
                    <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">
                      {(viewType === "players" ? item.demoPerGame : item.avgDemoPerGame || 0).toFixed(2)}
                    </td>
                    {viewType === "players" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.ppg || 0).toFixed(1)}</td>}
                    {viewType === "players" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.gpg || 0).toFixed(2)}</td>}
                    {viewType === "players" && <td className="hidden lg:table-cell px-1 py-3 text-center text-sm">{(item.apg || 0).toFixed(2)}</td>}
                    <td className="px-1 py-3 text-center text-sm">
                      {viewType === "players" ? item.games_played : item.displayGames}
                    </td>
                    {viewType === "teams" && <td className="hidden xl:table-cell px-1 py-3 text-center text-sm">{item.eastRecord || '0-0'}</td>}
                    {viewType === "teams" && <td className="hidden xl:table-cell px-1 py-3 text-center text-sm">{item.westRecord || '0-0'}</td>}
                    {viewType === "teams" && <td className="hidden xl:table-cell px-1 py-3 text-center text-sm">{item.last6 || '0-0-0'}</td>}
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Info */}
        {processedStats.length > 0 && (
          <div className="mt-6 text-center text-white text-sm">
            <p>Showing {sortedData.length} {viewType} • Updated through Week {new Date().getWeek || 12}</p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-gray-300 flex-wrap">
            <span>MVP = Most Valuable Player</span>
            <span>OTG = Overtime Goals</span>
            <span>SH% = Shooting Percentage</span>
            <span>Epic Save % = Epic Save Percentage</span>
            <span>SVPG = Saves Per Game</span>
            <span>Demo/Game = Demos Per Game</span>
            <span>PPG = Points Per Game</span>
            <span>GPG = Goals Per Game</span>
            <span>APG = Assists Per Game</span>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;