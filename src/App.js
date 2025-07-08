import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LeagueInfo from "./pages/LeagueInfo";
import Standings from "./pages/Standings";
import Teams from "./pages/Teams";
import PowerRankings from "./pages/PowerRankings";
import Stats from "./pages/Stats";
import Schedule from "./pages/Schedule";
import Landing from "./pages/Landing";
import Footer from "./components/Footer";


import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white font-sans">
<nav className="relative backdrop-blur-md bg-[#1a1a2ecc] px-8 py-6 flex items-center border-b border-blue-800 shadow-md">
  {/* Centered Links */}
  <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-wrap gap-6">
    {[
      ["League Info", "/leagueinfo"],
      ["Standings", "/standings"],
      ["Teams", "/teams"],
      ["Power Rankings", "/power-rankings"],
      ["Stats", "/stats"],
      ["Schedule", "/schedule"]
    ].map(([label, path]) => (
      <Link
        key={path}
        to={path}
        className="text-gray-300 hover:text-white text-lg px-4 py-2 rounded-full transition-all duration-200 hover:bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-md hover:scale-105"
      >
        {label}
      </Link>
    ))}
  </div>

  {/* Admin Sign In */}
  <div className="ml-auto">
    <Link
      to="/admin"
      className="text-white text-base bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 rounded-full font-semibold hover:scale-105 shadow-lg transition duration-200"
    >
      Admin Sign In
    </Link>
  </div>
</nav>




        {/* Routes */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/leagueinfo" element={<LeagueInfo />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/power-rankings" element={<PowerRankings />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </div>

        </div>    
        
        <Footer />

    </Router>
  );
}

export default App;
