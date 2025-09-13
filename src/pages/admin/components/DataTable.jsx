import React from "react";

const DataTable = ({ 
  activeTab, 
  currentData, 
  loading, 
  loadingStates, 
  selectedSeason, 
  onEdit, 
  onDelete 
}) => {
  if (!currentData || currentData.length === 0) {
    return (
      <div className="bg-gray-800/90 border border-gray-600 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-white mb-2">No Data Available</h3>
        <p className="text-gray-300">Start by adding your first entry using the button above.</p>
      </div>
    );
  }

  // Get all possible keys from all objects to ensure consistent columns
  const allKeys = [...new Set(currentData.flatMap(item => Object.keys(item)))];
  
  // Filter out technical columns for schedule tab
  const filteredKeys = activeTab === "schedule" 
    ? allKeys.filter(key => !["id", "season_id", "home_team_season_id", "away_team_season_id", "home_score", "away_score"].includes(key))
    : allKeys;

  // Show loading state
  const isCurrentTabLoading = loadingStates[activeTab === 'schedule' ? 'schedule' : 
                                          activeTab === 'gameStats' ? 'gameStats' :
                                          activeTab === 'gameResults' ? 'gameResults' : activeTab];

  const renderCellValue = (key, value, itemKey) => {
    let displayValue;
    
    if (key.includes("Color")) {
      displayValue = (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-gray-400" style={{ backgroundColor: value }} />
          <span className="text-xs">{value}</span>
        </div>
      );
    } else if (Array.isArray(value)) {
      displayValue = <div className="text-xs">Array ({value.length} items)</div>;
    } else if (typeof value === "object" && value !== null) {
      displayValue = <div className="text-xs">Object</div>;
    } else if (value === null || value === undefined) {
      displayValue = <span className="text-gray-500 italic">null</span>;
    } else {
      const className = typeof value === "number" ? "font-mono" : "";
      displayValue = <span className={className}>{String(value)}</span>;
    }

    return (
      <td key={`${itemKey}-${key}`} className="px-4 py-3 text-gray-300 border-r border-gray-600/50 last:border-r-0">
        {displayValue}
      </td>
    );
  };

  return (
    <div className="bg-gray-800/90 border border-gray-600 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-600">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Data Table
          {(loading || isCurrentTabLoading) && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          )}
        </h3>
        <p className="text-sm text-gray-300 mt-1">Click edit to modify entries</p>
      </div>
      
      {(loading || isCurrentTabLoading) ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading {activeTab} data...</p>
          </div>
        </div>
      ) : currentData.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">No {activeTab} data available</p>
            <p className="text-gray-500 text-sm">
              {selectedSeason ? 'Try selecting a different season' : 'Select a season to view data'}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-600">
              <tr>
                {filteredKeys.map((key) => (
                  <th key={key} className="px-4 py-3 text-left font-bold text-white border-r border-white/5 last:border-r-0">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-bold text-white w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => {
                const itemKey = item.id || item.player || item.team || item.rank || `admin-item-${Date.now()}-${Math.random()}`;
                return (
                  <tr key={itemKey} className="border-b border-gray-600 hover:bg-gray-700/50 transition-all duration-300">
                    {filteredKeys.map((key) => renderCellValue(key, item[key], itemKey))}
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onEdit(item, index)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-all duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataTable;