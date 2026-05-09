# Admin Troubleshooting

Things that go wrong while running the league, and how to fix them from the admin panel.

For developer-side issues (build errors, deploy failures, code-level bugs), see [`../dev/TROUBLESHOOTING.md`](../dev/TROUBLESHOOTING.md).

## Admin login rejects every password

**Symptom:** AdminAuth modal says "Invalid password" no matter what you enter.

**Causes:**
1. The password env var (`REACT_APP_ADMIN_PASSWORD`) was changed in Vercel without redeploying. `REACT_APP_*` variables are baked into the frontend at build time, so changes need a new deploy. Trigger a redeploy from the Vercel dashboard.
2. You're typing the wrong password — confirm with the Owner.
3. (Local dev only) `.env.local` was edited after starting `npm start`. Restart the dev server.

## Standings show wrong LP after editing scores

**Symptom:** A team's LP/record doesn't match what you expect after editing a game.

**Fix:** Standings rows are not auto-updated when you edit a game. Go to **Standings tab → ⚡ Auto-Generate**.

If LP is still wrong, check:
- The OT game has a player with `OTG > 0` (otherwise the calculator treats it as regulation).
- No stray forfeit flag is set.
- Both team_seasons exist and are linked to the correct season.

## A team's logo or color is wrong

That's `team_seasons` data — per-season, not per-team. Edit it from the Teams & Rosters tab for the active season, not the base Teams tab.

## A player isn't showing up for a team

They might exist as a base player but aren't on this season's roster. Teams & Rosters → Edit Roster → add them.

If they don't exist as a base player at all, Players tab → Add New (or 📋 Bulk Add).

## A page on the public site shows old data

1. Hard refresh your browser (Ctrl+F5 / Cmd+Shift+R) — could be cache.
2. Open the admin panel and verify the data is correct there.
3. If the data is right in admin but wrong on the public page, the API may be down. Ask a developer to check Vercel function logs.

## "I clicked Delete and now I'm worried"

Different deletes have different scope:

| Delete | What it removes |
|---|---|
| Delete a base team (Teams tab) | The team **and** its `team_seasons` for every season **and** all roster_memberships under those team_seasons. Game/stat rows stay but reference deleted IDs. |
| Remove a team from a season (Teams & Rosters tab) | Just that season's team_season + roster_memberships. The base team and other seasons are untouched. |
| Delete a player (Players tab) | The player **and** every roster membership and stat line they have, across all seasons. |
| Delete a game (Schedule / Game Results) | The game and its player_game_stats. Standings stay until you click ⚡ Auto-Generate. |

If you suspect you deleted something you shouldn't have, **stop and ask a developer to restore from a Neon backup** before doing anything else.

## "I can't find the Add New / Bulk Add button"

Different tabs have different buttons. See [`ADMIN_GUIDE.md` → Speed-up reference](ADMIN_GUIDE.md#speed-up-reference-cheat-sheet).

## The site is fully down (every page errors)

That's not an admin-fixable issue. Escalate to a developer. Common causes:
- Database paused (Neon free tier auto-pauses after inactivity — open Neon console to wake it).
- `DATABASE_URL` env var got cleared in Vercel.
- A bad deploy went out — a developer can roll back in Vercel.
