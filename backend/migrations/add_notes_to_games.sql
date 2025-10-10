-- Add notes column to games table
-- This will allow admins to add notes/comments to individual games

ALTER TABLE games
ADD COLUMN notes TEXT DEFAULT NULL;

-- Add index for faster queries when filtering by notes
CREATE INDEX idx_games_notes ON games(notes) WHERE notes IS NOT NULL;
