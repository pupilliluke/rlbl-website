import { useState, useMemo } from 'react';

function PlayerStatsTable({ data, headers }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let sortableData = [...data];

    // Filter by search term
    if (searchTerm) {
      sortableData = sortableData.filter(row => {
        const playerName = row.Player || '';
        const teamName = row.Team || row.Conference || '';
        return (
          playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teamName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Sort data
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Convert to numbers if possible
        const aNum = parseFloat(aVal?.toString().replace(/,/g, '').replace(/%/g, ''));
        const bNum = parseFloat(bVal?.toString().replace(/,/g, '').replace(/%/g, ''));

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        aVal = aVal?.toString() || '';
        bVal = bVal?.toString() || '';

        if (sortConfig.direction === 'asc') {
          return aVal.localeCompare(bVal);
        } else {
          return bVal.localeCompare(aVal);
        }
      });
    }

    return sortableData;
  }, [data, sortConfig, searchTerm]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '⇅';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Define column groups for player stats
  const getColumnGroups = () => {
    const offensiveStats = ['Points', 'Goals', 'Assists', 'Shots', 'SH%', 'MVP', 'OTG'];
    const defensiveStats = ['Saves', 'Epic Saves', 'Epic Save %'];
    const demoStats = ['Demos'];
    const perGameStats = ['PPG', 'GPG', 'APG', 'SVPG', 'Demo/Game', 'Games Played'];

    const groups = [];
    let currentIndex = 0;

    // Basic info columns (before offensive stats)
    const basicCols = [];
    while (currentIndex < headers.length && !offensiveStats.includes(headers[currentIndex])) {
      basicCols.push(headers[currentIndex]);
      currentIndex++;
    }
    if (basicCols.length > 0) {
      groups.push({ name: '', color: '', columns: basicCols });
    }

    // Offensive stats
    const offensiveCols = [];
    while (currentIndex < headers.length && offensiveStats.includes(headers[currentIndex])) {
      offensiveCols.push(headers[currentIndex]);
      currentIndex++;
    }
    if (offensiveCols.length > 0) {
      groups.push({ name: '🟢 OFFENSIVE STATS', color: 'text-green-400', columns: offensiveCols });
    }

    // Defensive stats
    const defensiveCols = [];
    while (currentIndex < headers.length && defensiveStats.includes(headers[currentIndex])) {
      defensiveCols.push(headers[currentIndex]);
      currentIndex++;
    }
    if (defensiveCols.length > 0) {
      groups.push({ name: '🔴 DEFENSIVE STATS', color: 'text-red-400', columns: defensiveCols });
    }

    // Demo stats
    const demoCols = [];
    while (currentIndex < headers.length && demoStats.includes(headers[currentIndex])) {
      demoCols.push(headers[currentIndex]);
      currentIndex++;
    }
    if (demoCols.length > 0) {
      groups.push({ name: '💥 DEMOS', color: 'text-orange-400', columns: demoCols });
    }

    // Per game stats
    const perGameCols = [];
    while (currentIndex < headers.length && perGameStats.includes(headers[currentIndex])) {
      perGameCols.push(headers[currentIndex]);
      currentIndex++;
    }
    if (perGameCols.length > 0) {
      groups.push({ name: '🔵 PER GAME / EFFICIENCY', color: 'text-blue-400', columns: perGameCols });
    }

    // Any remaining columns
    if (currentIndex < headers.length) {
      groups.push({ name: '', color: '', columns: headers.slice(currentIndex) });
    }

    return groups;
  };

  const columnGroups = getColumnGroups();

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by player or team..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
        />
        <div className="text-sm text-gray-400">
          {sortedData.length} {sortedData.length === 1 ? 'player' : 'players'}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            {/* Category Headers Row */}
            <tr className="bg-white/10">
              {columnGroups.map((group, groupIndex) => (
                group.columns.length > 0 && (
                  <th
                    key={`group-${groupIndex}`}
                    colSpan={group.columns.length}
                    className={`px-4 py-2 text-center font-bold text-xs uppercase tracking-wider border-r border-white/10 ${group.color}`}
                  >
                    {group.name}
                  </th>
                )
              ))}
            </tr>
            {/* Column Headers Row */}
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => requestSort(header)}
                  className="px-4 py-3 text-left font-semibold text-gray-300 hover:bg-white/10 cursor-pointer transition-all whitespace-nowrap select-none group"
                >
                  <div className="flex items-center gap-2">
                    <span>{header}</span>
                    <span className="text-gray-500 group-hover:text-blue-400 transition-colors">
                      {getSortIcon(header)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedData.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-white/5 transition-all"
              >
                {headers.map((header) => (
                  <td
                    key={header}
                    className={`px-4 py-3 whitespace-nowrap ${
                      header === 'Player' ? 'font-semibold text-blue-400' :
                      header === 'Team' || header === 'Conference' ? 'text-gray-300' :
                      'text-gray-400'
                    }`}
                  >
                    {row[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-400">
          <p>No players found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

export default PlayerStatsTable;
