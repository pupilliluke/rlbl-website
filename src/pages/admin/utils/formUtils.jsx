import React from "react";

export const renderFormField = (field, value, type = "text", handleFormChange, teams = [], seasons = []) => {
  const baseClasses = "w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:outline-none";

  // Handle team selection fields (team_season_id, home_team_season_id, away_team_season_id)
  if ((field === "team_season_id" || field === "home_team_season_id" || field === "away_team_season_id") && teams.length > 0) {
    const label = field === "home_team_season_id" ? "Home Team" :
                  field === "away_team_season_id" ? "Away Team" : "Team";
    return (
      <select
        value={value || ''}
        onChange={(e) => handleFormChange(field, e.target.value)}
        className={baseClasses}
      >
        <option value="">Select {label}</option>
        {teams.map((team) => (
          <option key={team.id || team.team_season_id} value={team.id || team.team_season_id}>
            {team.display_name || team.team_name}
          </option>
        ))}
      </select>
    );
  }

  if (field === "season_id" && seasons.length > 0) {
    return (
      <select
        value={value || ''}
        onChange={(e) => handleFormChange(field, e.target.value)}
        className={baseClasses}
      >
        <option value="">Select Season</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.season_name || season.name}
          </option>
        ))}
      </select>
    );
  }

  if (field === "conference") {
    return (
      <select
        value={value || ''}
        onChange={(e) => handleFormChange(field, e.target.value)}
        className={baseClasses}
      >
        <option value="">Select Conference</option>
        <option value="East">East</option>
        <option value="West">West</option>
        <option value="homer">Homer</option>
        <option value="garfield">Garfield</option>
      </select>
    );
  }

  if (field === "is_active" || field === "is_playoffs") {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => handleFormChange(field, e.target.checked)}
          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
        />
        <span className="text-white">{value ? 'Yes' : 'No'}</span>
      </label>
    );
  }

  if (field.includes("date")) {
    return (
      <input
        type="date"
        value={value ? value.split('T')[0] : ''}
        onChange={(e) => handleFormChange(field, e.target.value)}
        className={baseClasses}
      />
    );
  }

  if (type === "number" || typeof value === "number") {
    return (
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          if (e.target.value === '') {
            handleFormChange(field, null);
          } else {
            const numValue = parseInt(e.target.value, 10);
            handleFormChange(field, isNaN(numValue) ? null : numValue);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
          }
        }}
        className={baseClasses}
      />
    );
  }

  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => handleFormChange(field, e.target.value)}
      className={baseClasses}
    />
  );
};

export const getDefaultFormData = (activeTab) => {
  switch (activeTab) {
    case 'players':
      return {
        player_name: '',
        display_name: '',
        reddit_name: '',
        discord_name: '',
        steam_name: '',
        epic_name: '',
        psn_name: '',
        xbox_name: '',
        switch_name: ''
      };
    case 'teams':
      return {
        team_name: '',
        display_name: '',
        abbreviation: '',
        color: '#000000',
        secondary_color: '#ffffff',
        logo_url: ''
      };
    case 'standings':
      return {
        team_season_id: '',
        wins: 0,
        losses: 0,
        games_played: 0,
        goals_for: 0,
        goals_against: 0,
        goal_differential: 0,
        points: 0
      };
    case 'schedule':
      return {
        season_id: '',
        home_team_season_id: '',
        away_team_season_id: '',
        game_date: '',
        week: 0,
        is_playoffs: false
      };
    case 'powerRankings':
      return {
        team_season_id: '',
        rank: 1,
        previous_rank: 1,
        points: 0,
        wins: 0,
        losses: 0,
        streak: '',
        comment: ''
      };
    case 'seasons':
      return {
        season_name: '',
        start_date: '',
        end_date: '',
        is_active: false
      };
    default:
      return {};
  }
};