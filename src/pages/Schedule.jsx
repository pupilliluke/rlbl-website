import React from "react";
import { schedule } from "../data/schedule.js"; // Adjust the path as necessary

const Schedule = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 via-blue-800 to-green-900 border-b border-green-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">📅 RLBL Schedule</h1>
          <p className="text-green-200 text-sm md:text-base">Complete league schedule and upcoming matches</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="space-y-10">
        {schedule.map((week, idx) => (
          <div key={idx}>
            <h2 className="text-2xl font-bold text-blue-400 mb-4 border-b border-blue-800 pb-2">{week.week}</h2>
            <ul className="space-y-2">
              {week.games.map((game, i) => (
                <li key={i} className="bg-[#2a2a3d] p-4 rounded shadow hover:bg-[#33334a]">
                  <span className="font-semibold text-white">{game.match}</span>
                  {game.time && <span className="block text-sm text-gray-400">{game.time}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
