# Admin Runbooks

Step-by-step recipes for the league admin. Everything here is point-and-click in the admin panel — no code changes.

For tab-by-tab detail, see [`ADMIN_GUIDE.md`](ADMIN_GUIDE.md).
For developer-side recipes (deploys, migrations, code changes), see [`../dev/RUNBOOKS.md`](../dev/RUNBOOKS.md).

## "I need to start a new season"

The full walkthrough lives in [`ADMIN_GUIDE.md` → Setting up a new season — fast path](ADMIN_GUIDE.md#setting-up-a-new-season--fast-path). Quick checklist:

1. Seasons tab → Add New → set start date → Save.
2. Edit the new season → check `is_active` → Save. (Only one season active at a time.)
3. Teams tab → 📑 Clone From Season (if rosters are similar to last season) **or** 📋 Bulk Add Teams.
4. Players tab → 📋 Bulk Add Players (if any are new).
5. Teams & Rosters tab → Edit Roster on each team.
6. Schedule tab → Add New for each game (form pre-fills season, week, next Sunday).

Typical time: ~15 min for a full setup once you have the team list.

> Before step 1: ask a developer (or Claude) whether any pending DB migrations need to run on Neon. If you don't know what that means, you almost certainly don't have any pending — but it's worth asking once per season.

## "I need to add a single team mid-season"

1. Teams tab → Add New (or 📋 Bulk Add) → fill name + colors → Save.
2. On the new team's row, click `+ Link to Season N`.
3. Teams & Rosters tab → find the new team → Edit Roster → add players.

## "I need to mark a forfeit"

1. Game Results tab → find the game.
2. Edit it → check `home_team_forfeit` or `away_team_forfeit` → Save.
3. Standings tab → ⚡ Auto-Generate (forfeits award 0 LP to the forfeiting side).

## "I need to recalculate standings after editing scores"

Standings tab → ⚡ Auto-Generate.

This rebuilds standings from current games + player stats. Standings do not auto-update when you edit a score, so always click this after score edits.

If LP looks wrong after auto-generate, the usual cause is a missing OTG flag — see [`ADMIN_GUIDE.md` → Game Results](ADMIN_GUIDE.md#game-results).

## "An overtime game is being treated as regulation"

The system uses the `OTG` (Overtime Goal) column on `player_game_stats` to detect overtime. If no player has `OTG > 0`, the game looks like regulation.

1. Game Results tab → expand the game.
2. On the player who scored the OT goal, set `OTG = 1`.
3. Standings tab → ⚡ Auto-Generate.

## "I need to update the live Twitch stream URL"

Stream tab → paste Twitch URL → Save. No code change needed.

## "I need to update the public REQUESTS.html status page"

That page lives in code (`public/REQUESTS.html`), so it needs a commit and a Vercel deploy. Ask Claude or a developer to make the change — that's a one-line task for them.
