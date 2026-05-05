# Runbooks

Step-by-step recipes for common operations.

## "I need to start a new season"

1. **Run any pending DB migrations** on Neon (check `backend/migrations/` for unapplied files).
2. **Admin → Seasons tab → Add New** (or `n`). Form pre-fills `"Season N+1"` and dates.
3. **Activate it**: edit the row, check `is_active`, save. (System enforces single-active by ORDER BY, but tidy is better.)
4. **Bring teams in**:
   - Same teams as last season? → Teams tab → 📑 Clone From Season → pick prior season.
   - New roster of teams? → Teams tab → 📋 Bulk Add Teams → paste names → check "Also link to Season N".
   - Mix? → Clone first, then add new ones.
5. **Set rosters**: Teams & Rosters → Edit Roster on each team → use bulk paste or inline create.
6. **Add the schedule**: Schedule tab → Add New (form pre-fills season, week, next Sunday) → enter games week-by-week.

Time: ~15 min for a full season setup once you have the team list.

## "I need to add a single team mid-season"

1. Admin → Teams tab → Add New (or paste it via Bulk Add) → fill name + colors.
2. Click `+ Link to Season N` on its row.
3. Teams & Rosters tab → find the new team → Edit Roster → add players.

## "I need to mark a forfeit"

1. Admin → Game Results tab → find the game.
2. Edit it → check `home_team_forfeit` or `away_team_forfeit`.
3. Save.
4. Standings → Auto-Generate (recomputes LP using forfeits = 0 for the forfeiting side).

## "I need to recalculate standings after editing scores"

Admin → Standings tab → click ⚡ Auto-Generate.

This rebuilds `standings` rows from current `games` + `player_game_stats` using `backend/utils/standingsCalculator.js`.

## "I need to apply a new SQL migration"

1. Open the migration file in `backend/migrations/`.
2. Open Neon console → SQL Editor.
3. Paste, click Run.
4. If it added a column, verify the DAO read/write path matches.
5. If you added a new migration, commit the file.

## "I need to update the REQUESTS.html status page"

1. Edit `public/REQUESTS.html` directly. It's plain HTML.
2. Update statuses (`status-fixed`, `status-pending`, `status-progress`, `status-confirm`).
3. Add new rows to the appropriate priority section if needed.
4. Commit and push. Vercel redeploys. Page is at `<deploy-url>/REQUESTS.html`.

## "Vercel deploy failed"

1. Check Vercel dashboard → Deployments → click the failed one → view logs.
2. Most common: ESLint warning treated as error. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
3. Reproduce locally with `npm run build`. Fix until it compiles cleanly.
4. Commit fix, push, Vercel redeploys.

## "API works locally but not on prod"

1. Vercel dashboard → Functions → check the function's logs for the failing request.
2. Common: `DATABASE_URL` env var missing in Vercel. Set it under Project Settings → Environment Variables.
3. After setting, **redeploy** (env changes don't apply to existing functions until redeploy).

## "I need to rotate the database password"

1. In Neon console, rotate the role's password.
2. Update `DATABASE_URL` in Vercel env vars.
3. Update your local `.env`.
4. Redeploy on Vercel (Settings → Deployments → Redeploy latest).
5. **Important**: `lib/database.js` has a hardcoded fallback connection string. After rotation, that fallback is invalid — which is fine, but should be removed entirely. See "Tech debt to address" below.

## "I need to add a brand new endpoint"

1. **DAO**: add or extend a method in `backend/dao/<Resource>Dao.js`.
2. **API route**: add the handler in `backend/api/<resource>.js`.
3. **Register**: if it's a new file, add to `backend/api/index.js`.
4. **Frontend client**: add a method to `src/services/apiService.js`.
5. **Use it** in a page or component.
6. Document in [API.md](API.md).

## "I need to add a new column to a table"

1. Write a migration: `backend/migrations/add_<col>_to_<table>.sql`.
   ```sql
   ALTER TABLE foo ADD COLUMN IF NOT EXISTS bar INTEGER DEFAULT 0;
   ```
2. Run it on Neon.
3. Update the relevant DAO's INSERT/UPDATE/SELECT to include the column.
4. Update API route handler if the new column is request/response payload.
5. Update frontend if the new column is shown.
6. Commit migration + code together.

## "Hooked up an Admin search/filter that doesn't refresh after I add a row"

The admin pattern is: after a successful create/update/delete, the handler updates local state AND calls a `loadX()` to refetch. If your new feature isn't refreshing, look for the load function (e.g. `loadBaseTeams`, `loadTeams`, `loadTeamPlayerIndex`) and call it in the success path.

## Tech debt to address (background backlog)

Listed roughly in priority order — these aren't urgent but should get cleaned up.

| Item | Why |
|---|---|
| Remove hardcoded DB credentials in `lib/database.js` (lines 14-24) | Currently a fallback when `DATABASE_URL` isn't set. Credentials shouldn't live in source. Always require `DATABASE_URL`. |
| Add a real auth flow if multi-user admin is ever needed | Today: shared password baked into the bundle. Fine for now, won't scale. |
| Add a migration runner | Manual SQL is fragile. A simple "list applied migrations in a table, run unapplied" runner would be ~50 LOC. |
| Add backend tests to CI | `tests/dao/*.js` exists but isn't wired up. |
| Pagination on list endpoints | `/api/games` returns every game ever. Will be slow eventually. |
| Replace `alert()` calls in admin with toast notifications | Better UX. |
