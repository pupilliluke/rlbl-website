import { useParams, useNavigate } from "react-router-dom";
import { teamStats } from "../data/teamStats.js";
import { players } from "../data/players.js";
import { formatPlayerName } from "../utils/formatters.js";

const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function TeamStats() {
  const { teamSlug } = useParams();
  const navigate = useNavigate();

  const team = teamStats.find((t) => slugify(t.name) === teamSlug);
  
  // Get players for this team
  const teamPlayers = players.filter(player => 
    slugify(player.team) === teamSlug
  );

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-red-400 mb-4">
            Team not found: {teamSlug}
          </h1>
          <button
            onClick={() => navigate("/teams")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            ← Back to Teams
          </button>
        </div>
      </div>
    );
  }

  const { name, stats } = team;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-orange-600 border-b border-orange-500">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{name}</h1>
          <p className="text-orange-100 text-sm md:text-base">Team statistics and roster information</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Team Roster */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-6">👥 Team Roster</h2>
          {teamPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {teamPlayers.map((player, index) => (
                <div key={index} className="bg-[#1f1f2e] rounded-xl p-4 md:p-6 border border-blue-800 hover:scale-105 transition-transform">
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                      {formatPlayerName(player.player, player.gamertag)}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-[#2a2a3d] rounded-lg p-2">
                        <div className="text-yellow-400 font-bold">{player.points.toLocaleString()}</div>
                        <div className="text-gray-400">Points</div>
                      </div>
                      <div className="bg-[#2a2a3d] rounded-lg p-2">
                        <div className="text-green-400 font-bold">{player.goals}</div>
                        <div className="text-gray-400">Goals</div>
                      </div>
                      <div className="bg-[#2a2a3d] rounded-lg p-2">
                        <div className="text-blue-400 font-bold">{player.assists}</div>
                        <div className="text-gray-400">Assists</div>
                      </div>
                      <div className="bg-[#2a2a3d] rounded-lg p-2">
                        <div className="text-purple-400 font-bold">{player.saves}</div>
                        <div className="text-gray-400">Saves</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      {player.gamesPlayed} GP • {player.ppg.toFixed(1)} PPG • {player.shPercent.toFixed(1)}% SH%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1f1f2e] rounded-xl p-6 border border-gray-700 text-center">
              <p className="text-gray-400">No player data available for this team.</p>
            </div>
          )}
        </section>

        {/* Team Statistics */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-6">📊 Team Statistics</h2>
          <div className="bg-[#1f1f2e] rounded-xl p-6 md:p-8 border border-orange-800">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2">{value}</div>
                  <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wide">
                    {formatStatLabel(key)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Summary */}
        {teamPlayers.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-6">📈 Team Summary</h2>
            <div className="bg-[#1f1f2e] rounded-xl p-6 md:p-8 border border-green-800">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
                    {teamPlayers.reduce((sum, player) => sum + player.points, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">
                    {teamPlayers.reduce((sum, player) => sum + player.goals, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                    {teamPlayers.reduce((sum, player) => sum + player.assists, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Assists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">
                    {teamPlayers.reduce((sum, player) => sum + player.mvps, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total MVPs</div>
                </div>
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
    .replace(/\b(gpg|spg|shPct|ppg)\b/g, (match) => match.toUpperCase())
    .replace(/\b(gm|pct)\b/gi, (match) =>
      match === "gm" ? "Game" : match.toUpperCase()
    )
    .replace(/\bsa\b/gi, "Shot Against")
    .replace(/\bsv\b/gi, "Save")
    .replace(/\bsh\b/gi, "Shot")
    .replace(/\bspg\b/gi, "Shots per Game")
    .replace(/\bgpg\b/gi, "Goals per Game")
    .replace(/\bepic\b/gi, "Epic")
    .replace(/\bppg\b/gi, "Points per Game")
    .replace(/\bpct\b/gi, "%")
    .replace(/ +/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}