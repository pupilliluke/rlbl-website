-- Add conference column to teams table
-- This will allow teams to be assigned to 'East' or 'West' conferences

ALTER TABLE teams
ADD COLUMN conference VARCHAR(10) DEFAULT NULL;

-- Add index for conference filtering
CREATE INDEX idx_teams_conference ON teams(conference);

-- Update Season 3 teams with their conference assignments
UPDATE teams
SET conference = 'West'
WHERE team_name IN (
    'Backdoor Bandits',
    'LeJohn James',
    'Jakeing It!',
    'Mid Boost',
    'Double Bogey',
    'Demo Daddies',
    'Nukes'
);

UPDATE teams
SET conference = 'East'
WHERE team_name IN (
    'Vince Owen',
    'Cancun Baboons',
    'Brain Aneurysm',
    'MJ',
    'AA',
    'A-Arob',
    'Overdosed Otters'
);

-- Update team name changes for Season 3 only (via team_seasons)
UPDATE teams
SET team_name = 'AA'
WHERE team_name = 'Alcoholics Anonymous'
  AND id IN (
    SELECT DISTINCT team_id
    FROM team_seasons
    WHERE season_id = 3
  );

UPDATE teams
SET team_name = 'Overdosed Otters'
WHERE team_name = 'Otters'
  AND id IN (
    SELECT DISTINCT team_id
    FROM team_seasons
    WHERE season_id = 3
  );