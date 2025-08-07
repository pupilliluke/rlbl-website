import { teams } from "../data/teams.js";
import { Link } from "react-router-dom";

const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Teams() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm shadow-2xl border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">⚽ RLBL Teams</h1>
          <p className="text-blue-200 text-sm md:text-base">Explore team rosters and player lineups across all seasons</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">

      {Object.entries(teams)
        .sort(([a], [b]) => b.localeCompare(a)) // reverse order
        .map(([season, teams]) => (
          <div key={season} className="mb-20">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 text-center">
              {season} Season
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {teams.map((team, i) => (
                <Link to={`/teams/${slugify(team.name)}`} key={i}>
                  <div
                    className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-500/30 transition duration-300 hover:scale-[1.02] cursor-pointer hover:border-blue-500/60"
                    style={{
                      background: `linear-gradient(135deg, ${team.colors[0]}15 20%, ${team.colors[1]}15 80%), rgba(31, 41, 55, 0.9)`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white drop-shadow">
                        {team.name}
                      </h3>
                      <div className="flex space-x-2">
                        {team.colors.map((color, j) => (
                          <div
                            key={j}
                            className="w-5 h-5 rounded-full border border-white"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-100 mb-1">Players:</p>
                      <div className="grid grid-cols-1 gap-1">
                        {team.players.map((p, idx) => (
                          <div
                            key={idx}
                            className="text-lg font-semibold text-white drop-shadow-sm"
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
