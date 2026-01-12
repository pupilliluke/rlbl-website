import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatPlayerName } from "../utils/formatters.js";
import { apiService } from "../services/apiService.js";
import { slugify, findTeamBySlug, createPlayerSlug } from "../utils/slugify.js";

export default function TeamStats() {
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [teamGames, setTeamGames] = useState([]);
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get active season
        const seasonsData = await apiService.getSeasons();
        const activeSeasonData = seasonsData.find(s => s.is_active) || seasonsData[seasonsData.length - 1];
        setActiveSeason(activeSeasonData);

        if (activeSeasonData) {
          // Get all teams from active season
          const teamsData = await apiService.getTeams(activeSeasonData.id);
          const foundTeam = findTeamBySlug(teamsData, teamSlug);
          
          if (foundTeam) {
            setTeam(foundTeam);

            // Determine the correct IDs from the foundTeam object
            // foundTeam from getTeams() has: id (team_season_id), team_id, team_name, etc.
            const teamSeasonId = foundTeam.id || foundTeam.team_season_id;
            const teamId = foundTeam.team_id;
            console.log('Found team:', foundTeam, 'Team ID:', teamId, 'Team Season ID:', teamSeasonId);

            // Get team standings for this season
            try {
              const standingsResponse = await apiService.getStandings(activeSeasonData.id);
              const standingsData = standingsResponse.standings || standingsResponse;
              // Compare with team_season_id from standings
              const teamStanding = standingsData.find(s => s.team_season_id === teamSeasonId);
              setStandings(teamStanding);
            } catch (error) {
              console.error('Failed to fetch standings:', error);
            }

            // Get team games (schedule)
            try {
              const [gamesData, teamSeasons, playerGameStats] = await Promise.all([
                apiService.getGames(activeSeasonData.id),
                apiService.getTeamSeasons(activeSeasonData.id),
                apiService.getPlayerGameStats(activeSeasonData.id)
              ]);

              // Filter games by team_season_id
              const teamGamesRaw = gamesData.filter(game =>
                game.home_team_season_id === teamSeasonId ||
                game.away_team_season_id === teamSeasonId
              );

              // Enrich games with display names and scores (like Weekly tab)
              const teamGamesData = teamGamesRaw.map(game => {
                const homeTeamSeason = teamSeasons.find(ts => ts.id === game.home_team_season_id);
                const awayTeamSeason = teamSeasons.find(ts => ts.id === game.away_team_season_id);

                // Calculate total goals from player stats
                const homePlayerStats = playerGameStats.filter(stat =>
                  stat.team_season_id === game.home_team_season_id && stat.game_id === game.id
                );
                const awayPlayerStats = playerGameStats.filter(stat =>
                  stat.team_season_id === game.away_team_season_id && stat.game_id === game.id
                );

                const totalHomeGoals = homePlayerStats.reduce((sum, stat) => sum + (stat.goals || 0), 0);
                const totalAwayGoals = awayPlayerStats.reduce((sum, stat) => sum + (stat.goals || 0), 0);

                return {
                  ...game,
                  home_display: homeTeamSeason?.display_name || 'Unknown Team',
                  away_display: awayTeamSeason?.display_name || 'Unknown Team',
                  home_score: totalHomeGoals,
                  away_score: totalAwayGoals
                };
              });

              setTeamGames(teamGamesData);
            } catch (error) {
              console.error('Failed to fetch games:', error);
            }

            // Get team players (from roster memberships)
            try {
              const rosterData = await apiService.getRosterMemberships(teamId, activeSeasonData.id);
              
              // For each roster member, try to get their stats
              const playersWithStats = [];
              if (rosterData.length > 0) {
                try {
                  const allStats = await apiService.getStats(activeSeasonData.id);
                  
                  rosterData.forEach(rosterPlayer => {
                    // Find matching stats for this player
                    const playerStats = allStats.find(stat => 
                      stat.player_name === rosterPlayer.player_name || 
                      stat.player_name === rosterPlayer.gamertag
                    );
                    
                    // Combine roster info with stats
                    playersWithStats.push({
                      id: rosterPlayer.player_id,
                      player_name: rosterPlayer.player_name,
                      gamertag: rosterPlayer.gamertag,
                      // Add stats if found, otherwise use 0 defaults
                      total_points: playerStats?.total_points || 0,
                      total_goals: playerStats?.total_goals || 0,
                      total_assists: playerStats?.total_assists || 0,
                      total_saves: playerStats?.total_saves || 0,
                      games_played: playerStats?.games_played || 0,
                      average_score: playerStats?.average_score || 0,
                      team_name: foundTeam.team_name
                    });
                  });
                } catch (statsError) {
                  console.error('Failed to fetch player stats:', statsError);
                  // Still show roster members even without stats
                  rosterData.forEach(rosterPlayer => {
                    playersWithStats.push({
                      id: rosterPlayer.player_id,
                      player_name: rosterPlayer.player_name,
                      gamertag: rosterPlayer.gamertag,
                      total_points: 0,
                      total_goals: 0,
                      total_assists: 0,
                      total_saves: 0,
                      games_played: 0,
                      average_score: 0,
                      team_name: foundTeam.team_name
                    });
                  });
                }
              }
              
              setTeamPlayers(playersWithStats);
            } catch (error) {
              console.error('Failed to fetch roster memberships:', error);
              // Fallback to the old method if roster memberships fail
              try {
                const playersData = await apiService.getStats(activeSeasonData.id);
                const teamPlayersData = playersData.filter(player => 
                  slugify(player.team_name) === teamSlug
                );
                setTeamPlayers(teamPlayersData);
              } catch (statsError) {
                console.error('Failed to fetch fallback player stats:', statsError);
              }
            }
          } else {
            setError('Team not found');
          }
        }
      } catch (error) {
        console.error('Failed to fetch team data:', error);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    if (teamSlug) {
      fetchTeamData();
    }
  }, [teamSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center page-with-navbar">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center page-with-navbar">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-red-400 mb-4">
            {error || `Team not found: ${teamSlug}`}
          </h1>
          <button
            onClick={() => navigate("/teams")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            ← Back to Teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white page-with-navbar">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm shadow-2xl pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-2 items-center">
              <div 
                className="w-6 h-6 rounded-full border border-gray-400"
                style={{ backgroundColor: team.color || '#808080' }}
              />
              <div 
                className="w-6 h-6 rounded-full border border-gray-400"
                style={{ backgroundColor: team.secondary_color || team.color || '#808080' }}
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {team.team_name}
            </h1>
          </div>
          
          <p className="text-blue-200 text-sm md:text-base">
            Team details, roster, stats and games
            {activeSeason && (
              <span className="ml-2 text-gray-300">
                • {activeSeason.season_name}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* Team Standings */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-6">🏆 Team Record</h2>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
            {standings ? (
              <>
                {/* Main Record */}
                <div className="text-center mb-6">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {standings.wins || 0}-{standings.losses || 0}{standings.ties > 0 ? `-${standings.ties}` : ''}
                  </div>
                  <div className="text-sm text-gray-400">
                    Win-Loss{standings.ties > 0 ? '-Tie' : ''} Record
                  </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  <div className="text-center bg-gray-700/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{standings.regulation_wins || 0}</div>
                    <div className="text-xs text-gray-400">Reg Wins</div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-cyan-400">{standings.overtime_wins || 0}</div>
                    <div className="text-xs text-gray-400">OT Wins</div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-400">{standings.overtime_losses || 0}</div>
                    <div className="text-xs text-gray-400">OT Losses</div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-400">{standings.regulation_losses || 0}</div>
                    <div className="text-xs text-gray-400">Reg Losses</div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-400">{standings.forfeits || 0}</div>
                    <div className="text-xs text-gray-400">Forfeits</div>
                  </div>
                </div>

                {/* Goals and Points */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-blue-400">{standings.points_for || 0}</div>
                    <div className="text-sm text-gray-400">GF (Goals For)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-orange-400">{standings.points_against || 0}</div>
                    <div className="text-sm text-gray-400">GA (Goals Against)</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl md:text-3xl font-bold ${(standings.point_diff || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(standings.point_diff || 0) >= 0 ? '+' : ''}{standings.point_diff || 0}
                    </div>
                    <div className="text-sm text-gray-400">Goal Diff</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-400">{standings.league_points || 0}</div>
                    <div className="text-sm text-gray-400">League Points</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">
                <p>No standings data available for this team.</p>
              </div>
            )}
          </div>
        </section>

        {/* Team Roster */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-6">👥 Team Roster</h2>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
            {teamPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {teamPlayers.map((player, index) => (
                  <div key={index} className="bg-gray-700/40 rounded-lg p-4 hover:bg-gray-700/60 transition-colors">
                    <div className="text-center">
                      <button
                        onClick={() => navigate(`/players/${createPlayerSlug(player.player_name, player.player_name)}`)}
                        className="text-lg md:text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer mb-3 block w-full"
                      >
                        {player.player_name}
                      </button>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-600/40 rounded-lg p-2">
                          <div className="text-yellow-400 font-bold">{player.total_points || 0}</div>
                          <div className="text-gray-400">Points</div>
                        </div>
                        <div className="bg-gray-600/40 rounded-lg p-2">
                          <div className="text-green-400 font-bold">{player.total_goals || 0}</div>
                          <div className="text-gray-400">Goals</div>
                        </div>
                        <div className="bg-gray-600/40 rounded-lg p-2">
                          <div className="text-blue-400 font-bold">{player.total_assists || 0}</div>
                          <div className="text-gray-400">Assists</div>
                        </div>
                        <div className="bg-gray-600/40 rounded-lg p-2">
                          <div className="text-purple-400 font-bold">{player.total_saves || 0}</div>
                          <div className="text-gray-400">Saves</div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-400">
                        GP: {player.games_played || 0} • Avg: {player.average_score ? player.average_score.toFixed(1) : '0.0'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No player stats available for this team.</p>
                <p className="text-sm mt-2">Player stats will appear here once games are played and data is recorded.</p>
              </div>
            )}
          </div>
        </section>

        {/* Team Games/Schedule */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-6">🏟️ Games & Schedule</h2>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
            {teamGames.length > 0 ? (
              <div className="space-y-4">
                {teamGames.map((game, index) => {
                  // Handle both home_display/away_display and home_team_name/away_team_name
                  const homeTeamName = game.home_display || game.home_team_name;
                  const awayTeamName = game.away_display || game.away_team_name;
                  
                  const isHomeTeam = homeTeamName === team.team_name;
                  const opponent = isHomeTeam ? awayTeamName : homeTeamName;
                  const teamScore = isHomeTeam ? game.home_score : game.away_score;
                  const opponentScore = isHomeTeam ? game.away_score : game.home_score;
                  const hasScores = game.home_score !== null && game.away_score !== null;
                  
                  return (
                    <div key={index} className="bg-gray-700/40 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400 w-16">
                          Week {game.week || 'TBD'}
                        </div>
                        <div className="text-white">
                          <span className="font-semibold">{team.team_name}</span>
                          <span className="text-gray-400 mx-2">vs</span>
                          <span>{opponent}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {hasScores ? (
                          <div className={`text-lg font-bold ${
                            teamScore > opponentScore ? 'text-green-400' : 
                            teamScore < opponentScore ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {teamScore} - {opponentScore}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">Not Played</div>
                        )}
                        {game.game_date && (
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(game.game_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No games scheduled for this team.</p>
                <p className="text-sm mt-2">Games will appear here once the schedule is set.</p>
              </div>
            )}
          </div>
        </section>

        {/* Team Summary */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-6">📈 Team Summary</h2>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
                  {teamPlayers.reduce((sum, player) => sum + (parseInt(player.total_points) || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">
                  {teamPlayers.reduce((sum, player) => sum + (parseInt(player.total_goals) || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                  {teamPlayers.reduce((sum, player) => sum + (parseInt(player.total_assists) || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Assists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">
                  {teamPlayers.reduce((sum, player) => sum + (parseInt(player.total_saves) || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Saves</div>
              </div>
            </div>
            
            {/* Team Details */}
            <div className="mt-8 pt-6 border-t border-gray-600">
              <h3 className="text-lg font-bold text-white mb-4">Team Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Team ID:</span>
                  <span className="text-white ml-2">#{team.id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Season:</span>
                  <span className="text-white ml-2">{activeSeason?.season_name || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white ml-2">{teamPlayers.length}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

