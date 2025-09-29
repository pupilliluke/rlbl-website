import React, { useState, useEffect } from "react";
import { CalendarIcon } from "../components/Icons";
import { apiService } from "../services/apiService";
import WeeklyGameResults from "../components/WeeklyGameResults";

export default function Weekly() {
  const [gameResultsData, setGameResultsData] = useState([]);
  const [seasonsData, setSeasonsData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load seasons data on component mount
  useEffect(() => {
    loadSeasons();
  }, []);

  // Load current season's game results when season is selected
  useEffect(() => {
    if (selectedSeason) {
      loadGameResults();
    }
  }, [selectedSeason]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSeasons = async () => {
    try {
      const seasons = await apiService.getSeasons();
      setSeasonsData(seasons);

      // Auto-select the most recent season
      if (seasons.length > 0) {
        const currentSeason = seasons.find(s => s.is_current) || seasons[0];
        setSelectedSeason(currentSeason);
      }
    } catch (error) {
      console.error('Failed to load seasons:', error);
    }
  };

  const loadGameResults = async () => {
    if (!selectedSeason) return;

    try {
      setLoading(true);
      const [games, , playerGameStats, teamSeasons] = await Promise.all([
        apiService.getGames(selectedSeason.id),
        apiService.getPlayers(),
        apiService.getPlayerGameStats(selectedSeason.id),
        apiService.getTeamSeasons(selectedSeason.id)
      ]);

      const gameResults = games.map(game => {
        // Get team displays
        const homeTeamSeason = teamSeasons.find(ts => ts.id === game.home_team_season_id);
        const awayTeamSeason = teamSeasons.find(ts => ts.id === game.away_team_season_id);

        // Calculate total goals from player stats
        const homePlayerStats = playerGameStats.filter(stat => stat.team_season_id === game.home_team_season_id && stat.game_id === game.id);
        const awayPlayerStats = playerGameStats.filter(stat => stat.team_season_id === game.away_team_season_id && stat.game_id === game.id);

        const totalHomeGoals = homePlayerStats.reduce((sum, stat) => sum + (stat.goals || 0), 0);
        const totalAwayGoals = awayPlayerStats.reduce((sum, stat) => sum + (stat.goals || 0), 0);

        return {
          ...game,
          home_display: homeTeamSeason?.display_name || 'Unknown Team',
          away_display: awayTeamSeason?.display_name || 'Unknown Team',
          total_home_goals: totalHomeGoals,
          total_away_goals: totalAwayGoals
        };
      });

      setGameResultsData(gameResults);
    } catch (error) {
      console.error('Failed to load game results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 relative page-with-navbar">
      {/* Dark Blue Header */}
      <div className="bg-slate-700 pt-16">
        <div className="w-full px-6 py-6">
          {/* Breadcrumb */}
          <div className="text-sm text-slate-300 mb-2">
            <span className="hover:underline cursor-pointer">RLBL</span>
            <span className="mx-2">></span>
            <span className="font-medium text-slate-100">Weekly Scores</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Weekly Scores
              </h1>
              <p className="text-slate-300 text-base">
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search teams, players, weeks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-600 border border-slate-500 text-white placeholder-slate-300 pl-10 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full max-w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Season Selector */}
              {seasonsData.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-300">Season:</span>
                  <select
                    value={selectedSeason?.id || ''}
                    onChange={(e) => {
                      const season = seasonsData.find(s => s.id === parseInt(e.target.value));
                      setSelectedSeason(season);
                    }}
                    className="bg-slate-600 border border-slate-500 text-white px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  >
                    {seasonsData.map(season => (
                      <option key={season.id} value={season.id}>
                        {season.season_name} {season.is_current ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
            <span className="ml-3 text-lg text-slate-300">Loading...</span>
          </div>
        ) : gameResultsData.length > 0 ? (
          <WeeklyGameResults
            gameResultsData={gameResultsData}
            apiService={apiService}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Games Found</h2>
              <p className="text-gray-600 mb-4">
                No games found for {selectedSeason?.season_name || 'the selected season'}.
              </p>
              <p className="text-gray-500 text-sm">
                Game results will appear here once games are played and stats are recorded.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}