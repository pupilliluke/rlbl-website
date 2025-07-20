import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";

import { players } from "../data/players.js"; // Adjust the path as necessary



const Stats = () => {
  const [sortBy, setSortBy] = useState("season");
  const [filter, setFilter] = useState("");

  const sortedPlayers = [...players]
    .filter((p) => p.player.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white px-6 py-12">
      <h1 className="text-4xl font-extrabold text-orange-400 mb-8 text-center drop-shadow-md">
        📊 RLBL Player Stats
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <input
          type="text"
          placeholder="Search player..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded bg-[#2a2a3d] border border-blue-800 text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded bg-[#2a2a3d] border border-blue-800 text-sm"
        >
          <option value="points">2025</option>
          <option value="ppg">2024</option>
         
        </select>
           <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded bg-[#2a2a3d] border border-blue-800 text-sm"
        >
          <option value="points">Points</option>
          <option value="ppg">PPG</option>
          <option value="goals">Goals</option>
          <option value="gpg">GPG</option>
          <option value="assists">Assists</option>
          <option value="saves">Saves</option>
          <option value="svpg">Saves/Game</option>
          <option value="shPercent">Shooting %</option>
        </select>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {sortedPlayers.map((p, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl shadow-lg border border-blue-900 transition bg-[#1f1f2e] hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${p.teamColor[0]}33 20%, ${p.teamColor[1]}33 80%)`,
              backgroundColor: "#1f1f2e",
            }}
          >
            <h2 className="text-xl font-bold text-white mb-2">{p.player}</h2>
            <p className="text-sm text-blue-300 mb-4 italic">{p.team}</p>
            <div className="grid grid-cols-2 text-sm gap-1 text-gray-200">
              <span>Points: {p.points}</span>
              <span>PPG: {p.ppg.toFixed(2)}</span>
              <span>Goals: {p.goals}</span>
              <span>GPG: {p.gpg.toFixed(2)}</span>
              <span>Assists: {p.assists}</span>
              <span>APG: {p.apg.toFixed(2)}</span>
              <span>Saves: {p.saves}</span>
              <span>SVPG: {p.svpg.toFixed(2)}</span>
              <span>Shots: {p.shots}</span>
              <span>SH%: {p.shPercent.toFixed(1)}%</span>
              <span>MVPs: {p.mvps}</span>
              <span>Demos: {p.demos}</span>
              <span>Epic Saves: {p.epicSaves}</span>
              <span>Games: {p.gamesPlayed}</span>
              <div className="col-span-2 mt-2">
                <div className="text-xs mb-1">MVP Progress</div>
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div className="h-full bg-yellow-400 rounded transition-all duration-500" style={{ width: `${(p.mvps / 15) * 100}%` }} />
                </div>
                <div className="text-xs mt-2 mb-1">Demos Progress</div>
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div className="h-full bg-red-500 rounded transition-all duration-500" style={{ width: `${(p.demos / 40) * 100}%` }} />
                </div>
                <div className="text-xs mt-2 mb-1">Saves Progress</div>
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div className="h-full bg-green-500 rounded transition-all duration-500" style={{ width: `${(p.saves / 60) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visualization: Goals */}
      <div className="max-w-5xl mx-auto mt-20">
        <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center">Top Goal Scorers</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedPlayers.slice(0, 10)}>
            <CartesianGrid strokeDasharray="4 4" stroke="#2c3e50" />
            <XAxis dataKey="player" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip wrapperClassName="text-sm" />
            <Legend />
            <Bar dataKey="goals" fill="#60a5fa" radius={[6, 6, 0, 0]} style={{ filter: "drop-shadow(0 0 6px #60a5fa)" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Visualization: Saves */}
      <div className="max-w-5xl mx-auto mt-20">
        <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center">Top Save Leaders</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedPlayers.slice(0, 10)}>
            <CartesianGrid strokeDasharray="4 4" stroke="#2c3e50" />
            <XAxis dataKey="player" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip wrapperClassName="text-sm" />
            <Legend />
            <Bar dataKey="saves" fill="#34d399" radius={[6, 6, 0, 0]} style={{ filter: "drop-shadow(0 0 6px #34d399)" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Visualization: Demos */}
      <div className="max-w-5xl mx-auto mt-20 mb-12">
        <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center">Top Demo Counts</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedPlayers.slice(0, 10)}>
            <CartesianGrid strokeDasharray="4 4" stroke="#2c3e50" />
            <XAxis dataKey="player" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip wrapperClassName="text-sm" />
            <Legend />
            <Bar dataKey="demos" fill="#f87171" radius={[6, 6, 0, 0]} style={{ filter: "drop-shadow(0 0 6px #f87171)" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Stats;
