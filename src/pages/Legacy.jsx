import { useState } from "react";
import { historicalSeasons } from "../data/historicalStats.js";
import { historicalStandingsData } from "../data/historicalStandings.js";
import { careerStats } from "../data/careerStats.js";
import { BuildingIcon, TrophyIcon, TargetIcon, ShieldIcon, StarIcon, ChartBarIcon, GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon, FireIcon } from "../components/Icons";

export default function Legacy() {
  const [selectedSeason, setSelectedSeason] = useState("career");

  const seasons = [
    { id: "career", name: "Career Stats", year: "All-Time", description: "Cumulative statistics across all seasons" },
    { id: "season2", name: "Season 2", year: "Spring 25", description: "The most competitive season yet with expanded playoffs" },
    { id: "season1", name: "Season 1", year: "Fall 24", description: "The inaugural season that started it all" }
  ];

  const currentSeason = selectedSeason === "career" ? { stats: careerStats } : historicalSeasons[selectedSeason];
  const currentStandings = historicalStandingsData[selectedSeason];

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
          <div className="flex bg-[#2a2a3d] rounded-lg overflow-hidden">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  selectedSeason === season.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {season.name} - {season.year}
              </button>
            ))}
          </div>
        </div>

        {/* Season Overview */}
        <div className="mb-12">
          <div className="bg-[#1f1f2e] rounded-xl p-8 border border-purple-800">
            <h2 className="text-3xl font-bold text-purple-400 mb-4">
              {currentSeason?.name || selectedSeason} - {seasons.find(s => s.id === selectedSeason)?.year}
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              {seasons.find(s => s.id === selectedSeason)?.description}
            </p>
            
            {/* Champion Banner */}
            {currentStandings?.data?.playoffs && (
              <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6" />
                  Season Champion
                </h3>
                <p className="text-xl text-white font-semibold">{currentStandings.data.playoffs.champion}</p>
                <p className="text-yellow-200">Runner-up: {currentStandings.data.playoffs.runnerUp}</p>
              </div>
            )}

            {/* Season Stats */}
            {currentSeason?.stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#2a2a3d] rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-2">Total Players</h4>
                  <p className="text-2xl font-bold text-white">{currentSeason.stats.length}</p>
                </div>
                <div className="bg-[#2a2a3d] rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-2">Leading Scorer</h4>
                  <p className="text-xl font-bold text-white">{currentSeason.stats[0]?.player}</p>
                  <p className="text-sm text-gray-400">{currentSeason.stats[0]?.goals} goals</p>
                </div>
                <div className="bg-[#2a2a3d] rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-2">MVP</h4>
                  <p className="text-xl font-bold text-white">
                    {currentSeason.stats.reduce((max, player) => 
                      (player.mvps || 0) > (max.mvps || 0) ? player : max
                    ).player}
                  </p>
                  <p className="text-sm text-gray-400">
                    {currentSeason.stats.reduce((max, player) => 
                      (player.mvps || 0) > (max.mvps || 0) ? player : max
                    ).mvps} MVPs
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        {currentSeason?.stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Goals Leaders */}
            <div className="bg-[#1f1f2e] rounded-xl p-6 border border-green-800">
              <h3 className="text-xl font-bold text-green-400 mb-4">🥅 Goals Leaders</h3>
              <div className="space-y-3">
                {[...currentSeason.stats]
                  .sort((a, b) => (b.goals || 0) - (a.goals || 0))
                  .slice(0, 5)
                  .map((player, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm w-4">{i + 1}</span>
                        <span className="font-medium text-white">{player.player}</span>
                        <span className="text-sm text-gray-400">({player.team})</span>
                      </div>
                      <span className="font-bold text-green-400">{player.goals}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Assists Leaders */}
            <div className="bg-[#1f1f2e] rounded-xl p-6 border border-blue-800">
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <TargetIcon className="w-5 h-5" />
                Assists Leaders
              </h3>
              <div className="space-y-3">
                {[...currentSeason.stats]
                  .sort((a, b) => (b.assists || 0) - (a.assists || 0))
                  .slice(0, 5)
                  .map((player, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm w-4">{i + 1}</span>
                        <span className="font-medium text-white">{player.player}</span>
                        <span className="text-sm text-gray-400">({player.team})</span>
                      </div>
                      <span className="font-bold text-blue-400">{player.assists}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Saves Leaders */}
            <div className="bg-[#1f1f2e] rounded-xl p-6 border border-purple-800">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <ShieldIcon className="w-5 h-5" />
                Saves Leaders
              </h3>
              <div className="space-y-3">
                {[...currentSeason.stats]
                  .sort((a, b) => (b.saves || 0) - (a.saves || 0))
                  .slice(0, 5)
                  .map((player, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm w-4">{i + 1}</span>
                        <span className="font-medium text-white">{player.player}</span>
                        <span className="text-sm text-gray-400">({player.team})</span>
                      </div>
                      <span className="font-bold text-purple-400">{player.saves}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Points Leaders */}
            <div className="bg-[#1f1f2e] rounded-xl p-6 border border-yellow-800">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <StarIcon className="w-5 h-5" />
                Points Leaders
              </h3>
              <div className="space-y-3">
                {[...currentSeason.stats]
                  .sort((a, b) => (b.points || 0) - (a.points || 0))
                  .slice(0, 5)
                  .map((player, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm w-4">{i + 1}</span>
                        <span className="font-medium text-white">{player.player}</span>
                        <span className="text-sm text-gray-400">({player.team})</span>
                      </div>
                      <span className="font-bold text-yellow-400">{player.points?.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Final Standings */}
        {currentStandings?.data?.overall && (
          <div className="bg-[#1f1f2e] rounded-xl p-6 border border-gray-800 mb-8">
            <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Final Standings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="py-2 px-3 text-left font-bold text-white">#</th>
                    <th className="py-2 px-3 text-left font-bold text-white">Team</th>
                    <th className="py-2 px-3 text-left font-bold text-white">Record</th>
                    <th className="py-2 px-3 text-left font-bold text-white">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStandings.data.overall.slice(0, 8).map((team, i) => {
                    const teamName = Array.isArray(team) ? team[0] : team;
                    const record = Array.isArray(team) && team[2] ? team[2] : "N/A";
                    const points = Array.isArray(team) ? (team.length > 3 ? team[3] : team[1]) : 0;
                    const rank = i + 1;
                    
                    return (
                      <tr key={i} className={`border-b border-gray-700 ${rank <= 3 ? 'bg-gradient-to-r from-yellow-900/20 to-transparent' : ''}`}>
                        <td className="py-2 px-3 font-bold">
                          {rank === 1 ? <GoldMedalIcon className="w-5 h-5" /> : rank === 2 ? <SilverMedalIcon className="w-5 h-5" /> : rank === 3 ? <BronzeMedalIcon className="w-5 h-5" /> : rank}
                        </td>
                        <td className="py-2 px-3 font-medium text-white">{teamName}</td>
                        <td className="py-2 px-3 text-gray-300">{record}</td>
                        <td className="py-2 px-3 font-bold text-yellow-400">{points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notable Records */}
        {currentSeason?.stats && (
          <div className="bg-[#1f1f2e] rounded-xl p-6 border border-red-800">
            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <FireIcon className="w-5 h-5" />
              Notable Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Highest Single Season Performance</h4>
                <p className="text-sm text-gray-300">
                  Most Goals: {Math.max(...currentSeason.stats.map(p => p.goals || 0))} 
                  ({currentSeason.stats.find(p => p.goals === Math.max(...currentSeason.stats.map(p => p.goals || 0)))?.player})
                </p>
                <p className="text-sm text-gray-300">
                  Most Saves: {Math.max(...currentSeason.stats.map(p => p.saves || 0))} 
                  ({currentSeason.stats.find(p => p.saves === Math.max(...currentSeason.stats.map(p => p.saves || 0)))?.player})
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Efficiency Leaders</h4>
                <p className="text-sm text-gray-300">
                  Best Shooting %: {Math.max(...currentSeason.stats.map(p => p.shPercent || 0)).toFixed(1)}% 
                  ({currentSeason.stats.find(p => p.shPercent === Math.max(...currentSeason.stats.map(p => p.shPercent || 0)))?.player})
                </p>
                <p className="text-sm text-gray-300">
                  Most MVPs: {Math.max(...currentSeason.stats.map(p => p.mvps || 0))} 
                  ({currentSeason.stats.find(p => p.mvps === Math.max(...currentSeason.stats.map(p => p.mvps || 0)))?.player})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Preserving the history and legacy of the Rocket League Business League</p>
        </div>
      </div>
    </div>
  );
}