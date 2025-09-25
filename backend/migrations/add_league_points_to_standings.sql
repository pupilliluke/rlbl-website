-- Add league_points column to standings table for auto-generated standings
-- Points system: 4 = Regulation Win, 3 = Overtime Win, 2 = Overtime Loss, 1 = Regulation Loss, 0 = Forfeit

ALTER TABLE standings
ADD COLUMN IF NOT EXISTS league_points INTEGER DEFAULT 0;

-- Add incomplete column to games table for forfeit detection
ALTER TABLE games
ADD COLUMN IF NOT EXISTS incomplete BOOLEAN DEFAULT false;

-- Update existing records to have 0 league points and complete games
UPDATE standings SET league_points = 0 WHERE league_points IS NULL;
UPDATE games SET incomplete = false WHERE incomplete IS NULL;