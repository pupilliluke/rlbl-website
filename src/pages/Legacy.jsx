import { useState, useEffect } from "react";
import { apiService } from "../services/apiService.js";
import { BuildingIcon, TrophyIcon, ChartBarIcon, StarIcon, FireIcon } from "../components/Icons";
import { useNavigate } from "react-router-dom";
import { createTeamSlug, createPlayerSlug } from "../utils/slugify.js";

export default function Legacy() {
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState("career");
  const [seasons, setSeasons] = useState([]);
  const [stats, setStats] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch available seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const seasonsData = await apiService.getSeasons();
        // Filter to only show past seasons (not current)
        const pastSeasons = seasonsData.filter(s => !s.is_active);
        setSeasons(pastSeasons);
      } catch (error) {
        console.error('Failed to fetch seasons:', error);
      }
    };
    fetchSeasons();
  }, []);

  // Fetch data when season changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (selectedSeason === "career") {
          // Fetch all-time career stats
          const [careerStats] = await Promise.all([
            apiService.getStats("career")
          ]);
          setStats(careerStats);
          setStandings([]);
        } else {
          // Fetch specific season data
          const seasonId = parseInt(selectedSeason);
          const [seasonStats, seasonStandings] = await Promise.all([
            apiService.getStats(`season${seasonId}`),
            apiService.getStandings(seasonId)
          ]);
          setStats(seasonStats);
          setStandings(seasonStandings.standings || seasonStandings);
        }
      } catch (error) {
        console.error('Failed to fetch legacy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason]);

  // Calculate top performers
  const topScorer = stats.length > 0 ? stats.reduce((max, p) =>
    (parseInt(p.total_goals) || 0) > (parseInt(max.total_goals) || 0) ? p : max
  ) : null;

  const topMVP = stats.length > 0 ? stats.reduce((max, p) =>
    (parseInt(p.total_mvps) || 0) > (parseInt(max.total_mvps) || 0) ? p : max
  ) : null;

  const topPoints = stats.length > 0 ? stats.reduce((max, p) =>
    (parseInt(p.total_points) || 0) > (parseInt(max.total_points) || 0) ? p : max
  ) : null;

  // Get season champion (team with most league points or wins)
  const champion = standings.length > 0 ? standings[0] : null;

  const seasonOptions = [
    { id: "career", name: "Career Stats", year: "All-Time", description: "Cumulative statistics across all seasons" },
    ...seasons.map(s => ({
      id: s.id.toString(),
      name: s.season_name,
      year: s.start_date ? new Date(s.start_date).getFullYear() : "",
      description: s.description || `Historical season ${s.season_name}`
    }))
  ];

  const currentSeasonInfo = seasonOptions.find(s => s.id === selectedSeason);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white relative page-with-navbar">
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-900 via-blue-800 to-purple-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BuildingIcon className="w-10 h-10" />
            RLBL Legacy
          </h1>
          <p className="text-purple-200">Historical seasons, champions, and legendary performances</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Season Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-[#2a2a3d] rounded-lg overflow-hidden flex-wrap">
            {seasonOptions.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  selectedSeason === season.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {season.name} {season.year && `- ${season.year}`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-purple-200">Loading legacy data...</p>
          </div>
        ) : (
          <>
            {/* Season Overview */}
            <div className="mb-12">
              <div className="bg-[#1f1f2e] rounded-xl p-8 border border-purple-800">
                <h2 className="text-3xl font-bold text-purple-400 mb-4">
                  {currentSeasonInfo?.name} {currentSeasonInfo?.year && `- ${currentSeasonInfo.year}`}
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  {currentSeasonInfo?.description}
                </p>

                {/* Champion Display (for specific seasons) */}
                {selectedSeason !== "career" && champion && (
                  <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg p-6 mb-6">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
                      <TrophyIcon className="w-6 h-6" />
                      Season Champion
                    </h3>
                    <button
                      onClick={() => navigate(`/teams/${createTeamSlug(champion.team_name)}`)}
                      className="text-2xl text-white font-semibold hover:text-yellow-300 transition-colors"
                    >
                      {champion.team_name}
                    </button>
                    <p className="text-yellow-200 mt-2">
                      {champion.wins}W - {champion.losses}L • {champion.league_points || champion.wins} Points
                    </p>
                  </div>
                )}

                {/* Top Performers Summary */}
                {stats.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#2a2a3d] rounded-lg p-4">
                      <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5" />
                        Total Players
                      </h4>
                      <p className="text-2xl font-bold text-white">{stats.length}</p>
                    </div>
                    <div className="bg-[#2a2a3d] rounded-lg p-4">
                      <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                        <FireIcon className="w-5 h-5" />
                        Leading Scorer
                      </h4>
                      {topScorer && (
                        <>
                          <button
                            onClick={() => navigate(`/players/${createPlayerSlug(topScorer.player_name, topScorer.player_name)}`)}
                            className="text-xl font-bold text-white hover:text-purple-300 transition-colors"
                          >
                            {topScorer.player_name}
                          </button>
                          <p className="text-sm text-gray-400">{topScorer.total_goals} goals</p>
                        </>
                      )}
                    </div>
                    <div className="bg-[#2a2a3d] rounded-lg p-4">
                      <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                        <StarIcon className="w-5 h-5" />
                        Most MVPs
                      </h4>
                      {topMVP && (
                        <>
                          <button
                            onClick={() => navigate(`/players/${createPlayerSlug(topMVP.player_name, topMVP.player_name)}`)}
                            className="text-xl font-bold text-white hover:text-purple-300 transition-colors"
                          >
                            {topMVP.player_name}
                          </button>
                          <p className="text-sm text-gray-400">{topMVP.total_mvps} MVPs</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Standings (for specific seasons) */}
            {selectedSeason !== "career" && standings.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6" />
                  Final Standings
                </h2>
                <div className="bg-[#1f1f2e] rounded-xl overflow-hidden border border-purple-800">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#2a2a3d]">
                      <tr>
                        <th className="py-3 px-4 text-left font-bold text-purple-400">#</th>
                        <th className="py-3 px-4 text-left font-bold text-purple-400">Team</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">W</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">L</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">PF</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">PA</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">LP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={team.team_season_id || index} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{index + 1}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => navigate(`/teams/${createTeamSlug(team.team_name)}`)}
                              className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-gray-400"
                                style={{ backgroundColor: team.color }}
                              />
                              {team.team_name}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center text-green-400 font-semibold">{team.wins}</td>
                          <td className="py-3 px-4 text-center text-red-400 font-semibold">{team.losses}</td>
                          <td className="py-3 px-4 text-center text-blue-400">{team.points_for}</td>
                          <td className="py-3 px-4 text-center text-orange-400">{team.points_against}</td>
                          <td className="py-3 px-4 text-center text-purple-400 font-bold">{team.league_points || team.wins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Performers Table */}
            {stats.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <StarIcon className="w-6 h-6" />
                  Top Performers
                </h2>
                <div className="bg-[#1f1f2e] rounded-xl overflow-hidden border border-purple-800">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#2a2a3d]">
                      <tr>
                        <th className="py-3 px-4 text-left font-bold text-purple-400">#</th>
                        <th className="py-3 px-4 text-left font-bold text-purple-400">Player</th>
                        <th className="py-3 px-4 text-left font-bold text-purple-400">Team</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">GP</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">PTS</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">G</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">A</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">SV</th>
                        <th className="py-3 px-4 text-center font-bold text-purple-400">MVP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.slice(0, 20).map((player, index) => (
                        <tr key={player.id || index} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{index + 1}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => navigate(`/players/${createPlayerSlug(player.player_name, player.player_name)}`)}
                              className="text-white hover:text-purple-300 transition-colors font-semibold"
                            >
                              {player.player_name}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{player.team_name}</td>
                          <td className="py-3 px-4 text-center text-gray-300">{player.games_played}</td>
                          <td className="py-3 px-4 text-center text-yellow-400 font-bold">{player.total_points}</td>
                          <td className="py-3 px-4 text-center text-green-400 font-semibold">{player.total_goals}</td>
                          <td className="py-3 px-4 text-center text-blue-400 font-semibold">{player.total_assists}</td>
                          <td className="py-3 px-4 text-center text-purple-400 font-semibold">{player.total_saves}</td>
                          <td className="py-3 px-4 text-center text-orange-400 font-bold">{player.total_mvps || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Records Section */}
            {stats.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <FireIcon className="w-6 h-6" />
                  {selectedSeason === "career" ? "All-Time Records" : "Season Records"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Most Points */}
                  <div className="bg-[#1f1f2e] rounded-lg p-6 border border-purple-800">
                    <h3 className="text-yellow-400 font-bold mb-3">Most Points</h3>
                    {topPoints && (
                      <>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topPoints.player_name, topPoints.player_name)}`)}
                          className="text-2xl font-bold text-white hover:text-purple-300 transition-colors block"
                        >
                          {topPoints.player_name}
                        </button>
                        <p className="text-gray-300 mt-2">{topPoints.total_points} points</p>
                        <p className="text-sm text-gray-400">{topPoints.team_name}</p>
                      </>
                    )}
                  </div>

                  {/* Most Goals */}
                  <div className="bg-[#1f1f2e] rounded-lg p-6 border border-purple-800">
                    <h3 className="text-green-400 font-bold mb-3">Most Goals</h3>
                    {topScorer && (
                      <>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topScorer.player_name, topScorer.player_name)}`)}
                          className="text-2xl font-bold text-white hover:text-purple-300 transition-colors block"
                        >
                          {topScorer.player_name}
                        </button>
                        <p className="text-gray-300 mt-2">{topScorer.total_goals} goals</p>
                        <p className="text-sm text-gray-400">{topScorer.team_name}</p>
                      </>
                    )}
                  </div>

                  {/* Most MVPs */}
                  <div className="bg-[#1f1f2e] rounded-lg p-6 border border-purple-800">
                    <h3 className="text-orange-400 font-bold mb-3">Most MVPs</h3>
                    {topMVP && (
                      <>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topMVP.player_name, topMVP.player_name)}`)}
                          className="text-2xl font-bold text-white hover:text-purple-300 transition-colors block"
                        >
                          {topMVP.player_name}
                        </button>
                        <p className="text-gray-300 mt-2">{topMVP.total_mvps} MVPs</p>
                        <p className="text-sm text-gray-400">{topMVP.team_name}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Preserving the history and legacy of the Rocket League Business League</p>
        </div>
      </div>
    </div>
  );
}
