# For Admins — Start Here

You're the admin running the RLBL website. This page is the one-stop intro: what the site does, how you change things, and how to get Claude to help when you're stuck.

Most of what you'll do is point-and-click in the admin panel — no code required.

## What you're looking at

- **The public site** (`/`) — landing page, standings, stats, schedule, team pages, etc. Anyone can visit.
- **The admin panel** (`/admin`) — password-protected. This is where you add seasons, teams, players, scores, and stats.
- **The database** — Postgres, hosted on Neon. You almost never need to touch it directly.
- **The code** — React frontend + Express backend, deployed automatically to Vercel whenever someone pushes to GitHub.

## How to log in

1. Open the deployed site (the Owner has the URL — usually `<something>.vercel.app` or a custom domain).
2. Go to `/admin`.
3. Enter the admin password (the Owner gave you this; it's stored in Vercel as `REACT_APP_ADMIN_PASSWORD`).

If your password stops working, see [TROUBLESHOOTING.md → "Admin login rejects every password"](TROUBLESHOOTING.md#admin-login-rejects-every-password).

## The mental model (the one thing to understand)

Almost everything in the league has **two tables** behind it:

- A **base** record that stays the same forever. (e.g. "the team Octane.")
- A **per-season** record that can change each season. (e.g. "Octane in Season 4, in the East conference, with these colors.")

So when you "add Octane to Season 5," you're not creating a new team — you're linking the existing base team into the new season. When you change Octane's display name to "Octane Reloaded" for Season 5, that change only applies to Season 5.

**Why this matters:** if you delete a "team" thinking it's just for one season, you might delete the base team and lose every season they ever played in. Always read the modal carefully — it tells you what's about to be deleted.

The admin panel makes this mostly invisible, but knowing the model is what keeps you from accidentally deleting a decade of history.

## What you'll do day-to-day

| Job | Where |
|---|---|
| Set up a new season | [Admin Guide → "Setting up a new season — fast path"](ADMIN_GUIDE.md#setting-up-a-new-season--fast-path) |
| Add a player or team | Admin → Players or Teams tab → Add New (or 📋 Bulk Add) |
| Edit a roster | Admin → Teams & Rosters tab → Edit Roster on the team |
| Enter game scores | Admin → Game Results tab → click the game → edit scores |
| Enter per-player stats | Admin → Game Results tab → expand a game → add a stat row per player |
| Mark a forfeit | Admin → Game Results → edit the game → check `home_team_forfeit` or `away_team_forfeit` |
| Recalculate standings | Admin → Standings tab → ⚡ Auto-Generate |
| Update the schedule | Admin → Schedule tab |
| Set the live Twitch URL | Admin → Stream tab |

For any of these, [`ADMIN_GUIDE.md`](ADMIN_GUIDE.md) has the detailed walkthrough. There's also an in-app **Admin Guide** button at the top of the admin page.

## When something looks wrong

| Symptom | First thing to try |
|---|---|
| A team's record is wrong | Standings tab → ⚡ Auto-Generate. Standings don't recompute automatically when you edit scores. |
| An overtime game is being treated as regulation | Open the game's stats → make sure the player who scored the OT goal has `OTG = 1`. The system uses OTG to detect overtime. |
| A player isn't showing up on a team | Teams & Rosters tab → Edit Roster → add them. They might exist as a base player but not be linked to the current season's roster. |
| Game shows the wrong team logo or color | That's `team_seasons` data — edit the team in the Teams & Rosters tab for the active season. |
| Site shows old data on a public page | Could be browser cache (hard refresh: Ctrl+F5). If multiple users see it, the API may be down — escalate to a developer or see [../dev/RUNBOOKS.md → "API works locally but not on prod"](../dev/RUNBOOKS.md#api-works-locally-but-not-on-prod). |
| Login won't work | See [TROUBLESHOOTING.md → "Admin login rejects every password"](TROUBLESHOOTING.md#admin-login-rejects-every-password). Usually the password env var was changed without redeploying. |

If none of those help, ask Claude (next section) or escalate to whoever owns the codebase.

## Working with Claude

Claude Code is your "developer in a box" for this project. There's a `CLAUDE.md` at the root that already tells Claude you're a league admin and to default to admin-UI fixes — so you don't need to explain the project from scratch.

### Good prompts to copy/paste

These are starting points. Replace the placeholders.

**Walk me through an admin task:**
> I need to set up Season 6 with the same teams as Season 5 but a new schedule. Walk me through it step by step in the admin panel.

**Diagnose a problem:**
> The Standings page shows Team X with 12 LP but I expected 16. What should I check, and how do I fix it?

**Understand what a button does before clicking it:**
> What happens if I click "Delete" on a base team in the Teams tab? What gets deleted with it?

**Make a small content change:**
> Add a new entry to `public/REQUESTS.html` under the "In Progress" section: "Adding playoff bracket support, expected next week."

**Ask for a real code change (involves a developer-level commit):**
> I want to track a new per-player stat called "block_assists." Walk me through the migration, DAO, API, and admin UI changes. Don't push anything until I confirm.

**You're not sure if it's a code or admin task:**
> I want to allow ties on the standings page. Is this an admin-UI change or a code change?

### Things to tell Claude up front when in doubt

- "Don't push to GitHub without asking me first." (Pushes auto-deploy to prod.)
- "Show me the SQL before I run it on Neon."
- "Use the admin panel if possible. Only change code if the admin panel can't do it."
- "Explain like I'm not a developer."

### Things Claude can't do for you

- **Run SQL on the production database.** You (or the Owner) have to paste migrations into the Neon SQL editor. Claude will write the SQL but won't execute it on prod.
- **Click buttons in the admin panel.** Claude can describe the steps; you do the clicks.
- **Roll back a Vercel deploy.** That's a button click in the Vercel dashboard. Claude can tell you where to click.

## When to escalate to a developer

You should pull in whoever maintains the code if:

- A deploy fails and the error message mentions a code or syntax error, not a data/config error.
- The site is fully down (loads nothing, or all pages show the same error).
- You're being asked to redesign a feature, not just configure data.
- A SQL migration looks scary — show it to a dev before running on Neon.
- You suspect data corruption (foreign key inconsistencies, "ghost" rows that won't delete).

## Reference docs (for when you need them)

| Doc | Read when |
|---|---|
**Admin docs** (in this folder, `docs/admin/`):

| Doc | Read when |
|---|---|
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | You're doing an admin task and want the full tab-by-tab tour. |
| [RUNBOOKS.md](RUNBOOKS.md) | You have a specific recipe in mind ("how do I add a season?"). |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Something broke and you want a known-fix list. |

**Developer docs** (in `docs/dev/`) — usually you'd point a developer or Claude at these:

| Doc | Read when |
|---|---|
| [../dev/ARCHITECTURE.md](../dev/ARCHITECTURE.md) | Someone's about to make a structural change and needs the data model. |
| [../dev/DATABASE.md](../dev/DATABASE.md) | Someone's about to run a migration or look up what a column does. |
| [../dev/DEPLOY.md](../dev/DEPLOY.md) | A deploy is acting up or a Vercel env var needs changing. |
| [../dev/API.md](../dev/API.md) | A developer asks about an endpoint. |
| [../dev/SETUP.md](../dev/SETUP.md) | A developer needs to run the project locally. |
| [../dev/RUNBOOKS.md](../dev/RUNBOOKS.md) | A developer needs migration / endpoint / deploy recipes. |
| [../dev/TROUBLESHOOTING.md](../dev/TROUBLESHOOTING.md) | A developer is debugging build / API / Vercel issues. |

That's it. The site is small enough that any single change you'll need to make is documented somewhere above. When in doubt, start with `ADMIN_GUIDE.md` and ask Claude.
