import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, fallbackData } from "../services/apiService";
import { ChartBarIcon, TrophyIcon, ChevronDownIcon } from "../components/Icons";
import { createTeamSlug } from "../utils/slugify.js";

export default function Standings() {
  const navigate = useNavigate();
  const [standings, setStandings] = useState([]);
  const [standingsMetadata, setStandingsMetadata] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasonsLoading, setSeasonsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lpModalOpen, setLpModalOpen] = useState(false);
  const [selectedTeamLP, setSelectedTeamLP] = useState(null);
  const [lpBreakdown, setLpBreakdown] = useState([]);
  const [conferenceFilter, setConferenceFilter] = useState('all'); // 'all', 'East', 'West'
  const [viewMode, setViewMode] = useState('combined'); // 'combined', 'grouped'

  // Function to get conference for a team (database-driven)
  const getTeamConference = (team, seasonId) => {
    // Use database conference if available
    if (team.conference) {
      return team.conference;
    }
    return null;
  };

  // Fetch available seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        setSeasonsLoading(true);
        console.log('Fetching seasons data from API...');
        const seasonsData = await apiService.getSeasons();
        console.log('Seasons data received:', seasonsData);
        setSeasons(seasonsData);
        
        // Set default season to the most recent active one, or first one
        if (seasonsData.length > 0) {
          const activeSeason = seasonsData.find(s => s.is_active) || seasonsData[seasonsData.length - 1];
          setSelectedSeason(activeSeason.id);
        }
      } catch (err) {
        console.error('Failed to fetch seasons:', err);
        // Fallback to manual season options
        const fallbackSeasons = [
          { id: 3, season_name: 'Season 3', is_active: true },
          { id: 2, season_name: 'Season 2', is_active: false },
          { id: 1, season_name: 'Season 1', is_active: false }
        ];
        setSeasons(fallbackSeasons);
        setSelectedSeason(3);
      } finally {
        setSeasonsLoading(false);
      }
    };

    fetchSeasons();
  }, []);

  // Auto-generate and fetch standings when season changes
  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedSeason) return;

      try {
        setLoading(true);
        console.log(`Auto-generating standings from game data for season ${selectedSeason}...`);

        // First, auto-generate standings from game results
        try {
          await apiService.autoGenerateStandings(selectedSeason);
          console.log('Standings auto-generated successfully');
        } catch (genErr) {
          console.warn('Auto-generate failed, will use existing standings:', genErr);
        }

        // Then fetch the standings (whether newly generated or existing)
        const standingsResponse = await apiService.getStandings(selectedSeason);
        console.log('Standings data received:', standingsResponse);

        // Handle new response format with metadata
        if (standingsResponse.standings) {
          setStandings(standingsResponse.standings);
          setStandingsMetadata(standingsResponse.metadata);
        } else {
          // Fallback for old response format
          setStandings(standingsResponse);
          setStandingsMetadata(null);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch standings:', err);
        console.error('Error details:', err.message);
        setError(err.message);
        console.log('Using fallback data due to API error');
        setStandings(fallbackData.standings);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [selectedSeason]);

  // Get filtered standings based on conference selection
  const getFilteredStandings = () => {
    if (!standings.length) return [];

    if (selectedSeason === 3 && conferenceFilter !== 'all') {
      return standings.filter(team => {
        const conference = getTeamConference(team, selectedSeason);
        return conference === conferenceFilter;
      });
    }

    return standings;
  };

  // Group standings by conference for Season 3
  const groupedStandings = () => {
    if (selectedSeason === 3 && standings.length > 0) {
      const grouped = { 'West': [], 'East': [], 'Other': [] };

      standings.forEach((team, index) => {
        const conference = getTeamConference(team, selectedSeason);
        const teamWithRank = { ...team, overallRank: index + 1 };

        if (conference) {
          grouped[conference].push(teamWithRank);
        } else {
          grouped['Other'].push(teamWithRank);
        }
      });

      // Sort each conference by league points (descending)
      Object.keys(grouped).forEach(conf => {
        grouped[conf].sort((a, b) => (b.league_points || 0) - (a.league_points || 0));
      });

      return grouped;
    }
    return null;
  };

  // Function to fetch league points breakdown for a team
  const fetchLeaguePointsBreakdown = async (teamSeasonId, teamName) => {
    try {
      const breakdown = await apiService.getTeamLeaguePointsBreakdown(selectedSeason, teamSeasonId);
      // Filter out tie games
      const filteredBreakdown = breakdown.filter(game => game.game_type !== 'tie');
      setLpBreakdown(filteredBreakdown);
      setSelectedTeamLP(teamName);
      setLpModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch league points breakdown:', err);
    }
  };

  // Render standings table
  const renderStandingsTable = (teamsData, startRank = 1, showConferenceRank = false) => (
    <div className="bg-gray-800/90 shadow-2xl overflow-hidden border border-gray-600/50 rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm md:text-base">
          <thead className="bg-gray-900/90 border-b border-gray-600/50">
            <tr>
              <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">#</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">Team</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white">W</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white">L</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white">OTG</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white">FF</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white">PF</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white">PA</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white">Diff</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white">LP</th>
              <th className="py-3 md:py-4 px-3 md:px-4 text-center font-bold text-white hidden md:table-cell">Win%</th>
            </tr>
          </thead>
          <tbody>
            {teamsData.map((team, index) => {
              const rank = showConferenceRank ? index + 1 : (team.overallRank || startRank + index);

              const baseStyle = "transition duration-200 border-b border-gray-600/50 hover:bg-gray-700/50";
              const styles = {
                1: "bg-gradient-to-r from-yellow-900/30 to-yellow-800/30",
                2: "bg-gradient-to-r from-gray-800/30 to-gray-700/30",
                3: "bg-gradient-to-r from-amber-900/30 to-amber-800/30",
              };

              const rowClass = showConferenceRank && styles[rank] ? styles[rank] : "";

              return (
                <tr key={team.team_season_id} className={`${rowClass} ${baseStyle}`}>
                  <td className="py-3 md:py-4 px-3 md:px-4 font-bold">
                    <span className="mr-2">{rank}</span>
                    {showConferenceRank && team.overallRank && (
                      <span className="text-xs text-gray-400">({team.overallRank})</span>
                    )}
                  </td>
                  <td className="py-3 md:py-4 px-3 md:px-4 font-semibold">
                    <button
                      onClick={() => navigate(`/teams/${createTeamSlug(team.team_name)}`)}
                      className="flex items-center gap-3 text-white hover:text-blue-400 transition-colors cursor-pointer w-full text-left"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-400"
                        style={{ backgroundColor: team.color }}
                      />
                      {team.team_name}
                    </button>
                  </td>
                  <td className="py-3 md:py-4 px-3 md:px-4 text-center text-green-400 font-semibold">{team.wins}</td>
                  <td className="py-3 md:py-4 px-3 md:px-4 text-center text-red-400 font-semibold">{team.losses}</td>
                  <td className="py-3 md:py-4 px-3 md:px-4 text-center text-yellow-400 font-semibold">{(team.overtime_wins || 0) + (team.overtime_losses || 0)}</td>
                  <td className="py-3 md:py-4 px-3 md:px-4 text-center text-red-400 font-semibold">{team.forfeits || 0}</td>
                  <td className="py-3 md:py-4 px-3 md:px-4 text-center text-blue-400">{team.points_for}</td>
                  <td className="py-3 md:py-4 px-3 md:px-4 text-center text-orange-400">{team.points_against}</td>
                  <td className={`py-3 md:py-4 px-3 md:px-4 text-center font-semibold ${
                    team.point_diff > 0 ? 'text-green-400' :
                    team.point_diff < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {team.point_diff > 0 ? '+' : ''}{team.point_diff}
                  </td>
                  <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                    <button
                      onClick={() => fetchLeaguePointsBreakdown(team.team_season_id, team.team_name)}
                      className="text-purple-400 font-bold hover:text-purple-300 hover:underline cursor-pointer transition-colors"
                    >
                      {team.league_points || 0}
                    </button>
                  </td>
                  <td className="py-3 md:py-4 px-3 md:px-4 hidden md:table-cell">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-yellow-400">
                        {team.win_percentage ? Number(team.win_percentage).toFixed(2) : '0.00'}%
                      </span>
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${team.win_percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading standings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white page-with-navbar overflow-x-hidden">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm shadow-2xl pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8" />
            RLBL Standings
          </h1>
          <p className="text-blue-200 text-sm md:text-base">
            Current season standings and team rankings
            {error && <span className="text-red-400 ml-2">(Using cached data)</span>}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Duplicate Team Warning */}
        {standingsMetadata && standingsMetadata.has_duplicates && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 text-xl mt-0.5">⚠️</div>
              <div>
                <h3 className="text-yellow-400 font-semibold mb-2">Duplicate Team Names Detected</h3>
                <div className="space-y-1">
                  {standingsMetadata.duplicate_warnings.map((warning, index) => (
                    <p key={index} className="text-yellow-200 text-sm">{warning}</p>
                  ))}
                </div>
                <p className="text-yellow-300 text-xs mt-2">
                  Multiple teams with the same name may cause display issues. Consider renaming duplicates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Season Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={seasonsLoading}
                className="inline-flex items-center justify-between px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors min-w-[140px] disabled:opacity-50"
              >
                <span className="text-sm font-medium">
                  {seasonsLoading ? 'Loading...' :
                   seasons.find(s => s.id === selectedSeason)?.season_name || 'Select Season'}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 ml-2 transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && !seasonsLoading && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-full">
                  {seasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => {
                        setSelectedSeason(season.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedSeason === season.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300'
                      }`}
                    >
                      {season.season_name} {season.is_active && '(Current)'}
                    </button>
                  ))}
                </div>
              )}

              {/* Backdrop to close dropdown */}
              {dropdownOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
              )}
            </div>

            {/* Conference Filter - Only show for Season 3 */}
            {selectedSeason === 3 && (
              <select
                value={conferenceFilter}
                onChange={(e) => setConferenceFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors text-sm"
              >
                <option value="all">All Conferences</option>
                <option value="East">East Conference</option>
                <option value="West">West Conference</option>
              </select>
            )}

            {/* View Mode Toggle - Only show for Season 3 when showing all conferences */}
            {selectedSeason === 3 && conferenceFilter === 'all' && (
              <div className="flex items-center bg-gray-700 rounded-lg border border-gray-600 p-1">
                <button
                  onClick={() => setViewMode('combined')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'combined'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Combined
                </button>
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grouped'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  By Conference
                </button>
              </div>
            )}

            {/* Recalculate Standings Button */}
            <button
              onClick={async () => {
                if (!selectedSeason) return;
                setLoading(true);
                try {
                  await apiService.autoGenerateStandings(selectedSeason);
                  const standingsResponse = await apiService.getStandings(selectedSeason);
                  if (standingsResponse.standings) {
                    setStandings(standingsResponse.standings);
                    setStandingsMetadata(standingsResponse.metadata);
                  } else {
                    setStandings(standingsResponse);
                    setStandingsMetadata(null);
                  }
                } catch (err) {
                  console.error('Failed to recalculate standings:', err);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg border border-green-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>


        {/* Current Standings */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 text-center flex items-center justify-center gap-3">
            <TrophyIcon className="w-7 h-7" />
            Current Standings
          </h2>

          {standings.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>No standings data available. Make sure the API server is running.</p>
            </div>
          ) : (
            <>
              {selectedSeason === 3 ? (
                // Season 3 with conference handling
                <>
                  {conferenceFilter !== 'all' ? (
                    // Show filtered conference
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">🛡️</div>
                        <h3 className="text-xl font-bold text-white">{conferenceFilter} Conference</h3>
                      </div>
                      {renderStandingsTable(getFilteredStandings())}
                    </div>
                  ) : viewMode === 'grouped' ? (
                    // Conference-grouped view
                    <div className="space-y-8">
                      {(() => {
                        const grouped = groupedStandings();
                        return (
                          <>
                            {/* West Conference */}
                            {grouped.West.length > 0 && (
                              <div>
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="text-2xl">🛡️</div>
                                  <h3 className="text-xl font-bold text-white">West Conference</h3>
                                </div>
                                {renderStandingsTable(grouped.West, 1, true)}
                              </div>
                            )}

                            {/* East Conference */}
                            {grouped.East.length > 0 && (
                              <div>
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="text-2xl">🛡️</div>
                                  <h3 className="text-xl font-bold text-white">East Conference</h3>
                                </div>
                                {renderStandingsTable(grouped.East, 1, true)}
                              </div>
                            )}

                            {/* Other teams (not assigned to conference) */}
                            {grouped.Other.length > 0 && (
                              <div>
                                <h3 className="text-xl font-bold text-white mb-4">Other Teams</h3>
                                {renderStandingsTable(grouped.Other, 1, false)}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    // Combined view - all teams in one table
                    renderStandingsTable(standings)
                  )}
                </>
              ) : (
                // Regular standings for other seasons
                renderStandingsTable(standings)
              )}
            </>
          )}
        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div><strong>W</strong> - Wins</div>
            <div><strong>L</strong> - Losses</div>
            <div><strong>OTG</strong> - Overtime Games</div>
            <div><strong>FF</strong> - Forfeits</div>
            <div><strong>PF</strong> - Points For</div>
            <div><strong>PA</strong> - Points Against</div>
            <div><strong>Diff</strong> - Point Differential</div>
            <div><strong>LP</strong> - League Points</div>
            <div><strong>Win%</strong> - Win Percentage</div>
          </div>
          <p className="mt-4">
            Updated live from database • 
            {seasons.find(s => s.id === selectedSeason)?.season_name || 'Season'}
            {seasons.find(s => s.id === selectedSeason)?.is_active && ' (Current)'}
            {standingsMetadata && (
              <span> • {standingsMetadata.total_teams} teams</span>
            )}
          </p>
        </div>
      </div>

      {/* League Points Breakdown Modal */}
      {lpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-600 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-600">
              <h3 className="text-xl font-bold text-white">
                League Points Breakdown - {selectedTeamLP}
              </h3>
              <button
                onClick={() => setLpModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {lpBreakdown.length === 0 ? (
                <p className="text-gray-400 text-center">No games found for this team.</p>
              ) : (
                <div className="space-y-4">
                  {lpBreakdown.map((game, index) => (
                    <div
                      key={index}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-semibold">
                          vs {game.opponent_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          Week {game.week_number || 'TBD'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                          Score: {game.team_score} - {game.opponent_score}
                          {game.game_type === 'forfeit' && ' (Forfeit)'}
                          {game.game_type.includes('overtime') && ' (OT)'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {game.game_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </span>
                          <span className="bg-purple-600 text-white px-2 py-1 rounded font-bold">
                            {game.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="bg-gray-700 rounded-lg p-4 border-2 border-purple-500">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-lg">Total League Points</span>
                      <span className="bg-purple-600 text-white px-3 py-2 rounded font-bold text-lg">
                        {lpBreakdown.reduce((sum, game) => sum + game.points, 0)} pts
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-600 bg-gray-700/30">
              <div className="text-xs text-gray-400 text-center">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <span>Regulation Win: 4pts</span>
                  <span>OT Win: 3pts</span>
                  <span>OT Loss: 2pts</span>
                  <span>Regulation Loss: 1pt</span>
                  <span>Forfeit: 0pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}