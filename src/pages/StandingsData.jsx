import { useState, useEffect } from 'react';

const STANDINGS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJz4vsqAQhsxS5U783SuKnvin-a4Hc8ubHoL2lpziOf-eZwzQjzq3NXtqtwx94yivFcVJdnZgiu_8I/pub?output=csv';

function StandingsData() {
  const [eastData, setEastData] = useState([]);
  const [westData, setWestData] = useState([]);
  const [overallData, setOverallData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overall'); // 'overall', 'east', 'west'

  useEffect(() => {
    fetchStandingsData();
  }, []);

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  };

  const fetchStandingsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(STANDINGS_CSV_URL);
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());

      let currentConference = null;
      const east = [];
      const west = [];
      let headers = [];

      for (let i = 0; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const firstCol = values[0]?.trim() || '';

        // Detect conference headers
        if (firstCol.toLowerCase().includes('eastern')) {
          currentConference = 'east';
          continue;
        } else if (firstCol.toLowerCase().includes('western')) {
          currentConference = 'west';
          continue;
        }

        // Detect header row (contains "Pos" or "Team")
        if (firstCol === 'Pos' || values.some(v => v === 'Team')) {
          headers = values.map(h => h.trim());
          continue;
        }

        // Skip completely empty rows
        const allEmpty = values.every(v => !v || v.trim() === '');
        if (allEmpty) {
          continue;
        }

        // Parse data row only if it's a numeric position (1, 2, 3, etc.)
        if (currentConference && headers.length > 0 && /^\d+$/.test(firstCol)) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });

          // Only add row if it has a valid team name and points
          const hasValidTeam = row.Team && row.Team.trim() !== '';
          const hasValidPoints = row.Points && !isNaN(parseInt(row.Points));

          if (hasValidTeam && hasValidPoints) {
            // Only add if conference doesn't already have 7 teams
            if (currentConference === 'east' && east.length < 7) {
              east.push(row);
            } else if (currentConference === 'west' && west.length < 7) {
              west.push(row);
            }
          }
        }
      }

      // Combine and sort for overall standings
      const combined = [...east, ...west].sort((a, b) => {
        return parseInt(b.Points) - parseInt(a.Points);
      });

      setEastData(east);
      setWestData(west);
      setOverallData(combined);
      setError(null);
    } catch (err) {
      console.error('Error fetching standings data:', err);
      setError('Failed to load standings data');
    } finally {
      setLoading(false);
    }
  };

  const StandingsTable = ({ data, title, color, isConference = true }) => {
    if (!data || data.length === 0) return null;

    const getRowColor = (index) => {
      if (isConference) {
        // Conference standings: top 3 green, middle 2 yellow, last 2 red
        if (index < 3) return 'bg-green-900/20 border-l-4 border-l-green-500';
        if (index < 5) return 'bg-yellow-900/20 border-l-4 border-l-yellow-500';
        return 'bg-red-900/20 border-l-4 border-l-red-500';
      } else {
        // Overall standings: top 6 green, middle 4 yellow, last 4 red
        if (index < 6) return 'bg-green-900/20 border-l-4 border-l-green-500';
        if (index < 10) return 'bg-yellow-900/20 border-l-4 border-l-yellow-500';
        return 'bg-red-900/20 border-l-4 border-l-red-500';
      }
    };

    return (
      <div className="mb-8">
        <h2 className={`text-3xl font-bold mb-6 ${color}`}>{title}</h2>
        <div className="bg-gray-800/90 border border-gray-600 rounded-3xl overflow-hidden shadow-executive">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-600">
                <tr>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm">Pos</th>
                  <th className="px-4 py-4 text-left font-bold text-white text-sm">Team</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm">GP</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm">Record</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm">Points</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm">W</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm hidden md:table-cell">W(OT)</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm hidden md:table-cell">L(OT)</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm">L</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm hidden lg:table-cell">FF</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm hidden lg:table-cell">GF</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm hidden lg:table-cell">GA</th>
                  <th className="px-4 py-4 text-center font-bold text-white text-sm hidden lg:table-cell">GD</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-600 hover:bg-gray-700/50 transition-all duration-300 ${getRowColor(index)}`}
                  >
                    <td className="px-4 py-3 text-center text-white font-mono text-sm">
                      {row.Pos || index + 1}
                    </td>
                    <td className="px-4 py-3 text-left font-semibold text-white text-sm">
                      {row.Team}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-300">
                      {row.GP}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-blue-400">
                      {row.Record}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-yellow-400">
                      {row.Points}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-green-400">
                      {row.W}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-center text-sm text-gray-300">
                      {row['W(OT)'] || row.WOT || '0'}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-center text-sm text-gray-300">
                      {row['L(OT)'] || row.LOT || '0'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-red-400">
                      {row.L}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-center text-sm text-gray-300">
                      {row.FF || '0'}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-center text-sm text-green-400">
                      {row.GF}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-center text-sm text-red-400">
                      {row.GA}
                    </td>
                    <td className={`hidden lg:table-cell px-4 py-3 text-center text-sm font-semibold ${
                      parseInt(row.GD) > 0 ? 'text-green-400' : parseInt(row.GD) < 0 ? 'text-red-400' : 'text-gray-300'
                    }`}>
                      {parseInt(row.GD) > 0 ? '+' : ''}{row.GD}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading standings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">{error}</p>
          <button
            onClick={fetchStandingsData}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="absolute inset-0 neural-bg opacity-20" />

      <div className="relative z-10 glass-dark border-b border-white/10 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-5xl font-black text-white mb-4">Standings Data</h1>
          <p className="text-xl text-white font-light">
            Conference standings and statistics from Google Sheets
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Tab Selector with Sliding Pill */}
        <div className="mb-6 flex justify-center animate-luxury-fade-in-up">
          <div className="relative inline-flex bg-gray-800/60 backdrop-blur-sm p-1.5 rounded-full border border-white/10">
            {/* Sliding background indicator */}
            <div
              className={`absolute top-1.5 bottom-1.5 rounded-full transition-all duration-300 ease-out ${
                activeView === 'overall'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-luxury'
                  : activeView === 'east'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-luxury'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 shadow-luxury'
              }`}
              style={{
                left: activeView === 'overall' ? '0.375rem' : activeView === 'east' ? 'calc(33.33% + 0.125rem)' : 'calc(66.67% - 0.125rem)',
                width: 'calc(33.33% - 0.25rem)',
              }}
            />

            {/* Tab buttons */}
            <button
              onClick={() => setActiveView('overall')}
              className={`relative z-10 px-6 py-2.5 rounded-full font-semibold transition-colors duration-300 ${
                activeView === 'overall'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Overall
            </button>
            <button
              onClick={() => setActiveView('east')}
              className={`relative z-10 px-6 py-2.5 rounded-full font-semibold transition-colors duration-300 ${
                activeView === 'east'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Eastern
            </button>
            <button
              onClick={() => setActiveView('west')}
              className={`relative z-10 px-6 py-2.5 rounded-full font-semibold transition-colors duration-300 ${
                activeView === 'west'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Western
            </button>
          </div>
        </div>

        {/* Conditionally render only the active table */}
        {activeView === 'overall' && (
          <StandingsTable data={overallData} title="Overall Standings" color="text-purple-400" isConference={false} />
        )}
        {activeView === 'east' && (
          <StandingsTable data={eastData} title="Eastern Conference" color="text-blue-400" isConference={true} />
        )}
        {activeView === 'west' && (
          <StandingsTable data={westData} title="Western Conference" color="text-orange-400" isConference={true} />
        )}
      </div>
    </div>
  );
}

export default StandingsData;
