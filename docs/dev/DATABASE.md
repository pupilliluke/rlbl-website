# Database

Postgres on Neon. Connection string in `DATABASE_URL`. Same database for prod and dev.

## Tables

| Table | What it holds | Key relationships |
|---|---|---|
| `seasons` | Season metadata (name, dates, is_active) | parent of team_seasons, games |
| `teams` | Master team identities (team_name, color, secondary_color, logo_url) | parent of team_seasons |
| `team_seasons` | Per-season instance: display_name, primary/secondary_color, conference | child of teams + seasons; parent of roster_memberships, games |
| `players` | Master player identities (player_name, display_name, gamertags) | parent of roster_memberships, player_game_stats |
| `roster_memberships` | Player-on-team-this-season link (player_id, team_season_id) | child of players + team_seasons |
| `games` | One row per scheduled/played game (week, season_id, home_team_season_id, away_team_season_id, scores, is_playoffs, forfeits) | child of seasons + team_seasons |
| `player_game_stats` | One row per (player, game). Stat columns: points, goals, assists, saves, shots, mvps, demos, epic_saves, otg | child of players + games + team_seasons |
| `standings` | Per-season per-team W/L/LP rollup (often regenerated from `games`) | child of team_seasons |
| `power_rankings` | Editorial weekly rankings per team_season | child of team_seasons |
| `brackets` | Playoff bracket rows | child of team_seasons |
| `season_stats` | Denormalized per-player per-season stat rollup (sync'd from player_game_stats) | child of players + seasons |
| `stream_settings` | key/value config for the stream page | — |
| `stream_chat_messages` | Public chat on the stream page | — |

## The two-table model (read this once)

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full explanation. TL;DR:

- `teams` = team identity (lifetime).
- `team_seasons` = team's appearance in one season (display_name, conference, alt colors).
- Games and stats reference `team_season_id`, never `team_id`.
- Career stats roll up via `team_seasons.team_id → teams.id`.

## OTG flag (overtime detection)

`player_game_stats.otg` is an integer column. The standings calculator checks if **any** player in a game has `otg > 0` to mark the game as overtime. Without OTG populated, every game looks like regulation, breaking LP/OTL.

When entering stats in admin, **mark the OTG column for whichever player scored the OT goal** (typically 1; could be more in rare cases).

LP scoring (driven by OTG flag):

| Outcome | LP |
|---|---|
| Regulation Win | 4 |
| Overtime Win | 3 |
| Overtime Loss | 2 |
| Regulation Loss | 1 |
| Forfeit | 0 |

## Migrations

`backend/migrations/*.sql` — one file per schema change, named `verb_object.sql`.

Existing migrations (chronological):

| File | Purpose |
|---|---|
| `add_conference_to_teams.sql` | Adds conference column to team_seasons |
| `add_detailed_standings_tracking.sql` | Extra standings columns |
| `add_forfeit_columns.sql` | `home_team_forfeit`, `away_team_forfeit` on games |
| `add_league_points_to_standings.sql` | LP column |
| `add_notes_to_games.sql` | Free-form note column |
| `add_otg_to_player_game_stats.sql` | OTG (overtime goal) flag |
| `create_season_stats_table.sql` | Denormalized rollup table |
| `create_stream_settings_table.sql` | Stream page key/value config |

## How to run a migration

There is **no migration runner**. Run them manually against Neon:

1. Open Neon console (https://console.neon.tech/) → your project → SQL Editor.
2. Paste the migration SQL.
3. Click Run.
4. Save the file in `backend/migrations/` (if not already there) and commit.

Always wrap mutating migrations in a transaction unless they're idempotent. Use `IF NOT EXISTS` / `IF EXISTS` for idempotency where possible — it lets you re-run safely.

## Adding a new migration

1. Create `backend/migrations/<verb>_<object>.sql`.
2. Use idempotent DDL where you can:
   ```sql
   ALTER TABLE foo ADD COLUMN IF NOT EXISTS bar INTEGER DEFAULT 0;
   ```
3. Update DAOs / API to read/write the new column.
4. Run the migration on Neon.
5. Commit the migration file along with the code changes.

## Fresh-DB bootstrap

`schema_dump.sql` at repo root holds a full schema dump (tables + columns). To bring up a brand-new Postgres from zero:

```bash
psql "$DATABASE_URL" < schema_dump.sql
```

Use this when:
- Spinning up a fresh local Postgres for offline dev.
- Provisioning a new Neon branch and wanting structure copied fast.

The dump is a snapshot — it will drift over time. Regenerate it after major schema changes:

```bash
pg_dump --schema-only "$DATABASE_URL" > schema_dump.sql
```

## DAOs

Every table has a DAO at `backend/dao/<Resource>Dao.js`. They all extend `BaseDao` (which provides `findAll`, `findById`, `create`, `update`, `delete`).

Resource-specific queries live on the DAO. Add new methods there, not inline in the API route handler.

## Things to know about the live DB

- **One row should be `is_active = true` in `seasons`**. Multiple actives confuse the dynamic season lookup. The cleanup pass enforced this.
- **Season names follow `"Season N"` convention** post-cleanup. Don't add seasons named "Fall 2025" — use the convention.
- **Don't manually edit IDs**. Foreign keys all point at `seasons.id`, `teams.id`, etc. Renaming `season_name` is fine; changing IDs breaks references.
