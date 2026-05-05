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

Copy the template and fill in real values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```bash
# REQUIRED — get this from Neon dashboard
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require

# REQUIRED — admin panel password
REACT_APP_ADMIN_PASSWORD=pickanything

# OPTIONAL — backend port (defaults to 5000)
# PORT=5000
```

`.env.local` is gitignored. The backend (and Vercel adapter) load env vars from `.env.local` first, then `.env` as fallback. `.env.example` is the committed template.

> The backend will throw a clear error on startup if `DATABASE_URL` is missing.
> No hardcoded fallback — set the env var or it won't run.

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
