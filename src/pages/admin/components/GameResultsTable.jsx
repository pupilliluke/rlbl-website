import React from "react";

const GameResultsTable = ({ 
  gameResultsData, 
  collapsedWeeks,
  collapsedSeries, 
  onToggleWeekCollapse,
  onToggleSeriesCollapse,
  onManageGameStats, 
  onAddSeriesGame,
  apiService
}) => {
  const [collapsedGames, setCollapsedGames] = React.useState(new Set());
  const [gamePlayersData, setGamePlayersData] = React.useState({});
  const [loadingGamePlayers, setLoadingGamePlayers] = React.useState(new Set());
  const [editingSeriesId, setEditingSeriesId] = React.useState(null);
  const [editableStats, setEditableStats] = React.useState({});
  const [savingSeriesId, setSavingSeriesId] = React.useState(null);

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

      // Get players for each team
      const homePlayers = allPlayers.filter(player => 
        homeRoster.some(roster => roster.player_id === player.id)
      );
      const awayPlayers = allPlayers.filter(player => 
        awayRoster.some(roster => roster.player_id === player.id)
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
      
      // Reload game data to reflect changes
      for (const game of seriesGames) {
        await loadGamePlayerData(game.id);
      }

      // Exit edit mode
      setEditingSeriesId(null);
      setEditableStats({});
      
      // Optional: Show success message
      alert('Player stats saved successfully!');
      
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
        [statField]: value === '' ? 0 : parseInt(value) || 0
      }
    }));
  };

  const getCurrentStats = (gameId, playerId) => {
    const statKey = `${gameId}-${playerId}`;
    return editableStats[statKey] || {};
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

  return (
    <div className="space-y-4">
      {sortedWeeks.map(week => {
        const weekNumber = parseInt(week);
        const isCollapsed = collapsedWeeks.has(weekNumber);
        const weekSeries = gamesByWeek[week];
        const totalGames = Object.values(weekSeries).reduce((sum, games) => sum + games.length, 0);
        
        return (
          <div key={week} className="bg-gray-900 border border-gray-700 rounded">
            {/* Week Header - Collapsible */}
            <button
              onClick={() => onToggleWeekCollapse(weekNumber)}
              className="w-full bg-gray-800 px-4 py-3 border-b border-gray-700 hover:bg-gray-750 transition-colors text-left"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono">
                    {isCollapsed ? '►' : '▼'}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-200 font-mono">
                      WEEK {weekNumber}
                    </h3>
                    <p className="text-gray-400 text-sm font-mono">
                      {Object.keys(weekSeries).length} series | {totalGames} games
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {isCollapsed ? '[+]' : '[-]'}
                </div>
              </div>
            </button>

            {/* Week Content - Tabular Layout */}
            {!isCollapsed && (
              <div className="p-4">
                {/* Series Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-mono">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 px-3 text-gray-400 font-bold">MATCHUP</th>
                        <th className="text-center py-2 px-2 text-gray-400 font-bold">GAME</th>
                        <th className="text-center py-2 px-2 text-gray-400 font-bold">DATE</th>
                        <th className="text-center py-2 px-2 text-gray-400 font-bold">SCORE</th>
                        <th className="text-center py-2 px-2 text-gray-400 font-bold">HOME STATS</th>
                        <th className="text-center py-2 px-2 text-gray-400 font-bold">AWAY STATS</th>
                        <th className="text-center py-2 px-2 text-gray-400 font-bold">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(weekSeries).map(([seriesKey, seriesGames]) => {
                        const sortedSeriesGames = seriesGames.sort((a, b) => (a.series_game || 1) - (b.series_game || 1));
                        const firstGame = sortedSeriesGames[0];
                        const matchupName = `${firstGame.home_display} vs ${firstGame.away_display}`;
                        const seriesId = `${weekNumber}-${seriesKey}`;
                        const isSeriesCollapsed = collapsedSeries.has(seriesId);
                        const totalSeriesGoals = sortedSeriesGames.reduce((sum, g) => sum + (g.total_home_goals || 0) + (g.total_away_goals || 0), 0);
                        
                        return (
                          <React.Fragment key={seriesKey}>
                            {/* Series Header Row */}
                            <tr className="border-b-2 border-gray-600 bg-gray-800">
                              <td 
                                className="py-2 px-3 text-gray-300 font-bold cursor-pointer hover:text-gray-100 transition-colors"
                                onClick={() => onToggleSeriesCollapse(seriesId)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs">
                                    {isSeriesCollapsed ? '►' : '▼'}
                                  </span>
                                  {matchupName}
                                  <span className="text-xs text-gray-500 font-mono">
                                    ({sortedSeriesGames.length} games)
                                  </span>
                                </div>
                              </td>
                              <td className="text-center py-2 px-2 text-gray-500 text-xs font-mono">
                                SERIES
                              </td>
                              <td className="text-center py-2 px-2 text-gray-500 text-xs">
                                --
                              </td>
                              <td className="text-center py-2 px-2">
                                <span className="text-gray-400 font-bold text-xs">
                                  {totalSeriesGoals} total goals
                                </span>
                              </td>
                              <td className="text-center py-2 px-2 text-gray-600 text-xs">
                                {firstGame.home_display}
                              </td>
                              <td className="text-center py-2 px-2 text-gray-600 text-xs">
                                {firstGame.away_display}
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
                                    className={`px-2 py-1 text-xs font-mono border transition-colors flex items-center gap-1 ${
                                      editingSeriesId === seriesId 
                                        ? 'bg-green-700 hover:bg-green-600 text-white border-green-600 disabled:opacity-50' 
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
                                      '💾 SAVE'
                                    ) : (
                                      '⋯ EDIT'
                                    )}
                                  </button>
                                  <button
                                    onClick={() => onAddSeriesGame(firstGame)}
                                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 text-xs font-mono border border-gray-600 transition-colors"
                                    title="Add Game to Series"
                                  >
                                    + GAME
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
                                    className={`border-b border-gray-800 hover:bg-gray-850 transition-colors bg-gray-900 cursor-pointer ${isLastGameInSeries && !isGameExpanded ? 'border-b-2 border-gray-700' : ''}`}
                                    onClick={() => toggleGameCollapse(game.id)}
                                  >
                                    {/* Game Title with Expand Icon */}
                                    <td className="py-2 px-3 pl-8 text-gray-500 text-xs">
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono text-lg cursor-pointer hover:text-gray-300 transition-colors">
                                          {isGameExpanded ? '▼' : '►'}
                                        </span>
                                        └─ Game {game.series_game || (gameIndex + 1)}
                                      </div>
                                    </td>
                                    
                                    {/* Game Number */}
                                    <td className="text-center py-2 px-2 text-gray-400">
                                      G{game.series_game || (gameIndex + 1)}
                                    </td>
                                    
                                    {/* Date */}
                                    <td className="text-center py-2 px-2 text-gray-400">
                                      {game.game_date ? new Date(game.game_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '--'}
                                    </td>
                                    
                                    {/* Score */}
                                    <td className="text-center py-2 px-2">
                                      <span className="text-gray-200 font-bold">
                                        {game.total_home_goals || 0} - {game.total_away_goals || 0}
                                      </span>
                                    </td>
                                    
                                    {/* Summary Stats */}
                                    <td className="text-center py-2 px-2 text-gray-500 text-xs">
                                      {isGameExpanded ? 'Expanded' : 'Click to expand'}
                                    </td>
                                    
                                    <td className="text-center py-2 px-2 text-gray-500 text-xs">
                                      {isGameExpanded ? 'Player Stats' : 'Player Stats'}
                                    </td>
                                    
                                    {/* Delete Action */}
                                    <td className="text-center py-2 px-2" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => onManageGameStats(game)}
                                        className="bg-red-700 hover:bg-red-600 text-gray-300 px-2 py-1 text-xs font-mono border border-red-600 transition-colors"
                                        title="Delete Game"
                                      >
                                        DEL
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Expanded Game Details */}
                                  {isGameExpanded && (
                                    <tr className={`bg-gray-950 ${isLastGameInSeries ? 'border-b-2 border-gray-700' : ''}`}>
                                      <td colSpan="7" className="p-0">
                                        <div className="p-4">
                                          {isLoadingGame ? (
                                            <div className="flex items-center justify-center py-4">
                                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                              <span className="ml-3 text-gray-400 font-mono">Loading player stats...</span>
                                            </div>
                                          ) : gamePlayerData ? (
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-xs font-mono">
                                                <thead>
                                                  <tr className="border-b border-gray-600">
                                                    <th className="text-left py-2 px-3 text-gray-300">TEAM</th>
                                                    <th className="text-left py-2 px-3 text-gray-300">PLAYER</th>
                                                    <th className="text-center py-2 px-2 text-yellow-400">G</th>
                                                    <th className="text-center py-2 px-2 text-blue-400">A</th>
                                                    <th className="text-center py-2 px-2 text-green-400">S</th>
                                                    <th className="text-center py-2 px-2 text-orange-400">SH</th>
                                                    <th className="text-center py-2 px-2 text-purple-400">ES</th>
                                                    <th className="text-center py-2 px-2 text-red-400">DEM</th>
                                                    <th className="text-center py-2 px-2 text-pink-400">OTG</th>
                                                    <th className="text-center py-2 px-2 text-gray-300">PTS</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {/* Home Team Players */}
                                                  {gamePlayerData.homePlayers.map((player, idx) => {
                                                    const isEditing = editingSeriesId === seriesId;
                                                    const currentStats = isEditing ? getCurrentStats(game.id, player.id) : {};
                                                    const displayStats = isEditing && Object.keys(currentStats).length > 0 ? currentStats : player.stats;
                                                    
                                                    return (
                                                      <tr key={`home-${player.id}`} className="border-b border-gray-800">
                                                        <td className="py-2 px-3 text-blue-400 font-bold">
                                                          {idx === 0 ? `🏠 ${game.home_display}` : ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-gray-200 font-bold">
                                                          {player.display_name || player.player_name}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.goals || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'goals', e.target.value)}
                                                              className="w-12 bg-gray-700 text-yellow-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-yellow-400">{displayStats.goals}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.assists || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'assists', e.target.value)}
                                                              className="w-12 bg-gray-700 text-blue-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-blue-400">{displayStats.assists}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.saves || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'saves', e.target.value)}
                                                              className="w-12 bg-gray-700 text-green-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-green-400">{displayStats.saves}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.shots || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'shots', e.target.value)}
                                                              className="w-12 bg-gray-700 text-orange-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-orange-400">{displayStats.shots}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.epic_saves || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'epic_saves', e.target.value)}
                                                              className="w-12 bg-gray-700 text-purple-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-purple-400">{displayStats.epic_saves}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.demos || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'demos', e.target.value)}
                                                              className="w-12 bg-gray-700 text-red-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-red-400">{displayStats.demos}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.otg || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'otg', e.target.value)}
                                                              className="w-12 bg-gray-700 text-pink-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-pink-400">{displayStats.otg}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.points || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'points', e.target.value)}
                                                              className="w-12 bg-gray-700 text-gray-300 text-center text-xs rounded border border-gray-600 font-bold"
                                                            />
                                                          ) : (
                                                            <span className="text-gray-300 font-bold">{displayStats.points}</span>
                                                          )}
                                                        </td>
                                                      </tr>
                                                    );
                                                  })}
                                                  
                                                  {/* Spacer Row */}
                                                  <tr className="border-b-2 border-gray-600">
                                                    <td colSpan="10" className="py-1"></td>
                                                  </tr>
                                                  
                                                  {/* Away Team Players */}
                                                  {gamePlayerData.awayPlayers.map((player, idx) => {
                                                    const isEditing = editingSeriesId === seriesId;
                                                    const currentStats = isEditing ? getCurrentStats(game.id, player.id) : {};
                                                    const displayStats = isEditing && Object.keys(currentStats).length > 0 ? currentStats : player.stats;
                                                    
                                                    return (
                                                      <tr key={`away-${player.id}`} className="border-b border-gray-800">
                                                        <td className="py-2 px-3 text-orange-400 font-bold">
                                                          {idx === 0 ? `✈️ ${game.away_display}` : ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-gray-200 font-bold">
                                                          {player.display_name || player.player_name}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.goals || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'goals', e.target.value)}
                                                              className="w-12 bg-gray-700 text-yellow-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-yellow-400">{displayStats.goals}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.assists || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'assists', e.target.value)}
                                                              className="w-12 bg-gray-700 text-blue-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-blue-400">{displayStats.assists}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.saves || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'saves', e.target.value)}
                                                              className="w-12 bg-gray-700 text-green-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-green-400">{displayStats.saves}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.shots || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'shots', e.target.value)}
                                                              className="w-12 bg-gray-700 text-orange-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-orange-400">{displayStats.shots}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.epic_saves || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'epic_saves', e.target.value)}
                                                              className="w-12 bg-gray-700 text-purple-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-purple-400">{displayStats.epic_saves}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.demos || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'demos', e.target.value)}
                                                              className="w-12 bg-gray-700 text-red-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-red-400">{displayStats.demos}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.otg || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'otg', e.target.value)}
                                                              className="w-12 bg-gray-700 text-pink-400 text-center text-xs rounded border border-gray-600"
                                                            />
                                                          ) : (
                                                            <span className="text-pink-400">{displayStats.otg}</span>
                                                          )}
                                                        </td>
                                                        <td className="text-center py-2 px-2">
                                                          {isEditing ? (
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              value={displayStats.points || 0}
                                                              onChange={(e) => handleStatChange(game.id, player.id, 'points', e.target.value)}
                                                              className="w-12 bg-gray-700 text-gray-300 text-center text-xs rounded border border-gray-600 font-bold"
                                                            />
                                                          ) : (
                                                            <span className="text-gray-300 font-bold">{displayStats.points}</span>
                                                          )}
                                                        </td>
                                                      </tr>
                                                    );
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          ) : (
                                            <div className="text-center py-4 text-gray-500 font-mono">
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
    </div>
  );
};

export default GameResultsTable;