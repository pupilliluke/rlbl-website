export default function LeagueInfo() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-[#1f1f2e] text-gray-200 rounded shadow">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">
        🚀 Rocket League Beer League Bible
      </h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">📝 Rules</h2>
        <p>Game Length: <strong>5:00</strong>, unlimited OT if tied. First OT goal wins. A <strong>witness</strong> is required to track stats and enforce rules.</p>
        <p className="mt-2">If a player crashes mid-game, play stops and resumes from 5:00 with the current score. Time is replayed only to reach the original remainder. If tied, next goal wins.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🏳️ Forfeits</h2>
        <p>Teams may forfeit at any time. If trailing by <strong>less than 5</strong>, the forfeit yields <strong>0 points</strong>.</p>
        <p className="mt-2">Failure to play at least one set every 2 weeks results in a forfeit unless an exception is granted.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">📶 Lag & Reschedules</h2>
        <p>Teams may request a reschedule due to lag. The score and rounded clock are preserved. Each team gets <strong>2 reschedules per season</strong>. No reschedules allowed in playoffs.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🚫 Absent Players</h2>
        <p>Failure to show up for a match with <strong>&lt; 1 hour notice</strong> results in a 3-game forfeit and no points. Also — thanks for wasting my time, dick.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">📆 Regular Season</h2>
        <p>Each duo plays every other team <strong>3 times</strong> in a round-robin format. Points are awarded per game played. Tiebreakers: Goal Differential → Regulation Wins → Head-to-Head.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🏆 Playoffs</h2>
        <ul className="list-disc list-inside">
          <li>Top 3 teams in each conference qualify</li>
          <li>4th and 5th seeds play a wild card match</li>
          <li>Semifinals: 1st vs Wild Card, 2nd vs 3rd (Best of 5)</li>
          <li>Conference finals: Best of 5</li>
          <li>Championship: Best of 7</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🛑 Offseason</h2>
        <p>Duos from non-playoff teams are shuffled. Playoff teams can opt into the shuffle. If a championship player leaves (due to rank), their teammate can pick a new one from the shuffle.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">💠 Rank Threshold</h2>
        <p>Players must be ranked between <strong>Gold 1</strong> and <strong>Champ 1</strong>.</p>
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
        <p>If you're caught — you lose. If you're not caught… let us know 😉</p>
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

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🧑‍🤝‍🧑 Teams</h2>
        <ul className="list-disc list-inside text-sm">
          <li>Pen15 Club (Erica & John C.) — Pink & Black</li>
          <li>Nick Al Nite (Big Nick & Alex) — Orange & Black</li>
          <li>Mid Boost (Austin & Keough) — White & Gold</li>
          <li>Double Bogey (Nick B. & Quinn) — Red & Light Purple</li>
          <li>Bronny James (Robert & Stan) — Purple & Yellow</li>
          <li>Jakeing It (Jake W. & Jake C.) — Green & Purple</li>
          <li>Backdoor Bandits (Sam & Gup) — Brown & White</li>
          <li>Non Chalant (Jack & A Rob) — Light Blue & White</li>
          <li>Chicken Jockeys (Vince & Jax) — Yellow & Green</li>
          <li>MJ (Mason & John) — Black & Green</li>
          <li>Overdosed Otters (Dylan & Ben) — Blue & Black</li>
          <li>Drunken Goats (Matt & Dundee) — Orange & White</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-semibold text-orange-400 mb-2">🌍 Conferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-lg font-bold text-blue-300 mb-1">Homer Conference</h3>
            <ul className="list-disc list-inside">
              <li>Non Chalant (Jack & A Rob)</li>
              <li>Pen15 Club (Erica & John C.)</li>
              <li>Overdosed Otters (Dylan & Ben)</li>
              <li>MJ (Mason & John)</li>
              <li>Drunken Goats (Matt & Dundee)</li>
              <li>Chicken Jockeys (Jax & Vince)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-300 mb-1">Garfield Conference</h3>
            <ul className="list-disc list-inside">
              <li>Backdoor Bandits (Sam & Gup)</li>
              <li>Jakeing It (Jake W. & Jake C.)</li>
              <li>Mid Boost (Austin & Keough)</li>
              <li>Nick Al Nite (Big Nick & Alex)</li>
              <li>Double Bogey (Quinn & Nick B.)</li>
              <li>Bronny James (Robert & Stan)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
