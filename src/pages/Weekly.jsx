/*
// Weekly page content - commented out for later use
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { players } from "../data/players.js";
import { formatPlayerName } from "../utils/formatters.js";
import { CalendarIcon, StarIcon, GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon, FireIcon, TrophyIcon, ChartBarIcon, BooksIcon, DocumentIcon, VideoIcon } from "../components/Icons";

export default function Weekly() {
  const [selectedWeek, setSelectedWeek] = useState("current");

  // Calculate 3 Stars of the Week
  const getThreeStars = () => {
    // Sort players by different metrics for variety
    const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
    const topAssist = [...players].sort((a, b) => b.assists - a.assists)[0];
    const topSaves = [...players].sort((a, b) => b.saves - a.saves)[0];
    
    return [
      { player: topScorer, reason: "Leading Goal Scorer", stat: `${topScorer.goals} Goals` },
      { player: topAssist, reason: "Top Playmaker", stat: `${topAssist.assists} Assists` },
      { player: topSaves, reason: "Wall Guardian", stat: `${topSaves.saves} Saves` }
    ];
  };

  const threeStars = getThreeStars();

  // Weekly updates content
  const weeklyContent = {
    current: {
      week: "Week 12",
      date: "January 2025",
      highlights: [
        "🔥 Jack continues his scoring rampage with 79 goals this season",
        "🛡️ Dundee sets the pace in saves with incredible defensive plays",
        "⚡ Non Chalant dominates the standings with stellar team play",
        "💥 Demo wars intensify as Dundee leads with 37 demolitions"
      ],
      gameOfWeek: {
        title: "Game of the Week: Non Chalant vs Chicken Jockey",
        description: "Two powerhouse teams clash in what promises to be the most exciting matchup of the week. Jack's offensive prowess meets Gup's well-rounded game.",
        prediction: "Expect fireworks and high-scoring action!"
      },
      statHighlight: {
        title: "Stat of the Week",
        stat: "Mason's 51.6% Shooting Percentage",
        description: "The most efficient shooter in the league continues to find the back of the net with incredible precision."
      }
    },
    // ... rest of content
  };

  // Full JSX content here...
}
*/

import { CalendarIcon } from "../components/Icons";

export default function Weekly() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white relative page-with-navbar">
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-blue-900 via-green-800 to-blue-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <CalendarIcon className="w-10 h-10" />
            RLBL Weekly
          </h1>
          <p className="text-blue-200">Weekly highlights, stats, and player spotlights</p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="bg-[#1f1f2e] rounded-xl p-12 border border-blue-800">
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Coming Soon</h2>
            <p className="text-gray-300 text-lg mb-6">
              The Weekly page is currently under construction. We're working hard to bring you weekly highlights, player spotlights, and game analysis.
            </p>
            <p className="text-gray-400">
              Check back soon for the latest weekly updates and featured content!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}