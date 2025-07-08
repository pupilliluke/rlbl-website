export default function LeagueInfo() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-[#1f1f2e] text-gray-200 rounded shadow">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">🚀 Rocket League Beer League Bible</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">📝 Rules</h2>
        <p>Game Length: <strong>5:00</strong>, unlimited OT if tied. First goal in OT wins. Each game must have 4 qualifying players and a <strong>witness</strong> to track stats and enforce rules.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🏳️ Forfeits</h2>
        <p>Teams can forfeit anytime. If they forfeit while down <strong>less than 5</strong>, they earn <strong>0 points</strong>.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">📶 Lag & Reschedules</h2>
        <p>In regular season games, players may reschedule due to lag. Score and time (rounded to nearest minute) are carried forward. <strong>2 reschedules per team.</strong> No reschedules in playoffs.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🚫 Absent Players</h2>
        <p>If players no-show with <strong>&lt; 1 hour notice</strong>, all 3 games are forfeited. No points. Also… thanks for wasting my time dick.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">📆 Regular Season</h2>
        <p>Round-robin: each duo plays all others <strong>3 times</strong>. Points based on results. Tiebreakers: Goal Diff → Reg Wins → Head-to-Head.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🏆 Playoffs</h2>
        <ul className="list-disc list-inside">
          <li>Top 6 teams qualify.</li>
          <li>Top 2 get byes.</li>
          <li>3 vs 6 and 4 vs 5: Best of 5.</li>
          <li>Semis: 1st plays lowest, 2nd plays highest.</li>
          <li>Championship: Best of 7.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🛑 Offseason</h2>
        <p>Non-playoff teams' duos are shuffled. Playoff teams may opt into shuffle. Only opted-in playoff players are shuffled.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🏅 Points System</h2>
        <ul className="list-disc list-inside">
          <li>4 — Regulation Win</li>
          <li>3 — Overtime Win</li>
          <li>2 — Overtime Loss</li>
          <li>1 — Regulation Loss</li>
          <li>0 — Forfeit</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🕵️ Cheating</h2>
        <p>Don’t. If you get caught — you lose. If you don’t get caught — let us know. 😉</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">📊 Stats Tracked</h2>
        <p><strong>T</strong> = Team stat, <strong>P</strong> = Player stat</p>
        <ul className="list-disc list-inside columns-2 text-sm">
          <li>Goals T P</li>
          <li>GPG T P</li>
          <li>Assists T P</li>
          <li>Overall Saves T P</li>
          <li>Epic Saves T P</li>
          <li>Demos T P</li>
          <li>Shots T P</li>
          <li>MVP P</li>
          <li>Points T P</li>
          <li>PPG T P</li>
          <li>Shooting % T P</li>
        </ul>
      </section>


    </div>
  );
}
