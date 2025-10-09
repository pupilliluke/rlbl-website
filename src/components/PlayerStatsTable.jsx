import { useState, useMemo } from 'react';

function PlayerStatsTable({ data, headers, isTeamStats = false }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let sortableData = [...data];

    // Filter by search term
    if (searchTerm) {
      sortableData = sortableData.filter(row => {
        const playerName = row.Player || '';
        const teamName = row.Team || row.Conference || row.WEST || row.West || row.East || '';
        const searchLower = searchTerm.toLowerCase();

        return (
          playerName.toLowerCase().includes(searchLower) ||
          teamName.toLowerCase().includes(searchLower)
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
    const isTeamColumn = key === 'Team' || key === 'Conference';

    if (isTeamColumn) {
      // For team column, just reset to original order
      setSortConfig({ key: null, direction: 'desc' });
    } else {
      // Standard sorting for other columns
      let direction = 'desc';
      if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc';
      }
      setSortConfig({ key, direction });
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '⇅';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Define column groups for both player and team stats
  const getColumnGroups = () => {
    // Different stat definitions for team vs player stats
    const offensiveStats = isTeamStats
      ? ['Points', 'Pts', 'Points per GM', 'Goals', 'G', 'Shots', 'SH%', 'Goals per GM', 'Shots per GM']
      : ['Points', 'Goals', 'Assists', 'Shots', 'SH%', 'MVP', 'OTG'];

    const defensiveStats = isTeamStats
      ? ['Saves', 'SV', 'Epic SV per GM', 'Saves per GM', 'Saves per SA', 'Shots Allowed', 'Shots Allowed per GM', 'Goals Allowed', 'Goals Allowed per GM', 'Goals Allowed per Shot']
      : ['Saves', 'Epic Saves', 'Epic Save %'];

    const demoStats = ['Demos', 'Demo', 'Demo per GM'];

    const perGameStats = isTeamStats
      ? ['Games Played', 'GP', 'East Record', 'West Record', 'Last 6']
      : ['Games Played', 'PPG', 'GPG', 'APG', 'SVPG', 'Demo/Game'];

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
      groups.push({ name: '🟢 OFFENSIVE STATS', color: 'text-green-300', columns: offensiveCols });
    }

    // Defensive stats
    const defensiveCols = [];
    while (currentIndex < headers.length && defensiveStats.includes(headers[currentIndex])) {
      defensiveCols.push(headers[currentIndex]);
      currentIndex++;
    }
    if (defensiveCols.length > 0) {
      groups.push({ name: '🔴 DEFENSIVE STATS', color: 'text-red-300', columns: defensiveCols });
    }

    // Demo stats
    const demoCols = [];
    while (currentIndex < headers.length && demoStats.includes(headers[currentIndex])) {
      demoCols.push(headers[currentIndex]);
      currentIndex++;
    }
    if (demoCols.length > 0) {
      groups.push({ name: '💥 DEMOS', color: 'text-orange-300', columns: demoCols });
    }

    // Per game stats
    const perGameCols = [];
    while (currentIndex < headers.length && perGameStats.includes(headers[currentIndex])) {
      perGameCols.push(headers[currentIndex]);
      currentIndex++;
    }
    if (perGameCols.length > 0) {
      groups.push({ name: '🔵 PER GAME / EFFICIENCY', color: 'text-blue-300', columns: perGameCols });
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
          {sortedData.length} {sortedData.length === 1 ? (isTeamStats ? 'team' : 'player') : (isTeamStats ? 'teams' : 'players')}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
        <table className="w-full text-sm">
          <thead>
            {/* Category Headers Row */}
            <tr className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border-b-2 border-purple-500/50">
              {columnGroups.map((group, groupIndex) => {
                // Determine background color for each group
                let groupBg = '';
                if (group.name.includes('OFFENSIVE')) groupBg = 'bg-green-900/30';
                else if (group.name.includes('DEFENSIVE')) groupBg = 'bg-red-900/30';
                else if (group.name.includes('DEMOS')) groupBg = 'bg-orange-900/30';
                else if (group.name.includes('PER GAME')) groupBg = 'bg-blue-900/30';

                return group.columns.length > 0 && (
                  <th
                    key={`group-${groupIndex}`}
                    colSpan={group.columns.length}
                    className={`px-4 py-3 text-center font-bold text-sm uppercase tracking-wider border-r border-white/20 ${group.color} ${groupBg} backdrop-blur-sm`}
                  >
                    <div className="drop-shadow-lg">{group.name}</div>
                  </th>
                );
              })}
            </tr>
            {/* Column Headers Row */}
            <tr className="bg-gradient-to-r from-gray-900/60 via-gray-800/60 to-gray-900/60 border-b-2 border-blue-500/30">
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => requestSort(header)}
                  className="px-4 py-3 text-left font-bold text-gray-200 hover:bg-blue-600/20 cursor-pointer transition-all whitespace-nowrap select-none group border-r border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="group-hover:text-blue-300 transition-colors">{header}</span>
                    <span className="text-blue-400 group-hover:text-blue-300 transition-colors text-base">
                      {getSortIcon(header)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-200 border-b border-white/5 ${
                  index % 2 === 0
                    ? 'bg-gradient-to-r from-gray-900/30 via-gray-800/20 to-gray-900/30'
                    : 'bg-gradient-to-r from-gray-800/40 via-gray-700/30 to-gray-800/40'
                }`}
              >
                {headers.map((header, cellIndex) => {
                  const isPlayer = header === 'Player';
                  const isTeamCol = header === 'Team' || header === 'Conference' || header === 'WEST' || header === 'West' || header === 'East';

                  // Offensive stats - different for team vs player
                  const isOffensive = isTeamStats
                    ? ['Points', 'Pts', 'Points per GM', 'Goals', 'G', 'Shots', 'SH%', 'Goals per GM', 'Shots per GM'].includes(header)
                    : ['Points', 'Goals', 'Assists', 'Shots', 'SH%', 'MVP', 'OTG'].includes(header);

                  // Defensive stats - different for team vs player
                  const isDefensive = isTeamStats
                    ? ['Saves', 'SV', 'Epic SV per GM', 'Saves per GM', 'Saves per SA', 'Shots Allowed', 'Shots Allowed per GM', 'Goals Allowed', 'Goals Allowed per GM', 'Goals Allowed per Shot'].includes(header)
                    : ['Saves', 'Epic Saves', 'Epic Save %'].includes(header);

                  const isDemos = ['Demos', 'Demo', 'Demo per GM'].includes(header);

                  // Per game stats - different for team vs player
                  const isPerGame = isTeamStats
                    ? ['Games Played', 'GP', 'East Record', 'West Record', 'Last 6'].includes(header)
                    : ['Games Played', 'PPG', 'GPG', 'APG', 'SVPG', 'Demo/Game'].includes(header);

                  // Alternate column background color
                  let columnBg = cellIndex % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-800/20';

                  // Add category color tint
                  if (isOffensive) columnBg += ' bg-blend-multiply';
                  else if (isDefensive) columnBg += ' bg-blend-multiply';
                  else if (isDemos) columnBg += ' bg-blend-multiply';
                  else if (isPerGame) columnBg += ' bg-blend-multiply';

                  return (
                    <td
                      key={header}
                      className={`px-4 py-3 whitespace-nowrap border-r border-white/5 ${columnBg} ${
                        isPlayer ? 'font-bold text-gray-100 text-base' :
                        isTeamCol ? 'font-semibold text-gray-200' :
                        isOffensive ? 'text-gray-100 font-medium' :
                        isDefensive ? 'text-gray-100 font-medium' :
                        isDemos ? 'text-gray-100 font-medium' :
                        isPerGame ? 'text-gray-100 font-medium' :
                        'text-gray-200'
                      }`}
                    >
                      {row[header] || '-'}
                    </td>
                  );
                })}
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
