import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { CalendarIcon } from "../components/Icons";

const Schedule = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(3); // Default to season 3
  const [collapsedWeeks, setCollapsedWeeks] = useState(new Set()); // Track collapsed weeks

  useEffect(() => {
    fetchGames();
  }, [selectedSeason]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch games for the selected season
      const gamesData = await apiService.getGames(selectedSeason);
      setGames(gamesData);
      
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Group games by week
  const groupGamesByWeek = (games) => {
    const weekGroups = {};
    games.forEach(game => {
      const week = game.week || 1;
      if (!weekGroups[week]) {
        weekGroups[week] = [];
      }
      weekGroups[week].push(game);
    });
    return weekGroups;
  };

  const isGameCompleted = (homeScore, awayScore) => {
    return homeScore !== null && awayScore !== null && (homeScore !== 0 || awayScore !== 0);
  };

  const toggleWeekCollapse = (weekNum) => {
    const newCollapsedWeeks = new Set(collapsedWeeks);
    if (newCollapsedWeeks.has(weekNum)) {
      newCollapsedWeeks.delete(weekNum);
    } else {
      newCollapsedWeeks.add(weekNum);
    }
    setCollapsedWeeks(newCollapsedWeeks);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white relative page-with-navbar flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
          <p className="text-xl">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white relative page-with-navbar flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-xl text-red-400">{error}</p>
          <button 
            onClick={fetchGames}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const weekGroups = groupGamesByWeek(games);
  const weeks = Object.keys(weekGroups).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white relative page-with-navbar">
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-green-900 via-blue-800 to-green-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8" />
            RLBL Schedule - Season {selectedSeason}
          </h1>
          <p className="text-green-200 text-sm md:text-base">
            Complete league schedule with {games.length} games across {weeks.length} weeks
          </p>
          
          {/* Season selector */}
          <div className="mt-4">
            <label className="text-green-200 text-sm mr-3">Season:</label>
            <select 
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
              className="bg-[#2a2a3d] text-white px-3 py-1 rounded border border-blue-800 focus:border-blue-600 focus:outline-none"
            >
              <option value={1}>Season 1 - Fall 2024</option>
              <option value={2}>Season 2 - Summer 2025</option>
              <option value={3}>Season 3 - Fall 2025</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {weeks.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-400">No games scheduled for this season yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {weeks.map((weekNum) => {
              const isCollapsed = collapsedWeeks.has(weekNum);
              const completedGames = weekGroups[weekNum].filter(game => isGameCompleted(game.home_score, game.away_score)).length;
              
              return (
                <div 
                  key={weekNum} 
                  className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                  style={{
                    background: 'rgba(4, 30, 66, 0.15)',
                    backdropFilter: 'blur(15px) saturate(180%)',
                    boxShadow: '0 8px 32px rgba(4, 30, 66, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <button
                    onClick={() => toggleWeekCollapse(weekNum)}
                    className="w-full px-8 py-6 flex items-center justify-between relative overflow-hidden group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(4, 30, 66, 0.3) 0%, rgba(29, 66, 138, 0.2) 100%)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(4, 30, 66, 0.4) 0%, rgba(29, 66, 138, 0.3) 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(4, 30, 66, 0.3) 0%, rgba(29, 66, 138, 0.2) 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="flex items-center gap-6">
                      <h2 className="text-2xl font-bold text-white tracking-wider" style={{
                        textShadow: '0 2px 4px rgba(4, 30, 66, 0.5)'
                      }}>
                        WEEK {weekNum}
                      </h2>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 font-medium">
                          {weekGroups[weekNum].length} games
                        </span>
                        {completedGames > 0 && (
                          <span className="bg-emerald-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-emerald-300 font-medium border border-emerald-400/30">
                            {completedGames} completed
                          </span>
                        )}
                      </div>
                    </div>
                    <div 
                      className="text-white text-2xl transform transition-transform duration-300"
                      style={{ 
                        transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                        filter: 'drop-shadow(0 2px 4px rgba(4, 30, 66, 0.5))'
                      }}
                    >
                      ▼
                    </div>
                  </button>
                  
                  {!isCollapsed && (
                    <div className="p-8">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {weekGroups[weekNum].map((game) => {
                          const completed = isGameCompleted(game.home_score, game.away_score);
                          const homeColor = game.home_team_color || '#041E42';
                          const awayColor = game.away_team_color || '#041E42';
                          
                          return (
                            <div 
                              key={game.id} 
                              className="relative group overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2"
                              style={{
                                background: completed 
                                  ? `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(4, 30, 66, 0.2) 100%)`
                                  : `linear-gradient(135deg, rgba(29, 66, 138, 0.1) 0%, rgba(4, 30, 66, 0.2) 100%)`,
                                backdropFilter: 'blur(10px) saturate(180%)',
                                border: completed 
                                  ? '1px solid rgba(16, 185, 129, 0.3)'
                                  : '1px solid rgba(29, 66, 138, 0.3)',
                                boxShadow: completed
                                  ? '0 8px 32px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                  : '0 8px 32px rgba(29, 66, 138, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                transformStyle: 'preserve-3d'
                              }}
                            >
                              {/* Team color accents */}
                              <div 
                                className="absolute top-0 left-0 w-full h-1"
                                style={{
                                  background: `linear-gradient(90deg, ${homeColor} 0%, transparent 50%, ${awayColor} 100%)`
                                }}
                              />
                              
                              {completed ? (
                                // Completed game layout with enhanced styling
                                <div className="p-6">
                                  <div className="flex justify-center mb-4">
                                    <span 
                                      className="px-4 py-2 rounded-full text-emerald-200 font-semibold text-sm tracking-wider"
                                      style={{
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                                      }}
                                    >
                                      ✓ COMPLETED
                                    </span>
                                  </div>
                                  
                                  <div className="text-center space-y-4">
                                    {/* Team matchup with colors */}
                                    <div className="flex items-center justify-center gap-3">
                                      <div className="flex items-center gap-2 flex-1 justify-end">
                                        <div 
                                          className="w-3 h-3 rounded-full border border-white/30"
                                          style={{ backgroundColor: homeColor }}
                                        />
                                        <span className="font-bold text-white text-lg tracking-wide">
                                          {game.home_display}
                                        </span>
                                      </div>
                                      <div className="text-white/60 font-medium mx-2">VS</div>
                                      <div className="flex items-center gap-2 flex-1">
                                        <span className="font-bold text-white text-lg tracking-wide">
                                          {game.away_display}
                                        </span>
                                        <div 
                                          className="w-3 h-3 rounded-full border border-white/30"
                                          style={{ backgroundColor: awayColor }}
                                        />
                                      </div>
                                    </div>
                                    
                                    {/* Score with enhanced typography */}
                                    <div 
                                      className="text-4xl font-black text-emerald-300 tracking-wider"
                                      style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        textShadow: '0 0 10px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
                                        filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.2))'
                                      }}
                                    >
                                      {game.home_score} - {game.away_score}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Upcoming game layout with enhanced styling
                                <div className="p-6">
                                  <div className="flex justify-center mb-4">
                                    <span 
                                      className="px-4 py-2 rounded-full text-blue-200 font-semibold text-sm tracking-wider"
                                      style={{
                                        background: 'rgba(29, 66, 138, 0.2)',
                                        border: '1px solid rgba(29, 66, 138, 0.4)',
                                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                                      }}
                                    >
                                      ⏱ UPCOMING
                                    </span>
                                  </div>
                                  
                                  <div className="text-center space-y-4">
                                    {/* Team matchup with colors */}
                                    <div className="flex items-center justify-center gap-3">
                                      <div className="flex items-center gap-2 flex-1 justify-end">
                                        <div 
                                          className="w-3 h-3 rounded-full border border-white/30"
                                          style={{ backgroundColor: homeColor }}
                                        />
                                        <span className="font-bold text-white text-lg tracking-wide">
                                          {game.home_display}
                                        </span>
                                      </div>
                                      <div 
                                        className="text-2xl font-bold text-white/80 mx-2"
                                        style={{ textShadow: '0 2px 4px rgba(4, 30, 66, 0.5)' }}
                                      >
                                        VS
                                      </div>
                                      <div className="flex items-center gap-2 flex-1">
                                        <span className="font-bold text-white text-lg tracking-wide">
                                          {game.away_display}
                                        </span>
                                        <div 
                                          className="w-3 h-3 rounded-full border border-white/30"
                                          style={{ backgroundColor: awayColor }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Game date footer */}
                              {game.game_date && (
                                <div 
                                  className="px-6 pb-4 text-center text-xs text-white/60 font-medium tracking-wide"
                                  style={{ 
                                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'linear-gradient(to bottom, transparent, rgba(4, 30, 66, 0.1))'
                                  }}
                                >
                                  {new Date(game.game_date).toLocaleDateString()}
                                </div>
                              )}
                              
                              {/* Hover glow effect */}
                              <div 
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{
                                  background: completed
                                    ? 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
                                    : 'radial-gradient(circle at center, rgba(29, 66, 138, 0.1) 0%, transparent 70%)'
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
