\pset footer off
SELECT 'players', COUNT(*) FROM public.players
UNION ALL SELECT 'teams', COUNT(*) FROM public.teams
UNION ALL SELECT 'seasons', COUNT(*) FROM public.seasons;
