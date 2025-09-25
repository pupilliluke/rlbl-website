-- Add detailed point breakdown columns to standings table
-- This will track HOW the league points were earned for transparency

ALTER TABLE standings
ADD COLUMN IF NOT EXISTS regulation_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS overtime_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS overtime_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS regulation_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forfeits INTEGER DEFAULT 0;

-- Update existing records to have 0 for all new columns
UPDATE standings SET
  regulation_wins = 0,
  overtime_wins = 0,
  overtime_losses = 0,
  regulation_losses = 0,
  forfeits = 0
WHERE regulation_wins IS NULL OR overtime_wins IS NULL OR overtime_losses IS NULL OR regulation_losses IS NULL OR forfeits IS NULL;