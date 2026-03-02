-- Add otg (Overtime Goals) column to player_game_stats table
-- This column tracks when a player scores an overtime winning goal
-- Used by the standings calculator to determine OT wins/losses

ALTER TABLE player_game_stats
ADD COLUMN IF NOT EXISTS otg INTEGER DEFAULT 0;

-- Update existing records to have 0 for otg
UPDATE player_game_stats SET otg = 0 WHERE otg IS NULL;
