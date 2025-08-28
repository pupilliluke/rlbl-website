import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, fallbackData } from "../services/apiService";
import { ChartBarIcon, TrophyIcon, GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon } from "../components/Icons";
import { createTeamSlug } from "../utils/slugify.js";

export default function Standings() {
  const navigate = useNavigate();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSymbols, setShowSymbols] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        console.log('Fetching standings data from API...');
        const standingsData = await apiService.getStandings();
        console.log('Standings data received:', standingsData);
        setStandings(standingsData);
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
  }, []);

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
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Symbol Toggle */}
            <button
              onClick={() => setShowSymbols(!showSymbols)}
              className={`px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all ${
                showSymbols 
                  ? "bg-blue-600/50 border border-blue-500/50 text-white shadow-lg" 
                  : "bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:border-blue-500/30"
              }`}
            >
              {showSymbols ? "Hide Symbols" : "Show Symbols"}
            </button>
          </div>
        </div>

        {/* Legend */}
        {showSymbols && (
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-600/50 mb-8">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4">Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">👑</span>
                <span>League Leader</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">🟢</span>
                <span>Playoff Position</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-lg">🔴</span>
                <span>Bottom Team</span>
              </div>
            </div>
          </div>
        )}

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
                      let symbol = "";
                      let symbolClass = "";
                      
                      if (showSymbols) {
                        if (rank === 1) {
                          symbol = "👑";
                          symbolClass = "text-yellow-400";
                        } else if (rank <= 3) {
                          symbol = "🟢";
                          symbolClass = "text-green-400";
                        } else if (rank === standings.length) {
                          symbol = "🔴";
                          symbolClass = "text-red-400";
                        }
                      }

                      const baseStyle = "transition duration-200 border-b border-gray-600/50 hover:bg-gray-700/50";
                      const styles = {
                        1: "bg-gradient-to-r from-yellow-900/30 to-yellow-800/30",
                        2: "bg-gradient-to-r from-gray-800/30 to-gray-700/30",
                        3: "bg-gradient-to-r from-amber-900/30 to-amber-800/30",
                      };

                      const medal = rank === 1 ? <GoldMedalIcon className="w-5 h-5" /> : rank === 2 ? <SilverMedalIcon className="w-5 h-5" /> : rank === 3 ? <BronzeMedalIcon className="w-5 h-5" /> : "";
                      const rowClass = styles[rank] || "";

                      return (
                        <tr key={team.id} className={`${rowClass} ${baseStyle}`}>
                          <td className="py-3 md:py-4 px-3 md:px-4 font-bold">
                            <span className="mr-2">{medal || rank}</span>
                            <span className={symbolClass}>{symbol}</span>
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
          <p className="mt-4">Updated live from database • Current Season</p>
        </div>
      </div>
    </div>
  );
}