import { useState, useEffect } from 'react';
import PlayerStatsTable from '../components/PlayerStatsTable';
import { SHEETS_CONFIG, fetchSheetData } from '../utils/sheetsData';

function SeasonStats() {
  const [selectedSeason, setSelectedSeason] = useState('S3 Fall \'25');
  const [sheetData, setSheetData] = useState({ headers: [], data: [], teamHeaders: null, teamData: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const seasonConfig = SHEETS_CONFIG[selectedSeason];
      if (seasonConfig) {
        const data = await fetchSheetData(seasonConfig.gid);
        setSheetData(data);
        // Reset to players tab when switching seasons
        setActiveTab('players');
      }
      setLoading(false);
    };

    loadData();
  }, [selectedSeason]);

  return (
    <div className="container mx-auto spacing-container mt-20">
      <div className="spacing-section">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center holographic animate-luxury-fade-in">
          Season Statistics
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Interactive player statistics across all seasons
        </p>
      </div>

      {/* Season Selector */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center animate-luxury-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {Object.keys(SHEETS_CONFIG).map((season) => (
          <button
            key={season}
            onClick={() => setSelectedSeason(season)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedSeason === season
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-luxury'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            {season}
          </button>
        ))}
      </div>

      {/* Tab Selector (only show if team data exists) */}
      {!loading && sheetData.teamHeaders && sheetData.teamData && (
        <div className="mb-6 flex gap-2 justify-center animate-luxury-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'players'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-luxury'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Player Stats
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'teams'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-luxury'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Team Stats
          </button>
        </div>
      )}

      {/* Stats Table */}
      <div className="glass rounded-xl p-6 shadow-luxury animate-luxury-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading {selectedSeason} data...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedSeason} - {activeTab === 'players' ? 'Player Statistics' : 'Team Statistics'}
              </h2>
              <p className="text-gray-400 text-sm">
                Sortable table - click any column header to sort
              </p>
            </div>
            {activeTab === 'players' ? (
              <PlayerStatsTable data={sheetData.data} headers={sheetData.headers} />
            ) : (
              <PlayerStatsTable data={sheetData.teamData} headers={sheetData.teamHeaders} />
            )}
          </>
        )}
      </div>

      {/* Stats Summary Cards - Only show for player stats */}
      {!loading && activeTab === 'players' && sheetData.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-luxury-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">Total Players</div>
            <div className="text-3xl font-bold holographic">{sheetData.data.length}</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">Total Teams</div>
            <div className="text-3xl font-bold holographic">
              {new Set(sheetData.data.map(row => row.Team || row.Conference || row.WEST || row.EAST).filter(Boolean)).size}
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">Total Games</div>
            <div className="text-3xl font-bold holographic">
              {sheetData.data.reduce((sum, row) => {
                const games = parseInt(row['Games Played']?.replace(/,/g, '') || 0);
                return sum + games;
              }, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Team Stats Summary Cards */}
      {!loading && activeTab === 'teams' && sheetData.teamData && sheetData.teamData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-luxury-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">Total Teams</div>
            <div className="text-3xl font-bold holographic">{sheetData.teamData.length}</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">Conferences</div>
            <div className="text-3xl font-bold holographic">
              {new Set(sheetData.teamData.map(row => row.West || row.East).filter(Boolean)).size}
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">Total Games</div>
            <div className="text-3xl font-bold holographic">
              {sheetData.teamData.reduce((sum, row) => {
                const games = parseInt(row['Games Played']?.replace(/,/g, '') || 0);
                return sum + games;
              }, 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeasonStats;
