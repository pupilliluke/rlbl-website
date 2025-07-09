import { useParams, useNavigate } from "react-router-dom";
import { teamStats } from "../data/teamStats.js";

const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function TeamStats() {
  const { teamSlug } = useParams();
  const navigate = useNavigate();


  const team = teamStats.find((t) => slugify(t.name) === teamSlug);

  if (!team) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-400">
          Team not found: {teamSlug}
        </h1>
      </div>
    );
  }

  const { name, stats } = team;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111827] to-black text-white px-6 py-12">
              {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
        >
          ← Back
        </button>
      </div>    
      <h1 className="text-5xl font-extrabold text-orange-400 text-center mb-10 drop-shadow-lg">
        {name} – Team Stats
      </h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#1f2937] p-8 rounded-3xl shadow-2xl">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center">
            <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">
              {formatStatLabel(key)}
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatStatLabel(label) {
  return label
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b(gpg|spg|shPct|ppg)\b/g, (match) => match.toUpperCase())
    .replace(/\b(gm|pct)\b/gi, (match) =>
      match === "gm" ? "Game" : match.toUpperCase()
    )
    .replace(/\bsa\b/gi, "Shot Against")
    .replace(/\bsv\b/gi, "Save")
    .replace(/\bsh\b/gi, "Shot")
    .replace(/\bspg\b/gi, "Shots per Game")
    .replace(/\bgpg\b/gi, "Goals per Game")
    .replace(/\bepic\b/gi, "Epic")
    .replace(/\bppg\b/gi, "Points per Game")
    .replace(/\bpct\b/gi, "%")
    .replace(/ +/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}
