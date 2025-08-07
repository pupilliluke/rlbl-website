import { useState } from "react";
import { homerConference, garfieldConference, overall } from "../data/standings.js";
import { historicalStandingsData } from "../data/historicalStandings.js";

const Table = ({ title, data, showSymbols = false }) => (
  <section className="mb-10">
    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">{title}</h2>
    <div className="overflow-x-auto rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-sm border border-orange-500/30">
      <table className="min-w-full text-sm text-left text-gray-200">
        <thead className="bg-gray-900/90 border-b border-orange-500/30">
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
              <tr key={i} className="hover:bg-gray-700/50 transition-colors border-b border-gray-600/50">
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
  const [selectedSeason, setSelectedSeason] = useState("current");
  const [showSymbols, setShowSymbols] = useState(true);

  const seasons = {
    "current": { name: "Season 3 - Summer 25 (Not Started)", active: true },
    "season2": { name: "Season 2 - Spring 25", active: false },
    "season1": { name: "Season 1 - Fall 24", active: false },
    "all": { name: "All Time", active: false }
  };

  // Get current season data
  const getCurrentSeasonData = () => {
    if (selectedSeason === "current") {
      // Season 3 hasn't started
      return {
        homerConference: [],
        garfieldConference: [],
        overall: [],
        hasConferences: false,
        notStarted: true
      };
    } else if (selectedSeason === "2025") {
      return {
        homerConference,
        garfieldConference,
        overall,
        hasConferences: true
      };
    } else if (historicalStandingsData[selectedSeason]) {
      const data = historicalStandingsData[selectedSeason].data;
      return {
        homerConference: data.homerConference || [],
        garfieldConference: data.garfieldConference || [],
        overall: data.overall || [],
        hasConferences: !!(data.homerConference && data.garfieldConference),
        playoffs: data.playoffs
      };
    }
    return {
      homerConference: [],
      garfieldConference: [],
      overall: [],
      hasConferences: false
    };
  };

  const currentData = getCurrentSeasonData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm shadow-2xl border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">📊 RLBL Standings</h1>
          <p className="text-blue-200 text-sm md:text-base">
            {currentData.notStarted 
              ? "Preparing for Season 3 - Summer 25" 
              : "Current league standings and team rankings"}
          </p>
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
              className="px-4 py-2 rounded-lg glass-dark border border-white/20 text-sm md:text-base"
            >
              {Object.entries(seasons).map(([key, season]) => (
                <option key={key} value={key}>{season.name}</option>
              ))}
            </select>

            {/* Symbol Toggle */}
            <button
              onClick={() => setShowSymbols(!showSymbols)}
              className={`px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all ${
                showSymbols 
                  ? "glass border-blue-500/50 text-white shadow-lg" 
                  : "glass-dark border-white/20 text-gray-300 hover:border-blue-500/30"
              }`}
            >
              {showSymbols ? "Hide Symbols" : "Show Symbols"}
            </button>
          </div>
        </div>

        {/* Legend */}
        {showSymbols && (
          <div className="glass section-card shadow-executive border border-white/10 mb-8">
            <h3 className="text-lg md:text-xl font-bold holographic mb-4">Legend</h3>
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

        {/* Empty State for Season 3 */}
        {currentData.notStarted && (
          <div className="glass section-card shadow-executive border border-white/10 text-center">
            <div className="mb-8">
              <h3 className="text-3xl font-bold holographic mb-4">🚀 Season 3 - Summer 25</h3>
              <p className="text-xl text-gray-300 mb-4">Get ready for the upcoming season!</p>
              <p className="text-gray-400 mb-6">Teams are preparing and the season will begin soon.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="glass-dark p-6 rounded-lg border border-white/20">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">📅 Coming Soon:</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Team draft and rosters</li>
                  <li>• Conference divisions</li>
                  <li>• Regular season schedule</li>
                  <li>• Live standings tracking</li>
                </ul>
              </div>
              
              <div className="glass-dark p-6 rounded-lg border border-white/20">
                <h4 className="text-lg font-semibold text-green-400 mb-3">🏆 Last Champions:</h4>
                <p className="text-white font-semibold">Season 2: MJ</p>
                <p className="text-gray-400 text-sm">4-0 series victory over Jakeing It</p>
                <p className="text-gray-400 text-sm mt-2">Who will claim the crown next?</p>
              </div>
            </div>
          </div>
        )}

        {/* Overall Rankings */}
        {!currentData.notStarted && (
          <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold holographic mb-6 text-center">🏆 Overall Rankings</h2>
          <div className="glass shadow-executive overflow-hidden border border-white/10 rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm md:text-base">
                <thead className="glass-dark border-b border-white/20">
                  <tr>
                    <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">#</th>
                    <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">Team</th>
                    <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white">Points</th>
                    <th className="py-3 md:py-4 px-3 md:px-4 text-left font-bold text-white hidden md:table-cell">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.overall.map((team, i) => {
                    const teamName = Array.isArray(team) ? team[0] : team;
                    const points = Array.isArray(team) ? (team.length > 2 ? team[3] : team[1]) : 0;
                    const rank = i + 1;
                    let symbol = "";
                    let symbolClass = "";
                    
                    if (showSymbols && rank === 1) {
                      symbol = "👑";
                      symbolClass = "text-yellow-400";
                    }

                    const baseStyle = "transition duration-200 border-b border-white/10";
                    const styles = {
                      1: "bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 hover:from-yellow-800/60 hover:to-yellow-700/60",
                      2: "bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/60 hover:to-gray-600/60",
                      3: "bg-gradient-to-r from-amber-900/50 to-amber-800/50 hover:from-amber-800/60 hover:to-amber-700/60",
                    };

                    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
                    const rowClass = styles[rank] || "hover:bg-white/5";

                    return (
                      <tr key={i} className={`${rowClass} ${baseStyle}`}>
                        <td className="py-3 md:py-4 px-3 md:px-4 font-bold">
                          <span className="mr-2">{medal || rank}</span>
                          <span className={symbolClass}>{symbol}</span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 font-semibold text-white">{teamName}</td>
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
        )}

        {/* Conference Tables */}
        {currentData.hasConferences && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Table title="🏟 Homer Conference" data={currentData.homerConference} showSymbols={showSymbols} />
            <Table title="🏟 Garfield Conference" data={currentData.garfieldConference} showSymbols={showSymbols} />
          </div>
        )}

        {/* Playoffs Information */}
        {currentData.playoffs && (
          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold holographic mb-6 text-center">🏆 Playoffs Results</h2>
            <div className="glass section-card shadow-executive border border-white/10">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-yellow-400">🏆 Champion: {currentData.playoffs.champion}</h3>
                <p className="text-lg text-gray-300">Runner-up: {currentData.playoffs.runnerUp}</p>
              </div>
              {currentData.playoffs.bracket && currentData.playoffs.bracket.final && (
                <div className="text-center">
                  <p className="text-blue-200">
                    Final: {currentData.playoffs.bracket.final.home} vs {currentData.playoffs.bracket.final.away} - 
                    <span className="font-bold ml-1">{currentData.playoffs.bracket.final.result}</span>
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

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