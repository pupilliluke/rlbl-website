# New Admin — Quickstart

You're taking over (or helping run) the RLBL site. This page gets you from "nothing installed" to "site running on your laptop with admin access."

If you only need to fix data in the league (scores, rosters), you don't need any of this — just log in to the deployed site at `/admin`. See [admin/FOR_ADMINS.md](admin/FOR_ADMINS.md).

This page is for the case where you also need the code running locally.

## What you need from the Owner

Ask the previous admin / repo owner for these **before** starting:

1. **GitHub access** to the repo (read access at minimum; write if you'll be pushing changes).
2. **The `.env` files** — sent to you directly (they contain the database connection string and admin password). Treat these like passwords: don't post them in Slack, screenshots, or commit them anywhere.
3. *(Optional, only if you'll deploy)* **Vercel team invite** so you can see deploy logs and edit env vars.
4. *(Optional)* **Neon dashboard access** so you can run SQL migrations directly.

Don't proceed until you have items 1 and 2.

## 1. Install Node 22

Check what you have:

```powershell
node --version
```

If it's not 22.x, install Node 22 from <https://nodejs.org> (LTS) or via `nvm` / `fnm`. Other versions may build but 22 is what `package.json` declares.

## 2. Clone the repo

```powershell
cd $HOME\SideProjects        # or wherever you keep code
git clone https://github.com/<org>/<repo>.git rocketleague
cd rocketleague
npm install
```

`npm install` pulls both frontend (React) and backend (Express) deps from the single root `package.json`. It takes a couple minutes the first time.

## 3. Drop in the `.env` files

Take the `.env` and `.env.local` files the Owner sent you and place them in the **root** of the project — the same folder as `package.json` and `.env.example`.

```
rocketleague\
├── package.json
├── .env.example     ← already here (committed template, ignore it)
├── .env             ← drop here
├── .env.local       ← drop here
└── ...
```

Quick way to check from PowerShell that they landed in the right place:

```powershell
Get-ChildItem -Force -Filter ".env*"
```

You should see `.env`, `.env.local`, and `.env.example` listed.

> Both files are gitignored — they will never be committed. Don't paste their contents into Slack, screenshots, or anywhere public. If both exist, `.env.local` wins for any overlapping keys.

## 4. Run it

```powershell
npm run dev
```

This starts:

- React on <http://localhost:3000>
- Express API on <http://localhost:5000>

Leave the terminal open while you work. Ctrl+C to stop.

## 5. Verify

In a browser:

1. <http://localhost:3000> — public site loads with live data from the database.
2. <http://localhost:5000/api/health> — returns `{"status":"OK",...}`.
3. <http://localhost:3000/admin> — enter the admin password, you should see the admin tabs.

If all three work, you're done with setup.

## If something fails

| What you see | Fix |
|---|---|
| `Database connection error` on backend startup | `DATABASE_URL` missing or wrong. Check it ends with `?sslmode=require`. |
| Admin login rejects every password | `REACT_APP_ADMIN_PASSWORD` not set, or you edited `.env.local` after `npm run dev` started — restart the dev server. |
| `port 5000 already in use` | Another app is on 5000. Add `PORT=5001` to `.env.local` and restart. |
| `npm install` fails on a native module | Usually a Node version mismatch — confirm Node 22.x. |

For anything else, see [dev/TROUBLESHOOTING.md](dev/TROUBLESHOOTING.md).

## Getting around the project

Everything written about this project lives in the [`docs/`](.) folder at the root of the repo. It's split by audience:

```
docs\
├── NEW_ADMIN_QUICKSTART.md   ← you are here
├── admin\                    ← read this stuff first
│   ├── FOR_ADMINS.md         ← intro to running the league
│   ├── ADMIN_GUIDE.md        ← every admin tab, every shortcut
│   ├── RUNBOOKS.md           ← recipes (start a season, mark a forfeit, etc.)
│   └── TROUBLESHOOTING.md    ← admin-fixable problems
└── dev\                      ← only when changing code or schema
    ├── ARCHITECTURE.md       ← the data model — read before changing code
    ├── SETUP.md, API.md, DATABASE.md, DEPLOY.md, RUNBOOKS.md, TROUBLESHOOTING.md
```

Browse the folder when you're not sure what exists. Filenames are descriptive — you don't need to memorize them.

## Use Claude Code to navigate the project

The fastest way to learn this codebase is to install [Claude Code](https://claude.com/claude-code), open it in the project folder, and just ask it questions. There's a `CLAUDE.md` at the root that already tells Claude you're a league admin (not a developer) and to default to admin-UI fixes — so you don't have to explain the project from scratch.

Things you can ask:

- *"Where do I edit a team's logo for the current season?"*
- *"Explain how the standings page works — what data does it pull?"*
- *"A team's record is wrong. Walk me through fixing it."*
- *"What happens if I delete a base team in the Teams tab?"*
- *"Show me what's in the docs folder and what each file is for."*

[admin/FOR_ADMINS.md](admin/FOR_ADMINS.md) has more example prompts under "Working with Claude" — copy/paste them and adjust to your situation.

## What to read next (if you skip Claude)

- [admin/FOR_ADMINS.md](admin/FOR_ADMINS.md) — what the site does and how to run the league day-to-day.
- [admin/ADMIN_GUIDE.md](admin/ADMIN_GUIDE.md) — every admin tab, every shortcut.
- [dev/ARCHITECTURE.md](dev/ARCHITECTURE.md) — read this before changing any code that touches teams, players, or games.
- [/CLAUDE.md](../CLAUDE.md) — the file that tells Claude how to behave on this repo.

## Important reminders

- **Pushing to `main` deploys to production immediately** via Vercel. Don't push casually.
- **Migrations run manually on Neon.** No script applies them — you paste the SQL into the Neon SQL editor.
- **`REACT_APP_*` env vars are baked into the frontend at build time.** Changing them in Vercel requires a redeploy to take effect.
