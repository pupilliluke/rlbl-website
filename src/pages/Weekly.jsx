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
    previous: {
      week: "Week 11",
      date: "December 2024", 
      highlights: [
        "🎯 Mason reaches 50%+ shooting accuracy milestone",
        "🥅 Epic saves record broken multiple times this week",
        "🏆 MVP race heats up between Jack, Gup, and Jake W.",
        "📈 Several players hit career highs in multiple categories"
      ],
      gameOfWeek: {
        title: "Game of the Week: Jakeing It vs The Chopped Trees",
        description: "Jake W. put on a clinic with 3 goals and 2 assists, leading his team to victory.",
        result: "Final Score: Jakeing It 5 - The Chopped Trees 3"
      }
    }
  };

  const currentContent = weeklyContent[selectedWeek] || weeklyContent.current;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative page-with-navbar">
      {/* Header */}
      <div className="relative z-10 bg-gray-900/95 backdrop-blur-sm shadow-2xl pt-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8" />
            RLBL Weekly
          </h1>
          <p className="text-gray-200 text-sm md:text-base">Your weekly dose of RLBL updates, highlights, and storylines</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Week Selector */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
          <button
            onClick={() => setSelectedWeek("current")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base border ${
              selectedWeek === "current"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500"
                : "bg-gray-800/80 border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700 hover:border-blue-500"
            }`}
          >
            Current Week
          </button>
          <button
            onClick={() => setSelectedWeek("previous")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base border ${
              selectedWeek === "previous"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500"
                : "bg-gray-800/80 border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700 hover:border-blue-500"
            }`}
          >
            Previous Week
          </button>
        </div>

        {/* Week Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {currentContent.week} - {currentContent.date}
          </h2>
          <div className="h-1 w-24 md:w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded"></div>
        </div>

        {/* Three Stars of the Week */}
        {selectedWeek === "current" && (
          <section className="mb-10">
            <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <StarIcon className="w-6 h-6" color="#F59E0B" /> Three Stars of the Week
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {threeStars.map((star, index) => (
                <div key={index} className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl hover:scale-105 transition-transform border border-blue-500/30 shadow-xl">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl mb-2">
                      {index === 0 ? <GoldMedalIcon className="w-8 h-8" /> : index === 1 ? <SilverMedalIcon className="w-8 h-8" /> : <BronzeMedalIcon className="w-8 h-8" />}
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-white mb-2">{formatPlayerName(star.player.player, star.player.gamertag)}</h4>
                    <p className="text-sm md:text-base text-blue-300 mb-2">{star.player.team}</p>
                    <p className="text-xs md:text-sm text-gray-300 mb-2">{star.reason}</p>
                    <div className="bg-gray-900/80 rounded-lg p-2 md:p-3 border border-blue-400/50">
                      <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{star.stat}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Week Highlights */}
        <section className="mb-10">
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <FireIcon className="w-6 h-6" /> Week Highlights
          </h3>
          <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 shadow-xl">
            <ul className="space-y-3 md:space-y-4">
              {currentContent.highlights.map((highlight, index) => (
                <li key={index} className="text-sm md:text-base text-gray-100 flex items-start gap-3">
                  <span className="text-green-400 mt-1 font-bold">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Game/Stat of the Week */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10">
          {/* Game of the Week */}
          <section>
            <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <TrophyIcon className="w-6 h-6" /> {currentContent.gameOfWeek.title.includes("Game of the Week") ? "Game of the Week" : "Game Recap"}
            </h3>
            <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/30 shadow-xl">
              <h4 className="text-base md:text-lg font-semibold text-white mb-3">
                {currentContent.gameOfWeek.title.replace("Game of the Week: ", "")}
              </h4>
              <p className="text-sm md:text-base text-gray-100 leading-relaxed mb-4">
                {currentContent.gameOfWeek.description}
              </p>
              {currentContent.gameOfWeek.prediction && (
                <div className="bg-gray-900/80 rounded-lg p-3 border border-blue-400/50">
                  <p className="text-sm md:text-base text-blue-200 font-medium">
                    {currentContent.gameOfWeek.prediction}
                  </p>
                </div>
              )}
              {currentContent.gameOfWeek.result && (
                <div className="bg-gray-900/80 rounded-lg p-3 border border-green-400/50">
                  <p className="text-sm md:text-base text-green-200 font-medium">
                    {currentContent.gameOfWeek.result}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Stat Highlight */}
          {currentContent.statHighlight && (
            <section>
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6" /> {currentContent.statHighlight.title}
              </h3>
              <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 shadow-xl">
                <div className="text-center mb-4">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {currentContent.statHighlight.stat}
                  </div>
                </div>
                <p className="text-sm md:text-base text-gray-100 leading-relaxed">
                  {currentContent.statHighlight.description}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Power Rankings & Resources Links */}
        <section className="mb-10">
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <BooksIcon className="w-6 h-6" /> Resources & Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Link 
              to="/stats" 
              className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl hover:scale-105 transition-transform text-center group border border-cyan-500/30 shadow-xl"
            >
              <ChartBarIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-base md:text-lg font-semibold text-white mb-2">Latest Stats</h4>
              <p className="text-xs md:text-sm text-gray-300">View complete player and team statistics</p>
            </Link>
            
            <button 
              className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl hover:scale-105 transition-transform text-center group border border-cyan-500/30 shadow-xl"
              onClick={() => window.open('#', '_blank')}
            >
              <DocumentIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-base md:text-lg font-semibold text-white mb-2">Power Rankings Doc</h4>
              <p className="text-xs md:text-sm text-gray-300">Full analysis and team breakdowns</p>
            </button>
            
            <button 
              className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl hover:scale-105 transition-transform text-center group border border-cyan-500/30 shadow-xl"
              onClick={() => window.open('#', '_blank')}
            >
              <VideoIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-base md:text-lg font-semibold text-white mb-2">Game Footage</h4>
              <p className="text-xs md:text-sm text-gray-300">Watch the best plays and highlights</p>
            </button>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-300 text-xs md:text-sm">
          <p>RLBL Weekly • Updated every Monday</p>
          <p className="mt-1">Follow the action and stay up to date with all league news</p>
        </div>
      </div>
    </div>
  );
}