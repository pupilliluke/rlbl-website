import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LeagueInfo from "./pages/LeagueInfo";
import Standings from "./pages/Standings";
import StandingsData from "./pages/StandingsData";
import Teams from "./pages/Teams";
import Weekly from "./pages/Weekly";
import Stats from "./pages/Stats";
import Schedule from "./pages/Schedule";
import Landing from "./pages/Landing";
import Legacy from "./pages/Legacy";
import Admin from "./pages/Admin";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import TeamStats from "./pages/TeamStats";
import PlayerStats from "./pages/PlayerStats";
import Stream from "./pages/Stream";
import SeasonStats from "./pages/SeasonStats";

import "./index.css";
import "./styles/animations.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-executive text-white font-sans relative">
        <Navbar />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/leagueinfo" element={<><LeagueInfo /><Footer /></>} />
          <Route path="/standings" element={<><Standings /><Footer /></>} />
          <Route path="/standings-data" element={<><StandingsData /><Footer /></>} />
          <Route path="/teams" element={<><Teams /><Footer /></>} />
          <Route path="/power-rankings" element={<><Weekly /><Footer /></>} />
          <Route path="/stats" element={<><Stats /><Footer /></>} />
          <Route path="/schedule" element={<><Schedule /><Footer /></>} />
          <Route path="/season-stats" element={<><SeasonStats /><Footer /></>} />
          <Route path="/legacy" element={<><Legacy /><Footer /></>} />
          <Route path="/admin" element={<><Admin /><Footer /></>} />
          <Route path="/teams/:teamSlug" element={<><TeamStats /><Footer /></>} />
          <Route path="/players/:playerSlug" element={<><PlayerStats /><Footer /></>} />
          <Route path="/stream" element={<><Stream /><Footer /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;