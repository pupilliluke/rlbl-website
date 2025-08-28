// Utility function to create URL-friendly slugs
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Function to create player slug (can use either name or gamertag)
export const createPlayerSlug = (player, gamertag) => {
  // Prefer gamertag if it's unique and readable, otherwise use player name
  const preferredName = gamertag && gamertag.length > 2 ? gamertag : player;
  return slugify(preferredName);
};

// Function to create team slug
export const createTeamSlug = (teamName) => {
  return slugify(teamName);
};

// Function to find player by slug (checks both name and gamertag)
export const findPlayerBySlug = (players, slug) => {
  return players.find(player => 
    slugify(player.player) === slug || 
    slugify(player.gamertag) === slug
  );
};

// Function to find team by slug
export const findTeamBySlug = (teams, slug) => {
  return teams.find(team => 
    slugify(team.name || team.team_name) === slug
  );
};