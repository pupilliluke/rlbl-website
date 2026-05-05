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
lib/database.js       pg Pool factory (DATABASE_URL or fallback)
public/               Static assets + REQUESTS.html status page
docs/                 You are here
```

## 5-minute quickstart

```bash
# 1. Install
npm install

# 2. Configure (see docs/SETUP.md for the .env template)

# 3. Run frontend + backend together
npm run dev
```

Frontend at `http://localhost:3000`, backend at `http://localhost:5000/api`.

## Documentation map

Read in this order if you're new:

| Doc | What it covers |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Local dev setup — env vars, install, run |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How data flows; the two-table-per-entity model |
| [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | How to use every admin tab + shortcuts |
| [docs/API.md](docs/API.md) | Endpoint catalog grouped by resource |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, migrations, how to run one |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Vercel deploy, env vars in prod |
| [docs/RUNBOOKS.md](docs/RUNBOOKS.md) | "How do I add a new season?" / "fix a build break" / etc. |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Known issues + fixes |

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
