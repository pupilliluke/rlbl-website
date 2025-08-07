-- Database schema for Rocket League stats
CREATE DATABASE rocketleague;

-- Players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(255) NOT NULL,
    gamertag VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seasons table
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    season_name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player seasons (tracks which team a player was on each season)
CREATE TABLE player_seasons (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    home_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    game_date TIMESTAMP,
    week INTEGER,
    is_playoffs BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player stats per game
CREATE TABLE player_game_stats (
    id SERIAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team standings per season
CREATE TABLE standings (
    id SERIAL PRIMARY KEY,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Power rankings per week
CREATE TABLE power_rankings (
    id SERIAL PRIMARY KEY,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule/bracket information
CREATE TABLE bracket (
    id SERIAL PRIMARY KEY,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    round_name VARCHAR(255),
    matchup_data JSONB, -- Store complex bracket structure as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_player_game_stats_game_id ON player_game_stats(game_id);
CREATE INDEX idx_player_game_stats_player_id ON player_game_stats(player_id);
CREATE INDEX idx_games_season_id ON games(season_id);
CREATE INDEX idx_standings_season_id ON standings(season_id);
CREATE INDEX idx_power_rankings_season_week ON power_rankings(season_id, week);