# Notes for Claude

This file tells you (Claude) how to work effectively on this repo. Read it before doing anything else.

## Who you're likely working with

Most users on this project are **league admins**, not developers. Default assumptions:

- They want a thing fixed in the league (a score, a roster, a season setup) — not a code change.
- They may not know the difference between "the website" and "the database."
- They will describe problems in plain language ("Octane's record is wrong"), not in code terms.

Translate user intent before acting. If they say "Octane's record is wrong," the fix is almost always:
1. Open admin UI, fix the underlying game scores or stats, click **Auto-Generate** on Standings.
   *Not* edit a SQL file or a React component.

**Default to admin-UI changes. Only touch code when the user explicitly asks, or when the admin UI genuinely cannot do it.**

## Where to start reading

Docs are split by audience. The folder tells you who they're for.

**Admin-facing** (`docs/admin/`) — read first if the user is the league admin:

1. `docs/admin/FOR_ADMINS.md` — plain-language intro to the project for the admin running the league.
2. `docs/admin/ADMIN_GUIDE.md` — every admin tab, every shortcut, every footgun.
3. `docs/admin/RUNBOOKS.md` — admin-only recipes (start a season, mark a forfeit, etc.).
4. `docs/admin/TROUBLESHOOTING.md` — admin-fixable issues (login, standings).

**Developer-facing** (`docs/dev/`) — read when the user is asking for a code/schema/deploy change:

5. `docs/dev/ARCHITECTURE.md` — the **two-table model** (`teams` / `team_seasons`, `players` / `roster_memberships`). Internalize this before changing any code that touches teams, players, games, or stats.
6. `docs/dev/RUNBOOKS.md` — code/schema/deploy recipes.
7. `docs/dev/DATABASE.md`, `docs/dev/API.md`, `docs/dev/DEPLOY.md`, `docs/dev/SETUP.md`, `docs/dev/TROUBLESHOOTING.md` — reference, read on demand.

`README.md` is the documentation map.

## Hard rules

- **Games and stats reference `team_season_id`, never `team_id`.** Ditto `roster_memberships`. If you write code that joins games or stats to `teams` directly, you have a bug.
- **One season should be `is_active = true` at a time.** `seasons` lookups assume this.
- **Migrations are applied manually on Neon.** No runner. Write the SQL file under `backend/migrations/`, then tell the user to paste it into the Neon SQL editor. Don't try to run it from code.
- **Vercel auto-deploys on push to `main`.** Treat any push to main as shipping to prod. Confirm before pushing.
- **`REACT_APP_*` env vars are baked into the frontend bundle at build time.** Changing them in Vercel needs a redeploy.
- **No tests run in CI.** `npm run build` cleanly is the practical CI gate. ESLint warnings are fatal in prod builds (CRA + `CI=true` in Vercel).

## When the user asks for a change

Decide which tier the change lives in, then act accordingly:

| Tier | Looks like | What you do |
|---|---|---|
| **Admin UI** | "Add a player," "fix a score," "set up next season," "mark a forfeit" | Walk the user through the admin UI. Don't open code. Reference `docs/admin/ADMIN_GUIDE.md`. |
| **Content** | "Update the status page," "add a Twitch URL" | Edit `public/REQUESTS.html` or use the Stream tab. Small, contained. |
| **Code change** | "Add a new column to games," "the standings page is broken," "add an endpoint" | Read the relevant docs first, follow the patterns in `docs/dev/RUNBOOKS.md` ("add a new endpoint", "add a column"). Confirm with the user before pushing. |
| **Schema change** | "Track a new stat per player" | Migration + DAO + API + frontend. Show the user the migration SQL and have them run it on Neon before pushing code. |

If you're not sure which tier, ask.

## Things that look risky and need confirmation

- Pushing to `main` (auto-deploys to prod).
- Deleting any base team, player, or season (cascades to season instances, rosters, stat lines).
- Setting `is_active=true` on multiple seasons.
- Editing `lib/database.js` or anything that touches the `pg` Pool config.
- Bulk operations that mutate many rows.

When in doubt, propose the change and ask.

## Patterns to follow when editing code

- One DAO per table at `backend/dao/<Resource>Dao.js`, extending `BaseDao`.
- One route module per resource at `backend/api/<resource>.js`, registered in `backend/api/index.js`.
- All frontend → backend calls go through `src/services/apiService.js`. Don't call `fetch()` directly from a component.
- Admin tab edits: after a successful create/update/delete, update local state **and** call the relevant `loadX()` refetch. The pattern is consistent across the admin panel.

## What NOT to do

- Don't introduce an ORM, GraphQL, tRPC, or a state-management library. The codebase is deliberately plain.
- Don't add migration tooling without asking — manual SQL is the convention.
- Don't bypass `apiService.js` from the frontend.
- Don't add fallbacks, retries, or "defensive" wrappers around things that work fine today.
- Don't commit secrets. `.env.local` is gitignored; keep it that way.
