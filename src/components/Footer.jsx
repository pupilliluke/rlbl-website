export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-300 py-12 px-6 border-t border-blue-900 text-sm">
      <div className="max-w-4xl mx-auto flex flex-col gap-12 text-center">

        {/* Row 1: League Info */}
        <div>
          <h4 className="text-xl font-bold text-orange-400 mb-2">🏆 Rocket League Beer League</h4>
          <p className="text-gray-400 leading-relaxed">
            A community-built Rocket League experience. We bring the stats, the passion, and the fun.
          </p>
        </div>

        {/* Row 2: Contact Info */}
        <div>
          <h4 className="text-xl font-bold text-orange-400 mb-2">Contact</h4>
          <ul className="flex flex-col sm:flex-row gap-2 sm:gap-12 text-center justify-center">
            <li>Email: <a href="mailto:commissioner@rlbl.gg" className="text-blue-400 hover:underline">commissioner@rlbl.gg</a></li>
            <li>Support: <a href="mailto:support@rlbl.gg" className="text-blue-400 hover:underline">support@rlbl.gg</a></li>
            <li>Discord: <a href="https://discord.gg/t8WPe4YM" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Join the server</a></li>
          </ul>
        </div>

        {/* Row 3: Links */}
     <div>
      <h4 className="text-xl font-bold text-orange-400 mb-4 text-center">Quick Links</h4>
      <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-blue-300">
        <a href="/" className="hover:text-white transition">Home</a>
        <a href="/leagueinfo" className="hover:text-white transition">League Info</a>
        <a href="/standings" className="hover:text-white transition">Standings</a>
        <a href="/teams" className="hover:text-white transition">Teams</a>
        <a href="/power-rankings" className="hover:text-white transition">Power Rankings</a>
        <a href="/stats" className="hover:text-white transition">Player Stats</a>
        <a href="/schedule" className="hover:text-white transition">Schedule</a>
        <a href="/legacy" className="hover:text-white transition">Legacy</a>
        <a href="/admin" className="hover:text-white transition">Admin</a>
      </div>
    </div>

      </div>

      {/* Bottom Line */}
      <div className="mt-12 text-xs text-gray-500 text-center">
        Rocket League Beer League Tracker © 2025 — Not affiliated with Psyonix or Epic Games.
      </div>
    </footer>
  );
}
