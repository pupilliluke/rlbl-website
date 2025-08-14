import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { players } from '../data/players.js';
import { formatPlayerName } from '../utils/formatters.js';
import { RocketIcon, RulesIcon, AwardIcon, FlagIcon, TrophyIcon, UsersIcon } from '../components/Icons';

const LeagueInfo = () => {
  const navigate = useNavigate();
  const [expandedConference, setExpandedConference] = useState(null);

  // Get teams by conference with their players
  const getTeamsByConference = () => {
    const teamsByConference = {
      homer: [],
      garfield: []
    };

    // Group players by team
    const teamMap = {};
    players.forEach(player => {
      if (!teamMap[player.team]) {
        teamMap[player.team] = [];
      }
      teamMap[player.team].push(player);
    });

    // Define conference assignments (you may want to move this to a data file)
    const conferenceAssignments = {
      homer: ['Non Chalant', 'Pen15 Club', 'MJ', 'Drunken Goats', 'Chicken Jockey'],
      garfield: ['Backdoor Bandits', 'Jakeing It', 'Mid Boost', 'Nick Al Nite', 'Double Bogey', 'Bronny James', 'The Chopped Trees', 'The Shock']
    };

    Object.entries(teamMap).forEach(([teamName, teamPlayers]) => {
      const teamData = {
        name: teamName,
        players: teamPlayers,
        totalPoints: teamPlayers.reduce((sum, p) => sum + p.points, 0),
        totalGoals: teamPlayers.reduce((sum, p) => sum + p.goals, 0)
      };

      if (conferenceAssignments.homer.includes(teamName)) {
        teamsByConference.homer.push(teamData);
      } else if (conferenceAssignments.garfield.includes(teamName)) {
        teamsByConference.garfield.push(teamData);
      }
    });

    // Sort teams by total points
    teamsByConference.homer.sort((a, b) => b.totalPoints - a.totalPoints);
    teamsByConference.garfield.sort((a, b) => b.totalPoints - a.totalPoints);

    return teamsByConference;
  };

  const teamsByConference = getTeamsByConference();

  const toggleConference = (conference) => {
    setExpandedConference(expandedConference === conference ? null : conference);
  };

  const ConferenceSection = ({ title, teams, conference, color }) => (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg overflow-hidden">
      <button
        onClick={() => toggleConference(conference)}
        className="w-full p-6 text-left hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 ${color} rounded-full flex-shrink-0`}></div>
            <h3 className={`text-xl md:text-2xl font-bold ${color === 'bg-blue-500' ? 'text-blue-300' : 'text-orange-300'} font-barlow`}>
              {title}
            </h3>
            <span className="text-sm text-gray-400">({teams.length} teams)</span>
          </div>
          <div className={`transform transition-transform ${expandedConference === conference ? 'rotate-180' : ''}`}>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </button>
      
      {expandedConference === conference && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {teams.map((team, index) => (
              <div key={index} className="bg-gray-700/40 rounded-lg p-4 hover:bg-gray-700/60 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-lg">{team.name}</h4>
                  <div className="text-xs text-gray-400">
                    {team.totalPoints.toLocaleString()} pts
                  </div>
                </div>
                <div className="space-y-2">
                  {team.players.map((player, pIndex) => (
                    <div key={pIndex} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">
                        {formatPlayerName(player.player, player.gamertag)}
                      </span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-yellow-400">{player.goals}G</span>
                        <span className="text-blue-400">{player.assists}A</span>
                        <span className="text-purple-400">{player.saves}S</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate(`/teams/${team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`)}
                  className={`mt-3 w-full py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                    color === 'bg-blue-500' 
                      ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30' 
                      : 'bg-orange-600/20 text-orange-300 hover:bg-orange-600/30'
                  }`}
                >
                  View Team Details →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm shadow-2xl pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent text-center mb-4">
            <RocketIcon className="w-12 h-12 inline mr-4" />
            ROCKET LEAGUE BEER LEAGUE
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-orange-500 to-yellow-400 mx-auto rounded-full mb-6"></div>
          <p className="text-lg md:text-xl text-blue-200 text-center max-w-3xl mx-auto">
            The official rulebook and standings for the Rocket League Beer League
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-10">
          {/* Left Column - Rules */}
          <div className="space-y-8 md:space-y-10">
            {/* Rules Section */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <RulesIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">LEAGUE RULES</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  <span className="font-semibold text-blue-300">Game Length:</span> 5:00, unlimited OT if tied. First OT goal wins. A <span className="font-bold text-white">witness</span> is required to track stats and enforce rules.
                </p>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  If a player crashes mid-game, play stops and resumes from 5:00 with the current score. Time is replayed only to reach the original remainder. If tied, next goal wins.
                </p>
              </div>
            </section>

            {/* Points System */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <AwardIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">POINTS SYSTEM</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-bold text-white text-sm md:text-base">REGULATION WIN</h3>
                  <p className="text-2xl md:text-3xl font-extrabold text-green-400">4 pts</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-bold text-white text-sm md:text-base">OVERTIME WIN</h3>
                  <p className="text-2xl md:text-3xl font-extrabold text-blue-400">3 pts</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-bold text-white text-sm md:text-base">OVERTIME LOSS</h3>
                  <p className="text-2xl md:text-3xl font-extrabold text-yellow-400">2 pts</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-bold text-white text-sm md:text-base">REGULATION LOSS</h3>
                  <p className="text-2xl md:text-3xl font-extrabold text-red-400">1 pt</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Additional Rules */}
          <div className="space-y-8 md:space-y-10">
            {/* Forfeits Section */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <FlagIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">FORFEIT POLICY</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  Teams may forfeit at any time. If trailing by <span className="font-bold text-red-400">less than 5</span>, the forfeit yields <span className="font-bold text-red-400">0 points</span>.
                </p>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  Failure to play at least one set every 2 weeks results in automatic forfeit unless exception is granted.
                </p>
              </div>
            </section>

            {/* Playoffs Section */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <TrophyIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">PLAYOFF STRUCTURE</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/10 text-yellow-400 rounded-full p-1 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    <span className="font-semibold text-white">Top 3 teams</span> in each conference qualify automatically
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/10 text-yellow-400 rounded-full p-1 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    <span className="font-semibold text-white">4th vs 5th seeds</span> play wild card match (single elimination)
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Info */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-bold text-orange-300 border-l-4 border-orange-500 pl-4 mb-4">Full League Info</h2>
              <div className="p-3 rounded-lg bg-[#2a2a3d] border border-blue-700">
                <a
                  href="https://docs.google.com/document/d/1HIR5ctAJwBSPRK3Ozvj9bcFnKV63BmbqFvMsx9GTcYg/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-400 transition underline text-sm md:text-base"
                >
                  View Bible 2.0 on Google Docs →
                </a>
              </div>
            </section>
          </div>
        </div>

        {/* Team Rosters Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <UsersIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">TEAM ROSTERS</h2>
            </div>
            <button 
              onClick={() => navigate('/teams')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 text-sm md:text-base"
            >
              View All Teams
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            <ConferenceSection 
              title="HOMER CONFERENCE" 
              teams={teamsByConference.homer} 
              conference="homer"
              color="bg-blue-500"
            />
            <ConferenceSection 
              title="GARFIELD CONFERENCE" 
              teams={teamsByConference.garfield} 
              conference="garfield"
              color="bg-orange-500"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 font-medium text-sm md:text-base">
            © {new Date().getFullYear()} Rocket League Beer League | All rights reserved
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LeagueInfo;