import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, fallbackData } from "../services/apiService";

const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Teams() {
  // Function to get conference for a team (database-driven)
  const getTeamConference = (team) => {
    // Use database conference if available
    if (team.conference) {
      return team.conference;
    }
    return null;
  };
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("current");
  const [selectedConference, setSelectedConference] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching teams and players data from API for season:', selectedSeason);
        
        let teamsData, playersData;
        
        // Use team_seasons endpoint for specific seasons to get historical data
        if (selectedSeason === 'season1') {
          teamsData = await apiService.getTeamSeasonData(1);
        } else if (selectedSeason === 'season2') {
          teamsData = await apiService.getTeamSeasonData(2);
        } else if (selectedSeason === 'season2_playoffs') {
          teamsData = await apiService.getTeamSeasonData(2);
        } else {
          // For current/career, use teams endpoint with conference filtering
          teamsData = await apiService.getTeams(selectedSeason, selectedConference);
        }
        
        playersData = await apiService.getPlayers();
        
        console.log('Teams data received:', teamsData);
        console.log('Players data received:', playersData);
        
        setTeams(teamsData);
        setPlayers(playersData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch teams data:', err);
        console.error('Error details:', err.message);
        setError(err.message);
        // Use fallback data
        console.log('Using fallback data due to API error');
        setTeams(fallbackData.teams);
        setPlayers(fallbackData.players);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason, selectedConference]);

  // Circular Stadium Layout Function
  function renderCircularLayout(teamsData, conference) {
    if (!teamsData || teamsData.length === 0) {
      return (
        <div className="text-center text-gray-400 py-16">
          <p>No teams found for this selection.</p>
        </div>
      );
    }

    const teamCount = teamsData.length;
    const containerSize = Math.min(window.innerWidth * 0.8, 800); // Responsive size
    const centerX = containerSize / 2;
    const centerY = containerSize / 2;

    // Determine ring configuration
    let rings = [];
    if (teamCount <= 7) {
      // Single ring or center + ring configuration
      if (teamCount === 7) {
        rings = [{ teams: teamsData, radius: containerSize * 0.35 }];
      } else {
        rings = [{ teams: teamsData, radius: containerSize * 0.32 }];
      }
    } else if (teamCount <= 14) {
      // Two concentric rings
      const outerTeams = teamsData.slice(0, Math.ceil(teamCount / 2));
      const innerTeams = teamsData.slice(Math.ceil(teamCount / 2));
      rings = [
        { teams: outerTeams, radius: containerSize * 0.38 },
        { teams: innerTeams, radius: containerSize * 0.22 }
      ];
    } else {
      // Three rings for larger team counts
      const outerCount = Math.ceil(teamCount / 3);
      const middleCount = Math.ceil((teamCount - outerCount) / 2);
      rings = [
        { teams: teamsData.slice(0, outerCount), radius: containerSize * 0.4 },
        { teams: teamsData.slice(outerCount, outerCount + middleCount), radius: containerSize * 0.26 },
        { teams: teamsData.slice(outerCount + middleCount), radius: containerSize * 0.12 }
      ];
    }

    return (
      <div className="relative flex justify-center items-center py-8">
        <svg
          width={containerSize}
          height={containerSize}
          className="drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' }}
        >
          {/* Background orbital rings */}
          {rings.map((ring, ringIndex) => (
            <circle
              key={`ring-${ringIndex}`}
              cx={centerX}
              cy={centerY}
              r={ring.radius}
              fill="none"
              stroke="rgba(59, 130, 246, 0.1)"
              strokeWidth="1"
              strokeDasharray="4 8"
              className="animate-pulse"
            />
          ))}

          {/* Center badge */}
          {renderCenterBadge(centerX, centerY, conference)}

          {/* Team nodes */}
          {rings.map((ring, ringIndex) =>
            ring.teams.map((team, teamIndex) => {
              const angle = (2 * Math.PI * teamIndex) / ring.teams.length;
              const x = centerX + ring.radius * Math.cos(angle - Math.PI / 2);
              const y = centerY + ring.radius * Math.sin(angle - Math.PI / 2);
              return renderTeamNode(team, x, y, angle, teamIndex + ringIndex * 10);
            })
          )}
        </svg>
      </div>
    );
  }

  // Center Badge Component
  function renderCenterBadge(centerX, centerY, conference) {
    const badgeSize = 180; // Increased from 80 to 180
    return (
      <g>
        {/* Outer glow circles for dramatic effect */}
        <circle
          cx={centerX}
          cy={centerY}
          r={badgeSize / 2 + 20}
          fill="rgba(59, 130, 246, 0.1)"
          className="animate-pulse"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={badgeSize / 2 + 12}
          fill="rgba(59, 130, 246, 0.2)"
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={badgeSize / 2 + 6}
          fill="rgba(59, 130, 246, 0.3)"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />

        {/* Main badge circle with gradient */}
        <defs>
          <radialGradient id="centerBadgeGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="50%" stopColor="rgba(17, 24, 39, 0.95)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.9)" />
          </radialGradient>
        </defs>

        <circle
          cx={centerX}
          cy={centerY}
          r={badgeSize / 2}
          fill="url(#centerBadgeGradient)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="4"
          className="drop-shadow-2xl"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))'
          }}
        />

        {/* Large season text */}
        <text
          x={centerX}
          y={centerY - 15}
          textAnchor="middle"
          fill="white"
          fontSize="42"
          fontWeight="bold"
          className="select-none"
          style={{
            textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 16px rgba(59, 130, 246, 0.6)',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {selectedSeason === 'current' ? 'S3' :
           selectedSeason === 'season2' ? 'S2' :
           selectedSeason === 'season1' ? 'S1' : 'RL'}
        </text>

        {/* Conference/subtitle text */}
        <text
          x={centerX}
          y={centerY + 25}
          textAnchor="middle"
          fill="rgb(156, 163, 175)"
          fontSize="16"
          fontWeight="600"
          className="select-none"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {conference === 'all' ? 'ALL TEAMS' : conference || 'RLBL'}
        </text>

        {/* Optional decorative elements */}
        <circle
          cx={centerX - badgeSize / 2 + 15}
          cy={centerY}
          r="3"
          fill="rgba(59, 130, 246, 0.8)"
          className="animate-pulse"
        />
        <circle
          cx={centerX + badgeSize / 2 - 15}
          cy={centerY}
          r="3"
          fill="rgba(59, 130, 246, 0.8)"
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
      </g>
    );
  }

  // Team Node Component
  function renderTeamNode(team, x, y, angle, index) {
    const teamName = team.display_name || team.team_name || team.original_team_name;
    const teamPrimaryColor = team.color || '#3B82F6';
    const teamSecondaryColor = team.secondary_color || teamPrimaryColor;
    const teamConference = getTeamConference(team);
    const teamPlayers = getPlayersForTeam(teamName);
    const teamId = team.team_season_id || team.team_id || team.id;

    // Calculate team strength (player count as percentage)
    const maxPlayers = 5; // Typical RL team size
    const teamStrength = Math.min((teamPlayers.length / maxPlayers) * 100, 100);
    const nodeSize = 80; // Increased from 50 to 80
    const strokeDasharray = `${teamStrength * 4.02} 402`; // Circumference ≈ 2πr where r=64

    // Keep text upright
    const shouldFlip = angle > Math.PI / 2 && angle < (3 * Math.PI) / 2;
    const labelAngle = shouldFlip ? angle + Math.PI : angle;
    const textAnchor = shouldFlip ? 'end' : 'start';

    return (
      <g key={`team-${teamId}-${index}`} className="group cursor-pointer">
        {/* Node shadow */}
        <circle
          cx={x + 2}
          cy={y + 2}
          r={nodeSize / 2}
          fill="rgba(0, 0, 0, 0.3)"
        />

        {/* Strength arc background */}
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2 + 6}
          fill="none"
          stroke="rgba(75, 85, 99, 0.3)"
          strokeWidth="3"
        />

        {/* Strength arc */}
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2 + 6}
          fill="none"
          stroke={teamPrimaryColor}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeDashoffset="62.75"
          strokeLinecap="round"
          className="transition-all duration-500 group-hover:stroke-width-4"
          style={{
            filter: `drop-shadow(0 0 8px ${teamPrimaryColor}40)`,
            transform: 'rotate(-90deg)',
            transformOrigin: `${x}px ${y}px`
          }}
        />

        {/* Define gradient for this team */}
        <defs>
          <linearGradient id={`teamGradient-${teamId}-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={teamPrimaryColor} />
            <stop offset="100%" stopColor={teamSecondaryColor} />
          </linearGradient>
          <radialGradient id={`teamRadial-${teamId}-${index}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={teamSecondaryColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={teamPrimaryColor} />
          </radialGradient>
        </defs>

        {/* Main team node */}
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2}
          fill={`url(#teamRadial-${teamId}-${index})`}
          stroke="white"
          strokeWidth="3"
          className="transition-all duration-300 group-hover:stroke-width-4 group-hover:drop-shadow-xl"
          style={{
            filter: `drop-shadow(0 6px 12px ${teamPrimaryColor}40)`
          }}
        />

        {/* Team initials/logo */}
        <text
          x={x}
          y={y + 6}
          textAnchor="middle"
          fill="white"
          fontSize="18"
          fontWeight="bold"
          className="select-none transition-all duration-300 group-hover:text-xl"
          style={{
            textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {teamName.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase()}
        </text>

        {/* Conference indicator dots */}
        {teamConference && (
          <circle
            cx={x + nodeSize / 2 - 8}
            cy={y - nodeSize / 2 + 8}
            r="4"
            fill={teamConference === 'East' ? '#EF4444' : '#10B981'}
            stroke="white"
            strokeWidth="1"
            className="drop-shadow-sm"
          />
        )}

        {/* Team label wrapped over the top center of circle */}
        {(() => {
          const labelRadius = nodeSize / 2 + 25;
          const textLength = teamName.length;
          const charSpacing = 8; // Fixed spacing between characters

          // Calculate the arc that the text should span (roughly 120 degrees over the top)
          const maxArcAngle = Math.PI * 2/3; // 120 degrees in radians
          const totalTextAngle = Math.min((textLength * charSpacing) / labelRadius, maxArcAngle);

          // Start angle - center the text arc over the top of the circle
          const startAngle = -Math.PI / 2 - totalTextAngle / 2; // -90 degrees minus half the text arc

          return teamName.split('').map((char, charIndex) => {
            const charAngle = startAngle + (charIndex * charSpacing) / labelRadius;
            const charX = x + labelRadius * Math.cos(charAngle);
            const charY = y + labelRadius * Math.sin(charAngle);
            const rotationAngle = (charAngle + Math.PI / 2) * 180 / Math.PI;

            return (
              <text
                key={`char-${charIndex}`}
                x={charX}
                y={charY}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="600"
                className="select-none transition-all duration-300 group-hover:text-sm group-hover:font-bold"
                style={{
                  textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)',
                  transform: `rotate(${rotationAngle}deg)`,
                  transformOrigin: `${charX}px ${charY}px`
                }}
              >
                {char}
              </text>
            );
          });
        })()}

        {/* Click handler */}
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2 + 15}
          fill="transparent"
          className="cursor-pointer"
          onClick={() => window.location.href = `/teams/${slugify(teamName)}`}
        />
      </g>
    );
  }

  // Group players by team - handle both team_seasons and teams data structures
  const getPlayersForTeam = (teamName) => {
    return players.filter(player => {
      // Handle different team name fields from different endpoints
      return player.team_name === teamName ||
             (player.original_team_name && player.original_team_name === teamName) ||
             (player.current_team_name && player.current_team_name === teamName);
    });
  };

  // Filter teams by conference
  const filteredTeams = teams.filter(team => {
    if (selectedConference === "all") return true;
    return getTeamConference(team) === selectedConference;
  });

  // Group teams by conference for display
  const groupedByConference = () => {
    if (selectedSeason === 'current' && selectedConference === "all") {
      const grouped = { 'West': [], 'East': [], 'Other': [] };

      teams.forEach(team => {
        const conference = getTeamConference(team);
        if (conference) {
          grouped[conference].push(team);
        } else {
          grouped['Other'].push(team);
        }
      });

      return grouped;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white page-with-navbar relative overflow-x-hidden">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm shadow-2xl border-b border-blue-500/30 pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">⚽ RLBL Teams</h1>
              <p className="text-blue-200 text-sm md:text-base">
                Team rosters and player lineups by season
                {error && <span className="text-red-400 ml-2">(Using cached data)</span>}
              </p>
            </div>
            
            {/* Season and Conference Dropdowns */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex flex-col items-start md:items-end">
                <label className="text-xs text-gray-300 mb-1">Season</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white hover:shadow-lg transition-all duration-300 focus:border-blue-400 focus:outline-none min-w-[200px]"
                >
                  <option value="current" className="text-black bg-white">Season 3</option>
                  <option value="season2" className="text-black bg-white">Season 2 - Spring 25</option>
                  <option value="season2_playoffs" className="text-black bg-white">Season 2 Playoffs</option>
                  <option value="season1" className="text-black bg-white">Season 1 - Fall 24</option>
                </select>
              </div>

              {/* Conference Filter - Only show for Season 3 */}
              {selectedSeason === 'current' && (
                <div className="flex flex-col items-start md:items-end">
                  <label className="text-xs text-gray-300 mb-1">Conference</label>
                  <select
                    value={selectedConference}
                    onChange={(e) => setSelectedConference(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white hover:shadow-lg transition-all duration-300 focus:border-blue-400 focus:outline-none min-w-[150px]"
                  >
                    <option value="all" className="text-black bg-white">All Conferences</option>
                    <option value="West" className="text-black bg-white">🛡️ West</option>
                    <option value="East" className="text-black bg-white">🛡️ East</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 text-center">
            {selectedSeason === 'current' && selectedConference !== 'all' ? `Season 3 - ${selectedConference} Conference` :
             selectedSeason === 'current' ? 'Season 3 Teams' :
             selectedSeason === 'season1' ? 'Season 1 Teams' :
             selectedSeason === 'season2' ? 'Season 2 Teams' :
             selectedSeason === 'season2_playoffs' ? 'Season 2 Playoff Teams' :
             'Teams'}
          </h2>
          
          {teams.length === 0 ? (
            <div className="text-center text-gray-400">
              {selectedSeason === 'current' ? (
                <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-600">
                  <div className="text-4xl mb-4"></div>
                  <p className="text-xl text-white mb-2">Season 3 - Summer 25</p>
                  <p>No teams registered yet. Season hasn't started!</p>
                </div>
              ) : (
                <p>No teams found for this season. Make sure the API server is running.</p>
              )}
            </div>
          ) : (
            <>
              {/* Circular Stadium Layout */}
              {(() => {
                const grouped = groupedByConference();
                if (grouped && selectedConference === 'all') {
                  // Combined circular layout for all conferences
                  return renderCircularLayout(filteredTeams, selectedConference);
                } else if (grouped) {
                  // Conference-specific circular layouts
                  return (
                    <div className="space-y-16">
                      {Object.entries(grouped).map(([conferenceName, conferenceTeams]) => {
                        if (conferenceTeams.length === 0) return null;
                        return (
                          <div key={conferenceName}>
                            <div className="flex items-center gap-3 mb-8 justify-center">
                              <div className="text-3xl">🛡️</div>
                              <h3 className="text-3xl font-bold text-white">{conferenceName} Conference</h3>
                            </div>
                            {renderCircularLayout(conferenceTeams, conferenceName)}
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                // Circular layout for other cases
                return renderCircularLayout(filteredTeams, null);
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
