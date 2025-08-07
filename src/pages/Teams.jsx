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
                  <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-600 transition duration-300 hover:scale-[1.02] cursor-pointer hover:border-gray-500 hover:shadow-2xl">
                    {/* Team Color Strip */}
                    <div className="flex mb-4 rounded-lg overflow-hidden h-3">
                      {team.colors.map((color, j) => (
                        <div
                          key={j}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {team.name}
                      </h3>
                      <div className="flex space-x-2">
                        {team.colors.map((color, j) => (
                          <div
                            key={j}
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-300 mb-3 font-medium">Players:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {team.players.map((p, idx) => (
                          <div
                            key={idx}
                            className="text-base text-white bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-600/50"
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
