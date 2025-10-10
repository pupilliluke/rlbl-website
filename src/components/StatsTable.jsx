import { useMemo } from 'react';
import { formatPlayerName } from '../utils/formatters.js';

function StatsTable({ data, viewType }) {
  // Define column structure with categories
  const getColumnConfig = () => {
    if (viewType === 'players') {
      return {
        basic: [
          { key: 'rank', label: '#', className: 'w-12' },
          { key: 'player_name', label: 'Player', className: 'min-w-[150px]', sortable: true }
        ],
        offensive: [
          { key: 'total_points', label: 'Points', sortable: true },
          { key: 'total_goals', label: 'Goals', sortable: true },
          { key: 'total_shots', label: 'Shots', sortable: true },
          { key: 'shPercent', label: 'SH%', sortable: true },
          { key: 'total_assists', label: 'Assists', sortable: true },
          { key: 'total_mvps', label: 'MVP', sortable: true },
          { key: 'total_otg', label: 'OTG', sortable: true }
        ],
        defensive: [
          { key: 'total_saves', label: 'Saves', sortable: true },
          { key: 'total_epic_saves', label: 'Epic Saves', sortable: true },
          { key: 'epicSavePercent', label: 'Epic Save %', sortable: true }
        ],
        demos: [
          { key: 'total_demos', label: 'Demos', sortable: true },
          { key: 'demoPerGame', label: 'Demo/GM', sortable: true }
        ],
        perGame: [
          { key: 'ppg', label: 'PPG', sortable: true },
          { key: 'gpg', label: 'GPG', sortable: true },
          { key: 'apg', label: 'APG', sortable: true },
          { key: 'svpg', label: 'Saves/GM', sortable: true },
          { key: 'games_played', label: 'Games', sortable: true }
        ]
      };
    } else {
      // Teams view
      return {
        basic: [
          { key: 'rank', label: '#', className: 'w-12' },
          { key: 'team', label: 'Team', className: 'min-w-[150px]', sortable: true }
        ],
        offensive: [
          { key: 'totalPoints', label: 'Points', sortable: true },
          { key: 'avgPointsPerGame', label: 'Pts/GM', sortable: true },
          { key: 'totalGoals', label: 'Goals', sortable: true },
          { key: 'totalShots', label: 'Shots', sortable: true },
          { key: 'avgSH', label: 'SH%', sortable: true },
          { key: 'avgGPG', label: 'G/GM', sortable: true },
          { key: 'avgShotsPerGame', label: 'Shots/GM', sortable: true },
          { key: 'totalAssists', label: 'Assists', sortable: true },
          { key: 'totalMVPs', label: 'MVP', sortable: true },
          { key: 'totalOTG', label: 'OTG', sortable: true }
        ],
        defensive: [
          { key: 'totalSaves', label: 'Saves', sortable: true },
          { key: 'totalEpicSaves', label: 'Epic Saves', sortable: true },
          { key: 'avgEpicSavePercent', label: 'Epic Save %', sortable: true },
          { key: 'avgEpicSavePerGame', label: 'Epic SV/GM', sortable: true },
          { key: 'avgSVPG', label: 'Saves/GM', sortable: true },
          { key: 'savesPerShotsAgainst', label: 'Saves/SA', sortable: true },
          { key: 'totalShotsAllowed', label: 'SA', sortable: true },
          { key: 'avgShotsAllowedPerGame', label: 'SA/GM', sortable: true },
          { key: 'totalGoalsAllowed', label: 'GA', sortable: true },
          { key: 'avgGoalsAllowedPerGame', label: 'GA/GM', sortable: true },
          { key: 'goalsAllowedPerShot', label: 'GA/Shot', sortable: true }
        ],
        demos: [
          { key: 'totalDemos', label: 'Demos', sortable: true },
          { key: 'avgDemoPerGame', label: 'Demo/GM', sortable: true }
        ],
        perGame: [
          { key: 'displayGames', label: 'Games', sortable: true },
          { key: 'eastRecord', label: 'East Rec', sortable: false },
          { key: 'westRecord', label: 'West Rec', sortable: false },
          { key: 'last6', label: 'Last 6', sortable: false }
        ]
      };
    }
  };

  const columnConfig = getColumnConfig();

  // Get value from item based on key
  const getValue = (item, key) => {
    if (key === 'rank') return null; // Handled separately
    if (key === 'player_name' && viewType === 'players') {
      return formatPlayerName(
        item.player_name || item.name || item.display_name || 'Unknown Player',
        item.gamertag
      );
    }

    const value = item[key];

    // Format percentages
    if (key.includes('Percent') || key === 'avgSH' || key === 'savesPerShotsAgainst' || key === 'goalsAllowedPerShot') {
      return value != null ? `${(value || 0).toFixed(1)}%` : '-';
    }

    // Format decimal numbers
    if (typeof value === 'number' && !Number.isInteger(value)) {
      return (value || 0).toFixed(2);
    }

    // Format integers with locale
    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return value || '-';
  };

  // Flatten all columns for iteration
  const allColumns = useMemo(() => {
    return [
      ...columnConfig.basic,
      ...columnConfig.offensive,
      ...columnConfig.defensive,
      ...columnConfig.demos,
      ...columnConfig.perGame
    ];
  }, [viewType]);

  return (
    <div className="overflow-x-auto rounded-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
      <table className="w-full text-sm">
        <thead>
          {/* Category Headers Row */}
          <tr className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border-b-2 border-purple-500/50">
            <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider border-r border-white/20 backdrop-blur-sm" colSpan={columnConfig.basic.length}></th>
            <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider border-r border-white/20 text-green-300 bg-green-900/30 backdrop-blur-sm" colSpan={columnConfig.offensive.length}>
              <div className="drop-shadow-lg">🟢 OFFENSIVE STATS</div>
            </th>
            <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider border-r border-white/20 text-red-300 bg-red-900/30 backdrop-blur-sm" colSpan={columnConfig.defensive.length}>
              <div className="drop-shadow-lg">🔴 DEFENSIVE STATS</div>
            </th>
            <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider border-r border-white/20 text-orange-300 bg-orange-900/30 backdrop-blur-sm" colSpan={columnConfig.demos.length}>
              <div className="drop-shadow-lg">💥 DEMOS</div>
            </th>
            <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider border-r border-white/20 text-blue-300 bg-blue-900/30 backdrop-blur-sm" colSpan={columnConfig.perGame.length}>
              <div className="drop-shadow-lg">🔵 PER GAME / EFFICIENCY</div>
            </th>
          </tr>
          {/* Column Headers Row */}
          <tr className="bg-gradient-to-r from-gray-900/60 via-gray-800/60 to-gray-900/60 border-b-2 border-blue-500/30">
            {allColumns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-bold text-gray-200 cursor-pointer transition-all whitespace-nowrap select-none group border-r border-white/10 ${col.className || ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="group-hover:text-blue-300 transition-colors">{col.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={`hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-200 border-b border-white/5 ${
                index % 2 === 0
                  ? 'bg-gradient-to-r from-gray-900/30 via-gray-800/20 to-gray-900/30'
                  : 'bg-gradient-to-r from-gray-800/40 via-gray-700/30 to-gray-800/40'
              }`}
            >
              {allColumns.map((col, cellIndex) => {
                const isRank = col.key === 'rank';
                const isName = col.key === 'player_name' || col.key === 'team';

                // Alternate column background color
                let columnBg = cellIndex % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-800/20';

                return (
                  <td
                    key={col.key}
                    className={`px-4 py-3 whitespace-nowrap border-r border-white/5 ${columnBg} ${
                      isRank ? 'text-center text-white font-mono' :
                      isName ? 'font-bold text-gray-100 text-base' :
                      'text-gray-100 font-medium'
                    }`}
                  >
                    {isRank ? (
                      <div className="flex items-center justify-center">
                        {index + 1 <= 3 ? (
                          <span className="text-sm">{index + 1 === 1 ? '1st' : index + 1 === 2 ? '2nd' : '3rd'}</span>
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                    ) : (
                      getValue(item, col.key)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StatsTable;
