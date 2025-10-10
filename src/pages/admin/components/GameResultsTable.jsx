import React from "react";

const MatchupForm = ({ teams, week, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = React.useState({
    homeTeamSeasonId: '',
    awayTeamSeasonId: '',
    week: week || '',
    gameDate: '',
    isPlayoffs: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.homeTeamSeasonId || !formData.awayTeamSeasonId || !formData.week) {
      alert('Please fill in all required fields');
      return;
    }
    if (formData.homeTeamSeasonId === formData.awayTeamSeasonId) {
      alert('Home and away teams cannot be the same');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Home Team *
        </label>
        <select
          value={formData.homeTeamSeasonId}
          onChange={(e) => setFormData({...formData, homeTeamSeasonId: e.target.value})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          required
        >
          <option value="">Select Home Team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.display_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Away Team *
        </label>
        <select
          value={formData.awayTeamSeasonId}
          onChange={(e) => setFormData({...formData, awayTeamSeasonId: e.target.value})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          required
        >
          <option value="">Select Away Team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.display_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Week *
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={formData.week}
          onChange={(e) => setFormData({...formData, week: e.target.value})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          required
          disabled={true}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Game Date
        </label>
        <input
          type="date"
          value={formData.gameDate}
          onChange={(e) => setFormData({...formData, gameDate: e.target.value})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-300">
          <input
            type="checkbox"
            checked={formData.isPlayoffs}
            onChange={(e) => setFormData({...formData, isPlayoffs: e.target.checked})}
            className="mr-2"
          />
          Playoffs Game
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          {loading ? 'Saving...' : 'Create Matchup'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const GameResultsTable = ({
  gameResultsData,
  collapsedWeeks,
  collapsedSeries,
  onToggleWeekCollapse,
  onToggleSeriesCollapse,
  onManageGameStats,
  onAddSeriesGame,
  onUpdateGameResults,
  apiService,
  selectedSeason
}) => {
  const [collapsedGames, setCollapsedGames] = React.useState(new Set());
  const [gamePlayersData, setGamePlayersData] = React.useState({});
  const [loadingGamePlayers, setLoadingGamePlayers] = React.useState(new Set());
  const [editingSeriesId, setEditingSeriesId] = React.useState(null);
  const [editableStats, setEditableStats] = React.useState({});
  const [savingSeriesId, setSavingSeriesId] = React.useState(null);
  const [showCreateMatchupModal, setShowCreateMatchupModal] = React.useState(false);
  const [createMatchupWeek, setCreateMatchupWeek] = React.useState(null);
  const [teams, setTeams] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [gameNotes, setGameNotes] = React.useState({});

  // Load teams data for matchup creation/editing
  React.useEffect(() => {
    const loadTeams = async () => {
      if (selectedSeason && apiService) {
        try {
          const teamsData = await apiService.getTeamSeasons(selectedSeason.id);
          setTeams(teamsData);
        } catch (error) {
          console.error('Failed to load teams:', error);
        }
      }
    };
    loadTeams();
  }, [selectedSeason, apiService]);

  const handleCreateMatchup = (weekNumber) => {
    setCreateMatchupWeek(weekNumber);
    setShowCreateMatchupModal(true);
  };

  const handleDeleteMatchup = async (seriesGames) => {
    const firstGame = seriesGames[0];
    const matchupName = `${firstGame.home_display} vs ${firstGame.away_display}`;

    if (!window.confirm(`Are you sure you want to delete the entire matchup "${matchupName}" in Week ${firstGame.week}? This will delete all ${seriesGames.length} game(s) in this series. This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);

      // Delete all games in the series
      await Promise.all(seriesGames.map(game => apiService.deleteGame(game.id)));

      // Update local data
      const updatedGameResults = gameResultsData.filter(game =>
        !seriesGames.some(seriesGame => seriesGame.id === game.id)
      );
      onUpdateGameResults(updatedGameResults);

    } catch (error) {
      console.error('Failed to delete matchup:', error);
      alert('Failed to delete matchup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatchupSubmit = async (formData) => {
    try {
      setLoading(true);

      const gameData = {
        season_id: selectedSeason.id,
        home_team_season_id: parseInt(formData.homeTeamSeasonId),
        away_team_season_id: parseInt(formData.awayTeamSeasonId),
        week: createMatchupWeek,
        game_date: formData.gameDate || new Date().toISOString().split('T')[0],
        is_playoffs: formData.isPlayoffs || false
      };

      const newGame = await apiService.createGame(gameData);

      // Enhance the new game with display names
      const homeTeam = teams.find(t => t.id === parseInt(formData.homeTeamSeasonId));
      const awayTeam = teams.find(t => t.id === parseInt(formData.awayTeamSeasonId));

      const enhancedGame = {
        ...newGame,
        home_display: homeTeam?.display_name || 'Unknown Team',
        away_display: awayTeam?.display_name || 'Unknown Team',
        home_team_stats: [],
        away_team_stats: [],
        total_home_goals: 0,
        total_away_goals: 0
      };

      // Update local data
      const updatedGameResults = [...gameResultsData, enhancedGame];
      onUpdateGameResults(updatedGameResults);

      setShowCreateMatchupModal(false);
      setCreateMatchupWeek(null);

    } catch (error) {
      console.error('Failed to create matchup:', error);
      alert('Failed to create matchup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGameCollapse = async (gameId) => {
    const newCollapsed = new Set(collapsedGames);
    if (newCollapsed.has(gameId)) {
      newCollapsed.delete(gameId);
    } else {
      newCollapsed.add(gameId);
      // Load player data for this game if not already loaded
      if (!gamePlayersData[gameId] && apiService) {
        await loadGamePlayerData(gameId);
      }
    }
    setCollapsedGames(newCollapsed);
  };

  const loadGamePlayerData = async (gameId) => {
    try {
      setLoadingGamePlayers(prev => new Set(prev).add(gameId));
      
      const game = gameResultsData.find(g => g.id === gameId);
      if (!game) return;

      const [allPlayers, homeRoster, awayRoster, gameStats] = await Promise.all([
        apiService.getPlayers(),
        apiService.getRosterMembershipsByTeamSeason(game.home_team_season_id),
        apiService.getRosterMembershipsByTeamSeason(game.away_team_season_id),
        apiService.getPlayerGameStatsByGame(gameId).catch(() => []) // Handle no stats gracefully
      ]);

      // Get players for each team (deduplicated)
      const homePlayerIds = [...new Set(homeRoster.map(roster => roster.player_id))];
      const awayPlayerIds = [...new Set(awayRoster.map(roster => roster.player_id))];

      const homePlayers = allPlayers.filter(player =>
        homePlayerIds.includes(player.id)
      );
      const awayPlayers = allPlayers.filter(player =>
        awayPlayerIds.includes(player.id)
      );

      // Merge player info with their game stats
      const homePlayersWithStats = homePlayers.map(player => ({
        ...player,
        stats: gameStats.find(stat => stat.player_id === player.id) || {
          goals: 0, assists: 0, saves: 0, shots: 0, 
          epic_saves: 0, demos: 0, otg: 0, points: 0
        }
      }));

      const awayPlayersWithStats = awayPlayers.map(player => ({
        ...player,
        stats: gameStats.find(stat => stat.player_id === player.id) || {
          goals: 0, assists: 0, saves: 0, shots: 0,
          epic_saves: 0, demos: 0, otg: 0, points: 0
        }
      }));

      setGamePlayersData(prev => ({
        ...prev,
        [gameId]: {
          homePlayers: homePlayersWithStats,
          awayPlayers: awayPlayersWithStats,
          game: game
        }
      }));

    } catch (error) {
      console.error('Failed to load game player data:', error);
    } finally {
      setLoadingGamePlayers(prev => {
        const newSet = new Set(prev);
        newSet.delete(gameId);
        return newSet;
      });
    }
  };

  const handleSeriesEdit = async (seriesId, seriesGames) => {
    if (editingSeriesId === seriesId) {
      // This case will be handled by handleSeriesSave now
      return;
    }

    // Enter edit mode
    setEditingSeriesId(seriesId);
    
    // Open all games in the series
    const newCollapsed = new Set(collapsedGames);
    for (const game of seriesGames) {
      newCollapsed.add(game.id);
      
      // Load player data if not already loaded
      if (!gamePlayersData[game.id] && apiService) {
        await loadGamePlayerData(game.id);
      }
    }
    setCollapsedGames(newCollapsed);

    // Initialize editable stats from existing data
    const initialStats = {};
    seriesGames.forEach(game => {
      const playerData = gamePlayersData[game.id];
      if (playerData) {
        [...playerData.homePlayers, ...playerData.awayPlayers].forEach(player => {
          const statKey = `${game.id}-${player.id}`;
          initialStats[statKey] = { ...player.stats };
        });
      }
    });
    setEditableStats(initialStats);
  };

  const handleSeriesSave = async (seriesId, seriesGames) => {
    try {
      setSavingSeriesId(seriesId);
      
      // Save all edited stats to the API
      const savePromises = [];
      
      Object.entries(editableStats).forEach(([statKey, stats]) => {
        const [gameId, playerId] = statKey.split('-');
        
        // Get the game and player data to find team_season_id
        const gameData = gamePlayersData[gameId];
        if (!gameData) {
          console.error('No game data found for game', gameId);
          return;
        }
        
        const allPlayers = [...gameData.homePlayers, ...gameData.awayPlayers];
        const player = allPlayers.find(p => p.id === parseInt(playerId));
        if (!player) {
          console.error('No player found for ID', playerId, 'in game', gameId);
          return;
        }
        
        // Determine team_season_id based on which team the player is on
        const game = seriesGames.find(g => g.id === parseInt(gameId));
        if (!game) {
          console.error('No game found for ID', gameId);
          return;
        }
        
        const isHomeTeam = gameData.homePlayers.some(p => p.id === parseInt(playerId));
        const team_season_id = isHomeTeam ? game.home_team_season_id : game.away_team_season_id;
        
        // Create or update player game stats with all required fields
        const statData = {
          game_id: parseInt(gameId),
          player_id: parseInt(playerId),
          team_season_id: team_season_id,
          goals: stats.goals || 0,
          assists: stats.assists || 0,
          saves: stats.saves || 0,
          shots: stats.shots || 0,
          epic_saves: stats.epic_saves || 0,
          demos: stats.demos || 0,
          mvps: stats.mvps || 0,
          points: stats.points || 0
        };

        console.log('Preparing to save stats for player', playerId, 'game', gameId, ':', statData);
        
        if (player.stats && player.stats.id) {
          // Update existing stat
          console.log('Updating existing stat with ID:', player.stats.id);
          savePromises.push(apiService.updatePlayerGameStats(player.stats.id, statData));
        } else {
          // Create new stat
          console.log('Creating new stat record');
          savePromises.push(apiService.createPlayerGameStats(statData));
        }
      });

      console.log('Saving', savePromises.length, 'player stats...');
      const results = await Promise.all(savePromises);
      console.log('Save results:', results);

      // Update local game data with saved stats instead of reloading
      const updatedGamePlayersData = { ...gamePlayersData };
      Object.entries(editableStats).forEach(([statKey, stats]) => {
        const [gameId, playerId] = statKey.split('-');
        const gameData = updatedGamePlayersData[gameId];

        if (gameData) {
          // Update both home and away players with new stats
          gameData.homePlayers = gameData.homePlayers.map(player => {
            if (player.id === parseInt(playerId)) {
              return { ...player, stats: { ...player.stats, ...stats } };
            }
            return player;
          });

          gameData.awayPlayers = gameData.awayPlayers.map(player => {
            if (player.id === parseInt(playerId)) {
              return { ...player, stats: { ...player.stats, ...stats } };
            }
            return player;
          });
        }
      });

      setGamePlayersData(updatedGamePlayersData);

      // Calculate updated game scores and update parent gameResultsData
      if (onUpdateGameResults) {
        const updatedGameResults = gameResultsData.map(game => {
          const gameInSeries = seriesGames.find(g => g.id === game.id);
          if (!gameInSeries) {
            return game; // Game not in this series, return unchanged
          }

          // Calculate total goals for this game from updated player stats
          const gameData = updatedGamePlayersData[game.id];
          if (gameData) {
            const homeGoals = gameData.homePlayers.reduce((sum, player) =>
              sum + (player.stats.goals || 0), 0
            );
            const awayGoals = gameData.awayPlayers.reduce((sum, player) =>
              sum + (player.stats.goals || 0), 0
            );

            return {
              ...game,
              total_home_goals: homeGoals,
              total_away_goals: awayGoals,
              home_team_stats: gameData.homePlayers.map(p => p.stats),
              away_team_stats: gameData.awayPlayers.map(p => p.stats)
            };
          }

          return game;
        });

        onUpdateGameResults(updatedGameResults);
      }

      // Exit edit mode
      setEditingSeriesId(null);
      setEditableStats({});
      
    } catch (error) {
      console.error('Failed to save player stats:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Check if it's a validation error
      if (error.message.includes('Validation failed')) {
        alert(`❌ ROSTER VALIDATION ERROR:\n\n${error.message}\n\nPlease verify that all players are assigned to the correct teams in the roster management section before entering game statistics.`);
      } else {
        alert(`Failed to save player stats: ${error.message}`);
      }
    } finally {
      setSavingSeriesId(null);
    }
  };

  const handleStatChange = (gameId, playerId, statField, value) => {
    const statKey = `${gameId}-${playerId}`;
    setEditableStats(prev => ({
      ...prev,
      [statKey]: {
        ...prev[statKey],
        [statField]: value === '' ? '' : parseInt(value) || 0
      }
    }));
  };

  const getCurrentStats = (gameId, playerId) => {
    const statKey = `${gameId}-${playerId}`;
    return editableStats[statKey] || {};
  };

  const handleNotesChange = (gameId, value) => {
    setGameNotes(prev => ({
      ...prev,
      [gameId]: value
    }));
  };

  const handleNotesSave = async (gameId) => {
    try {
      const notes = gameNotes[gameId] || '';
      await apiService.updateGameNotes(gameId, notes);

      // Update local state
      const updatedGames = gameResultsData.map(g =>
        g.id === gameId ? { ...g, notes } : g
      );
      onUpdateGameResults(updatedGames);
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  if (!gameResultsData || gameResultsData.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-bold text-gray-300 mb-2">No Game Results Available</h3>
        <p className="text-gray-500 text-sm">Start by adding player stats to completed games.</p>
      </div>
    );
  }

  // Group games by week first, then by series (same teams)
  const gamesByWeek = gameResultsData.reduce((acc, game) => {
    const week = game.week;
    if (!acc[week]) {
      acc[week] = {};
    }
    
    // Create series key based on team matchup (normalize team order)
    const team1 = Math.min(game.home_team_season_id, game.away_team_season_id);
    const team2 = Math.max(game.home_team_season_id, game.away_team_season_id);
    const seriesKey = `${team1}_${team2}`;
    
    if (!acc[week][seriesKey]) {
      acc[week][seriesKey] = [];
    }
    
    acc[week][seriesKey].push(game);
    return acc;
  }, {});

  // Sort weeks in ascending order
  const sortedWeeks = Object.keys(gamesByWeek).sort((a, b) => parseInt(a) - parseInt(b));

  const handleGenerateNewWeek = async () => {
    const nextWeek = sortedWeeks.length > 0 ? Math.max(...sortedWeeks.map(w => parseInt(w))) + 1 : 1;

    if (window.confirm(`Generate a new week (Week ${nextWeek}) with empty matchup slots? You can then add specific matchups using the "New Matchup" button.`)) {
      try {
        setLoading(true);

        // Create a placeholder game to make the week visible
        // We'll create one dummy game that can be deleted later, just to establish the week
        if (teams.length >= 2) {
          const gameData = {
            season_id: selectedSeason.id,
            home_team_season_id: teams[0].id,
            away_team_season_id: teams[1].id,
            week: nextWeek,
            game_date: new Date().toISOString().split('T')[0],
            is_playoffs: false
          };

          const newGame = await apiService.createGame(gameData);

          // Enhance the new game with display names
          const enhancedGame = {
            ...newGame,
            home_display: teams[0]?.display_name || 'Team 1',
            away_display: teams[1]?.display_name || 'Team 2',
            home_team_stats: [],
            away_team_stats: [],
            total_home_goals: 0,
            total_away_goals: 0
          };

          // Update local data
          const updatedGameResults = [...gameResultsData, enhancedGame];
          onUpdateGameResults(updatedGameResults);

          alert(`Week ${nextWeek} has been created! You can now add specific matchups using the "New Matchup" button, or delete the placeholder game if not needed.`);
        } else {
          alert('Need at least 2 teams to generate a week. Please add teams first.');
        }

      } catch (error) {
        console.error('Failed to generate new week:', error);
        alert('Failed to generate new week. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Generate New Week Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Game Results</h2>
        <button
          onClick={handleGenerateNewWeek}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 text-sm font-sans border border-purple-500 transition-colors rounded flex items-center gap-2"
          title="Generate New Week"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              Generate New Week
            </>
          )}
        </button>
      </div>

      {sortedWeeks.map(week => {
        const weekNumber = parseInt(week);
        const isCollapsed = collapsedWeeks.has(weekNumber);
        const weekSeries = gamesByWeek[week];
        const totalGames = Object.values(weekSeries).reduce((sum, games) => sum + games.length, 0);
        
        return (
          <div key={week} className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg">
            {/* Week Header - Collapsible */}
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-600 rounded-t-lg">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => onToggleWeekCollapse(weekNumber)}
                  className="flex items-center gap-3 hover:bg-slate-700 transition-colors p-2 rounded"
                >
                  <span className="text-lg font-sans text-slate-200">
                    {isCollapsed ? '►' : '▼'}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 font-sans">
                      WEEK {weekNumber}
                    </h3>
                    <p className="text-slate-200 text-sm font-sans">
                      {Object.keys(weekSeries).length} series | {totalGames} games
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateMatchup(weekNumber);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-sans border border-green-500 transition-colors rounded flex items-center gap-1"
                    title="Create New Matchup"
                  >
                    New Matchup
                  </button>
                </div>
              </div>
            </div>

            {/* Week Content - Tabular Layout */}
            {!isCollapsed && (
              <div className="p-4 bg-slate-800">
                {/* Series Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="border-b border-slate-600 bg-slate-700">
                        <th className="text-left py-2 px-3 text-slate-200 font-bold">MATCHUP</th>
                        <th className="text-center py-2 px-2 text-slate-200 font-bold">GAME</th>
                        <th className="text-center py-2 px-2 text-slate-200 font-bold">DATE</th>
                        <th className="text-center py-2 px-2 text-slate-200 font-bold">SERIES</th>
                        <th className="text-center py-2 px-2 text-slate-200 font-bold"></th>
                        <th className="text-center py-2 px-2 text-slate-200 font-bold"></th>
                        <th className="text-center py-2 px-2 text-slate-200 font-bold">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(weekSeries).map(([seriesKey, seriesGames]) => {
                        const sortedSeriesGames = seriesGames.sort((a, b) => (a.series_game || 1) - (b.series_game || 1));
                        const firstGame = sortedSeriesGames[0];
                        const matchupName = `${firstGame.home_display} vs ${firstGame.away_display}`;
                        const seriesId = `${weekNumber}-${seriesKey}`;
                        const isSeriesCollapsed = collapsedSeries.has(seriesId);

                        // Calculate series wins by counting game winners
                        let homeWins = 0;
                        let awayWins = 0;
                        sortedSeriesGames.forEach(game => {
                          const homeGoals = game.total_home_goals || 0;
                          const awayGoals = game.total_away_goals || 0;
                          if (homeGoals > awayGoals) {
                            homeWins++;
                          } else if (awayGoals > homeGoals) {
                            awayWins++;
                          }
                          // Ties don't count towards either team
                        });
                        
                        return (
                          <React.Fragment key={seriesKey}>
                            {/* Series Header Row */}
                            <tr className="border-b-2 border-slate-500 bg-slate-600">
                              <td
                                className="py-2 px-3 text-slate-200 font-bold cursor-pointer hover:text-slate-100 transition-colors"
                                onClick={() => onToggleSeriesCollapse(seriesId)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-sans text-xs">
                                    {isSeriesCollapsed ? '►' : '▼'}
                                  </span>
                                  {matchupName}
                                  <span className="text-xs text-slate-200 font-sans">
                                    ({sortedSeriesGames.length} games)
                                  </span>
                                </div>
                              </td>
                              <td className="text-center py-2 px-2 text-slate-200 text-xs font-sans">

                              </td>
                              <td className="text-center py-2 px-2 text-slate-200 text-xs">
                                --
                              </td>
                              <td className="text-center py-2 px-2">
                                <span className="text-slate-200 font-bold text-xs">
                                  {homeWins}-{awayWins}
                                </span>
                              </td>
                              <td className="text-center py-2 px-2 text-gray-600 text-xs">

                              </td>
                              <td className="text-center py-2 px-2 text-gray-600 text-xs">

                              </td>
                              <td className="text-center py-2 px-2">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      if (editingSeriesId === seriesId) {
                                        handleSeriesSave(seriesId, sortedSeriesGames);
                                      } else {
                                        handleSeriesEdit(seriesId, sortedSeriesGames);
                                      }
                                    }}
                                    disabled={savingSeriesId === seriesId}
                                    className={`px-2 py-1 text-xs font-sans border transition-colors flex items-center gap-1 ${
                                      editingSeriesId === seriesId
                                        ? 'bg-green-700 hover:bg-green-600 text-slate-100 border-green-600 disabled:opacity-50'
                                        : 'bg-blue-700 hover:bg-blue-600 text-gray-300 border-blue-600'
                                    }`}
                                    title={editingSeriesId === seriesId ? "Save Changes" : "Edit Series"}
                                  >
                                    {savingSeriesId === seriesId ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                                        SAVING
                                      </>
                                    ) : editingSeriesId === seriesId ? (
                                      'SAVE'
                                    ) : (
                                      'Insert Stats'
                                    )}
                                  </button>
                                  <button
                                    onClick={() => onAddSeriesGame(firstGame)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs font-sans border border-green-500 transition-colors"
                                    title="Add Game to Series"
                                  >
                                    Add Games
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMatchup(sortedSeriesGames)}
                                    className="bg-red-700 hover:bg-red-600 text-gray-300 px-2 py-1 text-xs font-sans border border-red-600 transition-colors"
                                    title="Delete Entire Matchup"
                                  >
                                    DEL
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Series Games - Only show if not collapsed */}
                            {!isSeriesCollapsed && sortedSeriesGames.map((game, gameIndex) => {
                              const isLastGameInSeries = gameIndex === sortedSeriesGames.length - 1;
                              const isGameExpanded = collapsedGames.has(game.id);
                              const gamePlayerData = gamePlayersData[game.id];
                              const isLoadingGame = loadingGamePlayers.has(game.id);
                              
                              return (
                                <React.Fragment key={game.id}>
                                  {/* Game Header Row - Clickable */}
                                  <tr
                                    className={`border-b border-slate-500 hover:bg-slate-400 transition-colors cursor-pointer ${
                                      isGameExpanded
                                        ? 'bg-slate-300 border-l-4 border-l-blue-400'
                                        : 'bg-slate-500'
                                    } ${isLastGameInSeries && !isGameExpanded ? 'border-b-2 border-gray-400' : ''}`}
                                    onClick={() => toggleGameCollapse(game.id)}
                                  >
                                    {/* Game Title with Expand Icon */}
                                    <td className={`py-2 px-3 pl-8 text-xs ${isGameExpanded ? 'text-slate-800' : 'text-slate-200'}`}>
                                      <div className="flex items-center gap-3">
                                        <span className={`font-sans text-lg cursor-pointer transition-colors ${
                                          isGameExpanded ? 'text-slate-800 hover:text-slate-900' : 'text-slate-200 hover:text-slate-200'
                                        }`}>
                                          {isGameExpanded ? '▼' : '►'}
                                        </span>
                                        └─ Game {game.series_game || (gameIndex + 1)}
                                      </div>
                                    </td>
                                    
                                    {/* Game Number */}
                                    <td className={`text-center py-2 px-2 ${isGameExpanded ? 'text-slate-800' : 'text-slate-200'}`}>
                                      G{game.series_game || (gameIndex + 1)}
                                    </td>
                                    
                                    {/* Date */}
                                    <td className={`text-center py-2 px-2 ${isGameExpanded ? 'text-slate-800' : 'text-slate-200'}`}>
                                      {game.game_date ? new Date(game.game_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '--'}
                                    </td>
                                    
                                    {/* Game Winner */}
                                    <td className="text-center py-2 px-2">
                                      <span className={`font-bold ${isGameExpanded ? 'text-slate-800' : 'text-slate-200'}`}>
                                        {(() => {
                                          const homeGoals = game.total_home_goals || 0;
                                          const awayGoals = game.total_away_goals || 0;
                                          // Check for forfeits first
                                          if (game.home_team_forfeit) {
                                            return `Forfeit (${game.home_display})`;
                                          } else if (game.away_team_forfeit) {
                                            return `Forfeit (${game.away_display})`;
                                          } else if (homeGoals > awayGoals) {
                                            return `${game.home_display} W (${homeGoals}-${awayGoals})`;
                                          } else if (awayGoals > homeGoals) {
                                            return `${game.away_display} W (${awayGoals}-${homeGoals})`;
                                          } else {
                                            // 0-0 means unplayed, any other tie score is a legitimate tie
                                            if (homeGoals === 0 && awayGoals === 0) {
                                              return "Unplayed";
                                            } else {
                                              return `TIE (${homeGoals}-${awayGoals})`;
                                            }
                                          }
                                        })()}
                                      </span>
                                    </td>
                                    
                                    {/* Home/Away Stats - Now Blank */}
                                    <td className={`text-center py-2 px-2 text-xs ${isGameExpanded ? 'text-slate-800' : 'text-slate-200'}`}>

                                    </td>

                                    <td className={`text-center py-2 px-2 text-xs ${isGameExpanded ? 'text-slate-800' : 'text-slate-200'}`}>

                                    </td>
                                    
                                    {/* Delete Action */}
                                    <td className="text-center py-2 px-2" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => onManageGameStats(game)}
                                        className="bg-red-700 hover:bg-red-600 text-gray-300 px-2 py-1 text-xs font-sans border border-red-600 transition-colors"
                                        title="Delete Game"
                                      >
                                        DEL
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Expanded Game Details */}
                                  {isGameExpanded && (
                                    <tr className={`bg-gray-50 ${isLastGameInSeries ? 'border-b-2 border-gray-200' : ''}`}>
                                      <td colSpan="7" className="p-0">
                                        <div className="p-4 bg-gray-50">
                                          {isLoadingGame ? (
                                            <div className="flex items-center justify-center py-4">
                                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                              <span className="ml-3 text-gray-800 font-sans">Loading player stats...</span>
                                            </div>
                                          ) : gamePlayerData ? (
                                            <div className="bg-white rounded-lg border border-gray-300">
                                              {/* Game Status Controls */}
                                              {editingSeriesId === seriesId && (
                                                <div className="p-3 border-b border-gray-300 bg-gray-50">
                                                  <div className="space-y-3">
                                                    <h4 className="text-sm font-bold text-gray-800">Forfeit Detection</h4>

                                                    <div className="grid grid-cols-2 gap-4">
                                                      {/* Home Team Forfeit */}
                                                      <label className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                          type="checkbox"
                                                          checked={game.home_team_forfeit || false}
                                                          onChange={async (e) => {
                                                            const isChecked = e.target.checked;
                                                            try {
                                                              await apiService.updateGame(game.id, {
                                                                home_team_forfeit: isChecked
                                                              });
                                                              // Update the local state properly using the callback
                                                              const updatedGames = gameResultsData.map(g =>
                                                                g.id === game.id
                                                                  ? { ...g, home_team_forfeit: isChecked }
                                                                  : g
                                                              );
                                                              onUpdateGameResults(updatedGames);
                                                            } catch (error) {
                                                              console.error('Failed to update forfeit status:', error);
                                                              // Revert checkbox to its previous state
                                                              e.target.checked = game.home_team_forfeit || false;
                                                            }
                                                          }}
                                                          className="rounded border-gray-400"
                                                        />
                                                        <span className="font-semibold">{game.home_display}</span> forfeited
                                                      </label>

                                                      {/* Away Team Forfeit */}
                                                      <label className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                          type="checkbox"
                                                          checked={game.away_team_forfeit || false}
                                                          onChange={async (e) => {
                                                            const isChecked = e.target.checked;
                                                            try {
                                                              await apiService.updateGame(game.id, {
                                                                away_team_forfeit: isChecked
                                                              });
                                                              // Update the local state properly using the callback
                                                              const updatedGames = gameResultsData.map(g =>
                                                                g.id === game.id
                                                                  ? { ...g, away_team_forfeit: isChecked }
                                                                  : g
                                                              );
                                                              onUpdateGameResults(updatedGames);
                                                            } catch (error) {
                                                              console.error('Failed to update forfeit status:', error);
                                                              // Revert checkbox to its previous state
                                                              e.target.checked = game.away_team_forfeit || false;
                                                            }
                                                          }}
                                                          className="rounded border-gray-400"
                                                        />
                                                        <span className="font-semibold">{game.away_display}</span> forfeited
                                                      </label>
                                                    </div>

                                                    <p className="text-xs text-gray-600">
                                                      Check if a team forfeited. Forfeiting team gets 0 points, opponent gets 4 points (when score diff > 5).
                                                    </p>
                                                  </div>
                                                </div>
                                              )}
                                              <div className="overflow-x-auto">
                                                <table className="w-full text-xs font-sans bg-white">
                                                <thead>
                                                  <tr className="border-b border-gray-300">
                                                    <th className="text-left py-2 px-3 text-black font-bold bg-gray-200">TEAM</th>
                                                    <th className="text-left py-2 px-3 text-black font-bold bg-gray-300">PLAYER</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-200">PTS</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-300">G</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-200">A</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-300">S</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-200">SH</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-300">MVP</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-200">DEM</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-300">ES</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-200">OTG</th>
                                                    <th className="text-center py-2 px-2 text-black font-bold bg-gray-300">GP</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {/* Home Team Players */}
                                                  {gamePlayerData.homePlayers && Array.from(new Set(gamePlayerData.homePlayers.map(p => p.id)))
                                                    .map(playerId => gamePlayerData.homePlayers.find(p => p.id === playerId))
                                                    .map((player, rowIndex) => {
                                                    const isEditing = editingSeriesId === seriesId;
                                                    const currentStats = isEditing ? getCurrentStats(game.id, player.id) : {};
                                                    const displayStats = isEditing && Object.keys(currentStats).length > 0 ? currentStats : player.stats;

                                                    return (
                                                      <tr key={`admin-home-${seriesId}-${game.id}-${player.id}`} className="border-b border-gray-300 hover:bg-gray-50">
                                                        <td className="py-2 px-3 text-black font-bold bg-gray-200">
                                                          {rowIndex === 0 ? `🏠 ${game.home_display}` : ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-black font-bold bg-gray-300">
                                                          {player.display_name || player.player_name}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.points || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'points', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400 font-bold"
                                                            />
                                                          ) : (
                                                            <span className="text-black font-bold">{displayStats.points}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.goals || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'goals', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.goals}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.assists || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'assists', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.assists}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.saves || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'saves', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.saves}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.shots || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'shots', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.shots}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.mvps || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'mvps', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.mvps || 0}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.demos || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'demos', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.demos}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.epic_saves || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'epic_saves', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.epic_saves}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.otg || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'otg', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.otg || 0}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">1</span>
                                                        </td>
                                                      </tr>
                                                    );
                                                  })}
                                                  
                                                  {/* Spacer Row */}
                                                  <tr className="border-b-2 border-gray-400 bg-gray-200">
                                                    <td colSpan="10" className="py-1"></td>
                                                  </tr>
                                                  
                                                  {/* Away Team Players */}
                                                  {gamePlayerData.awayPlayers && Array.from(new Set(gamePlayerData.awayPlayers.map(p => p.id)))
                                                    .map(playerId => gamePlayerData.awayPlayers.find(p => p.id === playerId))
                                                    .map((player, rowIndex) => {
                                                    const isEditing = editingSeriesId === seriesId;
                                                    const currentStats = isEditing ? getCurrentStats(game.id, player.id) : {};
                                                    const displayStats = isEditing && Object.keys(currentStats).length > 0 ? currentStats : player.stats;

                                                    return (
                                                      <tr key={`admin-away-${seriesId}-${game.id}-${player.id}`} className="border-b border-gray-300 hover:bg-gray-50">
                                                        <td className="py-2 px-3 text-black font-bold bg-gray-200">
                                                          {rowIndex === 0 ? `✈️ ${game.away_display}` : ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-black font-bold bg-gray-300">
                                                          {player.display_name || player.player_name}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.points || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'points', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400 font-bold"
                                                            />
                                                          ) : (
                                                            <span className="text-black font-bold">{displayStats.points}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.goals || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'goals', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.goals}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.assists || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'assists', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.assists}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.saves || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'saves', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.saves}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.shots || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'shots', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.shots}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.mvps || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'mvps', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.mvps || 0}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.demos || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'demos', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.demos}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.epic_saves || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'epic_saves', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.epic_saves}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.otg || ''}
                                                              placeholder="0"
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'otg', e.target.value)}
                                                              className="w-12 bg-white text-black text-center text-xs rounded border border-gray-400"
                                                            />
                                                          ) : (
                                                            <span className="text-black">{displayStats.otg || 0}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">1</span>
                                                        </td>
                                                      </tr>
                                                    );
                                                  })}
                                                </tbody>
                                                </table>
                                              </div>

                                              {/* Game Notes Section */}
                                              <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300">
                                                <h4 className="text-sm font-bold text-gray-800 mb-2">Game Notes</h4>
                                                {editingSeriesId === seriesId ? (
                                                  <div className="space-y-2">
                                                    <textarea
                                                      value={gameNotes[game.id] !== undefined ? gameNotes[game.id] : (game.notes || '')}
                                                      onChange={(e) => handleNotesChange(game.id, e.target.value)}
                                                      placeholder="Add notes about this game..."
                                                      className="w-full px-3 py-2 bg-white border border-gray-400 rounded text-black text-sm font-sans resize-vertical"
                                                      rows="3"
                                                    />
                                                    <button
                                                      onClick={() => handleNotesSave(game.id)}
                                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs rounded transition-colors"
                                                    >
                                                      Save Notes
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {game.notes || <span className="italic text-gray-500">No notes added</span>}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-center py-4 text-gray-800 font-sans">
                                              Failed to load player data
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        );
      })}

      {/* Create Matchup Modal */}
      {showCreateMatchupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create New Matchup - Week {createMatchupWeek}</h3>
            <MatchupForm
              teams={teams}
              week={createMatchupWeek}
              onSubmit={handleCreateMatchupSubmit}
              onCancel={() => {
                setShowCreateMatchupModal(false);
                setCreateMatchupWeek(null);
              }}
              loading={loading}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default GameResultsTable;