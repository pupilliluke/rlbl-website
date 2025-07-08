import "../index.css";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      {/* Background image with zoom */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat animate-zoom-slow scale-110"
          style={{ backgroundImage: "url('/assets/images/rlLanding.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        </div>
      </div>

      {/* Foreground content */}
      <div className="relative z-20 flex items-center justify-center w-full h-full px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl leading-[1.25] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 drop-shadow text-center animate-pulse transition duration-300">
            RL BEER LEAGUE
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 font-light">
            Track matches, players, power rankings, and stats like a pro. Beer optional. Glory required.
          </p>
          <div className="mt-8">
            <Link
              to="/leagueinfo"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg transition duration-200"
            >
              Go
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
