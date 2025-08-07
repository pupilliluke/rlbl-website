// Utility functions for formatting data across the app

export const formatPlayerName = (player, gamertag) => {
  if (gamertag && gamertag !== player) {
    return `${player} (${gamertag})`;
  }
  return player;
};

export const formatTeamName = (teamName) => {
  return teamName;
};

export const formatPoints = (points) => {
  return points.toLocaleString();
};

export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

export const formatDecimal = (value, decimals = 2) => {
  return value.toFixed(decimals);
};