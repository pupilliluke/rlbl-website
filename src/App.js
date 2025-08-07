import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white font-sans">
<nav className="backdrop-blur-md bg-[#1a1a2ecc] px-4 py-3 border-b border-blue-800 shadow-md">
  {/* Mobile-first responsive navigation */}
  <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 lg:gap-6">
    {/* Navigation Links */}
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-6 text-sm md:text-base lg:text-lg">
      {[
        ["League Info", "/leagueinfo"],
        ["Standings", "/standings"],
        ["Teams", "/teams"],
        ["Weekly", "/power-rankings"],
        ["Stats", "/stats"],
        ["Schedule", "/schedule"],
        ["Legacy", "/legacy"]
      ].map(([label, path]) => (
        <Link
          key={path}
          to={path}
          className="text-gray-300 hover:text-white px-2 py-1 md:px-3 lg:px-3 rounded-full transition duration-200 hover:bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-md hover:scale-105 text-center"
        >
          {label}
        </Link>
      ))}
    </div>

    {/* Admin button - responsive positioning */}
    <Link
      to="/admin"
      className="bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold py-1 px-3 md:py-2 md:px-5 rounded-full shadow hover:scale-105 transition text-sm md:text-base mt-2 md:mt-0 md:ml-4"
    >
      <span className="hidden md:inline">Admin Sign In</span>
      <span className="md:hidden">Admin</span>
    </Link>
  </div>
</nav>





        {/* Routes */}
        <div className="p-3 md:p-6">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/leagueinfo" element={<LeagueInfo />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/power-rankings" element={<Weekly />} />
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
