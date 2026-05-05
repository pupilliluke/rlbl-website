# Admin Guide

Complete tour of the admin panel at `/admin`. Login is the password you set in `REACT_APP_ADMIN_PASSWORD`.

## Tabs

The top of the admin page has a season picker (dropdown, top-right) and tabs along the top:

| Tab | Purpose | Underlying tables |
|---|---|---|
| **Game Results** | Per-week game scores + per-player stats per game | `games`, `player_game_stats` |
| **Teams & Rosters** | Manage which teams play in each season + each team's roster | `team_seasons`, `roster_memberships` |
| **Players** | Master player list — names, gamertags, IDs | `players` |
| **Teams** | Master team list — names, base colors, logos | `teams` |
| **Standings** | Per-season W/L/LP. Auto-generated from games. | `standings` (or computed) |
| **Schedule** | Game definitions before scores are entered | `games` |
| **Game Stats** | Per-player per-game stat rows | `player_game_stats` |
| **Power Rankings** | Weekly editorial team rankings | `power_rankings` |
| **Seasons** | Create/edit season metadata | `seasons` |
| **Stream** | Twitch stream URL + chat moderation | `stream_settings`, `stream_chat_messages` |

## Setting up a new season — fast path

This used to be a 30-step process. Today, with the speed-ups shipped, it's 5 steps.

### 1. Create the season row

Seasons tab → **Add New** (or press `n`). The form pre-fills `season_name` to `"Season N+1"` based on existing rows. Set `start_date`. Hit **Add**.

After creation, **set it active**: edit it, check `is_active`, save. Only one season should be active at a time. (See [DATABASE.md](DATABASE.md) for why.)

### 2. Bring teams into the season

Two paths:

**A) Clone from a prior season** (fastest if rosters are similar)
Teams tab → **📑 Clone From Season...** → pick the source season → Clone. Copies every team_season row (team identity, display name, conference, colors). Rosters are NOT copied.

**B) Link existing base teams**
Teams tab → **🔗 Link All Unlinked to Season N** (one click) — links every base team that isn't already in the season.

If you need new base teams first:
- **One at a time**: Teams tab → Add New → fill `team_name`, color, etc. → click `+ Link to Season N` on its row.
- **Many at once**: Teams tab → **📋 Bulk Add Teams** → paste one name per line (optional `,#hex` for color) → check "Also link to Season N" → Create.

### 3. Add players (if any are new)

Players tab → **📋 Bulk Add Players** → paste one name per line (optional `,DisplayName`). Or one-by-one via Add New.

### 4. Set rosters

Teams & Rosters tab → for each team, click **Edit Roster**.

- **Pick from existing players**: type in the searchable picker, click result, click **➕ Add Player**.
- **Create a new player inline**: type a name that doesn't exist → "+ Create player 'X'" appears at the bottom of the dropdown → click it. Player is created and added in one shot.
- **Paste a whole roster**: expand "📋 Bulk paste roster", paste names (one per line), click **Add All**. Matches against existing players by name (case-insensitive). Reports unmatched names so you can create them and try again.

### 5. Add games

Schedule tab → Add New. Form pre-fills:
- `season_id` to the active season
- `week` to the next unused week number
- `game_date` to next Sunday

Pick `home_team_season_id` and `away_team_season_id` from the searchable team dropdown. Submit.

For series (Bo3): use Game Results tab → existing series get an "Add Series Game" button.

## Per-tab details

### Game Results

Hierarchical view of a season's games grouped by week, then by series. For each game:
- Edit scores (home/away)
- Mark forfeits (checkboxes — see [RUNBOOKS.md](RUNBOOKS.md) for the LP impact)
- Edit per-player stats: open a game → add a row per player → set goals/assists/saves/shots/MVPs/demos/OTG.

**Important**: `OTG` (Overtime Goal) on any player in a game flags the game as overtime. This drives the LP/OTL calculation. See [DATABASE.md](DATABASE.md).

### Teams & Rosters

- **Add Team to Season modal**: link a base team to the active season with a custom display name + conference. Same effect as the per-row "Link" button on the Teams tab, but with the extra fields.
- **Sort options**: name / conference / player count.
- **Conference filter**: only shown when the active season has conferences set.

### Teams

- **Search box**: filters by team name *or* by any player ever rostered for that team across all seasons.
- **Press `/`** to focus the search input.
- **Per-row actions**:
  - `+ Link to Season N` (or `✓ In Season N` if already linked) — adds to the active season.
  - Edit / Delete the base team.
- Color fields show a native color picker + hex input.

### Players

- Bulk Add button at top.
- Add New (or press `n`) for one at a time. Form supports player_name, display_name, plus account names (Reddit, Discord, Steam, Epic, PSN, Xbox, Switch).

### Standings

- **Auto-Generate** button: rebuilds standings rows from `games` + `player_game_stats` (uses `standingsCalculator.js`).
- Manual edits still work but get overwritten by Auto-Generate.

### Seasons

- Add / edit / delete season rows.
- `is_active` checkbox — only one season should be active at a time.
- After our cleanup, season names follow `"Season N"` convention.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `n` | Open the Add New modal for the current tab (when no modal is open) |
| `/` | Focus the team search box (Teams tab only) |
| `Esc` | Close the current modal |
| `Ctrl/Cmd + Enter` | Submit the current form modal |
| Arrow keys + Enter (in dropdowns) | Navigate searchable dropdowns |

Shortcuts only fire when not focused on an input/textarea.

## Speed-up reference (cheat sheet)

| Need | Where |
|---|---|
| Create many teams at once | Teams tab → 📋 Bulk Add Teams |
| Create many players at once | Players tab → 📋 Bulk Add Players |
| Link every base team to current season | Teams tab → 🔗 Link All Unlinked |
| Copy last season's team list | Teams tab → 📑 Clone From Season... |
| Add 7 players to a team's roster | Teams & Rosters → Edit Roster → Bulk paste |
| Create a new player while editing a roster | Teams & Rosters → Edit Roster → type name → "+ Create player 'X'" |
| Find which team a player is on | Teams tab → search by player name |
| Pick a hex color | Any color field — click the swatch |

## Things you'll rarely need

- **Stream tab**: paste a Twitch URL. Only matters if you're broadcasting.
- **Game Stats tab**: redundant with Game Results' nested editor. Useful if you want a flat table view.
- **Power Rankings**: editorial weekly rankings. Optional content.

## Things to be careful with

- **Deleting a base team** (Teams tab) deletes its `team_seasons` and roster_memberships via cascade. Use sparingly.
- **Removing a team from a season** (Teams & Rosters tab) deletes that season's roster_memberships for that team. Game and stat rows are NOT deleted but become orphaned.
- **`is_active`** on multiple seasons: the system uses `is_active = true ORDER BY start_date DESC LIMIT 1`, so only the most recent active wins. But this is a footgun — fix it.
