import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';
import { apiService } from '../services/apiService';

const SeasonDropdown = ({ 
  entityType = 'team', // 'team' or 'player'
  entityId, 
  entitySlug,
  selectedSeason, 
  onSeasonChange, 
  className = '' 
}) => {
  const [seasons, setSeasons] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeasons = async () => {
      if (!entityId && !entitySlug) return;
      
      try {
        setLoading(true);
        let data;
        
        if (entityType === 'team') {
          // For teams, we can use either ID or slug
          if (entityId) {
            data = await apiService.getTeamSeasons(entityId);
          } else {
            // If we only have slug, we need to map it to ID (mock mapping for now)
            const slugToIdMap = {
              'non-chalant': '1',
              'pen15-club': '2',
              'mj': '3',
              'drunken-goats': '4',
              'chicken-jockey': '5',
              'backdoor-bandits': '6',
              'jakeing-it': '7',
              'mid-boost': '8',
              'nick-al-nite': '9',
              'double-bogey': '10',
              'bronny-james': '11',
              'the-chopped-trees': '12',
              'the-shock': '13'
            };
            const teamId = slugToIdMap[entitySlug] || '1';
            data = await apiService.getTeamSeasons(teamId);
          }
        } else {
          data = await apiService.getPlayerSeasons(entityId);
        }
        
        if (data && data.seasons) {
          setSeasons(data.seasons);
          // Set default to most recent season if no season selected
          if (!selectedSeason && data.seasons.length > 0) {
            onSeasonChange(data.seasons[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch seasons:', error);
        // Fallback to current season and recent seasons
        const fallbackSeasons = ['2024', '2023', '2022'];
        setSeasons(fallbackSeasons);
        if (!selectedSeason) {
          onSeasonChange(fallbackSeasons[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [entityId, entitySlug, entityType, selectedSeason, onSeasonChange]);

  const handleSeasonSelect = (season) => {
    onSeasonChange(season);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center px-3 py-2 bg-gray-700 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-sm text-gray-300">Loading seasons...</span>
      </div>
    );
  }

  if (seasons.length <= 1) {
    return (
      <div className={`inline-flex items-center px-3 py-2 bg-gray-700 rounded-lg ${className}`}>
        <span className="text-sm text-gray-300">Season: {selectedSeason || seasons[0] || '2024'}</span>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors min-w-[120px]"
      >
        <span className="text-sm font-medium">
          {selectedSeason || seasons[0] || '2024'}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-full">
          {seasons.map((season) => (
            <button
              key={season}
              onClick={() => handleSeasonSelect(season)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                selectedSeason === season 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SeasonDropdown;