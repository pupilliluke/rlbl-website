import { Link } from "react-router-dom";
import { homerConference, garfieldConference, overall } from "../data/standings.js"; // Adjust the path as necessary
// import PlayoffBracket from "../components/PlayoffBracket.jsx";

const Table = ({ title, data }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-bold text-orange-400 mb-4">{title}</h2>
    <div className="overflow-x-auto rounded shadow">
      <table className="min-w-full bg-[#2a2a3d] text-sm text-left text-gray-200">
        <thead className="bg-[#1f1f2e] text-gray-400 uppercase tracking-wide text-xs">
          <tr>
            <th className="py-2 px-3">Pos</th>
            <th className="py-2 px-3">Team</th>
            <th className="py-2 px-3">GP</th>
            <th className="py-2 px-3">Record</th>
            <th className="py-2 px-3">Pts</th>
            <th className="py-2 px-3">W</th>
            <th className="py-2 px-3">W(OT)</th>
            <th className="py-2 px-3">L(OT)</th>
            <th className="py-2 px-3">L</th>
            <th className="py-2 px-3">FF</th>
            <th className="py-2 px-3">GF</th>
            <th className="py-2 px-3">GA</th>
            <th className="py-2 px-3">GD</th>
          </tr>
        </thead>
        <tbody>
          {data.map((team, i) => (
            <tr key={i} className="hover:bg-[#3a3a50]">
              <td className="py-2 px-3 font-semibold">{i + 1}</td>
              {team.map((value, j) => (
                <td key={j} className="py-2 px-3">{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default function Standings() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white font-sans">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* 🏆 Playoff Bracket Section */}
        {/* <PlayoffBracket /> */}

        {/* Page Content */}
        <h1 className="text-4xl font-bold text-blue-400 mb-8">📊 Season 2 Standings</h1>

        <section className="mb-12">
          <h2 className="text-3xl font-extrabold text-blue-400 mb-4 text-center">🏆 Overall Rankings</h2>
          <div className="overflow-x-auto rounded-xl shadow-lg">
            <table className="min-w-full bg-[#2a2a3d] text-sm text-left text-gray-200">
              <thead className="bg-[#1f1f2e] text-gray-400 uppercase tracking-wide text-xs">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {overall.map(([team, points], i) => {
                  const rank = i + 1;

                  const baseStyle = "transition duration-200";
                  const styles = {
                    1: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold animate-pulse",
                    2: "bg-gradient-to-r from-gray-300 to-gray-500 text-black font-semibold",
                    3: "bg-gradient-to-r from-amber-700 to-yellow-400 text-white font-semibold",
                  };

                  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
                  const rowClass = styles[rank] || "hover:bg-[#3a3a50]";

                  return (
                    <tr key={i} className={`${rowClass} ${baseStyle}`}>
                      <td className="py-3 px-4 font-bold">{medal || rank}</td>
                      <td className="py-3 px-4">{team}</td>
                      <td className="py-3 px-4">{points}</td>
                      <td className="py-3 px-4 w-1/3">
                        <div className="relative w-full h-3 bg-gray-700 rounded">
                          <div
                            className="h-full rounded bg-gradient-to-r from-blue-500 to-cyan-400"
                            style={{ width: `${(points / 80) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <Table title="🏟 Homer Conference" data={homerConference} />
        <Table title="🏟 Garfield Conference" data={garfieldConference} />
      </div>
    </div>
  );
}
