import React, { useState, useEffect, useRef } from "react";
import { apiService } from "../../services/apiService";

// Components
import AdminAuth from "./components/AdminAuth";
import DataTable from "./components/DataTable";
import GameResultsTable from "./components/GameResultsTable";
import StandingsTable from "./components/StandingsTable";
import TeamsRostersTable from "./components/TeamsRostersTable";
import EditFormModal from "./modals/EditFormModal";
import GameEditModal from "./modals/GameEditModal";
import BulkAddModal from "./components/BulkAddModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import AdminGuideModal from "./components/AdminGuideModal";
import Tip from "./components/Tip";

// Utils
import { renderFormField, getDefaultFormData } from "./utils/formUtils";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("gameResults");
  
  // Data state for each tab - loaded from API
  const [playersData, setPlayersData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [baseTeamsData, setBaseTeamsData] = useState([]);
  const [allTeamSeasons, setAllTeamSeasons] = useState([]);
  const [allRosterMemberships, setAllRosterMemberships] = useState([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [showBulkTeamsModal, setShowBulkTeamsModal] = useState(false);
  const [showBulkPlayersModal, setShowBulkPlayersModal] = useState(false);
  const [bulkTeamsLinkToSeason, setBulkTeamsLinkToSeason] = useState(true);
  const [showSeasonCloneModal, setShowSeasonCloneModal] = useState(false);
  const [cloneSourceSeasonId, setCloneSourceSeasonId] = useState('');
  const [cloneBusy, setCloneBusy] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState(null);
  const [showAdminGuide, setShowAdminGuide] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('adminTipsEnabled');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const teamsSearchInputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('adminTipsEnabled', String(tipsEnabled)); } catch {}
  }, [tipsEnabled]);
  const [standingsData, setStandingsData] = useState({ homer: [], garfield: [], overall: [] });
  const [scheduleData, setScheduleData] = useState([]);
  const [gameStatsData, setGameStatsData] = useState([]);
  const [gameResultsData, setGameResultsData] = useState([]);
  const [powerRankingsData, setPowerRankingsData] = useState([]);
  const [seasonsData, setSeasonsData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [streamLink, setStreamLink] = useState('');

  // Load stored stream link on mount
  useEffect(() => {
    const loadStreamSetting = async () => {
      try {
        const streamUrl = await apiService.getStreamSetting('stream_link');
        if (streamUrl) {
          setStreamLink(streamUrl);
        }
      } catch (error) {
        console.error('Error loading stream setting:', error);
      }
    };

    loadStreamSetting();
  }, []);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    players: false,
    teams: false,
    standings: false,
    schedule: false,
    gameStats: false,
    gameResults: false,
    powerRankings: false,
    seasons: false
  });
  
  // Form states
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [selectedConference, setSelectedConference] = useState("homer");
  
  // Game Results specific states
  const [collapsedWeeks, setCollapsedWeeks] = useState(new Set());
  const [collapsedSeries, setCollapsedSeries] = useState(new Set());
  const [hasInitializedCollapse, setHasInitializedCollapse] = useState(false);
  const isLocalDataUpdateRef = useRef(false);
  
  // Game Edit Modal states
  const [showGameEditModal, setShowGameEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  // Keyboard shortcuts: / to focus team search, n to open Add modal
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      const anyModalOpen = showAddForm || editingItem !== null || showGameEditModal || showBulkTeamsModal || showBulkPlayersModal || showSeasonCloneModal;
      if (isTyping || anyModalOpen) return;

      if (e.key === '/' && activeTab === 'teams' && teamsSearchInputRef.current) {
        e.preventDefault();
        teamsSearchInputRef.current.focus();
      } else if (e.key === 'n' && !e.ctrlKey && !e.metaKey && activeTab !== 'gameResults' && activeTab !== 'teamsRosters' && activeTab !== 'stream') {
        e.preventDefault();
        setShowAddForm(true);
        setFormData(getDefaultFormData(activeTab, { selectedSeason, scheduleData, seasonsData }));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, showAddForm, editingItem, showGameEditModal, showBulkTeamsModal, showBulkPlayersModal, showSeasonCloneModal, selectedSeason]);

  // Auto-collapse all weeks only on initial load, preserve state on subsequent loads
  useEffect(() => {
    if (gameResultsData && gameResultsData.length > 0) {
      const allWeeks = [...new Set(gameResultsData.map(game => game.week))];

      if (!hasInitializedCollapse) {
        // First load - collapse all weeks
        console.log('Initial load - collapsing all weeks:', allWeeks);
        setCollapsedWeeks(new Set(allWeeks));
        setHasInitializedCollapse(true);
      } else if (!isLocalDataUpdateRef.current) {
        // Only update collapse state for API-driven loads, not local CRUD operations
        setCollapsedWeeks(prevCollapsed => {
          const newCollapsed = new Set(prevCollapsed);

          // Only add weeks that are genuinely new
          allWeeks.forEach(week => {
            if (!prevCollapsed.has(week)) {
              newCollapsed.add(week);
            }
          });

          // Remove weeks that no longer exist in the data
          const existingWeeks = new Set(allWeeks);
          Array.from(prevCollapsed).forEach(week => {
            if (!existingWeeks.has(week)) {
              newCollapsed.delete(week);
            }
          });

          console.log('API reload - updating collapse state. Previous:', Array.from(prevCollapsed), 'New:', Array.from(newCollapsed));
          return newCollapsed;
        });
      }

      // Reset the local update flag after processing
      if (isLocalDataUpdateRef.current) {
        isLocalDataUpdateRef.current = false;
      }
    }
  }, [gameResultsData, hasInitializedCollapse]);

  // Reset collapse initialization when switching tabs or seasons
  useEffect(() => {
    setHasInitializedCollapse(false);
    setCollapsedWeeks(new Set());
    setCollapsedSeries(new Set());
  }, [activeTab, selectedSeason]);

  // Load seasons data on component mount
  useEffect(() => {
    if (authenticated) {
      loadSeasons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  // Load initial data for the selected season when season changes
  useEffect(() => {
    if (authenticated && selectedSeason) {
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, selectedSeason]);

  const setLoadingState = (key, loading) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const loadSeasons = async () => {
    try {
      setLoadingState('seasons', true);
      const seasons = await apiService.getSeasons();
      setSeasonsData(seasons);
      if (seasons.length > 0) {
        const activeSeason = seasons.find(s => s.is_active) || seasons[0];
        setSelectedSeason(activeSeason);
      }
    } catch (error) {
      console.error('Failed to load seasons:', error);
    } finally {
      setLoadingState('seasons', false);
    }
  };

  const loadAllData = async () => {
    if (!selectedSeason) return;
    
    await Promise.all([
      loadPlayers(),
      loadTeams(),
      loadBaseTeams(),
      loadTeamPlayerIndex(),
      loadStandings(),
      loadGames(),
      loadPowerRankings(),
      loadStats(),
      loadGameResults()
    ]);
  };

  const loadBaseTeams = async () => {
    try {
      const baseTeams = await apiService.getTeams();
      setBaseTeamsData(baseTeams);
    } catch (error) {
      console.error('Failed to load base teams:', error);
    }
  };

  const loadTeamPlayerIndex = async () => {
    try {
      const [teamSeasons, memberships] = await Promise.all([
        apiService.getTeamSeasons(),
        apiService.getAllRosterMemberships()
      ]);
      setAllTeamSeasons(teamSeasons);
      setAllRosterMemberships(memberships);
    } catch (error) {
      console.error('Failed to load team-player index:', error);
    }
  };

  const handleLinkTeamToSeason = async (baseTeam) => {
    if (!selectedSeason) return;
    try {
      setLoading(true);
      await apiService.createTeamSeason({
        season_id: selectedSeason.id,
        team_id: baseTeam.id,
        display_name: baseTeam.team_name,
        primary_color: baseTeam.color || null,
        secondary_color: baseTeam.secondary_color || null,
        conference: null
      });
      await loadTeams();
    } catch (error) {
      console.error('Failed to link team to season:', error);
      alert('Failed to link team to season: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAllUnlinked = async () => {
    if (!selectedSeason) return;
    const linkedTeamIds = new Set(teamsData.map(t => t.team_id));
    const unlinked = baseTeamsData.filter(t => !linkedTeamIds.has(t.id));
    if (unlinked.length === 0) {
      alert('All teams are already linked to ' + selectedSeason.season_name);
      return;
    }
    if (!window.confirm(`Link ${unlinked.length} unlinked team(s) to ${selectedSeason.season_name}?`)) return;
    try {
      setLoading(true);
      const results = await Promise.allSettled(
        unlinked.map(t => apiService.createTeamSeason({
          season_id: selectedSeason.id,
          team_id: t.id,
          display_name: t.team_name,
          primary_color: t.color || null,
          secondary_color: t.secondary_color || null,
          conference: null
        }))
      );
      const failures = results.filter(r => r.status === 'rejected').length;
      await loadTeams();
      await loadTeamPlayerIndex();
      if (failures > 0) alert(`Linked ${unlinked.length - failures}; ${failures} failed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAddTeams = async (rows) => {
    const successes = [];
    const failures = [];
    const created = [];
    for (const row of rows) {
      try {
        const team = await apiService.createTeam(row);
        successes.push(team);
        created.push(team);
      } catch (e) {
        failures.push({ raw: row.team_name, error: e.message || 'Create failed' });
      }
    }
    if (bulkTeamsLinkToSeason && selectedSeason && created.length > 0) {
      for (const team of created) {
        try {
          await apiService.createTeamSeason({
            season_id: selectedSeason.id,
            team_id: team.id,
            display_name: team.team_name,
            primary_color: team.color || null,
            secondary_color: team.secondary_color || null,
            conference: null
          });
        } catch (e) {
          failures.push({ raw: `link ${team.team_name}`, error: e.message || 'Link failed' });
        }
      }
    }
    await loadBaseTeams();
    await loadTeams();
    await loadTeamPlayerIndex();
    return { successes, failures };
  };

  const handleBulkAddPlayers = async (rows) => {
    const successes = [];
    const failures = [];
    for (const row of rows) {
      try {
        const player = await apiService.createPlayer(row);
        successes.push(player);
      } catch (e) {
        failures.push({ raw: row.player_name, error: e.message || 'Create failed' });
      }
    }
    await loadPlayers();
    return { successes, failures };
  };

  const handleCloneSeason = async () => {
    if (!selectedSeason || !cloneSourceSeasonId) return;
    if (parseInt(cloneSourceSeasonId) === selectedSeason.id) {
      alert("Can't clone a season into itself.");
      return;
    }
    const sourceTeamSeasons = allTeamSeasons.filter(
      ts => ts.season_id === parseInt(cloneSourceSeasonId)
    );
    if (sourceTeamSeasons.length === 0) {
      alert('No teams found in source season.');
      return;
    }
    const linkedTeamIds = new Set(teamsData.map(t => t.team_id));
    const toClone = sourceTeamSeasons.filter(ts => !linkedTeamIds.has(ts.team_id));
    if (toClone.length === 0) {
      alert('All source teams are already in ' + selectedSeason.season_name);
      return;
    }
    if (!window.confirm(`Clone ${toClone.length} team(s) into ${selectedSeason.season_name}? (Rosters not copied.)`)) return;
    try {
      setCloneBusy(true);
      const results = await Promise.allSettled(
        toClone.map(ts => apiService.createTeamSeason({
          season_id: selectedSeason.id,
          team_id: ts.team_id,
          display_name: ts.display_name,
          primary_color: ts.primary_color || null,
          secondary_color: ts.secondary_color || null,
          conference: ts.conference || null
        }))
      );
      const failures = results.filter(r => r.status === 'rejected').length;
      await loadTeams();
      await loadTeamPlayerIndex();
      setShowSeasonCloneModal(false);
      setCloneSourceSeasonId('');
      if (failures > 0) alert(`Cloned ${toClone.length - failures}; ${failures} failed.`);
      else alert(`Cloned ${toClone.length} team(s) into ${selectedSeason.season_name}.`);
    } finally {
      setCloneBusy(false);
    }
  };

  const loadPlayers = async () => {
    try {
      setLoadingState('players', true);
      const players = await apiService.getPlayers();
      setPlayersData(players);
    } catch (error) {
      console.error('Failed to load players:', error);
    } finally {
      setLoadingState('players', false);
    }
  };

  const loadTeams = async () => {
    try {
      setLoadingState('teams', true);
      const teams = await apiService.getTeams(selectedSeason.id);
      setTeamsData(teams);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoadingState('teams', false);
    }
  };

  const loadStandings = async () => {
    try {
      setLoadingState('standings', true);
      const standings = await apiService.getStandings(selectedSeason.id);

      // For now, treat all teams as 'overall' since conference grouping may not be implemented
      // TODO: Add conference field to teams/team_seasons for proper grouping
      const categorizedStandings = {
        homer: standings.filter(team => team.conference === 'homer'),
        garfield: standings.filter(team => team.conference === 'garfield'),
        overall: standings
      };
      setStandingsData(categorizedStandings);
    } catch (error) {
      console.error('Failed to load standings:', error);
    } finally {
      setLoadingState('standings', false);
    }
  };

  const loadGames = async () => {
    try {
      setLoadingState('schedule', true);
      const games = await apiService.getGames(selectedSeason.id);
      setScheduleData(games);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoadingState('schedule', false);
    }
  };

  const loadPowerRankings = async () => {
    try {
      setLoadingState('powerRankings', true);
      const powerRankings = await apiService.getPowerRankings(selectedSeason.id);
      setPowerRankingsData(powerRankings);
    } catch (error) {
      console.error('Failed to load power rankings:', error);
    } finally {
      setLoadingState('powerRankings', false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingState('gameStats', true);
      const stats = await apiService.getPlayerGameStats(selectedSeason.id);
      setGameStatsData(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoadingState('gameStats', false);
    }
  };

  const loadGameResults = async () => {
    try {
      setLoadingState('gameResults', true);
      const [games, players, playerGameStats, teamSeasons] = await Promise.all([
        apiService.getGames(selectedSeason.id),
        apiService.getPlayers(),
        apiService.getPlayerGameStats(selectedSeason.id),
        apiService.getTeamSeasons(selectedSeason.id)
      ]);

      const gameResults = games.map(game => {
        // Get team names
        const homeTeam = teamSeasons.find(ts => ts.id === game.home_team_season_id);
        const awayTeam = teamSeasons.find(ts => ts.id === game.away_team_season_id);
        
        // Get player stats for this game
        const gamePlayerStats = playerGameStats.filter(stat => stat.game_id === game.id);
        
        // Separate stats by team
        const homeTeamStats = gamePlayerStats.filter(stat => stat.team_season_id === game.home_team_season_id);
        const awayTeamStats = gamePlayerStats.filter(stat => stat.team_season_id === game.away_team_season_id);
        
        // Enrich stats with player names
        const enrichedHomeStats = homeTeamStats.map(stat => {
          const player = players.find(p => p.id === stat.player_id);
          return { ...stat, display_name: player?.display_name || 'Unknown Player' };
        });
        
        const enrichedAwayStats = awayTeamStats.map(stat => {
          const player = players.find(p => p.id === stat.player_id);
          return { ...stat, display_name: player?.display_name || 'Unknown Player' };
        });

        return {
          ...game,
          home_display: homeTeam?.display_name || 'Unknown Team',
          away_display: awayTeam?.display_name || 'Unknown Team',
          home_team_stats: enrichedHomeStats,
          away_team_stats: enrichedAwayStats,
          total_home_goals: enrichedHomeStats.reduce((sum, stat) => sum + (stat.goals || 0), 0),
          total_away_goals: enrichedAwayStats.reduce((sum, stat) => sum + (stat.goals || 0), 0)
        };
      });

      setGameResultsData(gameResults);

      // Auto-collapse weeks that have games
      const allWeeks = [...new Set(gameResults.map(game => game.week).filter(week => week != null))];
      if (allWeeks.length > 3) {
        const weeksToCollapse = allWeeks.slice(0, -3);
        setCollapsedWeeks(new Set(weeksToCollapse));
      }
    } catch (error) {
      console.error('Failed to load game results:', error);
    } finally {
      setLoadingState('gameResults', false);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'players': return playersData;
      case 'teams': return baseTeamsData;
      case 'standings': return standingsData.overall || [];
      case 'schedule': return scheduleData;
      case 'gameStats': return gameStatsData;
      case 'gameResults': return gameResultsData;
      case 'powerRankings': return powerRankingsData;
      case 'seasons': return seasonsData;
      default: return [];
    }
  };

  const setCurrentData = (newData) => {
    switch (activeTab) {
      case 'players':
        setPlayersData(newData);
        break;
      case 'teams':
        setBaseTeamsData(newData);
        break;
      case 'standings':
        setStandingsData(prev => ({ ...prev, overall: newData }));
        break;
      case 'schedule':
        setScheduleData(newData);
        break;
      case 'gameStats':
        setGameStatsData(newData);
        break;
      case 'gameResults':
        setGameResultsData(newData);
        break;
      case 'powerRankings':
        setPowerRankingsData(newData);
        break;
      case 'seasons':
        setSeasonsData(newData);
        break;
      default:
        break;
    }
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      let newItem;
      
      switch (activeTab) {
        case 'players':
          newItem = await apiService.createPlayer(formData);
          break;
        case 'teams':
          newItem = await apiService.createTeam(formData);
          break;
        case 'standings':
          newItem = await apiService.createTeamSeason(formData);
          break;
        case 'schedule':
          newItem = await apiService.createGame({ ...formData, season_id: selectedSeason.id });
          break;
        case 'gameStats':
          newItem = await apiService.createPlayerGameStats({ ...formData, season_id: selectedSeason.id });
          break;
        case 'powerRankings':
          newItem = await apiService.createPowerRanking({ ...formData, season_id: selectedSeason.id });
          break;
        case 'seasons':
          newItem = await apiService.createSeason(formData);
          break;
        default:
          throw new Error(`Add not implemented for ${activeTab}`);
      }
      
      const currentData = getCurrentData();
      setCurrentData([...currentData, newItem]);
      setFormData(getDefaultFormData(activeTab, { selectedSeason, scheduleData, seasonsData }));
      setShowAddForm(false);

      // Only refresh dropdowns if needed, preserving UI state
      if (activeTab === 'teams') {
        await loadBaseTeams();
      }
    } catch (error) {
      console.error(`Failed to add ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item, index) => {
    setEditingItem(index);
    
    if (activeTab === 'gameStats') {
      try {
        const stats = gameStatsData.find(stat => stat.id === item.id);
        if (stats) {
          setFormData({ ...stats });
        } else {
          setFormData({ ...item });
        }
      } catch (error) {
        setFormData({ ...item });
      }
    } else {
      setFormData({ ...item });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let updatedItem;

      switch (activeTab) {
        case 'players':
          updatedItem = await apiService.updatePlayer(formData.id, formData);
          break;
        case 'teams':
          updatedItem = await apiService.updateTeam(formData.id, formData);
          break;
        case 'standings':
          updatedItem = await apiService.updateTeamSeason(formData.id, formData);
          break;
        case 'schedule':
        case 'gameResults':
          updatedItem = await apiService.updateGame(formData.id, formData);
          break;
        case 'gameStats':
          updatedItem = await apiService.updatePlayerGameStats(formData.id, formData);
          break;
        case 'powerRankings':
          updatedItem = await apiService.updatePowerRanking(formData.id, formData);
          break;
        case 'seasons':
          updatedItem = await apiService.updateSeason(formData.id, formData);
          break;
        default:
          throw new Error(`Update not implemented for ${activeTab}`);
      }

      // Update data in place without triggering full reload
      const currentData = getCurrentData();
      const newData = [...currentData];
      newData[editingItem] = updatedItem;
      setCurrentData(newData);

      // Only refresh dropdowns/selectors if needed, without affecting UI state
      if (activeTab === 'teams') {
        await loadBaseTeams();
        await loadTeams();
      }

      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error(`Failed to save ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCurrentList = (index) => {
    const currentData = getCurrentData();
    setCurrentData(currentData.filter((_, i) => i !== index));
  };

  const handleTableDelete = (index) => {
    const currentData = getCurrentData();
    const item = currentData[index];
    const seasonName = selectedSeason?.season_name || 'this season';

    if (activeTab === 'players') {
      const scopedAvailable = !!selectedSeason;
      const playerName = item.player_name || item.display_name || `Player #${item.id}`;
      const scopeOptions = [];
      if (scopedAvailable) {
        scopeOptions.push({
          key: 'season',
          label: `Remove from ${seasonName}`,
          description: `Removes their roster spot(s) for ${seasonName}. Stats history and other-season rosters are preserved.`,
          consequences: [`All roster memberships for ${playerName} in ${seasonName}`],
          destructive: false,
          action: async () => {
            await apiService.deletePlayerFromSeason(item.id, selectedSeason.id);
            await loadTeamPlayerIndex();
            setDeleteModalConfig(null);
          }
        });
      }
      scopeOptions.push({
        key: 'complete',
        label: 'Delete player completely',
        description: 'Removes the player and all their data, every season. This cannot be undone.',
        consequences: [
          'The player record itself',
          'Every roster membership across every season',
          'Every per-game stat line across every season',
          'All season-level stat rollups for this player'
        ],
        destructive: true,
        action: async () => {
          await apiService.deletePlayer(item.id);
          removeFromCurrentList(index);
          await loadTeamPlayerIndex();
          setDeleteModalConfig(null);
        }
      });
      setDeleteModalConfig({
        title: `Delete player "${playerName}"`,
        entityName: playerName,
        scopeOptions
      });
      return;
    }

    if (activeTab === 'teams') {
      const teamName = item.team_name || `Team #${item.id}`;
      const teamSeasonInCurrent = teamsData.find(ts => ts.team_id === item.id);
      const scopeOptions = [];
      if (teamSeasonInCurrent && selectedSeason) {
        scopeOptions.push({
          key: 'season',
          label: `Remove from ${seasonName}`,
          description: `Unlinks this team from ${seasonName}. The team identity and other-season data are preserved.`,
          consequences: [
            `Team's roster memberships in ${seasonName}`,
            `Team's per-game stats in ${seasonName}`,
            `Team's standings/power-rankings rows in ${seasonName}`,
            `Will fail if any games reference this team in ${seasonName} (database FK protection).`
          ],
          destructive: true,
          action: async () => {
            await apiService.deleteTeamSeason(teamSeasonInCurrent.id);
            await loadTeams();
            await loadTeamPlayerIndex();
            setDeleteModalConfig(null);
          }
        });
      }
      scopeOptions.push({
        key: 'complete',
        label: 'Delete team completely',
        description: 'Removes the base team and every season it appeared in. Cannot be undone.',
        consequences: [
          'The base team record',
          'Every team_seasons row for this team',
          'All roster memberships and stats tied to those team_seasons',
          'Will fail if any games reference any of this team\'s team_seasons (database FK protection).'
        ],
        destructive: true,
        action: async () => {
          await apiService.deleteTeam(item.id);
          removeFromCurrentList(index);
          await loadBaseTeams();
          await loadTeams();
          await loadTeamPlayerIndex();
          setDeleteModalConfig(null);
        }
      });
      setDeleteModalConfig({
        title: `Delete team "${teamName}"`,
        entityName: teamName,
        scopeOptions
      });
      return;
    }

    if (activeTab === 'seasons') {
      const sName = item.season_name || `Season #${item.id}`;
      setDeleteModalConfig({
        title: `Delete season "${sName}"`,
        entityName: sName,
        consequences: [
          'Every team_seasons row in this season',
          'Every game in this season (and their stat lines)',
          'Every roster membership tied to this season',
          'Every standings, power_rankings, bracket, and season_stats row',
          'This is a total wipe of the season. Cannot be undone.'
        ],
        destructive: true,
        confirmLabel: 'Delete Season',
        onConfirm: async () => {
          await apiService.deleteSeason(item.id);
          removeFromCurrentList(index);
          setDeleteModalConfig(null);
        }
      });
      return;
    }

    if (activeTab === 'schedule') {
      const desc = `Week ${item.week} game (id ${item.id})`;
      setDeleteModalConfig({
        title: `Delete ${desc}?`,
        consequences: [
          'All player_game_stats rows for this game',
          'The game itself'
        ],
        destructive: false,
        confirmLabel: 'Delete Game',
        onConfirm: async () => {
          await apiService.deleteGame(item.id);
          removeFromCurrentList(index);
          setDeleteModalConfig(null);
        }
      });
      return;
    }

    // Generic single-row delete (gameStats, standings, powerRankings)
    const action = {
      gameStats: () => apiService.deletePlayerGameStats(item.id),
      standings: () => apiService.deleteTeamSeason(item.id),
      powerRankings: () => apiService.deletePowerRanking(item.id)
    }[activeTab];

    if (!action) {
      console.warn(`Delete not implemented for ${activeTab}`);
      return;
    }

    setDeleteModalConfig({
      title: `Delete this ${activeTab.replace(/s$/, '')} entry?`,
      consequences: ['Just this single row.'],
      destructive: false,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await action();
        removeFromCurrentList(index);
        setDeleteModalConfig(null);
      }
    });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({});
    setShowAddForm(false);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleWeekCollapse = (week) => {
    const newCollapsed = new Set(collapsedWeeks);
    if (newCollapsed.has(week)) {
      newCollapsed.delete(week);
    } else {
      newCollapsed.add(week);
    }
    setCollapsedWeeks(newCollapsed);
  };

  const handleManageGameStats = (game) => {
    setDeleteModalConfig({
      title: `Delete Game ${game.series_game || 1}: ${game.home_display} vs ${game.away_display}?`,
      consequences: [
        `Week ${game.week} game record`,
        'All player_game_stats rows for this game'
      ],
      destructive: false,
      confirmLabel: 'Delete Game',
      onConfirm: async () => {
        await apiService.deleteGame(game.id);
        isLocalDataUpdateRef.current = true;
        setGameResultsData(gameResultsData.filter(g => g.id !== game.id));
        setDeleteModalConfig(null);
      }
    });
  };

  const handleGameEditSave = async () => {
    // For now, just close the modal
    // TODO: Implement game stats saving logic
    console.log('Saving game stats for:', editingGame);
    setShowGameEditModal(false);
    setEditingGame(null);
  };

  const handleGameEditCancel = () => {
    setShowGameEditModal(false);
    setEditingGame(null);
  };

  const handleGameEditDelete = () => {
    if (!editingGame) return;
    const game = editingGame;
    setShowGameEditModal(false);
    setEditingGame(null);
    setDeleteModalConfig({
      title: `Delete Game ${game.series_game || 1}: ${game.home_display} vs ${game.away_display}?`,
      consequences: [
        `Week ${game.week} game record`,
        'All player_game_stats rows for this game'
      ],
      destructive: false,
      confirmLabel: 'Delete Game',
      onConfirm: async () => {
        await apiService.deleteGame(game.id);
        isLocalDataUpdateRef.current = true;
        setGameResultsData(gameResultsData.filter(g => g.id !== game.id));
        setDeleteModalConfig(null);
      }
    });
  };

  const handleDelete = () => {
    if (!formData.id) {
      alert('Cannot delete: No item selected');
      return;
    }
    const currentData = getCurrentData();
    const idx = currentData.findIndex(item => item.id === formData.id);
    if (idx === -1) {
      alert('Cannot find item to delete');
      return;
    }
    handleCancel();              // close the edit modal first
    handleTableDelete(idx);      // open the unified delete confirmation
  };

  const handleAutoGenerateStandings = async () => {
    if (!selectedSeason) {
      alert('Please select a season first.');
      return;
    }

    if (!window.confirm(`Auto-generate standings for ${selectedSeason.season_name || selectedSeason.name}? This will overwrite existing standings data.`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.autoGenerateStandings(selectedSeason.id);

      // Reload standings data to reflect changes
      await loadStandings();

      alert(`Successfully auto-generated standings! Updated ${result.count} teams with the new point system (4-reg win, 3-OT win, 2-OT loss, 1-reg loss, 0-forfeit).`);
    } catch (error) {
      console.error('Failed to auto-generate standings:', error);
      alert('Failed to auto-generate standings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeriesGame = async (game) => {
    const numGamesInput = prompt(`How many games would you like to add to the series between ${game.home_display} and ${game.away_display} in Week ${game.week}?`, '1');
    
    if (numGamesInput === null) {
      return; // User cancelled
    }
    
    const numGames = parseInt(numGamesInput, 10);
    
    if (isNaN(numGames) || numGames < 1 || numGames > 10) {
      alert('Please enter a valid number between 1 and 10.');
      return;
    }

    if (!window.confirm(`Add ${numGames} game${numGames > 1 ? 's' : ''} to the series between ${game.home_display} and ${game.away_display} in Week ${game.week}?`)) {
      return;
    }

    try {
      setLoading(true);
      
      const gameData = {
        season_id: game.season_id,
        home_team_season_id: game.home_team_season_id,
        away_team_season_id: game.away_team_season_id,
        game_date: new Date().toISOString().split('T')[0],
        week: game.week,
        is_playoffs: game.is_playoffs
      };

      // Create multiple games and add them to local state
      const newGames = [];
      for (let i = 0; i < numGames; i++) {
        const newGame = await apiService.createSeriesGame(gameData);
        newGames.push(newGame);
      }

      // Add new games to local state without full reload to preserve UI state
      if (newGames.length > 0) {
        // Enhance new games with display names like in loadGameResults
        const enhancedNewGames = await Promise.all(newGames.map(async (newGame) => {
          const [, teamSeasons] = await Promise.all([
            apiService.getPlayers(),
            apiService.getTeamSeasons(selectedSeason.id)
          ]);

          const homeTeam = teamSeasons.find(ts => ts.id === newGame.home_team_season_id);
          const awayTeam = teamSeasons.find(ts => ts.id === newGame.away_team_season_id);

          return {
            ...newGame,
            home_display: homeTeam?.display_name || 'Unknown Team',
            away_display: awayTeam?.display_name || 'Unknown Team',
            home_team_stats: [],
            away_team_stats: [],
            total_home_goals: 0,
            total_away_goals: 0
          };
        }));

        isLocalDataUpdateRef.current = true;
        setGameResultsData(prev => [...prev, ...enhancedNewGames]);
      }
      
    } catch (error) {
      console.error('Failed to add series games:', error);
      alert('Failed to add games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'gameResults') {
      return (
        <GameResultsTable
          gameResultsData={gameResultsData}
          collapsedWeeks={collapsedWeeks}
          collapsedSeries={collapsedSeries}
          onToggleWeekCollapse={toggleWeekCollapse}
          onToggleSeriesCollapse={(seriesKey) => {
            const newCollapsed = new Set(collapsedSeries);
            if (newCollapsed.has(seriesKey)) {
              newCollapsed.delete(seriesKey);
            } else {
              newCollapsed.add(seriesKey);
            }
            setCollapsedSeries(newCollapsed);
          }}
          onManageGameStats={handleManageGameStats}
          onAddSeriesGame={handleAddSeriesGame}
          onUpdateGameResults={(updatedGames) => {
            isLocalDataUpdateRef.current = true;
            setGameResultsData(updatedGames);
          }}
          apiService={apiService}
          selectedSeason={selectedSeason}
          isActive={activeTab === 'gameResults'}
        />
      );
    }
    
    if (activeTab === 'teamsRosters') {
      return (
        <TeamsRostersTable
          selectedSeason={selectedSeason}
          apiService={apiService}
        />
      );
    }
    if (activeTab === 'standings') {
      // Use overall standings data only
      const currentStandingsData = standingsData.overall || standingsData;
      const flatStandingsData = Array.isArray(currentStandingsData) ? currentStandingsData : [];

      return (
        <StandingsTable
          standingsData={flatStandingsData}
          loading={loadingStates.standings}
          onEdit={handleEdit}
          onDelete={handleTableDelete}
        />
      );
    }

    if (activeTab === 'stream') {
      const handleStreamSubmit = async (e) => {
        e.preventDefault();
        try {
          setLoading(true);

          // Save stream link to database
          await apiService.setStreamSetting('stream_link', streamLink, 'Twitch stream URL for the public stream page');
          console.log('Stream link saved to database:', streamLink);

          // Show success message
          alert('Stream link saved successfully!');
        } catch (error) {
          console.error('Failed to save stream link:', error);
          alert('Failed to save stream link. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      const handleDeleteAllChats = async () => {
        const confirmDelete = window.confirm(
          'Are you sure you want to delete ALL chat messages? This action cannot be undone.'
        );

        if (!confirmDelete) return;

        try {
          setLoading(true);

          // Delete all chat messages
          const response = await apiService.deleteAllChatMessages();
          console.log('All chat messages deleted:', response);

          // Show success message
          alert(`Successfully deleted ${response.data.deletedCount} chat messages.`);
        } catch (error) {
          console.error('Failed to delete all chat messages:', error);
          alert('Failed to delete chat messages. Please try again.');
        } finally {
          setLoading(false);
        }
      };


      return (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-xl border border-gray-600 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📺 Stream Configuration
            </h3>
            <form onSubmit={handleStreamSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitch Stream URL
                </label>
                <input
                  type="url"
                  value={streamLink}
                  onChange={(e) => setStreamLink(e.target.value)}
                  placeholder="https://www.twitch.tv/your-channel-name"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter the Twitch channel URL that will be displayed on the public stream page
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !streamLink.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Stream Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setStreamLink('')}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>

            {streamLink && (
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Preview:</h4>
                <p className="text-blue-400 break-all">{streamLink}</p>
                <p className="text-xs text-gray-400 mt-2">
                  This link will be used on the public stream page at <span className="text-blue-400">/stream</span>
                </p>
              </div>
            )}
          </div>

          {/* Chat Management Section */}
          <div className="bg-gray-700/50 rounded-xl border border-gray-600 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              💬 Chat Management
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Manage the chat messages on the public stream page. Use these controls for moderation purposes.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAllChats}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {loading ? 'Deleting...' : 'Delete All Chat Messages'}
                </button>
              </div>

              <div className="text-xs text-gray-400 space-y-1">
                <p>⚠️ <strong>Warning:</strong> Deleting chat messages is permanent and cannot be undone.</p>
                <p>💡 This will remove all messages from the database and clear the chat for all users.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const teamsTabExtraActions = activeTab === 'teams' && selectedSeason
      ? (item) => {
          const linkedTeamIds = new Set(teamsData.map(t => t.team_id));
          const alreadyLinked = linkedTeamIds.has(item.id);
          return [{
            label: alreadyLinked ? `✓ In ${selectedSeason.season_name}` : `+ Link to ${selectedSeason.season_name}`,
            disabled: alreadyLinked,
            title: alreadyLinked
              ? `Already linked to ${selectedSeason.season_name}. Manage in Teams & Rosters tab.`
              : `Add this team to ${selectedSeason.season_name}`,
            className: alreadyLinked
              ? 'bg-gray-600 cursor-default'
              : 'bg-purple-600 hover:bg-purple-700',
            onClick: () => handleLinkTeamToSeason(item)
          }];
        }
      : undefined;

    let dataForTable = getCurrentData();
    if (activeTab === 'teams' && teamSearchQuery.trim()) {
      const q = teamSearchQuery.trim().toLowerCase();

      // Build base team id -> Set<player names ever rostered>
      const teamSeasonToBaseTeam = new Map(
        allTeamSeasons.map(ts => [ts.id, ts.team_id])
      );
      const baseTeamPlayers = new Map();
      for (const m of allRosterMemberships) {
        const baseTeamId = teamSeasonToBaseTeam.get(m.team_season_id);
        if (baseTeamId == null) continue;
        const player = playersData.find(p => p.id === m.player_id);
        const name = player?.player_name || player?.display_name;
        if (!name) continue;
        if (!baseTeamPlayers.has(baseTeamId)) baseTeamPlayers.set(baseTeamId, new Set());
        baseTeamPlayers.get(baseTeamId).add(name);
      }

      dataForTable = dataForTable.filter(team => {
        if ((team.team_name || '').toLowerCase().includes(q)) return true;
        const players = baseTeamPlayers.get(team.id);
        if (!players) return false;
        for (const name of players) {
          if (name.toLowerCase().includes(q)) return true;
        }
        return false;
      });
    }

    const linkedTeamIds = new Set(teamsData.map(t => t.team_id));
    const unlinkedCount = baseTeamsData.filter(t => !linkedTeamIds.has(t.id)).length;

    return (
      <div className="space-y-6">
        {activeTab === 'teams' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                ref={teamsSearchInputRef}
                type="text"
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                placeholder="Search by team name or player... (press / to focus)"
                className="flex-1 min-w-[260px] max-w-md px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              {teamSearchQuery && (
                <button
                  onClick={() => setTeamSearchQuery('')}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  Clear
                </button>
              )}
              <span className="text-gray-400 text-sm">
                {dataForTable.length} of {baseTeamsData.length} teams
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowBulkTeamsModal(true)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm"
              >
                📋 Bulk Add Teams
              </button>
              {selectedSeason && unlinkedCount > 0 && (
                <button
                  onClick={handleLinkAllUnlinked}
                  disabled={loading}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-sm"
                >
                  🔗 Link All Unlinked to {selectedSeason.season_name} ({unlinkedCount})
                </button>
              )}
              {selectedSeason && (
                <button
                  onClick={() => setShowSeasonCloneModal(true)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
                >
                  📑 Clone From Season...
                </button>
              )}
            </div>
          </>
        )}
        {activeTab === 'players' && (
          <div>
            <button
              onClick={() => setShowBulkPlayersModal(true)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm"
            >
              📋 Bulk Add Players
            </button>
          </div>
        )}
        <DataTable
          activeTab={activeTab}
          currentData={dataForTable}
          loading={loading}
          loadingStates={loadingStates}
          selectedSeason={selectedSeason}
          onEdit={handleEdit}
          onDelete={handleTableDelete}
          extraActions={teamsTabExtraActions}
        />
      </div>
    );
  };

  if (!authenticated) {
    return <AdminAuth onAuthenticated={setAuthenticated} />;
  }

  const currentData = getCurrentData();
  const seedKeys = currentData.length > 0
    ? Object.keys(currentData[0])
    : Object.keys(formData || {});
  const currentKeys = seedKeys.filter(key =>
    !key.includes('id') &&
    key !== 'id' &&
    key !== 'total_home_goals' &&
    key !== 'total_away_goals' &&
    // Hide team columns for players tab
    !(activeTab === 'players' && (key === 'team_name' || key === 'team_color')) &&
    // Hide specific columns from teams tab
    !(activeTab === 'teams' && (
      key === 'original_team_name' ||
      key === 'alt_logo_url' ||
      key === 'primary_color' ||
      key === 'ranking' ||
      key === 'season_id' ||
      key === 'season_name'
    ))
  );

  return (
    <div className="min-h-screen bg-gradient-executive relative page-with-navbar overflow-x-hidden">
      {/* Neural Background */}
      <div className="absolute inset-0 neural-bg opacity-20" />
      
      {/* Executive Header */}
      <div className="relative z-10 glass-dark border-b border-white/10 pt-20">
        <div className="w-full px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-4">🛠 Admin Control Center</h1>
                <button
                  onClick={() => setShowAdminGuide(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 mb-2 sm:mb-4 transition-colors"
                  title="Open admin guide"
                >
                  <span>📖</span> Help
                </button>
                <button
                  onClick={() => setTipsEnabled(v => !v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 mb-2 sm:mb-4 transition-colors ${
                    tipsEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                  }`}
                  title={tipsEnabled ? 'Click to hide all tips' : 'Click to show contextual tips'}
                >
                  <span>💡</span> Tips: {tipsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-white font-light">
                Full CRUD management for all league data and operations
              </p>
            </div>
            
            {/* Season Selector */}
            {seasonsData.length > 0 && (
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-600">
                <select
                  value={selectedSeason?.id || ''}
                  onChange={(e) => {
                    const season = seasonsData.find(s => s.id === parseInt(e.target.value));
                    setSelectedSeason(season);
                  }}
                  className="bg-transparent text-white border-none focus:outline-none"
                >
                  {seasonsData
                    .filter((season, index, array) => {
                      // Keep only the first occurrence of each season name
                      const seasonName = season.season_name || season.name;
                      return array.findIndex(s => (s.season_name || s.name) === seasonName) === index;
                    })
                    .map(season => (
                      <option key={season.id} value={season.id} className="bg-gray-800">
                        {season.season_name || season.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 py-8">
        <div className="w-full">
          {/* Tab Navigation */}
          <div className="bg-gray-800/90 border border-gray-600 rounded-t-2xl overflow-hidden">
            <div className="flex flex-wrap">
              {[
                { key: 'gameResults', label: '🏒 Game Results', icon: '🏒' },
                { key: 'teamsRosters', label: '🛡️ Teams & Rosters', icon: '🛡️' },
                { key: 'players', label: '👥 Players', icon: '👥' },
                { key: 'teams', label: '🏛️ Teams', icon: '🏛️' },
                { key: 'standings', label: '📊 Standings', icon: '📊' },
                { key: 'schedule', label: '📅 Schedule', icon: '📅' },
                { key: 'gameStats', label: '📈 Game Stats', icon: '📈' },
                { key: 'powerRankings', label: '👑 Weekly', icon: '👑' },
                { key: 'seasons', label: '📆 Seasons', icon: '📆' },
                { key: 'stream', label: '📺 Stream', icon: '📺' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-3 sm:px-4 sm:py-4 text-xs sm:text-sm font-bold transition-all duration-300 border-r border-gray-600 last:border-r-0 flex-1 min-w-0 ${
                    activeTab === key
                      ? 'bg-gradient-to-b from-blue-600/30 to-purple-600/30 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg sm:text-lg">{icon}</span>
                    <span className="hidden sm:inline">{label.split(' ').slice(1).join(' ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800/90 border-l border-r border-b border-gray-600 rounded-b-2xl p-6">

            {/* Add New Button (except for game results, teams rosters, and stream) */}
            {activeTab !== 'gameResults' && activeTab !== 'teamsRosters' && activeTab !== 'stream' && (
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white capitalize">
                  Manage {activeTab}
                </h2>
                <div className="flex gap-3">
                  {/* Auto-Generate Standings Button */}
                  {activeTab === 'standings' && (
                    <button
                      onClick={handleAutoGenerateStandings}
                      disabled={loading || !selectedSeason}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2"
                    >
                      <span className="text-lg">⚡</span>
                      Auto-Generate
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setFormData(getDefaultFormData(activeTab, { selectedSeason, scheduleData, seasonsData }));
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2"
                  >
                    <span className="text-lg">➕</span>
                    Add New
                  </button>
                </div>
              </div>
            )}

            {/* Per-tab tip */}
            {(() => {
              const tipMap = {
                gameResults: <>Click <strong>Insert Stats</strong> on a series (or expand a game and use it there) to enter per-player stats. Mark <strong>OTG</strong> on whoever scored the OT goal — it drives the W/L/OTL calc.</>,
                teamsRosters: <>Use <strong>📋 Bulk paste roster</strong> in Edit Roster to add a whole team at once. Type a name not in the list to inline-create a new player.</>,
                players: <>Use <strong>📋 Bulk Add Players</strong> for many at once. Delete here gives you a choice: scoped to current season or completely (every season).</>,
                teams: <>Press <strong>/</strong> to focus search, <strong>n</strong> to add. Search matches team name OR any player ever on that team. <strong>+ Link to Season</strong> button puts a base team into the active season.</>,
                standings: <>Click <strong>⚡ Auto-Generate</strong> to rebuild standings from games + stats. Manual edits get overwritten by the next Auto-Generate.</>,
                schedule: <>Add New pre-fills <strong>season_id</strong>, next-unused week, and next Sunday's date. For Bo3 series, use Game Results' <strong>Add Series Game</strong>.</>,
                gameStats: <>This is the flat stats view. It's usually easier to enter stats via <strong>Game Results → Insert Stats</strong> instead.</>,
                powerRankings: <>Editorial weekly rankings — these don't auto-update from games. Edit each week manually.</>,
                seasons: <>Only one season should be <strong>is_active</strong>. The active season drives every "current season" lookup. Smart defaults suggest <strong>Season N+1</strong>.</>,
                stream: <>Twitch URL goes here. <strong>Delete All Chats</strong> is permanent.</>
              };
              const tip = tipMap[activeTab];
              return tip ? (
                <Tip enabled={tipsEnabled} className="mb-4">{tip}</Tip>
              ) : null;
            })()}

            {/* Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <EditFormModal
        show={showAddForm || editingItem !== null}
        formData={formData}
        editingItem={editingItem}
        showAddForm={showAddForm}
        loading={loading}
        onCancel={handleCancel}
        onSave={handleSave}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onFormChange={handleFormChange}
        renderFormField={(field, value) => 
          renderFormField(field, value, "text", handleFormChange, teamsData, seasonsData)
        }
        currentKeys={currentKeys}
        activeTab={activeTab}
        tipsEnabled={tipsEnabled}
      />

      {/* Game Edit Modal */}
      <GameEditModal
        show={showGameEditModal}
        game={editingGame}
        loading={loading}
        onCancel={handleGameEditCancel}
        onSave={handleGameEditSave}
        onDelete={handleGameEditDelete}
        apiService={apiService}
      />

      {/* Bulk Add Teams Modal */}
      <BulkAddModal
        show={showBulkTeamsModal}
        title="Bulk Add Teams"
        description="One team name per line. Optional second column (separated by comma) for hex color."
        placeholder={"Octane\nHotshot,#ff5733\nDiestro,#3366ff"}
        onCancel={() => setShowBulkTeamsModal(false)}
        parseLine={(line) => {
          const [name, color] = line.split(',').map(s => s.trim());
          if (!name) throw new Error('Empty team name');
          return { team_name: name, color: color || null };
        }}
        onSubmit={handleBulkAddTeams}
        extraControls={
          selectedSeason && (
            <label className="flex items-center gap-2 text-gray-200">
              <input
                type="checkbox"
                checked={bulkTeamsLinkToSeason}
                onChange={(e) => setBulkTeamsLinkToSeason(e.target.checked)}
                className="w-4 h-4"
              />
              Also link each new team to {selectedSeason.season_name}
            </label>
          )
        }
      />

      {/* Bulk Add Players Modal */}
      <BulkAddModal
        show={showBulkPlayersModal}
        title="Bulk Add Players"
        description="One player per line. Optional second column (comma-separated) for display name."
        placeholder={"Joe Schmo\nFastFox,Fox\nKoji Cosplay"}
        onCancel={() => setShowBulkPlayersModal(false)}
        parseLine={(line) => {
          const [name, display] = line.split(',').map(s => s.trim());
          if (!name) throw new Error('Empty player name');
          return { player_name: name, display_name: display || name };
        }}
        onSubmit={handleBulkAddPlayers}
      />

      {/* Admin Guide Modal */}
      <AdminGuideModal show={showAdminGuide} onClose={() => setShowAdminGuide(false)} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={!!deleteModalConfig}
        title={deleteModalConfig?.title || 'Delete?'}
        entityName={deleteModalConfig?.entityName}
        scopeOptions={deleteModalConfig?.scopeOptions}
        consequences={deleteModalConfig?.consequences}
        destructive={deleteModalConfig?.destructive}
        confirmLabel={deleteModalConfig?.confirmLabel}
        tipsEnabled={tipsEnabled}
        onCancel={() => setDeleteModalConfig(null)}
        onConfirm={deleteModalConfig?.onConfirm}
      />

      {/* Season Clone Modal */}
      {showSeasonCloneModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-600 w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-600 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
              <h3 className="text-xl font-bold text-white">Clone Teams From Another Season</h3>
              <p className="text-sm text-gray-300 mt-1">
                Copies team_seasons (team identity + display name + conference) into {selectedSeason?.season_name}. Rosters are not copied.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <label className="block text-sm text-gray-300">Source season</label>
              <select
                value={cloneSourceSeasonId}
                onChange={(e) => setCloneSourceSeasonId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select source...</option>
                {seasonsData
                  .filter(s => s.id !== selectedSeason?.id)
                  .map(s => (
                    <option key={s.id} value={s.id} className="text-black bg-white">
                      {s.season_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="px-6 py-4 border-t border-gray-600 flex justify-end gap-3">
              <button
                onClick={() => { setShowSeasonCloneModal(false); setCloneSourceSeasonId(''); }}
                disabled={cloneBusy}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloneSeason}
                disabled={cloneBusy || !cloneSourceSeasonId}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded flex items-center gap-2"
              >
                {cloneBusy && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                {cloneBusy ? 'Cloning...' : 'Clone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;