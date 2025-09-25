-- Add forfeit columns to games table
-- Migration: add_forfeit_columns.sql
-- Description: Add home_team_forfeit and away_team_forfeit boolean columns to track individual team forfeits

ALTER TABLE games
ADD COLUMN home_team_forfeit BOOLEAN DEFAULT FALSE,
ADD COLUMN away_team_forfeit BOOLEAN DEFAULT FALSE;

-- Add comments for clarity
COMMENT ON COLUMN games.home_team_forfeit IS 'TRUE if home team forfeited this game';
COMMENT ON COLUMN games.away_team_forfeit IS 'TRUE if away team forfeited this game';