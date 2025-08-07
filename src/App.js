import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import LeagueInfo from "./pages/LeagueInfo";
import Standings from "./pages/Standings";
import Teams from "./pages/Teams";
import Weekly from "./pages/Weekly";
import Stats from "./pages/Stats";
import Schedule from "./pages/Schedule";
import Landing from "./pages/Landing";
import Legacy from "./pages/Legacy";
import Admin from "./pages/Admin";
import Footer from "./components/Footer";
import TeamStats from "./pages/TeamStats";

import "./index.css";
import "./styles/animations.css";

function NavBar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 glass-dark shadow-executive border-b border-white/10 transition-smooth ${isHome ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="max-w-7xl mx-auto spacing-container">
            <div className="flex items-center justify-between h-20">
              
              {/* Logo Section */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-luxury group-hover:animate-glow-pulse">
                  <span className="text-xl font-black text-white">RL</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-xl font-bold holographic">RLBL</div>
                  <div className="text-xs text-gray-400 -mt-1">Analytics Platform</div>
                </div>
              </Link>

              {/* Main Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {[
                  { label: "Dashboard", path: "/leagueinfo", icon: "🏠" },
                  { label: "Standings", path: "/standings", icon: "📊" },
                  { label: "Teams", path: "/teams", icon: "⚽" },
                  { label: "Weekly", path: "/power-rankings", icon: "📊" },
                  { label: "Analytics", path: "/stats", icon: "📈" },
                  { label: "Schedule", path: "/schedule", icon: "📅" },
                  { label: "Legacy", path: "/legacy", icon: "🏛️" }
                ].map(({ label, path, icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white transition-fast hover:bg-white/10 hover-gentle"
                  >
                    <span className="text-sm group-hover:animate-float">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <div className="hidden md:flex items-center gap-2 spacing-compact rounded-full glass text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-glow-pulse"></div>
                  <span className="text-green-400 font-medium">Live</span>
                </div>

                {/* Admin Access */}
                <Link
                  to="/admin"
                  className="group relative spacing-card bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-luxury hover-luxury"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4 group-hover:animate-ai-processing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="hidden sm:inline">Admin</span>
                  </span>
                </Link>

                {/* Mobile Menu Button */}
                <button className="lg:hidden spacing-card rounded-xl glass hover:bg-white/10 transition-fast">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-executive text-white font-sans relative">
        <NavBar />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/leagueinfo" element={<><LeagueInfo /><Footer /></>} />
          <Route path="/standings" element={<><Standings /><Footer /></>} />
          <Route path="/teams" element={<><Teams /><Footer /></>} />
          <Route path="/power-rankings" element={<><Weekly /><Footer /></>} />
          <Route path="/stats" element={<><Stats /><Footer /></>} />
          <Route path="/schedule" element={<><Schedule /><Footer /></>} />
          <Route path="/legacy" element={<><Legacy /><Footer /></>} />
          <Route path="/admin" element={<><Admin /><Footer /></>} />
          <Route path="/teams/:teamSlug" element={<><TeamStats /><Footer /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;