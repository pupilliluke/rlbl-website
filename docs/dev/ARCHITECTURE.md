# Architecture

The single biggest concept to understand before changing anything: **the two-table-per-entity model**. Once that clicks, the rest of the codebase is straightforward.

## The two-table model

Most "entities" in the league have two tables:

| Base table | Per-season table | Why split |
|---|---|---|
| `teams` | `team_seasons` | A team's identity (name, logo, base colors) is stable across seasons; their per-season look (display_name, conference, alt colors) changes |
| `players` | `roster_memberships` | A player is one human; their team affiliation changes each season |
| `seasons` | — | Single table; one row per season |

### Example

"Octane" plays Season 3 normally and rebrands to "Octane Reloaded" for Season 4. The DB:

```
teams:
  id=12, team_name="Octane", color="#ff5500"

team_seasons:
  id=44, team_id=12, season_id=3, display_name="Octane",          conference="West"
  id=78, team_id=12, season_id=5, display_name="Octane Reloaded", conference="East"
```

Career stats roll up via `team_id=12`. Season-specific rosters reference `team_seasons.id` (44 or 78). Games reference `team_season_id`, never `team_id`.

### Critical invariant

> Games store `home_team_season_id` and `away_team_season_id` — never `team_id`.
> Stats (`player_game_stats`) store `team_season_id` — never `team_id`.

Anytime you write code that resolves "who played in this game," you go via `team_seasons` to get the team identity. Skipping `team_seasons` is almost always a bug.

## Request flow

```
Browser
  └─ React component (e.g. src/pages/Standings.jsx)
       └─ apiService.js (single fetch wrapper)
            └─ HTTP /api/<resource>
                 └─ Express router (backend/api/<resource>.js)
                      └─ DAO (backend/dao/<Resource>Dao.js)
                           └─ pg Pool (lib/database.js)
                                └─ Neon Postgres
```

Every layer has a single responsibility. To add a new resource: add a DAO, an API route module, register it in `backend/api/index.js`, and add a method to `apiService.js`.

## Frontend layout

| Path | Role |
|---|---|
| `src/App.js` | Router. One `<Route>` per page. |
| `src/pages/*.jsx` | Top-level pages (Landing, Standings, Stats, Teams, Weekly, Schedule, TeamStats, PlayerStats, Legacy, Stream, Admin). |
| `src/pages/admin/index.jsx` | Admin panel — single component, multiple sub-tabs. |
| `src/pages/admin/components/` | Tab-specific tables (DataTable, TeamsRostersTable, GameResultsTable, StandingsTable). |
| `src/pages/admin/modals/` | Reusable modals (EditFormModal, GameEditModal). |
| `src/pages/admin/utils/formUtils.jsx` | Field renderer for the generic form modal. |
| `src/components/*` | Reusable UI shared across pages (Navbar, Footer, StatsTable, WeeklyGameResults, etc.). |
| `src/services/apiService.js` | Every backend call goes through here. Also exports `fallbackData` for offline mode. |
| `src/utils/` | `formatters.js` (display helpers), `slugify.js` (URL slugs). |

## Backend layout

| Path | Role |
|---|---|
| `backend/server.js` | Local dev entry. Boots Express on port 5000. Also exports app for Vercel. |
| `api/index.js` | Vercel serverless adapter. Wraps `backend/api`. |
| `backend/api/index.js` | Express router that mounts every per-resource sub-router. |
| `backend/api/<resource>.js` | One file per resource: routes for GET/POST/PUT/DELETE. |
| `backend/dao/BaseDao.js` | Generic CRUD (findAll, findById, create, update, delete). |
| `backend/dao/<Resource>Dao.js` | Resource-specific queries; extends BaseDao. |
| `backend/migrations/*.sql` | One SQL file per schema change. Run manually against Neon (see [DATABASE.md](DATABASE.md)). |
| `backend/utils/standingsCalculator.js` | League-points logic (LP / OTL / forfeits). |
| `backend/services/SeasonStatsSyncService.js` | Async sync from `player_game_stats` to denormalized `season_stats`. |
| `lib/database.js` | pg Pool factory. Reads `DATABASE_URL`. |

## Two flavors of the same Express app

- **Local dev**: `node backend/server.js` (via `npm run server`) — long-running process on port 5000.
- **Vercel prod**: `api/index.js` exports the same Express app for the Vercel serverless function. `vercel.json` rewrites `/api/(.*)` to that function.

Both go through `backend/api/index.js` for routing, so adding an endpoint shows up in both environments automatically.

## State management

There isn't one. Each page fetches what it needs through `apiService` and uses local React state. Redux is in `package.json` but unused.

This keeps the data flow easy to reason about. If you ever need shared state across routes, prefer React Context over reintroducing Redux.

## Authentication

Admin-only. Single shared password in `REACT_APP_ADMIN_PASSWORD` (env var). Checked by `src/pages/admin/components/AdminAuth.jsx` purely client-side.

There is no per-user auth, no sessions, no JWTs. The previous `users.js` API was removed in the cleanup.

## File-naming conventions

- React pages: PascalCase `.jsx` matching the route name (`Standings.jsx`, `Teams.jsx`).
- React components: PascalCase `.jsx`.
- Backend route modules: lowerCamelCase `.js` (`teamSeasons.js`, `rosterMemberships.js`).
- DAOs: PascalCase + `Dao.js` suffix (`TeamSeasonsDao.js`).
- Migrations: `verb_object.sql` (`add_otg_to_player_game_stats.sql`).

## What's NOT here

Things you might expect but don't exist:

- No GraphQL, tRPC, OpenAPI, or RPC — straight REST.
- No ORM. SQL is hand-written in DAOs.
- No backend tests in CI. The scripts under `tests/dao/` are one-off manual testers.
- No state management library used.
- No test pyramid. There are a few `.test.jsx` files but no enforced coverage.
- No CI/CD — Vercel auto-deploys on push to `main`. That's it.

If you add any of those, document it here.
