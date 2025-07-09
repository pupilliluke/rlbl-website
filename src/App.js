import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LeagueInfo from "./pages/LeagueInfo";
import Standings from "./pages/Standings";
import Teams from "./pages/Teams";
import PowerRankings from "./pages/PowerRankings";
import Stats from "./pages/Stats";
import Schedule from "./pages/Schedule";
import Landing from "./pages/Landing";
import Legacy from "./pages/Legacy";
import Admin from "./pages/Admin";
import Footer from "./components/Footer";

import TeamStats from "./pages/TeamStats";



import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white font-sans">
<nav className="backdrop-blur-md bg-[#1a1a2ecc] px-6 py-5 flex justify-between items-center border-b border-blue-800 shadow-md">
  {/* Centered links */}
  <div className="flex-1 flex justify-center gap-6 text-lg">
    {[
      ["League Info", "/leagueinfo"],
      ["Standings", "/standings"],
      ["Teams", "/teams"],
      ["Power Rankings", "/power-rankings"],
      ["Stats", "/stats"],
      ["Schedule", "/schedule"],
      ["Legacy", "/legacy"]
    ].map(([label, path]) => (
      <Link
        key={path}
        to={path}
        className="text-gray-300 hover:text-white px-3 py-1 rounded-full transition duration-200 hover:bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-md hover:scale-105"
      >
        {label}
      </Link>
    ))}
  </div>

  {/* Admin button aligned right */}
  <Link
    to="/admin"
    className="ml-auto bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold py-2 px-5 rounded-full shadow hover:scale-105 transition"
  >
    Admin Sign In
  </Link>
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
            <Route path="/legacy" element={<Legacy />} />
            <Route path="/admin" element={<Admin />} />

            <Route path="/teams/:teamSlug" element={<TeamStats />} />

          </Routes>
        </div>

        </div>    
        
        <Footer />

    </Router>
  );
}

export default App;
