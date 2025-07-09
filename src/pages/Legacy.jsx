export default function LeagueRecords() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-16 bg-gradient-to-br from-[#1f1f2e] to-[#2e1f2e] text-gray-100 rounded-3xl shadow-2xl space-y-28 animate-fade-in text-center">
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 animate-bounce">League Records & History</h1>

      <section className="space-y-6 animate-fade-in-up">
        <h2 className="text-4xl font-extrabold text-pink-300 uppercase tracking-wide border-b-4 border-pink-500 inline-block pb-2 mx-auto">All-time Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ul className="space-y-2 text-lg font-medium">
            <li>Goals - Jack (153)</li>
            <li>Runner-up - Matt (122)</li>
          </ul>
          <ul className="space-y-2 text-lg font-medium">
            <li>Assists - John G. (53)</li>
            <li>Runner-up - Dylan (48)</li>
          </ul>
          <ul className="space-y-2 text-lg font-medium">
            <li>Saves - Big Nick (112)</li>
            <li>Runner-up - Mason (96)</li>
          </ul>
        </div>
      </section>

      <section className="space-y-6 animate-slide-in-left">
        <h2 className="text-4xl font-extrabold text-yellow-300 uppercase tracking-wide border-b-4 border-yellow-500 inline-block pb-2 mx-auto">Single-Season Player Records</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg font-medium">
          <li>Most Goals - Tyler S. (84)</li>
          <li>Most Assists - Vince (32)</li>
          <li>Most Saves - John C. (73)</li>
          <li>Most Demos - Dundee (46)</li>
          <li>MVPs - Tyler S. (20)</li>
          <li>Points - Jack (18,736)</li>
        </ul>
      </section>

      <section className="space-y-6 animate-slide-in-right">
        <h2 className="text-4xl font-extrabold text-blue-300 uppercase tracking-wide border-b-4 border-blue-500 inline-block pb-2 mx-auto">Single Game Player Records</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg font-medium">
          <li>Most Goals - Matt S. (11)</li>
          <li>Most Assists - Sam M. (7)</li>
          <li>Most Saves - John C. (9)</li>
        </ul>
      </section>

      <section className="space-y-6 animate-fade-in-up">
        <h2 className="text-4xl font-extrabold text-green-300 uppercase tracking-wide border-b-4 border-green-500 inline-block pb-2 mx-auto">Single-Season Team Records</h2>
        <ul className="text-lg font-medium space-y-2">
          <li>Best Regular Season Record - John & Tyler (20-4-0)</li>
          <li>Most Goals in a Game - Style Boyz/Wolverines (14)</li>
        </ul>
      </section>

      <section className="space-y-6 animate-fade-in delay-100">
        <h2 className="text-4xl font-extrabold text-cyan-300 uppercase tracking-wide border-b-4 border-cyan-500 inline-block pb-2 mx-auto">2024 Fall Season</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg font-medium">
          <li>Champions - John & Tyler (3-1 series win)</li>
          <li>Runner-up - Style Boyz</li>
          <li>Playoff MVP - Tyler S.</li>
          <li>MVP - Tyler S.</li>
          <li>MVP Runner-up - Jack</li>
          <li>Defensive Player of the Year - Quinn</li>
          <li>Runner-up - Robert</li>
          <li>Most Goals - Tyler S. (84)</li>
          <li>Most Assists - Vince (32)</li>
          <li>Most Saves - Mason (52)</li>
          <li>Most Demos - Dundee (37)</li>
          <li>MVPs - Tyler S. (20)</li>
          <li>Points - Tyler S. (17,512)</li>
        </ul>
      </section>

      <section className="space-y-6 animate-fade-in delay-200">
        <h2 className="text-4xl font-extrabold text-cyan-300 uppercase tracking-wide border-b-4 border-cyan-500 inline-block pb-2 mx-auto">2025 Spring Season</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg font-medium">
          <li>Champions -</li>
          <li>Runner-up -</li>
          <li>Regular Season Champions - Jakeing It! (18-5-1)</li>
          <li>Garfield Conference Champions - Jakeing It! (10-5)</li>
          <li>Homer Conference Champions - Drunken Goats (12-3)</li>
          <li>MVP - Jack</li>
          <li>MVP Runner-up - Gup</li>
          <li>Defensive Player - Big Nick</li>
          <li>Defensive Runner-ups - Robert & John C.</li>
          <li>Rookie of the Year - Jake C.</li>
          <li>Rookie Runner-up - Keough</li>
          <li>Playmaker - Dundee</li>
          <li>Playmaker Runner-up - Jake W.</li>
          <li>Most Improved - John G.</li>
          <li>Runner-up - Erica</li>
          <li>Most Goals - Jack (79)</li>
          <li>Most Assists - Sam (31)</li>
          <li>Most Saves - John C. (73)</li>
          <li>Most Demos - Dundee (37)</li>
          <li>MVPs - Matt (17)</li>
          <li>Points - Jack (18,736)</li>
        </ul>
      </section>

      <section className="space-y-6 animate-zoom-in">
        <h2 className="text-4xl font-extrabold text-violet-300 uppercase tracking-wide border-b-4 border-violet-500 inline-block pb-2 mx-auto">All-Stars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-lg font-medium">
          <div>
            <h3 className="text-2xl font-semibold text-pink-300 mb-3">Homer Conference</h3>
            <ul className="space-y-2">
              <li>Matt* (did not participate)</li>
              <li>John C.</li>
              <li>John G.</li>
              <li>Mason</li>
              <li>Dylan</li>
              <li>Vince</li>
              <li>Jack</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-pink-300 mb-3">Garfield Conference</h3>
            <ul className="space-y-2">
              <li>Robert</li>
              <li>Stan</li>
              <li>Nick B.</li>
              <li>Big Nick</li>
              <li>Jake W.</li>
              <li>Gup</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}