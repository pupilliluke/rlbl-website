import React, { useState, useEffect } from "react";
import { apiService } from "../../services/apiService";

// Components
import AdminAuth from "./components/AdminAuth";
import DataTable from "./components/DataTable";
import GameResultsTable from "./components/GameResultsTable";
import EditFormModal from "./modals/EditFormModal";
import GameEditModal from "./modals/GameEditModal";

// Utils
import { renderFormField, getDefaultFormData } from "./utils/formUtils";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
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
  const [collapsedSeries, setCollapsedSeries] = useState(new Set());
  const [hasInitializedCollapse, setHasInitializedCollapse] = useState(false);
  
  // Game Edit Modal states
  const [showGameEditModal, setShowGameEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  // Auto-collapse all weeks only on initial load, preserve state on subsequent loads
  useEffect(() => {
    if (gameResultsData && gameResultsData.length > 0) {
      const allWeeks = [...new Set(gameResultsData.map(game => game.week))];
      
      if (!hasInitializedCollapse) {
        // First load - collapse all weeks
        console.log('Initial load - collapsing all weeks:', allWeeks);
        setCollapsedWeeks(new Set(allWeeks));
        setHasInitializedCollapse(true);
      } else {
        // Subsequent loads - preserve existing collapse state, but ensure new weeks are added
        setCollapsedWeeks(prevCollapsed => {
          const newCollapsed = new Set(prevCollapsed);
          
          // Add any new weeks that didn't exist before to collapsed state  
          allWeeks.forEach(week => {
            if (!prevCollapsed.has(week)) {
              // This is a new week, collapse it by default
              newCollapsed.add(week);
            }
          });
          
          console.log('Data reload - preserving collapse state. Previous:', Array.from(prevCollapsed), 'New:', Array.from(newCollapsed));
          return newCollapsed;
        });
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
  }, [authenticated]);

  // Load initial data for the selected season when season changes
  useEffect(() => {
    if (authenticated && selectedSeason) {
      loadAllData();
    }
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
      loadStandings(),
      loadGames(),
      loadPowerRankings(),
      loadStats(),
      loadGameResults()
    ]);
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
      const [games, players, playerGameStats] = await Promise.all([
        apiService.getGames(selectedSeason.id),
        apiService.getPlayers(),
        apiService.getPlayerGameStats(selectedSeason.id)
      ]);

      const gameResults = games.map(game => {
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
      case 'teams': return teamsData;
      case 'standings': return standingsData[selectedConference] || [];
      case 'schedule': return scheduleData;
      case 'gameStats': return gameStatsData;
      case 'gameResults': return gameResultsData;
      case 'powerRankings': return powerRankingsData;
      default: return [];
    }
  };

  const setCurrentData = (newData) => {
    switch (activeTab) {
      case 'players':
        setPlayersData(newData);
        break;
      case 'teams':
        setTeamsData(newData);
        break;
      case 'standings':
        setStandingsData(prev => ({ ...prev, [selectedConference]: newData }));
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
          newItem = await apiService.createTeam({ ...formData, season_id: selectedSeason.id });
          break;
        case 'standings':
          newItem = await apiService.createTeamSeason(formData);
          break;
        case 'schedule':
          newItem = await apiService.createGame(formData);
          break;
        case 'gameStats':
          newItem = await apiService.createPlayerGameStats(formData);
          break;
        case 'powerRankings':
          newItem = await apiService.createPowerRanking(formData);
          break;
        default:
          throw new Error(`Add not implemented for ${activeTab}`);
      }
      
      const currentData = getCurrentData();
      setCurrentData([...currentData, newItem]);
      setFormData(getDefaultFormData(activeTab));
      setShowAddForm(false);
      
      // Reload data to ensure consistency
      switch (activeTab) {
        case 'standings': await loadStandings(); break;
        case 'schedule': await loadGames(); break;
        default: break;
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
        default:
          throw new Error(`Update not implemented for ${activeTab}`);
      }
      
      const currentData = getCurrentData();
      const newData = [...currentData];
      newData[editingItem] = updatedItem;
      setCurrentData(newData);
      
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error(`Failed to save ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableDelete = async (index) => {
    const currentData = getCurrentData();
    const item = currentData[index];
    
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'players':
          await apiService.deletePlayer(item.id);
          break;
        case 'teams':
          await apiService.deleteTeam(item.id);
          break;
        case 'standings':
          await apiService.deleteTeamSeason(item.id);
          break;
        case 'schedule':
          await apiService.deleteGame(item.id);
          break;
        case 'gameStats':
          await apiService.deletePlayerGameStats(item.id);
          break;
        case 'powerRankings':
          await apiService.deletePowerRanking(item.id);
          break;
        default:
          throw new Error(`Delete not implemented for ${activeTab}`);
      }
      
      const newData = currentData.filter((_, i) => i !== index);
      setCurrentData(newData);
    } catch (error) {
      console.error(`Failed to delete ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
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

  const handleManageGameStats = async (game) => {
    // Direct game deletion
    if (!window.confirm(`Are you sure you want to delete Game ${game.series_game || 1} between ${game.home_display} and ${game.away_display}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteGame(game.id);
      await loadGameResults();
    } catch (error) {
      console.error('Failed to delete game:', error);
      alert('Failed to delete game. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleGameEditDelete = async () => {
    if (!editingGame) return;
    
    if (!window.confirm(`Are you sure you want to delete Game ${editingGame.series_game || 1} between ${editingGame.home_display} and ${editingGame.away_display}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteGame(editingGame.id);
      await loadGameResults();
      setShowGameEditModal(false);
      setEditingGame(null);
    } catch (error) {
      console.error('Failed to delete game:', error);
      alert('Failed to delete game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) {
      alert('Cannot delete: No item selected');
      return;
    }

    let confirmMessage = '';
    let deleteFunction = null;

    switch (activeTab) {
      case 'players':
        confirmMessage = `Are you sure you want to delete player "${formData.display_name || formData.player_name}"? This action cannot be undone.`;
        deleteFunction = () => apiService.deletePlayer(formData.id);
        break;
      case 'teams':
        confirmMessage = `Are you sure you want to delete team "${formData.display_name || formData.team_name}"? This action cannot be undone.`;
        deleteFunction = () => apiService.deleteTeam(formData.id);
        break;
      case 'schedule':
      case 'gameResults':
        confirmMessage = `Are you sure you want to delete Game ${formData.series_game || 1} between ${formData.home_display} and ${formData.away_display}? This action cannot be undone.`;
        deleteFunction = () => apiService.deleteGame(formData.id);
        break;
      case 'standings':
        confirmMessage = `Are you sure you want to delete this standing entry? This action cannot be undone.`;
        deleteFunction = () => apiService.deleteStanding(formData.id);
        break;
      case 'powerRankings':
        confirmMessage = `Are you sure you want to delete this power ranking entry? This action cannot be undone.`;
        deleteFunction = () => apiService.deletePowerRanking(formData.id);
        break;
      case 'gameStats':
        confirmMessage = `Are you sure you want to delete this game stat entry? This action cannot be undone.`;
        deleteFunction = () => apiService.deletePlayerGameStats(formData.id);
        break;
      default:
        alert('Delete not supported for this item type');
        return;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await deleteFunction();
      
      // Reload the appropriate data
      switch (activeTab) {
        case 'players':
          await loadAllData();
          break;
        case 'teams':
          await loadAllData();
          break;
        case 'schedule':
        case 'gameResults':
          await loadGameResults();
          break;
        case 'standings':
          await loadStandings();
          break;
        case 'powerRankings':
          await loadPowerRankings();
          break;
        case 'gameStats':
          await loadStats();
          break;
      }

      // Close modal
      handleCancel();
      
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
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

      // Create multiple games
      for (let i = 0; i < numGames; i++) {
        await apiService.createSeriesGame(gameData);
      }
      
      await loadGameResults();
      
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
          apiService={apiService}
        />
      );
    }
    
    return (
      <div className="space-y-6">
        <DataTable
          activeTab={activeTab}
          currentData={getCurrentData()}
          loading={loading}
          loadingStates={loadingStates}
          selectedSeason={selectedSeason}
          onEdit={handleEdit}
          onDelete={handleTableDelete}
        />
      </div>
    );
  };

  if (!authenticated) {
    return <AdminAuth onAuthenticated={setAuthenticated} />;
  }

  const currentData = getCurrentData();
  const currentKeys = currentData.length > 0 
    ? Object.keys(currentData[0]).filter(key => 
        !key.includes('id') && 
        key !== 'id' &&
        key !== 'total_home_goals' &&
        key !== 'total_away_goals'
      )
    : [];

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
                  {seasonsData.map(season => (
                    <option key={season.id} value={season.id} className="bg-gray-800">
                      {season.name}
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
                { key: 'players', label: '👥 Players', icon: '👥' },
                { key: 'teams', label: '🛡️ Teams', icon: '🛡️' },
                { key: 'standings', label: '📊 Standings', icon: '📊' },
                { key: 'schedule', label: '📅 Schedule', icon: '📅' },
                { key: 'gameStats', label: '📈 Game Stats', icon: '📈' },
                { key: 'powerRankings', label: '👑 Power Rankings', icon: '👑' }
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
                    <span className="text-base sm:text-lg">{icon}</span>
                    <span className="hidden sm:inline">{label.split(' ').slice(1).join(' ')}</span>
                    <span className="sm:hidden">{label.split(' ')[1] || label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800/90 border-l border-r border-b border-gray-600 rounded-b-2xl p-6">
            {/* Conference Selector for Standings */}
            {activeTab === 'standings' && (
              <div className="mb-6 flex justify-center">
                <div className="bg-gray-700 rounded-lg p-1 flex">
                  {['homer', 'garfield', 'overall'].map((conf) => (
                    <button
                      key={conf}
                      onClick={() => setSelectedConference(conf)}
                      className={`px-4 py-2 rounded font-bold transition-all duration-300 ${
                        selectedConference === conf
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {conf.charAt(0).toUpperCase() + conf.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Button (except for game results) */}
            {activeTab !== 'gameResults' && (
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white capitalize">
                  Manage {activeTab}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setFormData(getDefaultFormData(activeTab));
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2"
                >
                  <span className="text-lg">➕</span>
                  Add New
                </button>
              </div>
            )}

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
    </div>
  );
};

export default Admin;