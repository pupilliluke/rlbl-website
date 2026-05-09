# Developer Runbooks

Step-by-step recipes for code, schema, deploy, and infra work.

For admin-only recipes (in-app fixes, season setup, forfeits), see [`../admin/RUNBOOKS.md`](../admin/RUNBOOKS.md).

## "I need to apply a new SQL migration"

There is no migration runner. Run migrations manually on Neon.

1. Open the migration file in `backend/migrations/`.
2. Open Neon console → SQL Editor.
3. Paste, click Run.
4. If it added a column, verify the DAO read/write path matches.
5. If you added a new migration, commit the file.

## "I need to add a new column to a table"

1. Write a migration: `backend/migrations/add_<col>_to_<table>.sql`.
   ```sql
   ALTER TABLE foo ADD COLUMN IF NOT EXISTS bar INTEGER DEFAULT 0;
   ```
2. Run it on Neon (see above).
3. Update the relevant DAO's INSERT/UPDATE/SELECT to include the column.
4. Update the API route handler if the new column is in the request/response payload.
5. Update frontend if the new column is shown in the UI.
6. Commit migration + code together.

## "I need to add a brand new endpoint"

1. **DAO**: add or extend a method in `backend/dao/<Resource>Dao.js`.
2. **API route**: add the handler in `backend/api/<resource>.js`.
3. **Register**: if it's a new file, add to `backend/api/index.js`.
4. **Frontend client**: add a method to `src/services/apiService.js`.
5. **Use it** in a page or component.
6. Document in [API.md](API.md).

## "Vercel deploy failed"

1. Check Vercel dashboard → Deployments → click the failed one → view logs.
2. Most common: ESLint warning treated as error. See [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).
3. Reproduce locally with `npm run build`. Fix until it compiles cleanly.
4. Commit fix, push, Vercel redeploys.

## "API works locally but not on prod"

1. Vercel dashboard → Functions → check the function's logs for the failing request.
2. Common: `DATABASE_URL` env var missing in Vercel. Set it under Project Settings → Environment Variables.
3. After setting, **redeploy** (env changes don't apply to existing functions until redeploy).

## "I need to rotate the database password"

1. In Neon console, rotate the role's password.
2. Update `DATABASE_URL` in Vercel env vars.
3. Update your local `.env.local`.
4. Redeploy on Vercel (Settings → Deployments → Redeploy latest).

## "I need to update the public REQUESTS.html status page"

1. Edit `public/REQUESTS.html` directly. It's plain HTML.
2. Update statuses (`status-fixed`, `status-pending`, `status-progress`, `status-confirm`).
3. Add new rows to the appropriate priority section if needed.
4. Commit and push. Vercel redeploys. Page is at `<deploy-url>/REQUESTS.html`.

## "An admin search/filter doesn't refresh after I add a row"

The admin pattern is: after a successful create/update/delete, the handler updates local state **and** calls a `loadX()` to refetch. If your new feature isn't refreshing, look for the load function (e.g. `loadBaseTeams`, `loadTeams`, `loadTeamPlayerIndex`) and call it in the success path.

## Tech debt to address (background backlog)

Listed roughly in priority order — not urgent but should get cleaned up.

| Item | Why |
|---|---|
| Add a real auth flow if multi-user admin is ever needed | Today: shared password baked into the bundle. Fine for now, won't scale. |
| Add a migration runner | Manual SQL is fragile. A simple "list applied migrations in a table, run unapplied" runner would be ~50 LOC. |
| Add backend tests to CI | `tests/dao/*.js` exists but isn't wired up. |
| Pagination on list endpoints | `/api/games` returns every game ever. Will be slow eventually. |
| Replace `alert()` calls in admin with toast notifications | Better UX. |
