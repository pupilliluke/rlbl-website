import React from "react";

const WeeklyGameResults = ({
  gameResultsData,
  apiService,
  searchQuery
}) => {
  // All React hooks MUST be at the top of the component
  const [collapsedWeeks, setCollapsedWeeks] = React.useState(new Set());
  const [collapsedSeries, setCollapsedSeries] = React.useState(new Set());
  const [collapsedGames, setCollapsedGames] = React.useState(new Set());
  const [gamePlayersData, setGamePlayersData] = React.useState({});
  const [loadingGamePlayers, setLoadingGamePlayers] = React.useState(new Set());
  const [initializedCollapse, setInitializedCollapse] = React.useState(false);

  // Filter games based on search query - ALL useMemo hooks must be before any early returns
  const filteredGameResultsData = React.useMemo(() => {
    if (!gameResultsData || gameResultsData.length === 0) {
      return [];
    }

    if (!searchQuery || searchQuery.trim() === "") {
      return gameResultsData;
    }

    const query = searchQuery.toLowerCase().trim();
    return gameResultsData.filter(game => {
      // Search by week
      const weekMatch = `week ${game.week}`.toLowerCase().includes(query) ||
                       `${game.week}`.includes(query);

      // Search by team names
      const teamMatch = game.home_display?.toLowerCase().includes(query) ||
                       game.away_display?.toLowerCase().includes(query);

      // Search by game number
      const gameMatch = `game ${game.series_game || 1}`.toLowerCase().includes(query) ||
                       `g${game.series_game || 1}`.toLowerCase().includes(query);

      // Search by date
      const dateMatch = game.game_date &&
                       new Date(game.game_date).toLocaleDateString().includes(query);

      // Search by player names
      let playerMatch = false;
      const gamePlayerData = gamePlayersData[game.id];
      if (gamePlayerData) {
        const allPlayers = [...gamePlayerData.homePlayers, ...gamePlayerData.awayPlayers];
        playerMatch = allPlayers.some(player =>
          player.player_name?.toLowerCase().includes(query) ||
          player.display_name?.toLowerCase().includes(query)
        );
      }

      return weekMatch || teamMatch || gameMatch || dateMatch || playerMatch;
    });
  }, [gameResultsData, searchQuery, gamePlayersData]);

  // Group games by week first, then by series (same teams)
  const gamesByWeek = React.useMemo(() => {
    return filteredGameResultsData.reduce((acc, game) => {
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
  }, [filteredGameResultsData]);

  // Sort weeks in ascending order
  const sortedWeeks = React.useMemo(() => {
    return Object.keys(gamesByWeek).sort((a, b) => parseInt(a) - parseInt(b));
  }, [gamesByWeek]);

  // Auto-collapse all weeks on initial load
  React.useEffect(() => {
    if (!initializedCollapse && sortedWeeks.length > 0) {
      const allWeekNumbers = sortedWeeks.map(week => parseInt(week));
      setCollapsedWeeks(new Set(allWeekNumbers));
      setInitializedCollapse(true);
    }
  }, [sortedWeeks, initializedCollapse]);

  // Show search results info
  const showSearchResults = searchQuery && searchQuery.trim() !== "";
  const hasResults = sortedWeeks.length > 0;

  // Event handlers - these are NOT hooks so they can be anywhere
  const toggleWeekCollapse = (weekNumber) => {
    const newCollapsed = new Set(collapsedWeeks);
    if (newCollapsed.has(weekNumber)) {
      newCollapsed.delete(weekNumber);
    } else {
      newCollapsed.add(weekNumber);
    }
    setCollapsedWeeks(newCollapsed);
  };

  const toggleSeriesCollapse = (seriesId) => {
    const newCollapsed = new Set(collapsedSeries);
    if (newCollapsed.has(seriesId)) {
      newCollapsed.delete(seriesId);
    } else {
      newCollapsed.add(seriesId);
    }
    setCollapsedSeries(newCollapsed);
  };

  const toggleGameCollapse = async (gameId) => {
    const newCollapsed = new Set(collapsedGames);
    if (newCollapsed.has(gameId)) {
      newCollapsed.delete(gameId);
    } else {
      newCollapsed.add(gameId);
      // Load player data for this game if not already loaded
      if (!gamePlayersData[gameId]) {
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

      // Fetch all required data
      const [playersResponse, homeRosterResponse, awayRosterResponse, statsResponse] = await Promise.all([
        apiService.getPlayers(),
        apiService.getRosterMembershipsByTeamSeason(game.home_team_season_id),
        apiService.getRosterMembershipsByTeamSeason(game.away_team_season_id),
        apiService.getPlayerGameStatsByGame(gameId).catch(() => [])
      ]);

      // Create clean, unique player lists for each team
      const homeTeamPlayers = [];
      const awayTeamPlayers = [];

      // Process home team - use Map to ensure uniqueness by player ID
      const homePlayerMap = new Map();
      homeRosterResponse.forEach(roster => {
        const player = playersResponse.find(p => p.id === roster.player_id);
        if (player && !homePlayerMap.has(player.id)) {
          const playerStats = statsResponse.find(stat => stat.player_id === player.id) || {
            goals: 0, assists: 0, saves: 0, shots: 0,
            epic_saves: 0, demos: 0, otg: 0, points: 0, mvps: 0
          };

          homePlayerMap.set(player.id, {
            ...player,
            stats: playerStats
          });
        }
      });

      // Process away team - use Map to ensure uniqueness by player ID
      const awayPlayerMap = new Map();
      awayRosterResponse.forEach(roster => {
        const player = playersResponse.find(p => p.id === roster.player_id);
        if (player && !awayPlayerMap.has(player.id)) {
          const playerStats = statsResponse.find(stat => stat.player_id === player.id) || {
            goals: 0, assists: 0, saves: 0, shots: 0,
            epic_saves: 0, demos: 0, otg: 0, points: 0, mvps: 0
          };

          awayPlayerMap.set(player.id, {
            ...player,
            stats: playerStats
          });
        }
      });

      // Convert maps to arrays
      const finalHomePlayers = Array.from(homePlayerMap.values());
      const finalAwayPlayers = Array.from(awayPlayerMap.values());

      setGamePlayersData(prev => ({
        ...prev,
        [gameId]: {
          homePlayers: finalHomePlayers,
          awayPlayers: finalAwayPlayers,
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

  // Early return for empty data - AFTER all hooks
  if (!gameResultsData || gameResultsData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Game Results Available</h3>
        <p className="text-gray-500 text-sm">Game results will appear here when available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Search Results Info */}
      {showSearchResults && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-blue-800 font-medium">
              {hasResults
                ? `Found ${filteredGameResultsData.length} game${filteredGameResultsData.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : `No games found matching "${searchQuery}"`
              }
            </span>
          </div>
        </div>
      )}

      {/* No Results State */}
      {showSearchResults && !hasResults ? (
        <div className="text-center py-16">
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-4">
              Try searching for team names, week numbers, or game details.
            </p>
            <p className="text-gray-500 text-sm">
              Examples: "week 3", "game 2", team names, or dates
            </p>
          </div>
        </div>
      ) : (
        /* Results */
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {sortedWeeks.map((week, weekIndex) => {
            const weekNumber = parseInt(week);
            const isCollapsed = collapsedWeeks.has(weekNumber);
            const weekSeries = gamesByWeek[week];
            const totalGames = Object.values(weekSeries).reduce((sum, games) => sum + games.length, 0);
            const isLastWeek = weekIndex === sortedWeeks.length - 1;

            return (
              <div key={week} className={`${weekIndex > 0 ? 'border-t border-gray-200' : ''}`}>
              {/* Week Header - ESPN Style */}
              <button
                onClick={() => toggleWeekCollapse(weekNumber)}
                className={`w-full px-6 py-4 border-b border-slate-600 bg-slate-700 hover:bg-slate-600 transition-colors text-left ${weekIndex === 0 ? 'rounded-t-lg' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-base text-slate-300">
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Week {weekNumber}
                      </h3>
                      <p className="text-slate-300 text-sm mt-0.5">
                        {Object.keys(weekSeries).length} series • {totalGames} games
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {isCollapsed ? 'SHOW' : 'HIDE'}
                  </div>
                </div>
              </button>

              {/* Week Content - ESPN Style */}
              {!isCollapsed && (
                <div className="p-0">
                  {/* Series Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-6 text-gray-700 font-semibold text-xs uppercase tracking-wider">Matchup</th>
                          <th className="hidden md:table-cell text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider">Game</th>
                          <th className="hidden md:table-cell text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider">Date</th>
                          <th className="text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider">Result</th>
                          <th className="hidden md:table-cell text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider"></th>
                          <th className="hidden md:table-cell text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider"></th>
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
                              {/* Series Header Row - ESPN Style */}
                              <tr className="border-b border-gray-200 bg-gray-200 hover:bg-gray-300 transition-colors">
                                <td
                                  className="py-3 px-6 text-gray-800 font-semibold cursor-pointer"
                                  onClick={() => toggleSeriesCollapse(seriesId)}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-blue-600">
                                      {isSeriesCollapsed ? '▶' : '▼'}
                                    </span>
                                    <span className="text-base">{matchupName}</span>
                                    <span className="text-xs text-gray-500 font-normal">
                                      ({sortedSeriesGames.length} games)
                                    </span>
                                  </div>
                                </td>
                                <td className="hidden md:table-cell text-center py-3 px-4 text-gray-600 text-sm">
                                  SERIES
                                </td>
                                <td className="hidden md:table-cell text-center py-3 px-4 text-gray-600 text-sm">
                                  --
                                </td>
                                <td className="text-center py-3 px-4">
                                  <span className="text-gray-800 font-bold text-sm">
                                    {homeWins}-{awayWins}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell text-center py-3 px-4 text-gray-600 text-sm">

                                </td>
                                <td className="hidden md:table-cell text-center py-3 px-4 text-gray-600 text-sm">

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
                                    {/* Game Header Row - ESPN Style */}
                                    <tr
                                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${
                                        isGameExpanded
                                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                          : 'bg-white'
                                      }`}
                                      onClick={() => toggleGameCollapse(game.id)}
                                    >
                                      {/* Game Title with Expand Icon */}
                                      <td className="py-3 px-6 pl-12">
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm text-blue-600">
                                            {isGameExpanded ? '▼' : '▶'}
                                          </span>
                                          <span className="text-gray-700 text-sm font-medium">
                                            Game {game.series_game || (gameIndex + 1)}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Game Number */}
                                      <td className="hidden md:table-cell text-center py-3 px-4 text-gray-600 text-sm">
                                        G{game.series_game || (gameIndex + 1)}
                                      </td>

                                      {/* Date */}
                                      <td className="hidden md:table-cell text-center py-3 px-4 text-gray-600 text-sm">
                                        {game.game_date ? new Date(game.game_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '--'}
                                      </td>

                                      {/* Game Winner */}
                                      <td className="text-center py-3 px-4">
                                        <span className="font-semibold text-gray-800 text-sm">
                                          {(() => {
                                            const homeGoals = game.total_home_goals || 0;
                                            const awayGoals = game.total_away_goals || 0;

                                            // Check for forfeits first
                                            if (game.home_team_forfeit) {
                                              return (
                                                <div>
                                                  <span className="text-red-600">Forfeit ({game.home_display})</span>
                                                </div>
                                              );
                                            } else if (game.away_team_forfeit) {
                                              return (
                                                <div>
                                                  <span className="text-red-600">Forfeit ({game.away_display})</span>
                                                </div>
                                              );
                                            } else if (homeGoals > awayGoals) {
                                              return (
                                                <div>
                                                  <span className="text-green-600">{game.home_display}</span>
                                                  <span className="text-gray-600 ml-1">({homeGoals}-{awayGoals})</span>
                                                </div>
                                              );
                                            } else if (awayGoals > homeGoals) {
                                              return (
                                                <div>
                                                  <span className="text-green-600">{game.away_display}</span>
                                                  <span className="text-gray-600 ml-1">({awayGoals}-{homeGoals})</span>
                                                </div>
                                              );
                                            } else {
                                              // 0-0 means unplayed, any other tie score is a legitimate tie
                                              if (homeGoals === 0 && awayGoals === 0) {
                                                return (
                                                  <div>
                                                    <span className="text-gray-500">Unplayed</span>
                                                  </div>
                                                );
                                              } else {
                                                return (
                                                  <div>
                                                    <span className="text-yellow-600">TIE</span>
                                                    <span className="text-gray-600 ml-1">({homeGoals}-{awayGoals})</span>
                                                  </div>
                                                );
                                              }
                                            }
                                          })()}
                                        </span>
                                      </td>

                                      {/* Empty columns */}
                                      <td className="hidden md:table-cell text-center py-3 px-4 text-gray-600 text-sm">

                                      </td>

                                      <td className="hidden md:table-cell text-center py-3 px-4 text-gray-600 text-sm">

                                      </td>
                                    </tr>

                                    {/* Expanded Game Details */}
                                    {isGameExpanded && (
                                      <tr className={`bg-gray-50 ${isLastGameInSeries ? 'border-b-2 border-gray-200' : ''}`}>
                                        <td colSpan="6" className="p-0">
                                          <div className="p-4 bg-gray-50">
                                            {isLoadingGame ? (
                                              <div className="flex items-center justify-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                                <span className="ml-3 text-gray-800 font-sans">Loading player stats...</span>
                                              </div>
                                            ) : gamePlayerData ? (
                                              <div className="overflow-x-auto bg-white rounded-lg border border-gray-300">
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
                                                      .map((player, rowIndex) => (
                                                      <tr key={`home-team-${game.id}-player-${player.id}`} className="border-b border-gray-300 hover:bg-gray-50">
                                                        <td className="py-2 px-3 text-black font-bold bg-gray-200">
                                                          {rowIndex === 0 ? `🏠 ${game.home_display}` : ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-black font-bold bg-gray-300">
                                                          {player.display_name || player.player_name || 'Unknown Player'}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black font-bold">{player.stats?.points || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">{player.stats?.goals || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black">{player.stats?.assists || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">{player.stats?.saves || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black">{player.stats?.shots || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">{player.stats?.mvps || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black">{player.stats?.demos || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">{player.stats?.epic_saves || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black">{player.stats?.otg || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">1</span>
                                                        </td>
                                                      </tr>
                                                    ))}

                                                    {/* Spacer Row */}
                                                    <tr className="border-b-2 border-gray-400 bg-gray-200">
                                                      <td colSpan="12" className="py-1"></td>
                                                    </tr>

                                                    {/* Away Team Players */}
                                                    {gamePlayerData.awayPlayers && Array.from(new Set(gamePlayerData.awayPlayers.map(p => p.id)))
                                                      .map(playerId => gamePlayerData.awayPlayers.find(p => p.id === playerId))
                                                      .map((player, rowIndex) => (
                                                      <tr key={`away-team-${game.id}-player-${player.id}`} className="border-b border-gray-300 hover:bg-gray-50">
                                                        <td className="py-2 px-3 text-black font-bold bg-gray-200">
                                                          {rowIndex === 0 ? `✈️ ${game.away_display}` : ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-black font-bold bg-gray-300">
                                                          {player.display_name || player.player_name || 'Unknown Player'}
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black font-bold">{player.stats?.points || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">{player.stats?.goals || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black">{player.stats?.assists || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">{player.stats?.saves || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black">{player.stats?.shots || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">{player.stats?.mvps || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black">{player.stats?.demos || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">{player.stats?.epic_saves || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-200">
                                                          <span className="text-black">{player.stats?.otg || 0}</span>
                                                        </td>
                                                        <td className="text-center py-2 px-2 bg-gray-300">
                                                          <span className="text-black">1</span>
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>

                                                {/* Game Notes Section */}
                                                {game.notes && (
                                                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                                                    <h4 className="text-sm font-bold text-gray-800 mb-2">📝 Game Notes</h4>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                      {game.notes}
                                                    </div>
                                                  </div>
                                                )}
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
        </div>
      )}
    </div>
  );
};

export default WeeklyGameResults;