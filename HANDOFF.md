# RLBL Website - Development Handoff Document

## Current Branch
`BIG-FIXES` - All recent work is on this branch

## Recent Commits (Latest First)
```
4f554fb Fix Stats page column sorting null value handling
460761f Update REQUESTS.html status tracking
1071f77 Fix hardcoded season 3 in teams API
e2642a8 Add OTG support to fix overtime standings calculations
```

---

## CRITICAL: Database Migration Required

Run this migration on production database before testing OTG/OTL/LP fixes:

```sql
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS otg INTEGER DEFAULT 0;
UPDATE player_game_stats SET otg = 0 WHERE otg IS NULL;
```

This adds the `otg` (Overtime Goals) column that the standings calculator needs to detect overtime games.

---

## Completed Fixes

### P0 Issues (Fixed in Code)
| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | LP calculation wrong | Code Complete | Needs OTG migration + data |
| 2 | OTL not tracked | Code Complete | Needs OTG migration + data |
| 3 | OTG games not showing | Code Complete | Needs OTG migration + data |
| 4 | Can't add matchups to S2 | Fixed | Season API now dynamic |
| 6 | Can't add weeks/matchups | Fixed | Admin panel refreshes correctly |
| 8 | Wrong teams showing | Fixed | Removed hardcoded season 3 |

### P1 Issues (Fixed)
| # | Issue | Status |
|---|-------|--------|
| 10 | OT Wins/Losses inaccurate | Code Complete (same as LP) |
| 11 | Forfeits not reflected | Code Complete - use admin checkboxes |
| 13 | Column sorting not working | Fixed - null value handling |

---

## Remaining Issues

### P0 - Needs Database Verification
| # | Issue | Action Needed |
|---|-------|---------------|
| 5 | Season 1 doesn't exist in admin | Check if season 1 exists in `seasons` table |
| 7 | Can't add new seasons/playoffs | Test after other fixes confirmed |
| 9 | Player assignment not saving | Test roster_memberships API |

### P1 - Data Verification
| # | Issue | Action Needed |
|---|-------|---------------|
| 12 | Week 3 missing a game | Check games table for week 3 data |

### P2 - Feature Requests (Need Design Decisions)
| # | Issue | Decision Needed |
|---|-------|-----------------|
| 14 | Legacy page needs 3 sections | Define: All-Time, Season-High, Game-High structure |
| 15 | Playoffs separate from career stats | How to handle playoff vs regular season filtering |
| 16 | Teams across multiple seasons | Same page or separate team pages? |
| 17 | Consolidate weekly matchups | Dropdown UI design for team pages |

### P3 - Nice to Have
| # | Issue |
|---|-------|
| 18 | Search players in weekly scores |
| 19 | Schedule tab redesign/removal |
| 20 | Players tab season-agnostic |

---

## Key Files Modified

### Backend
- `backend/dao/PlayerGameStatsDao.js` - Added OTG to upsert/create methods
- `backend/api/playerGameStats.js` - Added OTG parameter handling + roster validation
- `backend/api/teams.js` - Dynamic season lookup instead of hardcoded season 3
- `backend/migrations/add_otg_to_player_game_stats.sql` - Migration file (needs to be run)

### Frontend
- `src/pages/Stats.jsx` - Fixed sorting null value handling (lines 251-272)
- `src/pages/Standings.jsx` - Updated footer legend (OTG -> OTL)
- `src/pages/admin/components/GameResultsTable.jsx` - Added OTG to stat saving

### Tracking
- `public/REQUESTS.html` - Issue tracker with current status

---

## Architecture Notes

### League Points System
- Regulation Win: 4 pts
- Overtime Win: 3 pts
- Overtime Loss: 2 pts
- Regulation Loss: 1 pt
- Forfeit: 0 pts

### OTG Detection
The `StandingsCalculator` checks if any player in a game has `otg > 0` to determine if the game went to overtime. Without the OTG column populated, all games appear as regulation.

### Forfeit System
- Database: `games.home_team_forfeit` and `games.away_team_forfeit` boolean columns
- Admin: Checkboxes in game editing to mark forfeits
- Fallback: Score differential > 5 with `incomplete` flag infers forfeit

### Season Architecture
- `seasons` table: Global seasons (id, name, dates, is_active)
- `team_seasons` table: Teams per season with conference assignment
- `roster_memberships` table: Players assigned to team_seasons
- `games` table: References team_season_ids, not team_ids

---

## Testing Checklist

After running migration:
1. [ ] Add OTG values to existing overtime games via admin
2. [ ] Recalculate standings to verify LP formula
3. [ ] Check Standings page shows W-L-OTL format
4. [ ] Verify Stats page column sorting works
5. [ ] Mark forfeits in admin, verify display
6. [ ] Test adding new games/matchups to Season 2

---

## Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
npm run dev

# Run on production DB (Neon.tech)
# Use the SQL migration above in your database console
```
