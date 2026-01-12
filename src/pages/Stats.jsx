import { useState, useMemo, useEffect } from "react";
import { apiService, fallbackData } from "../services/apiService";
import { formatPlayerName } from "../utils/formatters.js";
import { PremiumChart, MetricCard, RadialChart } from "../components/PremiumChart.jsx";
import StatsTable from "../components/StatsTable.jsx";
import * as XLSX from 'xlsx-js-style';

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
  const [playoffFilter, setPlayoffFilter] = useState("all"); // 'all', 'regular', 'playoffs'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching stats and teams data from API for season:', selectedSeason, 'playoffs:', playoffFilter);

        // Determine playoff parameter for API
        let playoffParam = null;
        if (playoffFilter === 'playoffs') {
          playoffParam = true;
        } else if (playoffFilter === 'regular') {
          playoffParam = false;
        }

        const [statsData, teamsData] = await Promise.all([
          apiService.getStats(selectedSeason, playoffParam),
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
  }, [selectedSeason, playoffFilter]);


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

  // Export current view to CSV
  const exportToCSV = () => {
    // Helper function to convert RGB to hex
    const rgbToHex = (r, g, b) => {
      return ('FF' + // Alpha channel (fully opaque)
        ('0' + Math.round(r).toString(16)).slice(-2) +
        ('0' + Math.round(g).toString(16)).slice(-2) +
        ('0' + Math.round(b).toString(16)).slice(-2)).toUpperCase();
    };

    // Helper function to calculate color based on rank
    const getColorFromRank = (rank, totalCount) => {
      if (rank === 1) {
        // Gold for #1 - matching reference image
        return rgbToHex(255, 242, 204); // Light gold/yellow
      }

      const median = Math.ceil(totalCount / 2);

      if (rank <= median) {
        // Top half: Green gradient matching reference colors
        // Darkest green at #2: RGB(146, 208, 80)
        // Lightest green at median: RGB(198, 224, 180)
        const progress = (rank - 2) / (median - 2); // 0 at rank 2, 1 at median
        const r = Math.round(146 + (198 - 146) * progress);
        const g = Math.round(208 + (224 - 208) * progress);
        const b = Math.round(80 + (180 - 80) * progress);
        return rgbToHex(r, g, b);
      } else {
        // Bottom half: Red gradient matching reference colors
        // Lightest red after median: RGB(255, 230, 230)
        // Darkest red at last: RGB(255, 199, 206)
        const progress = (rank - median - 1) / (totalCount - median - 1); // 0 just after median, 1 at last place
        const r = 255;
        const g = Math.round(230 - (230 - 199) * progress);
        const b = Math.round(230 - (230 - 206) * progress);
        return rgbToHex(r, g, b);
      }
    };

    // Helper function to rank data for a specific column
    const rankColumn = (data, getValue, higherIsBetter = true) => {
      const validData = data.filter(item => getValue(item) !== null && getValue(item) !== undefined);
      const sorted = [...validData].sort((a, b) => {
        const aVal = getValue(a);
        const bVal = getValue(b);
        return higherIsBetter ? bVal - aVal : aVal - bVal;
      });

      const ranks = new Map();
      sorted.forEach((item, index) => {
        ranks.set(item, index + 1);
      });

      return ranks;
    };

    if (viewType === "players") {
      // Determine if we should group by team
      const groupByTeam = showCount === 999;
      let dataToExport = sortedData;

      // If grouping by team, reorganize data
      if (groupByTeam) {
        const teamGroups = {};
        processedStats.forEach(player => {
          const teamName = player.team_name || 'Unknown Team';
          if (!teamGroups[teamName]) {
            teamGroups[teamName] = [];
          }
          teamGroups[teamName].push(player);
        });

        dataToExport = [];
        Object.keys(teamGroups).sort().forEach(teamName => {
          dataToExport.push({ isTeamHeader: true, teamName });
          teamGroups[teamName].forEach(player => {
            dataToExport.push(player);
          });
        });
      }

      // Filter out team headers for data processing
      const playerData = dataToExport.filter(item => !item.isTeamHeader);

      // Rank each column
      const rankMaps = {
        points: rankColumn(playerData, item => item.total_points),
        goals: rankColumn(playerData, item => item.total_goals),
        assists: rankColumn(playerData, item => item.total_assists),
        shots: rankColumn(playerData, item => item.total_shots),
        mvps: rankColumn(playerData, item => item.total_mvps),
        otg: rankColumn(playerData, item => item.total_otg),
        shPercent: rankColumn(playerData, item => item.shPercent),
        saves: rankColumn(playerData, item => item.total_saves),
        epicSaves: rankColumn(playerData, item => item.total_epic_saves),
        epicSavePercent: rankColumn(playerData, item => item.epicSavePercent),
        svpg: rankColumn(playerData, item => item.svpg),
        demos: rankColumn(playerData, item => item.total_demos),
        demoPerGame: rankColumn(playerData, item => item.demoPerGame),
        ppg: rankColumn(playerData, item => item.ppg),
        gpg: rankColumn(playerData, item => item.gpg),
        apg: rankColumn(playerData, item => item.apg),
        gamesPlayed: rankColumn(playerData, item => item.games_played)
      };

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const wsData = [];

      // Header row 1 - Category headers
      wsData.push(['', '', 'OFFENSIVE STATS', '', '', '', '', '', '', 'DEFENSIVE STATS', '', '', '', '', 'DEMOS', '', 'PER GAME / EFFICIENCY', '', '']);

      // Header row 2 - Column headers
      wsData.push(['Team', 'Player', 'Points', 'Goals', 'Assists', 'Shots', 'MVP', 'OTG', 'SH%', 'Saves', 'Epic Saves', 'Epic Save %', 'SVPG', 'Demos', 'Demo/Game', 'PPG', 'GPG', 'APG', 'Games Played']);

      // Track totals for average row
      let totals = {
        count: 0,
        points: 0,
        goals: 0,
        assists: 0,
        shots: 0,
        mvps: 0,
        otg: 0,
        saves: 0,
        epicSaves: 0,
        demos: 0,
        gamesPlayed: 0
      };

      // Data rows
      dataToExport.forEach(item => {
        if (item.isTeamHeader) {
          return;
        }

        totals.count++;
        totals.points += item.total_points || 0;
        totals.goals += item.total_goals || 0;
        totals.assists += item.total_assists || 0;
        totals.shots += item.total_shots || 0;
        totals.mvps += item.total_mvps || 0;
        totals.otg += item.total_otg || 0;
        totals.saves += item.total_saves || 0;
        totals.epicSaves += item.total_epic_saves || 0;
        totals.demos += item.total_demos || 0;
        totals.gamesPlayed += item.games_played || 0;

        const row = [
          item.team_name || '',
          item.player_name || item.name || 'Unknown',
          item.total_points || 0,
          item.total_goals || 0,
          item.total_assists || 0,
          item.total_shots || 0,
          item.total_mvps || 0,
          item.total_otg || 0,
          item.shPercent ? parseFloat(item.shPercent.toFixed(1)) : 0,
          item.total_saves || 0,
          item.total_epic_saves || 0,
          item.epicSavePercent ? parseFloat(item.epicSavePercent.toFixed(2)) : 0,
          item.svpg ? parseFloat(item.svpg.toFixed(2)) : 0,
          item.total_demos || 0,
          item.demoPerGame ? parseFloat(item.demoPerGame.toFixed(2)) : 0,
          item.ppg ? parseFloat(item.ppg.toFixed(2)) : 0,
          item.gpg ? parseFloat(item.gpg.toFixed(2)) : 0,
          item.apg ? parseFloat(item.apg.toFixed(2)) : 0,
          item.games_played || 0
        ];
        wsData.push(row);
      });

      // Add average row
      if (totals.count > 0) {
        const avgShootingPct = totals.shots > 0 ? parseFloat(((totals.goals / totals.shots) * 100).toFixed(1)) : 0;
        const avgEpicSavePct = totals.saves > 0 ? parseFloat(((totals.epicSaves / totals.saves) * 100).toFixed(2)) : 0;

        wsData.push(['']); // Empty row
        wsData.push([
          'Average:',
          '',
          parseFloat((totals.points / totals.count).toFixed(2)),
          parseFloat((totals.goals / totals.count).toFixed(2)),
          parseFloat((totals.assists / totals.count).toFixed(2)),
          parseFloat((totals.shots / totals.count).toFixed(2)),
          parseFloat((totals.mvps / totals.count).toFixed(2)),
          parseFloat((totals.otg / totals.count).toFixed(2)),
          avgShootingPct,
          parseFloat((totals.saves / totals.count).toFixed(2)),
          parseFloat((totals.epicSaves / totals.count).toFixed(2)),
          avgEpicSavePct,
          parseFloat((totals.saves / totals.count).toFixed(2)),
          parseFloat((totals.demos / totals.count).toFixed(2)),
          parseFloat((totals.demos / totals.count).toFixed(2)),
          parseFloat((totals.points / totals.count).toFixed(2)),
          parseFloat((totals.goals / totals.count).toFixed(2)),
          parseFloat((totals.assists / totals.count).toFixed(2)),
          parseFloat((totals.gamesPlayed / totals.count).toFixed(1))
        ]);
      }

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Apply cell styling with color coding
      const totalPlayers = playerData.length;
      playerData.forEach((item, index) => {
        const rowIndex = index + 2; // +2 because of 2 header rows
        const statColumns = [
          { col: 2, rankMap: rankMaps.points },
          { col: 3, rankMap: rankMaps.goals },
          { col: 4, rankMap: rankMaps.assists },
          { col: 5, rankMap: rankMaps.shots },
          { col: 6, rankMap: rankMaps.mvps },
          { col: 7, rankMap: rankMaps.otg },
          { col: 8, rankMap: rankMaps.shPercent },
          { col: 9, rankMap: rankMaps.saves },
          { col: 10, rankMap: rankMaps.epicSaves },
          { col: 11, rankMap: rankMaps.epicSavePercent },
          { col: 12, rankMap: rankMaps.svpg },
          { col: 13, rankMap: rankMaps.demos },
          { col: 14, rankMap: rankMaps.demoPerGame },
          { col: 15, rankMap: rankMaps.ppg },
          { col: 16, rankMap: rankMaps.gpg },
          { col: 17, rankMap: rankMaps.apg },
          { col: 18, rankMap: rankMaps.gamesPlayed }
        ];

        statColumns.forEach(({ col, rankMap }) => {
          const rank = rankMap.get(item);
          if (rank) {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: col });
            if (!ws[cellAddress]) ws[cellAddress] = {};
            const color = getColorFromRank(rank, totalPlayers);
            ws[cellAddress].s = {
              fill: {
                fgColor: { rgb: color }
              }
            };
          }
        });
      });

      // Style category headers (row 0)
      const categoryColors = [
        { start: 2, end: 8, color: rgbToHex(0, 255, 0) }, // Green: OFFENSIVE STATS
        { start: 9, end: 13, color: rgbToHex(255, 0, 0) }, // Red: DEFENSIVE STATS
        { start: 14, end: 14, color: rgbToHex(255, 165, 0) }, // Orange: DEMOS
        { start: 16, end: 18, color: rgbToHex(0, 0, 255) } // Blue: PER GAME / EFFICIENCY
      ];

      categoryColors.forEach(({ start, end, color }) => {
        for (let col = start; col <= end; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
          ws[cellAddress].s = {
            fill: { fgColor: { rgb: color } },
            font: { bold: true, color: { rgb: 'FFFFFFFF' } }
          };
        }
      });

      XLSX.utils.book_append_sheet(wb, ws, 'Player Stats');

      // Generate file and download
      const seasonLabel = selectedSeason === 'career' ? 'career' : selectedSeason.replace('season', 'season_');
      const playoffLabel = playoffFilter === 'playoffs' ? '_playoffs' : playoffFilter === 'regular' ? '_regular' : '';
      const conferenceLabel = selectedConference !== 'all' ? `_${selectedConference}` : '';

      XLSX.writeFile(wb, `${seasonLabel}_players${playoffLabel}${conferenceLabel}_stats.xlsx`);
    } else {
      // Team stats export (similar structure, but simpler for now)
      const wb = XLSX.utils.book_new();
      const wsData = [];

      wsData.push(['', 'OFFENSIVE STATS', '', '', '', '', '', '', 'DEFENSIVE STATS', '', '', '', '', '', '', '']);
      wsData.push(['Team', 'Players', 'Points', 'Goals', 'Assists', 'Shots', 'MVPs', 'Demos', 'SH%', 'Saves', 'Epic Saves', 'Epic Save %', 'Shots Allowed', 'Goals Allowed', 'PPG', 'GPG', 'APG', 'SVPG', 'Games']);

      let totals = {
        count: 0,
        players: 0,
        points: 0,
        goals: 0,
        assists: 0,
        shots: 0,
        mvps: 0,
        demos: 0,
        saves: 0,
        epicSaves: 0,
        shotsAllowed: 0,
        goalsAllowed: 0,
        games: 0
      };

      sortedData.forEach(item => {
        totals.count++;
        totals.players += item.players || 0;
        totals.points += item.totalPoints || 0;
        totals.goals += item.totalGoals || 0;
        totals.assists += item.totalAssists || 0;
        totals.shots += item.totalShots || 0;
        totals.mvps += item.totalMVPs || 0;
        totals.demos += item.totalDemos || 0;
        totals.saves += item.totalSaves || 0;
        totals.epicSaves += item.totalEpicSaves || 0;
        totals.shotsAllowed += item.totalShotsAllowed || 0;
        totals.goalsAllowed += item.totalGoalsAllowed || 0;
        totals.games += item.displayGames || 0;

        wsData.push([
          item.team || 'Unknown',
          item.players || 0,
          item.totalPoints || 0,
          item.totalGoals || 0,
          item.totalAssists || 0,
          item.totalShots || 0,
          item.totalMVPs || 0,
          item.totalDemos || 0,
          item.avgSH ? parseFloat(item.avgSH.toFixed(1)) : 0,
          item.totalSaves || 0,
          item.totalEpicSaves || 0,
          item.avgEpicSavePercent ? parseFloat(item.avgEpicSavePercent.toFixed(2)) : 0,
          item.totalShotsAllowed || 0,
          item.totalGoalsAllowed || 0,
          item.avgPPG ? parseFloat(item.avgPPG.toFixed(2)) : 0,
          item.avgGPG ? parseFloat(item.avgGPG.toFixed(2)) : 0,
          item.avgAPG ? parseFloat(item.avgAPG.toFixed(2)) : 0,
          item.avgSVPG ? parseFloat(item.avgSVPG.toFixed(2)) : 0,
          item.displayGames || 0
        ]);
      });

      if (totals.count > 0) {
        const avgShootingPct = totals.shots > 0 ? parseFloat(((totals.goals / totals.shots) * 100).toFixed(1)) : 0;
        const avgEpicSavePct = totals.saves > 0 ? parseFloat(((totals.epicSaves / totals.saves) * 100).toFixed(2)) : 0;

        wsData.push(['']);
        wsData.push([
          'Average:',
          parseFloat((totals.players / totals.count).toFixed(1)),
          parseFloat((totals.points / totals.count).toFixed(2)),
          parseFloat((totals.goals / totals.count).toFixed(2)),
          parseFloat((totals.assists / totals.count).toFixed(2)),
          parseFloat((totals.shots / totals.count).toFixed(2)),
          parseFloat((totals.mvps / totals.count).toFixed(2)),
          parseFloat((totals.demos / totals.count).toFixed(2)),
          avgShootingPct,
          parseFloat((totals.saves / totals.count).toFixed(2)),
          parseFloat((totals.epicSaves / totals.count).toFixed(2)),
          avgEpicSavePct,
          parseFloat((totals.shotsAllowed / totals.count).toFixed(2)),
          parseFloat((totals.goalsAllowed / totals.count).toFixed(2)),
          parseFloat((totals.points / totals.games).toFixed(2)),
          parseFloat((totals.goals / totals.games).toFixed(2)),
          parseFloat((totals.assists / totals.games).toFixed(2)),
          parseFloat((totals.saves / totals.games).toFixed(2)),
          parseFloat((totals.games / totals.count).toFixed(1))
        ]);
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Team Stats');

      const seasonLabel = selectedSeason === 'career' ? 'career' : selectedSeason.replace('season', 'season_');
      const playoffLabel = playoffFilter === 'playoffs' ? '_playoffs' : playoffFilter === 'regular' ? '_regular' : '';
      const conferenceLabel = selectedConference !== 'all' ? `_${selectedConference}` : '';

      XLSX.writeFile(wb, `${seasonLabel}_teams${playoffLabel}${conferenceLabel}_stats.xlsx`);
    }
  };

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
              <div className={`backdrop-blur-sm rounded-2xl px-8 py-5 text-center border-2 shadow-2xl ${
                selectedSeason === 'career'
                  ? 'bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-400 shadow-purple-500/50'
                  : 'bg-gray-800/90 border-gray-600'
              }`}>
                <div className={`font-black mb-1 ${
                  selectedSeason === 'career'
                    ? 'text-4xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent'
                    : 'text-2xl text-orange-400'
                }`}>
                  {selectedSeason === 'career' ? 'CAREER' :
                   selectedSeason === 'current' ? 'S3' :
                   selectedSeason === 'season2' ? 'S2' :
                   selectedSeason === 'season2_playoffs' ? 'S2 PO' :
                   selectedSeason === 'season1' ? 'S1' : 'SEASON'}
                </div>
                <div className={`text-xs font-semibold ${
                  selectedSeason === 'career' ? 'text-yellow-200' : 'text-white'
                }`}>
                  {selectedSeason === 'career' ? 'All-Time Stats' : 'Season'}
                </div>
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

        {/* Season Display Section */}
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-8 mb-8 border-2 border-gray-600 shadow-2xl">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Viewing Statistics For</div>
              <div className={`text-5xl font-black mb-2 ${
                selectedSeason === 'career'
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent'
                  : 'text-blue-400'
              }`}>
                {selectedSeason === 'career' ? 'CAREER STATS' :
                 selectedSeason === 'current' ? 'SEASON 3' :
                 selectedSeason === 'season2' ? 'SEASON 2 - SPRING 25' :
                 selectedSeason === 'season2_playoffs' ? 'SEASON 2 PLAYOFFS' :
                 selectedSeason === 'season1' ? 'SEASON 1 - FALL 24' : 'SEASON'}
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                {selectedSeason === 'career' && (
                  <span className="text-yellow-300 font-semibold">All-Time Records</span>
                )}
                {selectedSeason === 'current' && (
                  <span className="text-green-400 font-semibold">Current Season</span>
                )}
                {selectedConference !== 'all' && selectedSeason === 'current' && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-purple-400 font-semibold">{selectedConference} Conference</span>
                  </>
                )}
                {playoffFilter !== 'all' && selectedSeason !== 'career' && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-orange-400 font-semibold">
                      {playoffFilter === 'playoffs' ? 'Playoffs Only' : 'Regular Season Only'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

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

              {/* Playoff Filter - Show when a specific season is selected */}
              {selectedSeason !== 'career' && (
                <select
                  value={playoffFilter}
                  onChange={(e) => setPlayoffFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-gray-700/80 border border-gray-500 text-sm font-medium text-white hover:shadow-luxury transition-all duration-300"
                >
                  <option value="all" className="text-black bg-white">All Games</option>
                  <option value="regular" className="text-black bg-white">Regular Season</option>
                  <option value="playoffs" className="text-black bg-white">Playoffs</option>
                </select>
              )}

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 border border-green-500 text-sm font-medium text-white transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>

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

        {/* Excel-Style Data Table */}
        {processedStats.length > 0 && (
          <StatsTable data={sortedData} viewType={viewType} />
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