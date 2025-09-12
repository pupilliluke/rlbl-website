import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [activeTab, setActiveTab] = useState("gameResults");
  
  // Data state for each tab - loaded from API
  const [playersData, setPlayersData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [standingsData, setStandingsData] = useState({ homer: [], garfield: [], overall: [] });
  const [scheduleData, setScheduleData] = useState([]);
  const [gameStatsData, setGameStatsData] = useState([]);
  const [gameResultsData, setGameResultsData] = useState([]);
  const [powerRankingsData, setPowerRankingsData] = useState([]);
  const [seasonsData, setSeasonsData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  
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
  const [selectedConference, setSelectedConference] = useState("homer");
  
  // Game Results specific states
  const [collapsedWeeks, setCollapsedWeeks] = useState(new Set());
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameStatsModal, setShowGameStatsModal] = useState(false);
  const [homeRoster, setHomeRoster] = useState([]);
  const [awayRoster, setAwayRoster] = useState([]);
  const [editingPlayerStat, setEditingPlayerStat] = useState(null);
  const [playerStatFormData, setPlayerStatFormData] = useState({});
  const [showAddPlayerStatForm, setShowAddPlayerStatForm] = useState(false);
  const [addingStatForTeam, setAddingStatForTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerGame, setSelectedPlayerGame] = useState(null);
  const [showPlayerStatsModal, setShowPlayerStatsModal] = useState(false);
  const [playerStatsData, setPlayerStatsData] = useState(null);
  const [isPlayerStatsNew, setIsPlayerStatsNew] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timeout = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Load seasons data on component mount
  useEffect(() => {
    if (authenticated) {
      loadSeasons();
    }
  }, [authenticated]);

  // Auto-focus modals for keyboard navigation
  useEffect(() => {
    if (showPlayerStatsModal || showAddForm || editingItem !== null || showGameStatsModal) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const modal = document.querySelector('[tabIndex="-1"]');
        if (modal) modal.focus();
      }, 100);
    }
  }, [showPlayerStatsModal, showAddForm, editingItem, showGameStatsModal]);

  // Load initial data for the selected season when season changes
  useEffect(() => {
    if (authenticated && selectedSeason) {
      loadAllData();
    }
  }, [authenticated, selectedSeason]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (showAddForm || editingItem !== null || showGameStatsModal || showAddPlayerStatForm || editingPlayerStat !== null || showPlayerStatsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddForm, editingItem, showGameStatsModal, showAddPlayerStatForm, editingPlayerStat, showPlayerStatsModal]);

  // API Loading Functions
  const setLoadingState = (key, loading) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const loadSeasons = async () => {
    try {
      setLoadingState('seasons', true);
      const seasons = await apiService.getSeasons();
      setSeasonsData(seasons);
      
      // Set default season to current active season or first season
      if (seasons.length > 0) {
        const activeSeason = seasons.find(s => s.is_active) || seasons[0];
        setSelectedSeason(activeSeason.id);
      }
    } catch (error) {
      console.error('Failed to load seasons:', error);
      setError('Failed to load seasons data');
    } finally {
      setLoadingState('seasons', false);
    }
  };

  const loadAllData = async () => {
    if (!selectedSeason) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadPlayers(),
        loadTeams(),
        loadStandings(),
        loadGames(),
        loadPowerRankings(),
        loadStats(),
        loadGameResults()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      setLoadingState('players', true);
      const players = await apiService.getPlayers();
      setPlayersData(players);
    } catch (error) {
      console.error('Failed to load players:', error);
      setError('Failed to load players data');
    } finally {
      setLoadingState('players', false);
    }
  };

  const loadTeams = async () => {
    try {
      setLoadingState('teams', true);
      const teams = await apiService.getTeams(selectedSeason);
      setTeamsData(teams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setError('Failed to load teams data');
    } finally {
      setLoadingState('teams', false);
    }
  };

  const loadStandings = async () => {
    try {
      setLoadingState('standings', true);
      const standings = await apiService.getStandings(selectedSeason);
      // Convert flat standings into conference structure if needed
      setStandingsData({
        homer: standings.standings || standings,
        garfield: [],
        overall: standings.standings || standings
      });
    } catch (error) {
      console.error('Failed to load standings:', error);
      setError('Failed to load standings data');
    } finally {
      setLoadingState('standings', false);
    }
  };

  const loadGames = async () => {
    try {
      setLoadingState('schedule', true);
      const games = await apiService.getGames(selectedSeason);
      setScheduleData(games);
    } catch (error) {
      console.error('Failed to load games:', error);
      setError('Failed to load games data');
    } finally {
      setLoadingState('schedule', false);
    }
  };

  const loadPowerRankings = async () => {
    try {
      setLoadingState('powerRankings', true);
      const rankings = await apiService.getPowerRankings();
      setPowerRankingsData(rankings);
    } catch (error) {
      console.error('Failed to load power rankings:', error);
      setError('Failed to load power rankings data');
    } finally {
      setLoadingState('powerRankings', false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingState('gameStats', true);
      const stats = await apiService.getStats(selectedSeason);
      setGameStatsData(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load stats data');
    } finally {
      setLoadingState('gameStats', false);
    }
  };

  const loadGameResults = async () => {
    try {
      setLoadingState('gameResults', true);
      
      // Load games with full details
      const games = await apiService.getGames(selectedSeason);
      const playerGameStats = await apiService.getPlayerGameStats();
      const players = await apiService.getPlayers();
      
      // Create comprehensive game results by combining games with player stats
      const gameResults = games.map(game => {
        // Get all player stats for this game
        const gamePlayerStats = playerGameStats.filter(stat => stat.game_id === game.id);
        
        // Get players for home and away teams based on stats
        const homeTeamStats = gamePlayerStats.filter(stat => stat.team_season_id === game.home_team_season_id);
        const awayTeamStats = gamePlayerStats.filter(stat => stat.team_season_id === game.away_team_season_id);
        
        // Add player names to stats
        const enrichedHomeStats = homeTeamStats.map(stat => {
          const player = players.find(p => p.id === stat.player_id);
          return { ...stat, player_name: player?.player_name || 'Unknown', gamertag: player?.gamertag || 'Unknown' };
        });
        
        const enrichedAwayStats = awayTeamStats.map(stat => {
          const player = players.find(p => p.id === stat.player_id);
          return { ...stat, player_name: player?.player_name || 'Unknown', gamertag: player?.gamertag || 'Unknown' };
        });
        
        return {
          ...game,
          home_team_stats: enrichedHomeStats,
          away_team_stats: enrichedAwayStats,
          total_home_goals: enrichedHomeStats.reduce((sum, stat) => sum + (stat.goals || 0), 0),
          total_away_goals: enrichedAwayStats.reduce((sum, stat) => sum + (stat.goals || 0), 0)
        };
      });
      
      setGameResultsData(gameResults);
      
      // Initialize all weeks as collapsed on data load
      const allWeeks = [...new Set(gameResults.map(game => game.week).filter(week => week != null))];
      setCollapsedWeeks(new Set(allWeeks));
    } catch (error) {
      console.error('Failed to load game results:', error);
      setError('Failed to load game results data');
    } finally {
      setLoadingState('gameResults', false);
    }
  };

  const handleAuth = () => {
    console.log('Entered password:', password);
    console.log('Expected password:', process.env.REACT_APP_ADMIN_PASSWORD);
    const isCorrect = password === process.env.REACT_APP_ADMIN_PASSWORD;
    if (isCorrect) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setShowError(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAuth();
    }
  };

  // Generic CRUD operations
  const getCurrentData = () => {
    switch (activeTab) {
      case "players": return playersData;
      case "teams": return teamsData;
      case "standings": return standingsData[selectedConference];
      case "schedule": return scheduleData;
      case "gameStats": return gameStatsData;
      case "gameResults": return gameResultsData;
      case "powerRankings": return powerRankingsData;
      default: return [];
    }
  };

  const setCurrentData = (newData) => {
    switch (activeTab) {
      case "players":
        setPlayersData(newData);
        break;
      case "teams":
        setTeamsData(newData);
        break;
      case "standings":
        setStandingsData(prev => ({ ...prev, [selectedConference]: newData }));
        break;
      case "schedule":
        setScheduleData(newData);
        break;
      case "gameStats":
        setGameStatsData(newData);
        break;
      case "gameResults":
        setGameResultsData(newData);
        break;
      case "powerRankings":
        setPowerRankingsData(newData);
        break;
      default:
        break;
    }
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case "players":
        return {
          player_name: "",
          gamertag: "",
          team_name: ""
        };
      case "teams":
        return {
          team_name: "",
          color: "#000000",
          secondary_color: "#ffffff",
          logo_url: ""
        };
      case "standings":
        return {
          season_id: selectedSeason || 3,
          team_season_id: null,
          wins: 0,
          losses: 0,
          ties: 0,
          points_for: 0,
          points_against: 0
        };
      case "schedule":
        return {
          season_id: selectedSeason || 3,
          home_team_season_id: null,
          away_team_season_id: null,
          game_date: "",
          week: 1,
          is_playoffs: false
        };
      case "gameStats":
        return {
          gameDate: "",
          homeTeam: "",
          awayTeam: "",
          week: 1,
          season: "2025",
          playerStats: []
        };
      case "gameResults":
        return {
          game_id: null,
          player_id: null,
          team_season_id: null,
          points: 0,
          goals: 0,
          assists: 0,
          saves: 0,
          shots: 0,
          mvps: 0,
          demos: 0,
          epic_saves: 0
        };
      case "powerRankings":
        return {
          season_id: selectedSeason || 3,
          week: 1,
          team_season_id: null,
          rank: 1,
          reasoning: ""
        };
      default:
        return {};
    }
  };

  const handleAdd = async () => {
    if (!formData || Object.keys(formData).length === 0) return;
    
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'players':
          await apiService.createPlayer(formData);
          await loadPlayers();
          break;
        case 'teams':
          await apiService.createTeam(formData);
          await loadTeams();
          break;
        case 'standings':
          await apiService.createStanding(formData);
          await loadStandings();
          break;
        case 'schedule':
          await apiService.createGame(formData);
          await loadGames();
          break;
        case 'gameStats':
          console.log('Game stats creation not yet implemented');
          break;
        case 'gameResults':
          await apiService.createPlayerGameStats(formData);
          await loadGameResults();
          break;
        case 'powerRankings':
          await apiService.createPowerRanking(formData);
          await loadPowerRankings();
          break;
        default:
          console.log(`Add operation not implemented for ${activeTab}`);
      }
      
      setFormData(getDefaultFormData());
      setShowAddForm(false);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error(`Failed to add ${activeTab}:`, error);
      setError(`Failed to add ${activeTab}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item, index) => {
    setEditingItem(index);
    
    // For players, load complete stats data
    if (activeTab === 'players') {
      try {
        setLoading(true);
        // Load complete player stats which includes all fields
        const stats = await apiService.getStats();
        const playerStats = stats.find(stat => stat.id === item.id);
        
        if (playerStats) {
          setFormData({ ...playerStats });
        } else {
          // Fallback to basic player data if no stats found
          setFormData({ ...item });
        }
      } catch (error) {
        console.error('Failed to load player stats:', error);
        setFormData({ ...item });
      } finally {
        setLoading(false);
      }
    } else {
      setFormData({ ...item });
    }
  };

  const handleSave = async () => {
    if (!formData || editingItem === null) return;
    
    try {
      setLoading(true);
      const currentData = getCurrentData();
      const itemToUpdate = currentData[editingItem];
      
      switch (activeTab) {
        case 'players':
          await apiService.updatePlayer(itemToUpdate.id, formData);
          await loadPlayers();
          break;
        case 'teams':
          await apiService.updateTeam(itemToUpdate.id, formData);
          await loadTeams();
          break;
        case 'standings':
          await apiService.updateStanding(itemToUpdate.id, formData);
          await loadStandings();
          break;
        case 'schedule':
          await apiService.updateGame(itemToUpdate.id, formData);
          await loadGames();
          break;
        case 'gameStats':
          console.log('Game stats update not yet implemented');
          break;
        case 'gameResults':
          await apiService.updatePlayerGameStats(itemToUpdate.id, formData);
          await loadGameResults();
          break;
        case 'powerRankings':
          await apiService.updatePowerRanking(itemToUpdate.id, formData);
          await loadPowerRankings();
          break;
        default:
          console.log(`Update operation not implemented for ${activeTab}`);
      }
      
      setEditingItem(null);
      setFormData({});
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error(`Failed to update ${activeTab}:`, error);
      setError(`Failed to update ${activeTab}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      setLoading(true);
      const currentData = getCurrentData();
      const itemToDelete = currentData[index];
      
      switch (activeTab) {
        case 'players':
          await apiService.deletePlayer(itemToDelete.id);
          await loadPlayers();
          break;
        case 'teams':
          await apiService.deleteTeam(itemToDelete.id);
          await loadTeams();
          break;
        case 'standings':
          await apiService.deleteStanding(itemToDelete.id);
          await loadStandings();
          break;
        case 'schedule':
          await apiService.deleteGame(itemToDelete.id);
          await loadGames();
          break;
        case 'gameStats':
          console.log('Game stats deletion not yet implemented');
          break;
        case 'gameResults':
          await apiService.deletePlayerGameStats(itemToDelete.id);
          await loadGameResults();
          break;
        case 'powerRankings':
          await apiService.deletePowerRanking(itemToDelete.id);
          await loadPowerRankings();
          break;
        default:
          console.log(`Delete operation not implemented for ${activeTab}`);
      }
      
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error(`Failed to delete ${activeTab}:`, error);
      setError(`Failed to delete ${activeTab}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({});
    setShowAddForm(false);
  };

  const toggleWeekCollapse = (week) => {
    const newCollapsedWeeks = new Set(collapsedWeeks);
    if (newCollapsedWeeks.has(week)) {
      newCollapsedWeeks.delete(week);
    } else {
      newCollapsedWeeks.add(week);
    }
    setCollapsedWeeks(newCollapsedWeeks);
  };

  const handleManageGameStats = async (game) => {
    setSelectedGame(game);
    setShowGameStatsModal(true);
    
    // Load team rosters
    try {
      const [homeRosterData, awayRosterData] = await Promise.all([
        apiService.getRosterMembershipsByTeamSeason(game.home_team_season_id),
        apiService.getRosterMembershipsByTeamSeason(game.away_team_season_id)
      ]);
      setHomeRoster(homeRosterData || []);
      setAwayRoster(awayRosterData || []);
    } catch (error) {
      console.error('Failed to load team rosters:', error);
      setHomeRoster([]);
      setAwayRoster([]);
    }
  };

  const handleCloseGameStatsModal = () => {
    setSelectedGame(null);
    setShowGameStatsModal(false);
    setHomeRoster([]);
    setAwayRoster([]);
    setEditingPlayerStat(null);
    setPlayerStatFormData({});
    setShowAddPlayerStatForm(false);
    setAddingStatForTeam(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Player Stats Management Functions
  const handleAddPlayerStat = (teamType, teamSeasonId) => {
    setAddingStatForTeam({ type: teamType, teamSeasonId });
    setPlayerStatFormData({
      game_id: selectedGame.id,
      player_id: null,
      team_season_id: teamSeasonId,
      points: 0,
      goals: 0,
      assists: 0,
      saves: 0,
      shots: 0,
      mvps: 0,
      demos: 0,
      epic_saves: 0
    });
    setShowAddPlayerStatForm(true);
  };

  const handleEditPlayerStat = (stat, index) => {
    setEditingPlayerStat(stat);
    setPlayerStatFormData({ ...stat });
  };

  const handleSavePlayerStat = async () => {
    try {
      setLoading(true);
      
      if (editingPlayerStat) {
        // Update existing stat
        await apiService.updatePlayerGameStats(editingPlayerStat.id, playerStatFormData);
      } else {
        // Create new stat
        await apiService.createPlayerGameStats(playerStatFormData);
      }
      
      // Reload game results to refresh stats
      await loadGameResults();
      
      // Reset form state
      setEditingPlayerStat(null);
      setPlayerStatFormData({});
      setShowAddPlayerStatForm(false);
      setAddingStatForTeam(null);
      
      setError('');
    } catch (error) {
      console.error('Failed to save player stat:', error);
      setError('Failed to save player stat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayerStat = async (statId) => {
    if (!window.confirm('Are you sure you want to delete this player stat?')) return;
    
    try {
      setLoading(true);
      await apiService.deletePlayerGameStats(statId);
      await loadGameResults();
      setError('');
    } catch (error) {
      console.error('Failed to delete player stat:', error);
      setError('Failed to delete player stat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPlayerStat = () => {
    setEditingPlayerStat(null);
    setPlayerStatFormData({});
    setShowAddPlayerStatForm(false);
    setAddingStatForTeam(null);
  };

  const handlePlayerStatFormChange = (field, value) => {
    setPlayerStatFormData(prev => ({ ...prev, [field]: value }));
  };

  // Player Slug Modal Functions
  const handlePlayerClick = async (player, game) => {
    setSelectedPlayer(player);
    setSelectedPlayerGame(game);
    setLoading(true);
    
    try {
      // Try to get existing stats for this player and game
      const existingStats = await apiService.getPlayerGameStat(player.player_id, game.id);
      
      if (existingStats) {
        setPlayerStatsData(existingStats);
        setIsPlayerStatsNew(false);
      } else {
        // This should not happen as API should return existing stats
        throw new Error('Unexpected empty response');
      }
      
      setShowPlayerStatsModal(true);
    } catch (error) {
      console.error('Failed to load player stats:', error);
      
      // If 404 or any error, create new stats entry (expected behavior for new records)
      // Determine team_season_id based on roster membership, not existing stats
      console.log('Determining team for player:', player);
      console.log('Home roster:', homeRoster.map(r => ({ player_id: r.player_id, team_season_id: r.team_season_id })));
      console.log('Away roster:', awayRoster.map(r => ({ player_id: r.player_id, team_season_id: r.team_season_id })));
      console.log('Game team_season_ids:', { home: game.home_team_season_id, away: game.away_team_season_id });
      
      const isHomeTeamPlayer = homeRoster.some(r => r.player_id === player.player_id);
      const isAwayTeamPlayer = awayRoster.some(r => r.player_id === player.player_id);
      
      console.log('Team membership:', { isHomeTeamPlayer, isAwayTeamPlayer });
      
      let teamSeasonId;
      if (isHomeTeamPlayer) {
        teamSeasonId = game.home_team_season_id;
      } else if (isAwayTeamPlayer) {
        teamSeasonId = game.away_team_season_id;
      } else {
        // Fallback - this shouldn't happen if rosters are set up correctly
        console.error('Player not found in either team roster:', player);
        teamSeasonId = game.home_team_season_id; // Default to home team
      }
      
      console.log('Assigned team_season_id:', teamSeasonId);
        
      setPlayerStatsData({
        game_id: game.id,
        player_id: player.player_id,
        team_season_id: teamSeasonId,
        points: 0,
        goals: 0,
        assists: 0,
        saves: 0,
        shots: 0,
        mvps: 0,
        demos: 0,
        epic_saves: 0,
        player_name: player.player_name,
        gamertag: player.gamertag
      });
      setIsPlayerStatsNew(true);
      setShowPlayerStatsModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePlayerStatsModal = () => {
    setSelectedPlayer(null);
    setSelectedPlayerGame(null);
    setShowPlayerStatsModal(false);
    setPlayerStatsData(null);
    setIsPlayerStatsNew(false);
  };

  const handleSavePlayerStats = async () => {
    if (!playerStatsData) return;
    
    try {
      setLoading(true);
      
      if (isPlayerStatsNew) {
        await apiService.createPlayerGameStats(playerStatsData);
      } else {
        await apiService.updatePlayerGameStats(playerStatsData.id, playerStatsData);
      }
      
      // Reload game results to refresh stats and get updated data
      await loadGameResults();
      
      // The selectedGame will be updated when the modal is opened again
      // or we can keep the modal open and it will show updated data
      handleClosePlayerStatsModal();
      setError('');
    } catch (error) {
      console.error('Failed to save player stats:', error);
      setError('Failed to save player stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerStatsChange = (field, value) => {
    setPlayerStatsData(prev => ({ ...prev, [field]: value }));
  };

  const renderFormField = (field, value, type = "text") => {
    const isTextarea = field === "reasoning" || field === "players";
    const isColor = field.includes("Color");
    const isNumber = ["rank", "week", "gamesPlayed", "points", "goals", "assists", "saves", "shots", "mvps", "demos", "epicSaves", "wins", "losses", "pointsFor", "pointsAgainst", "total_points", "total_goals", "total_assists", "total_saves", "total_shots", "total_mvps", "total_demos", "total_epic_saves", "games_played", "avg_points_per_game", "avg_goals_per_game", "avg_saves_per_game", "id", "season_id", "team_season_id", "home_team_season_id", "away_team_season_id", "home_score", "away_score"].includes(field);

    if (isTextarea) {
      return (
        <textarea
          value={value || ""}
          onChange={(e) => handleFormChange(field, e.target.value)}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full h-24 resize-none"
          rows={3}
        />
      );
    }

    if (isColor) {
      return (
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => handleFormChange(field, e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-gray-500"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => handleFormChange(field, e.target.value)}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white flex-1"
          />
        </div>
      );
    }

    let stepValue;
    if (isNumber) {
      stepValue = field.includes("Percent") ? "0.1" : "1";
    }

    return (
      <input
        type={isNumber ? "number" : type}
        value={value ?? ""}
        onChange={(e) => {
          if (isNumber) {
            const inputValue = e.target.value;
            if (inputValue === "" || inputValue === null) {
              handleFormChange(field, null);
            } else {
              const numValue = field.includes("Percent") || field === "ppg" || field === "gpg" || field === "apg" || field === "svpg" 
                ? parseFloat(inputValue) 
                : parseInt(inputValue);
              handleFormChange(field, isNaN(numValue) ? null : numValue);
            }
          } else {
            handleFormChange(field, e.target.value);
          }
        }}
        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
        className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
        step={stepValue}
      />
    );
  };

  const renderDataTable = () => {
    const currentData = getCurrentData();
    if (!currentData || currentData.length === 0) {
      return (
        <div className="bg-gray-800/90 border border-gray-600 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Data Available</h3>
          <p className="text-gray-300">Start by adding your first entry using the button above.</p>
        </div>
      );
    }

    // Get all possible keys from all objects to ensure consistent columns
    const allKeys = [...new Set(currentData.flatMap(item => Object.keys(item)))];
    
    // Filter out technical columns for schedule tab
    const filteredKeys = activeTab === "schedule" 
      ? allKeys.filter(key => !["id", "season_id", "home_team_season_id", "away_team_season_id", "home_score", "away_score"].includes(key))
      : allKeys;

    // Show loading state
    const isCurrentTabLoading = loadingStates[activeTab === 'schedule' ? 'schedule' : 
                                              activeTab === 'gameStats' ? 'gameStats' :
                                              activeTab === 'gameResults' ? 'gameResults' : activeTab];

    return (
      <div className="bg-gray-800/90 border border-gray-600 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Data Table
            {(loading || isCurrentTabLoading) && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            )}
          </h3>
          <p className="text-sm text-gray-300 mt-1">Click edit to modify entries</p>
        </div>
        
        {(loading || isCurrentTabLoading) ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading {activeTab} data...</p>
            </div>
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">No {activeTab} data available</p>
              <p className="text-gray-500 text-sm">
                {selectedSeason ? 'Try selecting a different season' : 'Select a season to view data'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-600">
              <tr>
                {filteredKeys.map((key) => (
                  <th key={key} className="px-4 py-3 text-left font-bold text-white border-r border-white/5 last:border-r-0">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-bold text-white w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => {
                const itemKey = item.id || item.player || item.team || item.rank || `admin-item-${Date.now()}-${Math.random()}`;
                return (
                  <tr key={itemKey} className="border-b border-gray-600 hover:bg-gray-700/50 transition-all duration-300">
                    {filteredKeys.map((key) => {
                      const value = item[key];
                      let displayValue;
                      
                      if (key.includes("Color")) {
                        displayValue = (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border-2 border-gray-400" style={{ backgroundColor: value }} />
                            <span className="text-xs">{value}</span>
                          </div>
                        );
                      } else if (Array.isArray(value)) {
                        displayValue = <div className="text-xs">Array ({value.length} items)</div>;
                      } else if (typeof value === "object" && value !== null) {
                        displayValue = <div className="text-xs">Object</div>;
                      } else if (value === null || value === undefined) {
                        displayValue = <span className="text-gray-500 italic">null</span>;
                      } else {
                        const className = typeof value === "number" ? "font-mono" : "";
                        displayValue = <span className={className}>{String(value)}</span>;
                      }

                      return (
                        <td key={`${itemKey}-${key}`} className="px-4 py-3 text-gray-300 border-r border-gray-600/50 last:border-r-0">
                          {displayValue}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item, index)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-all duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    );
  };

  const renderGameResultsTable = () => {
    if (!gameResultsData || gameResultsData.length === 0) {
      return (
        <div className="bg-gray-800/90 border border-gray-600 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🏒</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Game Results Available</h3>
          <p className="text-gray-300">Start by adding player stats to completed games.</p>
        </div>
      );
    }

    // Group games by week
    const gamesByWeek = gameResultsData.reduce((acc, game) => {
      const week = game.week;
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(game);
      return acc;
    }, {});

    // Sort weeks in ascending order
    const sortedWeeks = Object.keys(gamesByWeek).sort((a, b) => parseInt(a) - parseInt(b));

    return (
      <div className="space-y-4">
        {sortedWeeks.map(week => {
          const weekNumber = parseInt(week);
          const isCollapsed = collapsedWeeks.has(weekNumber);
          const weekGames = gamesByWeek[week];
          
          return (
            <div key={week} className="bg-gray-800/90 border border-gray-600 rounded-2xl overflow-hidden">
              {/* Week Header - Collapsible */}
              <button
                onClick={() => toggleWeekCollapse(weekNumber)}
                className="w-full bg-gradient-to-r from-red-600/20 via-orange-500/20 to-yellow-400/20 px-6 py-4 border-b border-gray-600 hover:from-red-600/30 hover:via-orange-500/30 hover:to-yellow-400/30 transition-all duration-200"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {isCollapsed ? '▶️' : '🔽'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white text-left">
                        Week {weekNumber}
                      </h3>
                      <p className="text-gray-300 text-left">
                        {weekGames.length} game{weekGames.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    {isCollapsed ? 'Click to expand' : 'Click to collapse'}
                  </div>
                </div>
              </button>

              {/* Week Games - Collapsible Content */}
              {!isCollapsed && (
                <div className="space-y-4 p-6">
                  {weekGames.map((game, gameIndex) => (
                    <div key={game.id} className="bg-gray-700/30 border border-gray-500/30 rounded-xl overflow-hidden">
                      {/* Individual Game Header */}
                      <div className="bg-gray-700/50 px-4 py-3 border-b border-gray-500/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {game.home_display} vs {game.away_display}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Game #{game.id} • {game.game_date ? new Date(game.game_date).toLocaleDateString() : 'Date TBD'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {game.total_home_goals || 0} - {game.total_away_goals || 0}
                            </div>
                            <div className="text-xs text-gray-400">
                              Final Score
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Teams and Player Stats */}
                      <div className="p-3 sm:p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          
                          {/* Home Team */}
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <h5 className="text-lg font-bold text-white mb-3 text-center">
                              🏠 {game.home_display}
                            </h5>
                            {game.home_team_stats.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-500">
                                      <th className="text-left py-2 text-gray-300">Player</th>
                                      <th className="text-center py-2 text-gray-300">PTS</th>
                                      <th className="text-center py-2 text-gray-300">G</th>
                                      <th className="text-center py-2 text-gray-300">A</th>
                                      <th className="text-center py-2 text-gray-300">S</th>
                                      <th className="text-center py-2 text-gray-300">SH</th>
                                      <th className="text-center py-2 text-gray-300">MVP</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {game.home_team_stats.map((stat, statIndex) => (
                                      <tr key={stat.id} className="border-b border-gray-500/30 hover:bg-gray-500/20">
                                        <td className="py-1 text-white font-medium">{stat.player_name}</td>
                                        <td className="text-center py-1 text-yellow-400 font-bold">{stat.points}</td>
                                        <td className="text-center py-1 text-white">{stat.goals}</td>
                                        <td className="text-center py-1 text-white">{stat.assists}</td>
                                        <td className="text-center py-1 text-white">{stat.saves}</td>
                                        <td className="text-center py-1 text-white">{stat.shots}</td>
                                        <td className="text-center py-1 text-white">{stat.mvps}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center text-gray-400 py-3 text-sm">No stats recorded</div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <h5 className="text-lg font-bold text-white mb-3 text-center">
                              ✈️ {game.away_display}
                            </h5>
                            {game.away_team_stats.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-500">
                                      <th className="text-left py-2 text-gray-300">Player</th>
                                      <th className="text-center py-2 text-gray-300">PTS</th>
                                      <th className="text-center py-2 text-gray-300">G</th>
                                      <th className="text-center py-2 text-gray-300">A</th>
                                      <th className="text-center py-2 text-gray-300">S</th>
                                      <th className="text-center py-2 text-gray-300">SH</th>
                                      <th className="text-center py-2 text-gray-300">MVP</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {game.away_team_stats.map((stat, statIndex) => (
                                      <tr key={stat.id} className="border-b border-gray-500/30 hover:bg-gray-500/20">
                                        <td className="py-1 text-white font-medium">{stat.player_name}</td>
                                        <td className="text-center py-1 text-yellow-400 font-bold">{stat.points}</td>
                                        <td className="text-center py-1 text-white">{stat.goals}</td>
                                        <td className="text-center py-1 text-white">{stat.assists}</td>
                                        <td className="text-center py-1 text-white">{stat.saves}</td>
                                        <td className="text-center py-1 text-white">{stat.shots}</td>
                                        <td className="text-center py-1 text-white">{stat.mvps}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center text-gray-400 py-3 text-sm">No stats recorded</div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => handleManageGameStats(game)}
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg text-sm"
                          >
                            ⚡ Manage Game Stats
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'gameResults') {
      return renderGameResultsTable();
    }
    
    return (
      <div className="space-y-6">
        {/* Data Table */}
        {renderDataTable()}
      </div>
    );
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
        <div className={`bg-[#1f1f2e] p-8 rounded-xl shadow-xl max-w-md w-full transition-transform duration-300 ${error ? 'animate-shake' : ''}`}>
          <h2 className="text-2xl font-bold text-center text-orange-400 mb-4">🔐 Admin Access</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 rounded bg-[#2a2a3d] border border-blue-900 text-white mb-3"
          />
          {error && (
            <p
              className={`text-red-500 text-sm mb-2 text-center transition-opacity duration-700 ${showError ? "opacity-100" : "opacity-0"}`}
            >
              {error}
            </p>
          )}
          <button
            onClick={handleAuth}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-executive relative page-with-navbar overflow-x-hidden">
      {/* Neural Background */}
      <div className="absolute inset-0 neural-bg opacity-20" />
      
      {/* Executive Header */}
      <div className="relative z-10 glass-dark border-b border-white/10 pt-20">
        <div className="w-full px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-4">🛠 Admin Control Center</h1>
              <p className="text-base sm:text-lg lg:text-xl text-white font-light">
                Full CRUD management for all league data and operations
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-4 py-3 text-center border border-gray-600">
                <div className="text-xl font-bold text-red-400">🔐</div>
                <div className="text-xs text-white">Secure</div>
              </div>
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-4 py-3 text-center border border-gray-600">
                <div className="text-xl font-bold text-orange-400">⚡</div>
                <div className="text-xs text-white">Live</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-600">
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {[
              { id: "gameResults", label: "🏒 GAME RESULTS", icon: "🎯", featured: true },
              { id: "players", label: "👥 Players", icon: "🏃‍♂️" },
              { id: "teams", label: "🏆 Teams", icon: "⚽" },
              { id: "standings", label: "📊 Standings", icon: "🏅" },
              { id: "schedule", label: "📅 Schedule", icon: "⏰" },
              { id: "gameStats", label: "📈 Game Stats", icon: "📋" },
              { id: "powerRankings", label: "👑 Rankings", icon: "🥇" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingItem(null);
                  setShowAddForm(false);
                  setFormData({});
                }}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? tab.featured 
                      ? "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white shadow-luxury"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-luxury"
                    : tab.featured
                      ? "bg-gradient-to-r from-red-700/50 to-orange-600/50 border-2 border-orange-400 text-orange-200 hover:from-red-600/70 hover:to-orange-500/70"
                      : "bg-gray-700/80 border border-gray-500 text-white hover:text-blue-300 hover:bg-gray-600"
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                <span className="xs:hidden sm:hidden">{tab.id === "gameResults" ? "GAMES" : tab.id.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Season Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-700/50 rounded-xl">
            <label className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg sm:text-xl">🗓️</span>
              Season:
            </label>
            <select
              value={selectedSeason || ''}
              onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
              className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-500 focus:border-blue-400 text-sm sm:text-base w-full sm:w-auto"
              disabled={loadingStates.seasons}
            >
              <option value="">Select Season...</option>
              {seasonsData.map(season => (
                <option key={season.id} value={season.id}>
                  {season.season_name} {season.is_active && '(Current)'}
                </option>
              ))}
            </select>
            {loadingStates.seasons && (
              <div className="text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              </div>
            )}
          </div>

          {/* Conference selector for standings */}
          {activeTab === "standings" && (
            <div className="mb-4">
              <div className="flex gap-2">
                {["homer", "garfield", "overall"].map((conf) => (
                  <button
                    key={conf}
                    onClick={() => setSelectedConference(conf)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedConference === conf
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {conf.charAt(0).toUpperCase() + conf.slice(1)} Conference
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add New Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              {activeTab === "standings" && ` - ${selectedConference.charAt(0).toUpperCase() + selectedConference.slice(1)} Conference`}
            </h3>
            {activeTab !== 'gameResults' && (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setFormData(getDefaultFormData());
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 shadow-luxury text-sm sm:text-base w-full sm:w-auto"
              >
                + Add New {activeTab === "standings" ? "Team" : activeTab.slice(0, -1)}
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {renderTabContent()}
      </div>

      {/* Modal for Edit and Add New - Rendered at top level */}
      {(showAddForm || editingItem !== null) && (
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4" style={{ zIndex: 9999 }}>
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCancel}
          />
          <div 
            className="relative bg-gray-800 rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault();
                handleSave();
              }
            }}
            tabIndex={-1}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingItem !== null ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(formData).map((field) => {
                  if (field === 'id') return null; // Skip ID field
                  
                  return (
                    <div key={field}>
                      <label className="block text-white font-semibold mb-2">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      {renderFormField(field, formData[field])}
                    </div>
                  );
                })}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={showAddForm ? handleAdd : handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all duration-300"
                    disabled={loading}
                  >
                    {showAddForm ? "Add" : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-bold transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Stats Management Modal */}
      {showGameStatsModal && selectedGame && (
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4" style={{ zIndex: 9999 }}>
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCloseGameStatsModal}
          />
          <div 
            className="relative bg-gray-800 rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-600"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault();
                // This modal doesn't have a single save action, so we won't auto-submit
                // But we could add specific logic if needed
              }
            }}
            tabIndex={-1}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Manage Game Stats
                </h3>
                <p className="text-gray-300">
                  Week {selectedGame.week}: {selectedGame.home_display} vs {selectedGame.away_display}
                </p>
              </div>
              <button
                onClick={handleCloseGameStatsModal}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Game Summary */}
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {selectedGame.total_home_goals || 0} - {selectedGame.total_away_goals || 0}
                  </div>
                  <div className="text-gray-300">
                    Game #{selectedGame.id} • {selectedGame.game_date ? new Date(selectedGame.game_date).toLocaleDateString() : 'Date TBD'}
                  </div>
                </div>
              </div>

              {/* Team Stats Management */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Home Team Stats */}
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-white text-center">
                      🏠 {selectedGame.home_display}
                    </h4>
                  </div>
                  
                  {/* Show current stats first */}
                  {selectedGame.home_team_stats.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-300 mb-2">Current Stats</h5>
                      <div className="space-y-2">
                        {selectedGame.home_team_stats.map((stat, index) => (
                          <div key={stat.id} className="bg-gray-600/30 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <button
                                  onClick={() => handlePlayerClick({
                                    player_id: stat.player_id,
                                    player_name: stat.player_name,
                                    gamertag: stat.gamertag
                                  }, selectedGame)}
                                  className="font-medium text-white hover:text-blue-400 hover:underline transition-colors text-left"
                                >
                                  {stat.player_name}
                                </button>
                                <div className="text-sm text-gray-300 grid grid-cols-4 gap-2 mt-1">
                                  <span>{stat.points} pts</span>
                                  <span>{stat.goals}g</span>
                                  <span>{stat.assists}a</span>
                                  <span>{stat.saves}s</span>
                                </div>
                                <div className="text-xs text-gray-400 grid grid-cols-3 gap-2 mt-1">
                                  <span>{stat.shots} sh</span>
                                  <span>{stat.mvps} mvp</span>
                                  <span>{stat.demos} demo</span>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => handleEditPlayerStat(stat, index)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePlayerStat(stat.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                                >
                                  Del
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show available players */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">
                      Team Roster ({homeRoster.length} players)
                      {homeRoster.length === 0 && <span className="text-yellow-400 ml-2">(Loading...)</span>}
                    </h5>
                    {homeRoster.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {homeRoster.map((player, index) => {
                          const hasStats = selectedGame.home_team_stats.some(stat => stat.player_id === player.player_id);
                          return (
                            <div
                              key={player.player_id || index}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Clicked home team player:', player);
                                handlePlayerClick({
                                  player_id: player.player_id,
                                  player_name: player.player_name,
                                  gamertag: player.gamertag
                                }, selectedGame);
                              }}
                              className={`text-sm px-3 py-2 rounded-lg flex justify-between items-center transition-all duration-200 hover:scale-[1.02] w-full cursor-pointer border select-none ${
                                hasStats 
                                  ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30 border-green-500/30' 
                                  : 'bg-gray-600/20 text-gray-300 hover:bg-blue-600/30 hover:text-blue-300 border-gray-500/30'
                              }`}
                              style={{ userSelect: 'none' }}
                            >
                              <span className="font-medium pointer-events-none">{player.player_name}</span>
                              <span className="text-lg pointer-events-none">{hasStats ? '✅' : '➕'}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-yellow-400 py-4 bg-gray-700/20 rounded-lg">
                        <div className="text-xl mb-2">⚠️</div>
                        <div className="text-sm">No roster data available</div>
                        <div className="text-xs text-gray-400 mt-1">Check team_seasons and roster_memberships tables</div>
                      </div>
                    )}
                  </div>
                  
                  {homeRoster.length === 0 && selectedGame.home_team_stats.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      No roster or stats available
                    </div>
                  )}
                </div>

                {/* Away Team Stats */}
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-white text-center">
                      ✈️ {selectedGame.away_display}
                    </h4>
                  </div>
                  
                  {/* Show current stats first */}
                  {selectedGame.away_team_stats.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-300 mb-2">Current Stats</h5>
                      <div className="space-y-2">
                        {selectedGame.away_team_stats.map((stat, index) => (
                          <div key={stat.id} className="bg-gray-600/30 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <button
                                  onClick={() => handlePlayerClick({
                                    player_id: stat.player_id,
                                    player_name: stat.player_name,
                                    gamertag: stat.gamertag
                                  }, selectedGame)}
                                  className="font-medium text-white hover:text-blue-400 hover:underline transition-colors text-left"
                                >
                                  {stat.player_name}
                                </button>
                                <div className="text-sm text-gray-300 grid grid-cols-4 gap-2 mt-1">
                                  <span>{stat.points} pts</span>
                                  <span>{stat.goals}g</span>
                                  <span>{stat.assists}a</span>
                                  <span>{stat.saves}s</span>
                                </div>
                                <div className="text-xs text-gray-400 grid grid-cols-3 gap-2 mt-1">
                                  <span>{stat.shots} sh</span>
                                  <span>{stat.mvps} mvp</span>
                                  <span>{stat.demos} demo</span>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => handleEditPlayerStat(stat, index)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePlayerStat(stat.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                                >
                                  Del
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show available players */}
                  {awayRoster.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-2">Team Roster ({awayRoster.length} players)</h5>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {awayRoster.map((player, index) => {
                          const hasStats = selectedGame.away_team_stats.some(stat => stat.player_id === player.player_id);
                          return (
                            <div
                              key={player.player_id || index}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Clicked away team player:', player);
                                handlePlayerClick({
                                  player_id: player.player_id,
                                  player_name: player.player_name,
                                  gamertag: player.gamertag
                                }, selectedGame);
                              }}
                              className={`text-sm px-3 py-2 rounded-lg flex justify-between items-center transition-all duration-200 hover:scale-[1.02] w-full cursor-pointer border select-none ${
                                hasStats 
                                  ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30 border-green-500/30' 
                                  : 'bg-gray-600/20 text-gray-300 hover:bg-blue-600/30 hover:text-blue-300 border-gray-500/30'
                              }`}
                              style={{ userSelect: 'none' }}
                            >
                              <span className="font-medium pointer-events-none">{player.player_name}</span>
                              <span className="text-lg pointer-events-none">{hasStats ? '✅' : '➕'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {awayRoster.length === 0 && selectedGame.away_team_stats.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      No roster or stats available
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={handleCloseGameStatsModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-bold transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Stats Form Modal */}
      {(showAddPlayerStatForm || editingPlayerStat) && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCancelPlayerStat}
          />
          <div className="relative bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingPlayerStat ? 'Edit Player Stats' : `Add Player Stats - ${addingStatForTeam?.type === 'home' ? selectedGame?.home_display : selectedGame?.away_display}`}
              </h3>
              <button
                onClick={handleCancelPlayerStat}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Saving stats...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Player Selection (only for new stats) */}
                {!editingPlayerStat && (
                  <div>
                    <label className="block text-white font-semibold mb-2">Player</label>
                    <select
                      value={playerStatFormData.player_id || ''}
                      onChange={(e) => handlePlayerStatFormChange('player_id', parseInt(e.target.value))}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      required
                    >
                      <option value="">Select Player...</option>
                      {(addingStatForTeam?.type === 'home' ? homeRoster : awayRoster).map(player => (
                        <option key={player.player_id} value={player.player_id}>
                          {player.player_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Stats Input Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Points</label>
                    <input
                      type="number"
                      value={playerStatFormData.points ?? 0}
                      onChange={(e) => handlePlayerStatFormChange('points', parseInt(e.target.value) || 0)}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Goals</label>
                    <input
                      type="number"
                      value={playerStatFormData.goals ?? 0}
                      onChange={(e) => handlePlayerStatFormChange('goals', parseInt(e.target.value) || 0)}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Assists</label>
                    <input
                      type="number"
                      value={playerStatFormData.assists ?? 0}
                      onChange={(e) => handlePlayerStatFormChange('assists', parseInt(e.target.value) || 0)}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Saves</label>
                    <input
                      type="number"
                      value={playerStatFormData.saves ?? 0}
                      onChange={(e) => handlePlayerStatFormChange('saves', parseInt(e.target.value) || 0)}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Shots</label>
                    <input
                      type="number"
                      value={playerStatFormData.shots ?? 0}
                      onChange={(e) => handlePlayerStatFormChange('shots', parseInt(e.target.value) || 0)}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">MVPs</label>
                    <input
                      type="number"
                      value={playerStatFormData.mvps ?? 0}
                      onChange={(e) => handlePlayerStatFormChange('mvps', parseInt(e.target.value) || 0)}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Demos</label>
                    <input
                      type="number"
                      value={playerStatFormData.demos ?? 0}
                      onChange={(e) => handlePlayerStatFormChange('demos', parseInt(e.target.value) || 0)}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Epic Saves</label>
                    <input
                      type="number"
                      value={playerStatFormData.epic_saves ?? 0}
                      onChange={(e) => handlePlayerStatFormChange('epic_saves', parseInt(e.target.value) || 0)}
                      className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
                      min="0"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSavePlayerStat}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all duration-300"
                    disabled={loading || (!editingPlayerStat && !playerStatFormData.player_id)}
                  >
                    {editingPlayerStat ? 'Update Stats' : 'Add Stats'}
                  </button>
                  <button
                    onClick={handleCancelPlayerStat}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-bold transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Player Stats Modal */}
      {showPlayerStatsModal && selectedPlayer && selectedPlayerGame && playerStatsData && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001 }}>
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClosePlayerStatsModal}
          />
          <div 
            className="relative bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-600"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault();
                handleSavePlayerStats();
              }
            }}
            tabIndex={-1}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedPlayer.player_name}</h3>
                <p className="text-sm text-gray-400">Week {selectedPlayerGame.week} • Game #{selectedPlayerGame.id}</p>
              </div>
              <button
                onClick={handleClosePlayerStatsModal}
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Saving stats...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Input Grid */}
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Points</label>
                      <input
                        type="number"
                        value={playerStatsData.points === 0 ? '' : playerStatsData.points || ''}
                        onChange={(e) => handlePlayerStatsChange('points', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white w-full text-center"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Goals</label>
                      <input
                        type="number"
                        value={playerStatsData.goals === 0 ? '' : playerStatsData.goals || ''}
                        onChange={(e) => handlePlayerStatsChange('goals', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white w-full text-center"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Assists</label>
                      <input
                        type="number"
                        value={playerStatsData.assists === 0 ? '' : playerStatsData.assists || ''}
                        onChange={(e) => handlePlayerStatsChange('assists', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white w-full text-center"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Saves</label>
                      <input
                        type="number"
                        value={playerStatsData.saves === 0 ? '' : playerStatsData.saves || ''}
                        onChange={(e) => handlePlayerStatsChange('saves', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white w-full text-center"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Shots</label>
                      <input
                        type="number"
                        value={playerStatsData.shots === 0 ? '' : playerStatsData.shots || ''}
                        onChange={(e) => handlePlayerStatsChange('shots', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white w-full text-center"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">MVPs</label>
                      <input
                        type="number"
                        value={playerStatsData.mvps === 0 ? '' : playerStatsData.mvps || ''}
                        onChange={(e) => handlePlayerStatsChange('mvps', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white w-full text-center"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Demos</label>
                      <input
                        type="number"
                        value={playerStatsData.demos === 0 ? '' : playerStatsData.demos || ''}
                        onChange={(e) => handlePlayerStatsChange('demos', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white w-full text-center"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Epic Saves</label>
                      <input
                        type="number"
                        value={playerStatsData.epic_saves === 0 ? '' : playerStatsData.epic_saves || ''}
                        onChange={(e) => handlePlayerStatsChange('epic_saves', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white w-full text-center"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSavePlayerStats}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex-1"
                    disabled={loading}
                  >
                    {isPlayerStatsNew ? 'Save' : 'Update'}
                  </button>
                  <button
                    onClick={handleClosePlayerStatsModal}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
