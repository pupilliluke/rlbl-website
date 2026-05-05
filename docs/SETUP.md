# Setup — Local Development

## Prerequisites

- **Node 22.x** (see `engines` in `package.json`)
- **npm** (comes with Node)
- A **Neon Postgres** connection string. Easiest path: ask the owner for read access to the existing project, or create your own Neon branch from the existing one.

## 1. Clone and install

```bash
git clone <repo-url>
cd rocketleague
npm install
```

This installs both frontend (React) and backend (Express) deps from a single `package.json`.

## 2. Environment variables

Create a `.env` file at the repo root. Minimum needed:

```bash
# Postgres connection — get this from Neon dashboard
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require

# Admin panel password (only required to access /admin)
REACT_APP_ADMIN_PASSWORD=pickanything
```

Optional:

```bash
NODE_ENV=development     # default
PORT=5000                # backend port; default 5000
```

> `lib/database.js` has a hardcoded fallback connection string for legacy reasons.
> Always set `DATABASE_URL` in `.env` — the fallback is **not** a supported path
> and will be removed.

`.env` is in `.gitignore`. Don't commit it.

## 3. Run

**Both at once (recommended):**
```bash
npm run dev
```

This starts:
- React dev server on `http://localhost:3000`
- Express API on `http://localhost:5000`

The React dev server proxies `/api/*` to `http://localhost:5000` via `apiService.js`.

**Or separately:**
```bash
npm run server   # backend only, port 5000
npm start        # frontend only, port 3000
```

## 4. Verify

- Open `http://localhost:3000` — the landing page should load and pull live data from the database.
- Hit `http://localhost:5000/api/health` — should return `{"status":"OK",...}`.
- Open `http://localhost:3000/admin` — enter `REACT_APP_ADMIN_PASSWORD` from your `.env`. You should see the admin tabs.

## 5. Build for production locally (optional)

```bash
npm run build
```

Output is in `build/`. To serve it from Express (matches Vercel behavior):

```bash
NODE_ENV=production npm run server
# Then visit http://localhost:5000
```

## Common first-time issues

| Symptom | Cause / fix |
|---|---|
| `Database connection error` on backend startup | `DATABASE_URL` not set or wrong. Double-check the Neon connection string includes `?sslmode=require`. |
| Admin login rejects every password | `REACT_APP_ADMIN_PASSWORD` not set in `.env`, or set after `npm start` (you must restart the dev server after editing `.env`). |
| `port 5000 already in use` | Another process is on 5000. Set `PORT=5001` in `.env`. |
| ESLint warnings break `npm run build` | See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Vercel treats warnings as errors. |

## What's next

- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the data model before changing anything.
- Read [ADMIN_GUIDE.md](ADMIN_GUIDE.md) before doing season setup work.
