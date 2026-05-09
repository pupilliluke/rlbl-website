# API Reference

All endpoints are mounted under `/api`. The base URL is:
- Local: `http://localhost:5000/api`
- Prod: `https://<your-vercel-domain>/api`

The frontend talks to the API exclusively through [src/services/apiService.js](../src/services/apiService.js). Adding an endpoint usually means: add a method there, plus a handler in `backend/api/<resource>.js`.

## Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check. Returns `{status: "OK", message, timestamp}`. |
| GET | `/` | API info — version, list of mounted resources. |

## Resources

### Teams (base team identities)

`backend/api/teams.js` — operates on the `teams` table.

| Method | Path | Notes |
|---|---|---|
| GET | `/teams` | All base teams. Optional query: `?season=current\|career\|<id>` returns season-scoped team_seasons instead. |
| GET | `/teams/:id` | One base team. |
| GET | `/teams/name/:name` | Lookup by name. |
| GET | `/teams/color/:color` | Lookup by color. |
| GET | `/teams/with-player-count` | Joins active rosters. |
| GET | `/teams/:id/stats` | Team-level aggregate stats. |
| POST | `/teams` | Body: `{team_name, color, secondary_color, logo_url}`. `team_name` required. |
| PUT | `/teams/:id` | Partial update. |
| DELETE | `/teams/:id` | Cascades. |

### Team Seasons (per-season instances)

`backend/api/teamSeasons.js`.

| Method | Path | Notes |
|---|---|---|
| GET | `/team-seasons` | All. `?season_id=<id>` filters. |
| GET | `/team-seasons/:id` | One. |
| GET | `/team-seasons/season/:seasonId` | All for a season. |
| GET | `/team-seasons/season/:seasonId/team/:teamId` | Single team's row in a season. |
| POST | `/team-seasons` | Body: `{season_id, team_id, display_name, primary_color, secondary_color, conference}`. |
| PUT | `/team-seasons/:id` | Partial update. |
| DELETE | `/team-seasons/:id` | Cascades roster_memberships. |

> Aliased as `/team_seasons` (underscore) for legacy frontend code.

### Players

`backend/api/players.js`.

| Method | Path | Notes |
|---|---|---|
| GET | `/players` | All. |
| GET | `/players/:id` | One. |
| POST | `/players` | Body: `{player_name, display_name, gamertag, ...account_names}`. |
| PUT | `/players/:id` | Partial. |
| DELETE | `/players/:id` | Cascades roster_memberships and player_game_stats. |

### Roster Memberships

`backend/api/rosterMemberships.js` — links a player to a team_season.

| Method | Path | Notes |
|---|---|---|
| GET | `/roster-memberships` | All memberships across all seasons. |
| GET | `/roster-memberships/:id` | One. |
| GET | `/roster-memberships/team-season/:teamSeasonId` | Roster for a specific team_season. |
| GET | `/roster-memberships/player/:playerId` | All teams a player has been on. |
| GET | `/roster-memberships/team/:teamId/season/:seasonId` | Team's roster for a season. |
| POST | `/roster-memberships` | Body: `{player_id, team_season_id}`. |
| POST | `/roster-memberships/create` | Alias of POST. |
| DELETE | `/roster-memberships/:id` | Removes one player from one team_season. |

### Games

`backend/api/games.js`.

| Method | Path | Notes |
|---|---|---|
| GET | `/games` | All. `?season_id=<id>` filters. |
| GET | `/games/:id` | One. |
| POST | `/games` | Body: `{season_id, home_team_season_id, away_team_season_id, week, game_date, is_playoffs, ...}`. |
| PUT | `/games/:id` | Partial — including scores and forfeit flags. |
| DELETE | `/games/:id` | Removes the game. |

### Player Game Stats

`backend/api/playerGameStats.js` — per-player per-game stat lines.

| Method | Path | Notes |
|---|---|---|
| GET | `/player-game-stats` | All. `?season_id=<id>` filters. |
| GET | `/player-game-stats/:id` | One. |
| GET | `/player-game-stats/game/:gameId` | All stat lines for a game. |
| GET | `/player-game-stats/player/:playerId/game/:gameId` | One player's line in one game. |
| POST | `/player-game-stats` | Body: `{game_id, player_id, team_season_id, points, goals, assists, saves, shots, mvps, demos, epic_saves, otg}`. Upserts on (game_id, player_id). |
| PUT | `/player-game-stats/:id` | Partial. |
| DELETE | `/player-game-stats/:id` | Removes one stat line. |

> `otg` (Overtime Goal) on any player flags a game as overtime. Drives standings.

### Standings

`backend/api/standings.js`.

| Method | Path | Notes |
|---|---|---|
| GET | `/standings` | Current season's standings. `?season_id=<id>` for a specific season. |
| POST | `/standings/auto-generate/:seasonId` | Recompute standings for a season from games + stats. |
| GET | `/standings/league-points-breakdown/:seasonId/:teamSeasonId` | Per-game LP breakdown for a team. |

### Seasons

`backend/api/seasons.js`.

| Method | Path | Notes |
|---|---|---|
| GET | `/seasons` | All. |
| GET | `/seasons/active` | Currently active season (single row). |
| POST | `/seasons` | Body: `{season_name, start_date, end_date, is_active}`. |
| PUT | `/seasons/:id` | Partial. |
| POST | `/seasons/:id/activate` | Atomically set this season active and others inactive. |
| DELETE | `/seasons/:id` | Cascades. Use carefully. |

### Power Rankings

`backend/api/powerRankings.js` — mounted at `/weekly` (legacy).

| Method | Path | Notes |
|---|---|---|
| GET | `/weekly` | All. `?season_id=<id>` filters. |
| POST | `/weekly` | Create. |
| PUT | `/weekly/:id` | Update. |
| DELETE | `/weekly/:id` | Delete. |

### Brackets

`backend/api/brackets.js` — playoff brackets.

| Method | Path | Notes |
|---|---|---|
| GET | `/brackets` | All. |
| POST/PUT/DELETE | `/brackets...` | Standard CRUD. |

### Aggregate Stats

| Method | Path | Notes |
|---|---|---|
| GET | `/stats/...` | Various rollups (career, season, team). See `backend/api/stats.js`. |
| GET | `/season-stats` | Denormalized season-level stats per player. |
| POST | `/season-stats-sync` | Trigger a refresh of season_stats from player_game_stats. |

### Stream

| Method | Path | Notes |
|---|---|---|
| GET/POST/PUT | `/stream-settings` | Twitch URL config (key/value). |
| GET/POST/DELETE | `/stream-chat` | Public chat messages on the stream page. |

## Conventions

- All POST/PUT bodies are JSON.
- Errors use HTTP status codes + JSON `{error, details?}` body.
- 23505 (unique constraint violation) is mapped to 409 Conflict where applicable.
- Pagination: not implemented. All list endpoints return everything.
- Auth: none. Anyone with the URL can hit the API. Don't expose write endpoints publicly without adding auth first.

## Adding a new endpoint

1. Add method to the relevant DAO (`backend/dao/<X>Dao.js`), or create a new DAO extending `BaseDao`.
2. Add a route handler in `backend/api/<x>.js` (or create the file).
3. If new file: register in `backend/api/index.js` (`require` + `router.use`).
4. Add a method to `src/services/apiService.js` so the frontend can call it.
5. (Optional) Add a row to this file.

For schema changes, also create a new migration in `backend/migrations/`. See [DATABASE.md](DATABASE.md).
