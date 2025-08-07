import { useState } from "react";
import { homerConference, garfieldConference, overall } from "../data/standings.js";

const Table = ({ title, data, showSymbols = false }) => (
  <section className="mb-10">
    <h2 className="text-xl md:text-2xl font-bold text-orange-400 mb-4">{title}</h2>
    <div className="overflow-x-auto rounded shadow bg-[#1f1f2e] border border-blue-800">
      <table className="min-w-full text-sm text-left text-gray-200">
        <thead className="bg-blue-900 border-b border-blue-700">
          <tr>
            <th className="py-3 px-2 md:px-3 font-bold text-white">Pos</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white">Team</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white">GP</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white">Record</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white">Pts</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white hidden md:table-cell">W</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white hidden md:table-cell">W(OT)</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white hidden md:table-cell">L(OT)</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white hidden md:table-cell">L</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white hidden lg:table-cell">FF</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white">GF</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white">GA</th>
            <th className="py-3 px-2 md:px-3 font-bold text-white">GD</th>
          </tr>
        </thead>
        <tbody>
          {data.map((team, i) => {
            const position = i + 1;
            let symbol = "";
            let symbolClass = "";
            
            if (showSymbols) {
              if (position === 1) {
                symbol = "👑"; // Division Leader
                symbolClass = "text-yellow-400";
              } else if (position <= 2) {
                symbol = "🟢"; // Clinched Playoffs
                symbolClass = "text-green-400";
              } else if (position >= data.length - 1) {
                symbol = "🔴"; // Eliminated
                symbolClass = "text-red-400";
              }
            }
            
            return (
              <tr key={i} className="hover:bg-[#2a2a3d] transition-colors border-b border-gray-700">
                <td className="py-2 md:py-3 px-2 md:px-3 font-semibold">
                  <span className="mr-1">{position}</span>
                  <span className={symbolClass}>{symbol}</span>
                </td>
                <td className="py-2 md:py-3 px-2 md:px-3 font-medium text-white">{team[0]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3">{team[1]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 font-medium">{team[2]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 font-bold text-yellow-400">{team[3]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell">{team[4]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell">{team[5]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell">{team[6]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell">{team[7]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 hidden lg:table-cell">{team[8]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 text-green-400">{team[9]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 text-red-400">{team[10]}</td>
                <td className="py-2 md:py-3 px-2 md:px-3 font-semibold">{team[11]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

export default function Standings() {
  const [selectedSeason, setSelectedSeason] = useState("2025");
  const [showSymbols, setShowSymbols] = useState(true);

  const seasons = {
    "2025": { name: "2025 Season", active: true },
    "2024": { name: "2024 Season", active: false },
    "all": { name: "All Time", active: false }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">📊 RLBL Standings</h1>
          <p className="text-blue-200 text-sm md:text-base">Current league standings and team rankings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Season Selector */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#2a2a3d] border border-blue-800 text-sm md:text-base"
            >
              {Object.entries(seasons).map(([key, season]) => (
                <option key={key} value={key}>{season.name}</option>
              ))}
            </select>

            {/* Symbol Toggle */}
            <button
              onClick={() => setShowSymbols(!showSymbols)}
              className={`px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
                showSymbols 
                  ? "bg-blue-600 text-white" 
                  : "bg-[#2a2a3d] text-gray-300 hover:bg-gray-700"
              }`}
            >
              {showSymbols ? "Hide Symbols" : "Show Symbols"}
            </button>
          </div>
        </div>

        {/* Legend */}
        {showSymbols && (
          <div className="bg-[#1f1f2e] rounded-lg p-4 md:p-6 mb-8 border border-blue-800">
            <h3 className="text-lg md:text-xl font-bold text-blue-400 mb-4">Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">👑</span>
                <span>Division Leader</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">🟢</span>
                <span>Clinched Playoffs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-lg">🔴</span>
                <span>Eliminated</span>
              </div>
            </div>
          </div>
        )}

        {/* Overall Rankings */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-6 text-center">🏆 Overall Rankings</h2>
          <div className="bg-[#1f1f2e] rounded-xl shadow-lg overflow-hidden border border-blue-800">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm md:text-base">
                <thead className="bg-blue-900 border-b border-blue-700">
                  <tr>
                    <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">#</th>
                    <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">Team</th>
                    <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">Points</th>
                    <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white hidden md:table-cell">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {overall.map(([team, points], i) => {
                    const rank = i + 1;
                    let symbol = "";
                    let symbolClass = "";
                    
                    if (showSymbols && rank === 1) {
                      symbol = "👑";
                      symbolClass = "text-yellow-400";
                    }

                    const baseStyle = "transition duration-200 border-b border-gray-700";
                    const styles = {
                      1: "bg-gradient-to-r from-yellow-900 to-yellow-800 hover:from-yellow-800 hover:to-yellow-700",
                      2: "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600",
                      3: "bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-700",
                    };

                    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
                    const rowClass = styles[rank] || "hover:bg-[#2a2a3d]";

                    return (
                      <tr key={i} className={`${rowClass} ${baseStyle}`}>
                        <td className="py-3 md:py-4 px-3 md:px-4 font-bold">
                          <span className="mr-2">{medal || rank}</span>
                          <span className={symbolClass}>{symbol}</span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 font-semibold text-white">{team}</td>
                        <td className="py-3 md:py-4 px-3 md:px-4 font-bold text-yellow-400">{points}</td>
                        <td className="py-3 md:py-4 px-3 md:px-4 w-1/3 hidden md:table-cell">
                          <div className="relative w-full h-3 bg-gray-700 rounded-full">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                              style={{ width: `${Math.min((points / 80) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Conference Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Table title="🏟 Homer Conference" data={homerConference} showSymbols={showSymbols} />
          <Table title="🏟 Garfield Conference" data={garfieldConference} showSymbols={showSymbols} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-xs">
            <div><strong>GP</strong> - Games Played</div>
            <div><strong>W</strong> - Wins</div>
            <div><strong>W(OT)</strong> - Overtime Wins</div>
            <div><strong>L(OT)</strong> - Overtime Losses</div>
            <div><strong>L</strong> - Losses</div>
            <div><strong>GF</strong> - Goals For</div>
            <div><strong>GA</strong> - Goals Against</div>
            <div className="md:col-span-4 lg:col-span-7 mt-2">
              <strong>GD</strong> - Goal Differential • <strong>FF</strong> - Forfeits
            </div>
          </div>
          <p className="mt-4">Updated through {selectedSeason === "all" ? "All Seasons" : `${selectedSeason} Season`} • Week {new Date().getWeek || 12}</p>
        </div>
      </div>
    </div>
  );
}