import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatPlayerName } from "../utils/formatters.js";
import SeasonDropdown from "../components/SeasonDropdown.jsx";
import { apiService } from "../services/apiService.js";

export default function PlayerStats() {
  const { playerSlug } = useParams();
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState('career');
  const [seasonStats, setSeasonStats] = useState(null);
  const [player, setPlayer] = useState(null);
  const [allStats, setAllStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all stats to find the player
  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        const stats = await apiService.getStats('career');
        setAllStats(stats);
        
        // Find player by slug (convert slug back to potential player names)
        const searchTerms = playerSlug.toLowerCase().split('-');
        const foundPlayer = stats.find(p => {
          const nameWords = p.player_name.toLowerCase().split(' ');
          const gamertagWords = p.gamertag.toLowerCase().split(' ');
          
          return searchTerms.every(term => 
            nameWords.some(word => word.includes(term)) ||
            gamertagWords.some(word => word.includes(term)) ||
            p.player_name.toLowerCase().includes(term) ||
            p.gamertag.toLowerCase().includes(term)
          );
        });
        
        setPlayer(foundPlayer);
      } catch (error) {
        console.error('Failed to fetch player stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [playerSlug]);

  // Fetch season-specific stats
  useEffect(() => {
    const fetchSeasonStats = async () => {
      if (!player) return;
      
      try {
        const stats = await apiService.getStats(selectedSeason);
        const playerSeasonStats = stats.find(p => p.id === player.id);
        
        if (playerSeasonStats) {
          setSeasonStats({
            points: playerSeasonStats.total_points,
            goals: playerSeasonStats.total_goals,
            assists: playerSeasonStats.total_assists,
            saves: playerSeasonStats.total_saves,
            shots: playerSeasonStats.total_shots,
            gamesPlayed: playerSeasonStats.games_played,
            mvps: playerSeasonStats.total_mvps,
            demos: playerSeasonStats.total_demos,
            epicSaves: playerSeasonStats.total_epic_saves
          });
        } else {
          // Player has no stats for this season
          setSeasonStats({
            points: 0, goals: 0, assists: 0, saves: 0, shots: 0,
            gamesPlayed: 0, mvps: 0, demos: 0, epicSaves: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch season stats:', error);
        setSeasonStats({
          points: 0, goals: 0, assists: 0, saves: 0, shots: 0,
          gamesPlayed: 0, mvps: 0, demos: 0, epicSaves: 0
        });
      }
    };

    if (player && selectedSeason) {
      fetchSeasonStats();
    }
  }, [player, selectedSeason]);

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white flex items-center justify-center page-with-navbar">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white flex items-center justify-center page-with-navbar">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-red-400 mb-4">
            Player not found: {playerSlug}
          </h1>
          <button
            onClick={() => navigate("/stats")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            ← Back to Stats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white page-with-navbar">
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 border-b border-blue-500 pt-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              ← Back
            </button>
            
            <SeasonDropdown
              entityType="player"
              entityId={player.id}
              selectedSeason={selectedSeason}
              onSeasonChange={handleSeasonChange}
              className="ml-4"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {formatPlayerName(player.player_name, player.gamertag)}
          </h1>
          <div className="flex items-center gap-4 text-blue-100 text-sm md:text-base">
            <span>Team: {player.team_name}</span>
            {selectedSeason && <span>• Season {selectedSeason}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Player Statistics */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-6">📊 Player Statistics</h2>
          <div className="bg-[#1f1f2e] rounded-xl p-6 md:p-8 border border-blue-800">
            {seasonStats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Object.entries(seasonStats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wide">
                      {formatStatLabel(key)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="ml-3 text-gray-400">Loading season statistics...</span>
              </div>
            )}
          </div>
        </section>

        {/* Player Performance Metrics */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-6">⚡ Performance Metrics</h2>
          <div className="bg-[#1f1f2e] rounded-xl p-6 md:p-8 border border-green-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
                  {seasonStats?.gamesPlayed > 0 ? (seasonStats.points / seasonStats.gamesPlayed).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-400">Points Per Game</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">
                  {seasonStats?.gamesPlayed > 0 ? (seasonStats.goals / seasonStats.gamesPlayed).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-400">Goals Per Game</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                  {seasonStats?.shots > 0 ? ((seasonStats.goals / seasonStats.shots) * 100).toFixed(1) : '0.0'}%
                </div>
                <div className="text-sm text-gray-400">Shot Percentage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">
                  {seasonStats?.gamesPlayed > 0 ? (seasonStats.saves / seasonStats.gamesPlayed).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-400">Saves Per Game</div>
              </div>
            </div>
          </div>
        </section>

        {/* Season Comparison */}
        {selectedSeason !== '2024' && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-6">📈 Season Comparison</h2>
            <div className="bg-[#1f1f2e] rounded-xl p-6 md:p-8 border border-orange-800">
              <div className="text-center text-gray-300">
                Viewing {selectedSeason} season statistics. 
                <button 
                  onClick={() => setSelectedSeason('2024')}
                  className="ml-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Switch to current season
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function formatStatLabel(label) {
  return label
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b(ppg|spg|shPct|gpg)$/g, (match) => match.toUpperCase())
    .replace(/\b(gm|pct)$/gi, (match) =>
      match === "gm" ? "Game" : match.toUpperCase()
    )
    .replace(/\bsa$/gi, "Shot Against")
    .replace(/\bsv$/gi, "Save")
    .replace(/\bsh$/gi, "Shot")
    .replace(/\bspg$/gi, "Shots per Game")
    .replace(/\bgpg$/gi, "Goals per Game")
    .replace(/\bepic$/gi, "Epic")
    .replace(/\bppg$/gi, "Points per Game")
    .replace(/\bpct$/gi, "%")
    .replace(/\bgamesPlayed$/gi, "Games Played")
    .replace(/\bmvps$/gi, "MVPs")
    .replace(/\bdemos$/gi, "Demos")
    .replace(/ +/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}