import React, { useState } from "react";
// import { Link } from "react-router-dom";
import TeamEntry from "../components/PowerRankings/TeamEntry.jsx";
import { powerRankings } from "../data/powerRankings.js";

export default function PowerRankings() {

      const [expandedTeams, setExpandedTeams] = useState({});

    const toggleTeam = (sectionIdx, teamIdx) => {
        const key = `${sectionIdx}-${teamIdx}`;
        setExpandedTeams(prev => ({
        ...prev,
        [key]: !prev[key]
        }));
    };


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-900 via-orange-800 to-yellow-900 border-b border-yellow-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🥇 RLBL Power Rankings</h1>
          <p className="text-yellow-200 text-sm md:text-base">Weekly team rankings and analysis</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">

      {powerRankings.map(({ title, content }, sectionIdx) => (
        <section key={sectionIdx} className="mb-12">
          <h2 className="text-2xl font-bold text-blue-400 mb-6 border-b border-blue-800 pb-2">{title}</h2>

          {Array.isArray(content) ? (
            content.map((entry, teamIdx) => {
              const isExpanded = expandedTeams[`${sectionIdx}-${teamIdx}`];
              return (
                <TeamEntry
                  key={teamIdx}
                  team={entry.team}
                  body={entry.body}
                  expanded={isExpanded}
                  onToggle={() => toggleTeam(sectionIdx, teamIdx)}
                />
              );
            })
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm bg-[#2a2a3d] p-5 rounded-lg shadow text-gray-200 leading-relaxed">
              {content.trim()}
            </pre>
          )}
        </section>
      ))}
      </div>
    </div>
  );
}
