-- Create season_stats table to store aggregated season statistics from Google Sheets
-- This table receives live data synced from the Excel/Google Sheets and serves as
-- the single source of truth for season statistics

CREATE TABLE IF NOT EXISTS season_stats (
  id SERIAL PRIMARY KEY,

  -- Foreign keys
  season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_season_id INTEGER REFERENCES team_seasons(id) ON DELETE SET NULL,

  -- Player identification (denormalized for quick access)
  player_name VARCHAR(255) NOT NULL,
  team_name VARCHAR(255),
  conference VARCHAR(50), -- 'West' or 'East'

  -- Core statistics
  points INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shots INTEGER DEFAULT 0,
  mvps INTEGER DEFAULT 0,
  demos INTEGER DEFAULT 0,
  epic_saves INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,

  -- Advanced statistics (from sheet)
  otg INTEGER DEFAULT 0, -- Overtime Goals
  shot_percentage NUMERIC(5, 2), -- Shot %
  epic_save_percentage NUMERIC(5, 2), -- Epic Save %
  saves_per_game NUMERIC(6, 2), -- SVPG
  demos_per_game NUMERIC(6, 2), -- Demo/Game
  points_per_game NUMERIC(6, 2), -- PPG
  goals_per_game NUMERIC(6, 2), -- GPG
  assists_per_game NUMERIC(6, 2), -- APG

  -- Additional metadata
  is_rookie BOOLEAN DEFAULT false,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Last time synced from Google Sheets

  -- Unique constraint to prevent duplicates
  UNIQUE(season_id, player_id, team_season_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_season_stats_season ON season_stats(season_id);
CREATE INDEX IF NOT EXISTS idx_season_stats_player ON season_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_season_stats_team_season ON season_stats(team_season_id);
CREATE INDEX IF NOT EXISTS idx_season_stats_conference ON season_stats(conference);
CREATE INDEX IF NOT EXISTS idx_season_stats_points ON season_stats(points DESC);
CREATE INDEX IF NOT EXISTS idx_season_stats_goals ON season_stats(goals DESC);
CREATE INDEX IF NOT EXISTS idx_season_stats_synced_at ON season_stats(synced_at DESC);

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_season_stats_timestamp ON season_stats;
CREATE TRIGGER update_season_stats_timestamp
  BEFORE UPDATE ON season_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE season_stats IS 'Aggregated season statistics synced from Google Sheets';
COMMENT ON COLUMN season_stats.synced_at IS 'Timestamp of last sync from Google Sheets';
COMMENT ON COLUMN season_stats.is_rookie IS 'Indicates if this is the player''s rookie season';
COMMENT ON COLUMN season_stats.conference IS 'Conference the player/team belongs to (West/East)';
