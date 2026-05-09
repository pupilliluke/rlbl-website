# RLBL — Rocket League Business League

Web app for tracking the RLBL: standings, stats, schedule, weekly results, team rosters, season history, and an admin panel for managing it all.

## Tech stack

- **Frontend**: React 18 (Create React App) + Tailwind + react-router
- **Backend**: Express on Node 22
- **Database**: Postgres on [Neon](https://neon.tech)
- **Deploy**: Vercel (single project — frontend bundle + serverless API in `api/index.js`)

## Repo layout

```
src/                  React app
  pages/              Route-level components (one per URL)
    admin/            Admin panel (one folder, multiple sub-tabs)
  components/         Reusable UI
  services/           apiService.js — single client for the backend
  utils/              formatters, slugify, etc.
backend/              Express API
  api/                Route modules per resource (teams, players, games, ...)
  dao/                One DAO per table, all extend BaseDao
  migrations/         SQL files — one per schema change
  utils/              standingsCalculator (LP/OTL/forfeits)
  server.js           Local dev entry; also exports app for Vercel
api/index.js          Vercel serverless adapter — wraps backend/api
lib/database.js       pg Pool factory (reads DATABASE_URL; throws if unset)
public/               Static assets + REQUESTS.html status page
docs/                 You are here
```

## 5-minute quickstart

```bash
# 1. Install
npm install

# 2. Configure (see docs/dev/SETUP.md for the .env template)

# 3. Run frontend + backend together
npm run dev
```

Frontend at `http://localhost:3000`, backend at `http://localhost:5000/api`.

## Documentation map

Docs are split by audience. Pick your path.

### If you run the league (admin)

Start here:

| Doc | What it covers |
|---|---|
| [docs/admin/FOR_ADMINS.md](docs/admin/FOR_ADMINS.md) | The one-page intro: what the site is, how to log in, day-to-day tasks, how to work with Claude |
| [docs/admin/ADMIN_GUIDE.md](docs/admin/ADMIN_GUIDE.md) | Tab-by-tab walkthrough of the admin panel + shortcuts |
| [docs/admin/RUNBOOKS.md](docs/admin/RUNBOOKS.md) | Recipes: "I need to start a new season", "mark a forfeit", etc. |
| [docs/admin/TROUBLESHOOTING.md](docs/admin/TROUBLESHOOTING.md) | "Login is broken", "standings look wrong", and other admin-fixable issues |

### If you write code (developer)

Read in this order if you're new:

| Doc | What it covers |
|---|---|
| [docs/dev/SETUP.md](docs/dev/SETUP.md) | Local dev setup — env vars, install, run |
| [docs/dev/ARCHITECTURE.md](docs/dev/ARCHITECTURE.md) | How data flows; the two-table-per-entity model |
| [docs/dev/API.md](docs/dev/API.md) | Endpoint catalog grouped by resource |
| [docs/dev/DATABASE.md](docs/dev/DATABASE.md) | Schema, migrations, how to run one |
| [docs/dev/DEPLOY.md](docs/dev/DEPLOY.md) | Vercel deploy, env vars in prod |
| [docs/dev/RUNBOOKS.md](docs/dev/RUNBOOKS.md) | Recipes: "add a new endpoint", "add a column", "fix a build break" |
| [docs/dev/TROUBLESHOOTING.md](docs/dev/TROUBLESHOOTING.md) | Build / API / Vercel issues + fixes |

### If you're Claude (or any AI agent)

Read [`CLAUDE.md`](CLAUDE.md) at the repo root first. It explains who's likely asking, hard rules, and where to read next.

Status of in-flight bugs and feature requests lives in [public/REQUESTS.html](public/REQUESTS.html) (also live at `<deployed-url>/REQUESTS.html`).

Older one-off docs from prior handoffs are preserved in [docs/archive/](docs/archive/).

## Common scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Frontend (3000) + backend (5000) together |
| `npm start` | Frontend only |
| `npm run server` | Backend only |
| `npm run build` | Production frontend build into `build/` |

## Deployed environment

- **Prod**: any push to `main` triggers a Vercel deploy. The same Vercel project serves both the static React bundle and the `/api/*` routes.
- **Database**: Neon Postgres. Same database for prod and local dev (see Setup).

## License

Private project.
