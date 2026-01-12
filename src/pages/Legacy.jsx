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

            {/* All-Time Leaders - Show only when viewing career stats */}
            {selectedSeason === "career" && stats.length > 0 && (() => {
              // Calculate leaders for each stat
              const topAssists = stats.reduce((max, p) =>
                (parseInt(p.total_assists) || 0) > (parseInt(max.total_assists) || 0) ? p : max
              );
              const topSaves = stats.reduce((max, p) =>
                (parseInt(p.total_saves) || 0) > (parseInt(max.total_saves) || 0) ? p : max
              );
              const topShots = stats.reduce((max, p) =>
                (parseInt(p.total_shots) || 0) > (parseInt(max.total_shots) || 0) ? p : max
              );
              const topDemos = stats.reduce((max, p) =>
                (parseInt(p.total_demos) || 0) > (parseInt(max.total_demos) || 0) ? p : max
              );
              const topEpicSaves = stats.reduce((max, p) =>
                (parseInt(p.total_epic_saves) || 0) > (parseInt(max.total_epic_saves) || 0) ? p : max
              );
              const topOTG = stats.reduce((max, p) =>
                (parseInt(p.total_otg) || 0) > (parseInt(max.total_otg) || 0) ? p : max
              );
              const mostGames = stats.reduce((max, p) =>
                (parseInt(p.games_played) || 0) > (parseInt(max.games_played) || 0) ? p : max
              );

              return (
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text mb-6 flex items-center gap-3">
                    <TrophyIcon className="w-8 h-8 text-yellow-400" />
                    All-Time Leaders
                  </h2>
                  <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-8 border-2 border-yellow-400/50 shadow-2xl shadow-yellow-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Points Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/30">
                        <div className="text-yellow-400 font-bold text-sm mb-2 uppercase tracking-wide">📊 Total Points</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topPoints.player_name, topPoints.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-yellow-300 transition-colors block mb-1"
                        >
                          {topPoints.player_name}
                        </button>
                        <div className="text-3xl font-black text-yellow-400 mb-1">{(topPoints.total_points || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topPoints.team_name}</div>
                      </div>

                      {/* Goals Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-green-400/30 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30">
                        <div className="text-green-400 font-bold text-sm mb-2 uppercase tracking-wide">⚽ Total Goals</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topScorer.player_name, topScorer.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-green-300 transition-colors block mb-1"
                        >
                          {topScorer.player_name}
                        </button>
                        <div className="text-3xl font-black text-green-400 mb-1">{(topScorer.total_goals || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topScorer.team_name}</div>
                      </div>

                      {/* Assists Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-blue-400/30 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30">
                        <div className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wide">🎯 Total Assists</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topAssists.player_name, topAssists.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-blue-300 transition-colors block mb-1"
                        >
                          {topAssists.player_name}
                        </button>
                        <div className="text-3xl font-black text-blue-400 mb-1">{(topAssists.total_assists || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topAssists.team_name}</div>
                      </div>

                      {/* Saves Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-purple-400/30 hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30">
                        <div className="text-purple-400 font-bold text-sm mb-2 uppercase tracking-wide">🛡️ Total Saves</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topSaves.player_name, topSaves.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-purple-300 transition-colors block mb-1"
                        >
                          {topSaves.player_name}
                        </button>
                        <div className="text-3xl font-black text-purple-400 mb-1">{(topSaves.total_saves || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topSaves.team_name}</div>
                      </div>

                      {/* MVPs Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-orange-400/30 hover:border-orange-400 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30">
                        <div className="text-orange-400 font-bold text-sm mb-2 uppercase tracking-wide">⭐ Total MVPs</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topMVP.player_name, topMVP.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-orange-300 transition-colors block mb-1"
                        >
                          {topMVP.player_name}
                        </button>
                        <div className="text-3xl font-black text-orange-400 mb-1">{(topMVP.total_mvps || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topMVP.team_name}</div>
                      </div>

                      {/* Shots Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-cyan-400/30 hover:border-cyan-400 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/30">
                        <div className="text-cyan-400 font-bold text-sm mb-2 uppercase tracking-wide">🎯 Total Shots</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topShots.player_name, topShots.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-cyan-300 transition-colors block mb-1"
                        >
                          {topShots.player_name}
                        </button>
                        <div className="text-3xl font-black text-cyan-400 mb-1">{(topShots.total_shots || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topShots.team_name}</div>
                      </div>

                      {/* Demos Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-red-400/30 hover:border-red-400 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/30">
                        <div className="text-red-400 font-bold text-sm mb-2 uppercase tracking-wide">💥 Total Demos</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topDemos.player_name, topDemos.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-red-300 transition-colors block mb-1"
                        >
                          {topDemos.player_name}
                        </button>
                        <div className="text-3xl font-black text-red-400 mb-1">{(topDemos.total_demos || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topDemos.team_name}</div>
                      </div>

                      {/* Epic Saves Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-pink-400/30 hover:border-pink-400 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/30">
                        <div className="text-pink-400 font-bold text-sm mb-2 uppercase tracking-wide">✨ Epic Saves</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topEpicSaves.player_name, topEpicSaves.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-pink-300 transition-colors block mb-1"
                        >
                          {topEpicSaves.player_name}
                        </button>
                        <div className="text-3xl font-black text-pink-400 mb-1">{(topEpicSaves.total_epic_saves || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topEpicSaves.team_name}</div>
                      </div>

                      {/* OT Goals Leader */}
                      <div className="bg-black/40 rounded-xl p-6 border border-yellow-300/30 hover:border-yellow-300 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-300/30">
                        <div className="text-yellow-300 font-bold text-sm mb-2 uppercase tracking-wide">⏱️ OT Goals</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(topOTG.player_name, topOTG.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-yellow-200 transition-colors block mb-1"
                        >
                          {topOTG.player_name}
                        </button>
                        <div className="text-3xl font-black text-yellow-300 mb-1">{(topOTG.total_otg || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{topOTG.team_name}</div>
                      </div>

                      {/* Most Games Played */}
                      <div className="bg-black/40 rounded-xl p-6 border border-gray-400/30 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/30">
                        <div className="text-gray-300 font-bold text-sm mb-2 uppercase tracking-wide">🎮 Games Played</div>
                        <button
                          onClick={() => navigate(`/players/${createPlayerSlug(mostGames.player_name, mostGames.player_name)}`)}
                          className="text-2xl font-black text-white hover:text-gray-200 transition-colors block mb-1"
                        >
                          {mostGames.player_name}
                        </button>
                        <div className="text-3xl font-black text-gray-300 mb-1">{(mostGames.games_played || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{mostGames.team_name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

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
