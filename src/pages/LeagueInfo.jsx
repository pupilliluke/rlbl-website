import React from 'react';
import { useNavigate } from 'react-router-dom';



  const LeagueInfo = () => {
    
    const navigate = useNavigate();

    return (
      <div className="max-w-7xl mx-auto px-8 py-12 bg-gradient-to-br from-gray-900 to-[#1a1a2e] text-gray-100 rounded-2xl shadow-2xl border border-gray-800">
        {/* Custom font imports would go in your CSS file */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        `}</style>

        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-barlow tracking-tight leading-tight mb-4">
            🚀 ROCKET LEAGUE BEER LEAGUE
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-orange-500 to-yellow-400 mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-400 font-inter font-medium max-w-3xl mx-auto">
            The official rulebook and standings for the most competitive casual league in Rocket League
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-10">
            {/* Rules Section */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-3xl font-bold text-white font-barlow tracking-tight">LEAGUE RULES</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300 font-inter leading-relaxed">
                  <span className="font-semibold text-blue-300">Game Length:</span> 5:00, unlimited OT if tied. First OT goal wins. A <span className="font-bold text-white">witness</span> is required to track stats and enforce rules.
                </p>
                <p className="text-gray-300 font-inter leading-relaxed">
                  If a player crashes mid-game, play stops and resumes from 5:00 with the current score. Time is replayed only to reach the original remainder. If tied, next goal wins.
                </p>
              </div>
            </section>

            {/* Forfeits Section */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <span className="text-2xl">🏳️</span>
                </div>
                <h2 className="text-3xl font-bold text-white font-barlow tracking-tight">FORFEIT POLICY</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300 font-inter leading-relaxed">
                  Teams may forfeit at any time. If trailing by <span className="font-bold text-red-400">less than 5</span>, the forfeit yields <span className="font-bold text-red-400">0 points</span>.
                </p>
                <p className="text-gray-300 font-inter leading-relaxed">
                  Failure to play at least one set every 2 weeks results in automatic forfeit unless exception is granted.
                </p>
              </div>
            </section>

            {/* Playoffs Section */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <span className="text-2xl">🏆</span>
                </div>
                <h2 className="text-3xl font-bold text-white font-barlow tracking-tight">PLAYOFF STRUCTURE</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/10 text-yellow-400 rounded-full p-1 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-300 font-inter leading-relaxed">
                    <span className="font-semibold text-white">Top 3 teams</span> in each conference qualify automatically
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/10 text-yellow-400 rounded-full p-1 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-300 font-inter leading-relaxed">
                    <span className="font-semibold text-white">4th vs 5th seeds</span> play wild card match (single elimination)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/10 text-yellow-400 rounded-full p-1 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-300 font-inter leading-relaxed">
                    <span className="font-semibold text-white">Semifinals:</span> 1st vs Wild Card, 2nd vs 3rd (Best of 5)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/10 text-yellow-400 rounded-full p-1 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-300 font-inter leading-relaxed">
                    <span className="font-semibold text-white">Championship:</span> Best of 7 series
                  </p>
                </div>
              </div>
              
            </section>

            <section className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg">

        <h2 className="text-xl font-bold text-orange-300 border-l-4 p-4">Full League Info Available Here:  </h2>
        <div className="p-3 rounded-lg bg-[#2a2a3d] border border-blue-700 text-sm font-semibold text-blue-200 shadow-md max-w-sm">
          <p className="mb-1"></p>
          <a
            href="https://docs.google.com/document/d/1HIR5ctAJwBSPRK3Ozvj9bcFnKV63BmbqFvMsx9GTcYg/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-400 transition"
          >
            View Bible 2.0 on Google Docs
          </a>
        </div>
      </section>


            <section className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg">
        <h2 className="text-2xl font-bold text-orange-400 border-b border-orange-500 pb-1">Offseason</h2>
        <p className="leading-relaxed p-2">Duos from non-playoff teams are shuffled. Playoff teams can opt into the shuffle. If a championship player leaves (due to rank), their teammate can pick a new one from the shuffle.</p>

        <h2 className="text-2xl font-bold text-orange-400 border-b border-orange-500 pb-1">Rank Threshold</h2>
        <p className="leading-relaxed">Players must be ranked between <strong>Gold 1</strong> and <strong>Champ 1</strong>.</p>
      </section>

          </div>

          {/* Right Column */}
          <div className="space-y-10">
            {/* Points System */}
            <section className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <span className="text-2xl">🏅</span>
                </div>
                <h2 className="text-3xl font-bold text-white font-barlow tracking-tight">POINTS SYSTEM</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-bold text-white font-barlow tracking-wide">REGULATION WIN</h3>
                  <p className="text-3xl font-extrabold text-green-400">4 pts</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-bold text-white font-barlow tracking-wide">OVERTIME WIN</h3>
                  <p className="text-3xl font-extrabold text-blue-400">3 pts</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-bold text-white font-barlow tracking-wide">OVERTIME LOSS</h3>
                  <p className="text-3xl font-extrabold text-yellow-400">2 pts</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-bold text-white font-barlow tracking-wide">REGULATION LOSS</h3>
                  <p className="text-3xl font-extrabold text-red-400">1 pt</p>
                </div>
              </div>
            </section>


    <div className="max-w-7xl mx-auto px-8 py-12 bg-gradient-to-br from-gray-900 to-[#1a1a2e] text-gray-100 rounded-2xl shadow-2xl border border-gray-800">
      {/* Header and other sections remain the same... */}

      {/* Teams Section - Now just a preview with link button */}
      <section className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <span className="text-2xl">🧑‍🤝‍🧑</span>
            </div>
            <h2 className="text-3xl font-bold text-white font-barlow tracking-tight">TEAM ROSTERS</h2>
          </div>
          <button 
            onClick={() => navigate('/teams')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            View All Teams
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Sample team previews */}
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <h3 className="font-bold text-purple-300 font-barlow">Pen15 Club</h3>
            <p className="text-sm text-gray-400">Erica & John C.</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <h3 className="font-bold text-orange-300 font-barlow">Nick Al Nite</h3>
            <p className="text-sm text-gray-400">Big Nick & Alex</p>
          </div>
        </div>
      </section>

      {/* Conferences Section - Full team lists */}
      <section className="bg-gray-800/60 backdrop-blur-sm p-7 rounded-xl border border-gray-700/50 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-500/20 p-3 rounded-lg">
            <span className="text-2xl">🌍</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-barlow tracking-tight">CONFERENCES</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Homer Conference */}
          <div className="bg-gray-700/30 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-300 mb-4 font-barlow border-b border-blue-500/30 pb-2">HOMER CONFERENCE</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                Non Chalant (Jack & A Rob)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                Pen15 Club (Erica & John C.)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                Overdosed Otters (Dylan & Ben)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                MJ (Mason & John)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                Drunken Goats (Matt & Dundee)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                Chicken Jockeys (Jax & Vince)
              </li>
            </ul>
          </div>
          
          {/* Garfield Conference */}
          <div className="bg-gray-700/30 p-5 rounded-lg">
            <h3 className="text-xl font-bold text-orange-300 mb-4 font-barlow border-b border-orange-500/30 pb-2">GARFIELD CONFERENCE</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                Backdoor Bandits (Sam & Gup)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                Jakeing It (Jake W. & Jake C.)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                Mid Boost (Austin & Keough)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                Nick Al Nite (Big Nick & Alex)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                Double Bogey (Quinn & Nick B.)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                Bronny James (Robert & Stan)
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 font-medium">
            © {new Date().getFullYear()} Rocket League Beer League | All rights reserved
          </p>
        </footer>
      </div>
    );
  };

  export default LeagueInfo;