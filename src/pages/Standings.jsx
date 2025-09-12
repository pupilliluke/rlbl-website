import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, fallbackData } from "../services/apiService";
import { ChartBarIcon, TrophyIcon, GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon, ChevronDownIcon } from "../components/Icons";
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
  const [showSymbols, setShowSymbols] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  // Fetch standings when season changes
  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedSeason) return;
      
      try {
        setLoading(true);
        console.log(`Fetching standings data for season ${selectedSeason}...`);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white page-with-navbar">
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
            <div className="bg-gray-800/90 shadow-2xl overflow-hidden border border-gray-600/50 rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm md:text-base">
                  <thead className="bg-gray-900/90 border-b border-gray-600/50">
                    <tr>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">#</th>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">Team</th>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">W</th>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">L</th>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">T</th>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">PF</th>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">PA</th>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">Diff</th>
                      <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white hidden md:table-cell">Win%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => {
                      const rank = index + 1;

                      const baseStyle = "transition duration-200 border-b border-gray-600/50 hover:bg-gray-700/50";
                      const styles = {
                        1: "bg-gradient-to-r from-yellow-900/30 to-yellow-800/30",
                        2: "bg-gradient-to-r from-gray-800/30 to-gray-700/30",
                        3: "bg-gradient-to-r from-amber-900/30 to-amber-800/30",
                      };

                      const rowClass = styles[rank] || "";

                      return (
                        <tr key={team.id} className={`${rowClass} ${baseStyle}`}>
                          <td className="py-3 md:py-4 px-3 md:px-4 font-bold">
                            <span className="mr-2">{rank}</span>
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
                          <td className="py-3 md:py-4 px-3 md:px-4 text-green-400 font-semibold">{team.wins}</td>
                          <td className="py-3 md:py-4 px-3 md:px-4 text-red-400 font-semibold">{team.losses}</td>
                          <td className="py-3 md:py-4 px-3 md:px-4 text-gray-300">{team.ties}</td>
                          <td className="py-3 md:py-4 px-3 md:px-4 text-blue-400">{team.points_for}</td>
                          <td className="py-3 md:py-4 px-3 md:px-4 text-orange-400">{team.points_against}</td>
                          <td className={`py-3 md:py-4 px-3 md:px-4 font-semibold ${
                            team.point_diff > 0 ? 'text-green-400' : 
                            team.point_diff < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {team.point_diff > 0 ? '+' : ''}{team.point_diff}
                          </td>
                          <td className="py-3 md:py-4 px-3 md:px-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-yellow-400">
                                {team.win_percentage ? Number(team.win_percentage).toFixed(1) : '0.0'}%
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
          )}
        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div><strong>W</strong> - Wins</div>
            <div><strong>L</strong> - Losses</div>
            <div><strong>T</strong> - Ties</div>
            <div><strong>PF</strong> - Points For</div>
            <div><strong>PA</strong> - Points Against</div>
            <div><strong>Diff</strong> - Point Differential</div>
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
    </div>
  );
}