# Deploy

## How it works

The repo is a single Vercel project. One push to `main` ships frontend + backend together.

- The React app builds via `react-scripts build` → static bundle in `build/`.
- The Express backend deploys as a single serverless function via `api/index.js`.
- `vercel.json` rewrites `/api/(.*)` to that serverless function. Every other path serves the React static bundle.

## Environment variables (in Vercel dashboard)

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Neon connection string. Include `?sslmode=require`. |
| `REACT_APP_ADMIN_PASSWORD` | Yes | Admin login. Set to something non-trivial in prod. |
| `NODE_ENV` | Auto | Vercel sets this to `production`. |
| `VERCEL` | Auto | Vercel sets this — toggles `module.exports = app` in `backend/server.js`. |

> `REACT_APP_*` env vars are baked into the frontend bundle at build time. Changing this var means a redeploy.

## Vercel project settings

- **Framework preset**: Other (or "Create React App" — both work, but the API function needs to be detected from `api/`).
- **Build command**: `npm run build` (default).
- **Output directory**: `build` (default for CRA).
- **Install command**: `npm install` (default).
- **Root directory**: repo root (default).
- **Node version**: 22.x (set via `engines` in `package.json`; Vercel reads this).

## How a deploy happens

1. You push to `main` (or merge a PR into `main`).
2. Vercel detects the push, runs `npm install`, then `npm run build`.
3. If build succeeds, Vercel publishes:
   - Static bundle (everything in `build/`).
   - Serverless function from `api/index.js`.
4. New deploy goes live at the production domain typically within 1–3 minutes.

Each push also creates a preview deploy at a unique URL — useful for QA before merging.

## Rollback

Vercel dashboard → Deployments → find a known-good deploy → ⋯ → "Promote to Production". No git revert needed. (You'll still want to revert the bad code in git afterward.)

## Common deploy failures

| Symptom | Cause / fix |
|---|---|
| Build fails on ESLint warnings | CRA + Vercel treat warnings as errors. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — fix the warnings or add `// eslint-disable-next-line` (last resort). |
| API returns 500 on prod, works locally | Usually `DATABASE_URL` not set in Vercel env. Or the database is offline / hit free-tier limit. Check Vercel function logs. |
| API returns 404 for a route | Did you register the new route in `backend/api/index.js`? Vercel uses the same router. |
| Admin login broken after a deploy | `REACT_APP_ADMIN_PASSWORD` was changed but the bundle wasn't rebuilt. Trigger a redeploy. |
| Cold start latency on first hit | Normal for Vercel serverless functions. The first request after idle takes 1–3s. Subsequent requests are fast. |

## Custom domain

Set in Vercel dashboard → Project → Settings → Domains. Point your DNS at Vercel's nameservers or set CNAME records as Vercel instructs.

## Local prod simulation

To run the prod-style build locally (Express serves the bundle):

```bash
npm run build
NODE_ENV=production npm run server
# Visit http://localhost:5000
```

This matches what Vercel does, except Vercel runs the API as a serverless function (cold starts apply) while local runs it as a long-lived process.

## Database migrations and deploys

Migrations are NOT run by Vercel. Pattern:

1. Write the migration SQL.
2. **Run it on Neon first** (manually via the Neon SQL editor).
3. Push the code that depends on the new schema.
4. Vercel deploys; backend hits the already-migrated DB.

If you push code first and forget the migration, the API will throw on missing columns until you run it.

## Vercel project URL

Stored separately from this repo. The Owner has the dashboard URL. Production-facing URL is whatever custom domain points there (or the auto-generated `*.vercel.app`).
