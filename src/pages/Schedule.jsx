import React from "react";
import { schedule } from "../data/schedule.js"; // Adjust the path as necessary

const Schedule = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white px-6 py-12">
      <h1 className="text-4xl font-extrabold text-orange-400 mb-8 text-center drop-shadow-md">📅 RLBL League Schedule</h1>
      <div className="max-w-5xl mx-auto space-y-10">
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
  );
};

export default Schedule;
