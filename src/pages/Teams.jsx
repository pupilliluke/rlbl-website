import { teams } from "../data/teams.js"; // Adjust the path as necessary

export default function Teams() {
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white px-6 py-12">
      <h1 className="text-4xl font-extrabold text-orange-400 mb-12 text-center drop-shadow-md">
         RLBL Teams
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {teams.map((team, i) => (
       <div
        key={i}
        className="rounded-2xl shadow-lg p-6 border border-blue-900 transition duration-300 hover:scale-[1.02]"
        style={{
            background: `linear-gradient(135deg, ${team.colors[0]}33 20%, ${team.colors[1]}33 80%)`,
            backgroundColor: "#1f1f2e",
        }}
        >

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white drop-shadow">{team.name}</h2>
              <div className="flex space-x-2">
                {team.colors.map((color, j) => (
                  <div
                    key={j}
                    className="w-5 h-5 rounded-full border border-white"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-100 mb-1">Players:</p>
              <div className="grid grid-cols-1 gap-1">
                {team.players.map((p, idx) => (
                  <div key={idx} className="text-lg font-semibold text-white drop-shadow-sm">
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
