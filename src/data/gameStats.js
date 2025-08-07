// Game-by-game statistics for calculating season totals
export const gameStats = [
  {
    id: 1,
    gameDate: "2024-01-15",
    homeTeam: "Non Chalant",
    awayTeam: "Chicken Jockey",
    week: 1,
    season: "2024",
    playerStats: [
      {
        player: "Jack",
        team: "Non Chalant",
        goals: 3,
        assists: 0,
        saves: 2,
        shots: 6,
        mvp: 1,
        demos: 1,
        epicSaves: 1,
        points: 780
      },
      {
        player: "Mason",
        team: "Non Chalant", 
        goals: 2,
        assists: 1,
        saves: 2,
        shots: 5,
        mvp: 0,
        demos: 0,
        epicSaves: 0,
        points: 650
      },
      {
        player: "Gup",
        team: "Chicken Jockey",
        goals: 2,
        assists: 0,
        saves: 3,
        shots: 7,
        mvp: 0,
        demos: 1,
        epicSaves: 0,
        points: 720
      }
    ]
  }
  // More games will be added via admin panel
];

// Season configurations
export const seasons = [
  { id: "2024", name: "2024 Season", active: false },
  { id: "2025", name: "2025 Season", active: true }
];

// Calculate season totals from game stats
export const calculateSeasonTotals = (playerId, season = "2025") => {
  const playerGames = gameStats.filter(game => 
    game.season === season && 
    game.playerStats.some(stat => stat.player === playerId)
  );

  const totals = {
    player: playerId,
    season: season,
    gamesPlayed: playerGames.length,
    points: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    shots: 0,
    mvps: 0,
    demos: 0,
    epicSaves: 0
  };

  playerGames.forEach(game => {
    const playerStat = game.playerStats.find(stat => stat.player === playerId);
    if (playerStat) {
      totals.points += playerStat.points || 0;
      totals.goals += playerStat.goals || 0;
      totals.assists += playerStat.assists || 0;
      totals.saves += playerStat.saves || 0;
      totals.shots += playerStat.shots || 0;
      totals.mvps += playerStat.mvp || 0;
      totals.demos += playerStat.demos || 0;
      totals.epicSaves += playerStat.epicSaves || 0;
    }
  });

  // Calculate per-game averages
  if (totals.gamesPlayed > 0) {
    totals.ppg = totals.points / totals.gamesPlayed;
    totals.gpg = totals.goals / totals.gamesPlayed;
    totals.apg = totals.assists / totals.gamesPlayed;
    totals.svpg = totals.saves / totals.gamesPlayed;
    totals.shPercent = totals.shots > 0 ? (totals.goals / totals.shots) * 100 : 0;
  }

  return totals;
};