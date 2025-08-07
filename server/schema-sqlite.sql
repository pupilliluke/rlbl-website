-- SQLite schema for Rocket League stats
-- Players table
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    gamertag TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT NOT NULL,
    logo_url TEXT,
    color TEXT, -- Hex color code
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player seasons (tracks which team a player was on each season)
CREATE TABLE IF NOT EXISTS player_seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    home_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    game_date DATETIME,
    week INTEGER,
    is_playoffs INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player stats per game
CREATE TABLE IF NOT EXISTS player_game_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    mvps INTEGER DEFAULT 0,
    demos INTEGER DEFAULT 0,
    epic_saves INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team standings per season
CREATE TABLE IF NOT EXISTS standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Power rankings per week
CREATE TABLE IF NOT EXISTS power_rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    reasoning TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Schedule/bracket information
CREATE TABLE IF NOT EXISTS bracket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    round_name TEXT,
    matchup_data TEXT, -- Store complex bracket structure as JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_game_stats_game_id ON player_game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_player_id ON player_game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_games_season_id ON games(season_id);
CREATE INDEX IF NOT EXISTS idx_standings_season_id ON standings(season_id);
CREATE INDEX IF NOT EXISTS idx_power_rankings_season_week ON power_rankings(season_id, week);