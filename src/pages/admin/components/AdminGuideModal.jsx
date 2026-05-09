import React, { useState } from "react";

const sections = [
  { id: "quickstart", label: "Setting up a new season" },
  { id: "tabs", label: "What each tab does" },
  { id: "delete-scope", label: "Delete behavior & scope" },
  { id: "shortcuts", label: "Speed-ups & shortcuts" },
  { id: "keyboard", label: "Keyboard shortcuts" },
  { id: "gotchas", label: "Gotchas & invariants" }
];

const Section = ({ id, title, children, activeId }) => (
  <section id={id} className={`scroll-mt-4 ${activeId === id ? '' : ''}`}>
    <h2 className="text-2xl font-bold text-white mb-3 pb-2 border-b border-gray-600">
      {title}
    </h2>
    <div className="space-y-3 text-gray-200">{children}</div>
  </section>
);

const Code = ({ children }) => (
  <code className="font-mono text-sm bg-gray-700 text-yellow-200 px-1.5 py-0.5 rounded">
    {children}
  </code>
);

const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border border-gray-600 rounded">
      <thead className="bg-gray-700">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-3 py-2 text-left font-semibold text-white border-b border-gray-600">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className={ri % 2 ? 'bg-gray-800/40' : 'bg-gray-800/10'}>
            {row.map((cell, ci) => (
              <td key={ci} className="px-3 py-2 align-top border-b border-gray-700/50 text-gray-200">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AdminGuideModal = ({ show, onClose }) => {
  const [activeId, setActiveId] = useState("quickstart");

  if (!show) return null;

  const scrollTo = (id) => {
    setActiveId(id);
    document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
    >
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-blue-500 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Guide</h2>
              <p className="text-xs text-gray-300">In-app reference for the league management panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-2xl px-2"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <nav className="hidden md:flex flex-col gap-1 w-56 p-4 border-r border-gray-700 bg-gray-950 overflow-y-auto">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeId === s.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div id="guide-quickstart">
              <Section id="quickstart" title="Setting up a new season" activeId={activeId}>
                <p>Used to be a 30-step process. Today it's about 5 steps.</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Create the season row.</strong>{' '}
                    Seasons tab → <em>Add New</em> (or press <Code>n</Code>). Form pre-fills{' '}
                    <Code>season_name</Code> to <Code>"Season N+1"</Code>. Set <Code>start_date</Code>, save.
                    Then edit it and check <Code>is_active</Code> — only one season should be active.
                  </li>
                  <li>
                    <strong>Bring teams in.</strong>{' '}
                    Two ways:
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li><em>📑 Clone From Season</em> (Teams tab) — copies every team's identity, display name, conference, colors from a prior season. No rosters.</li>
                      <li><em>🔗 Link All Unlinked</em> — one click links every base team not yet in this season.</li>
                    </ul>
                    For brand-new teams: <em>📋 Bulk Add Teams</em> → paste names → check "Also link to current season".
                  </li>
                  <li>
                    <strong>Add players (if any are new).</strong>{' '}
                    Players tab → <em>📋 Bulk Add Players</em>, paste one name per line.
                  </li>
                  <li>
                    <strong>Set rosters.</strong>{' '}
                    Teams &amp; Rosters → <em>Edit Roster</em> on each team → use the searchable picker, or paste a list, or type a new name to inline-create.
                  </li>
                  <li>
                    <strong>Add games.</strong>{' '}
                    Schedule tab → <em>Add New</em>. Form pre-fills <Code>season_id</Code>, next-unused week, next Sunday's date.
                  </li>
                </ol>
              </Section>
            </div>

            <div id="guide-tabs">
              <Section id="tabs" title="What each tab does" activeId={activeId}>
                <Table
                  headers={["Tab", "Purpose", "Underlying tables"]}
                  rows={[
                    ["Game Results", "Per-week game scores + per-player stats per game", <Code>games</Code>, <Code>player_game_stats</Code>],
                    ["Teams &amp; Rosters", "Manage which teams play in each season + each team's roster", <span><Code>team_seasons</Code>, <Code>roster_memberships</Code></span>],
                    ["Players", "Master player list — names, gamertags, account IDs", <Code>players</Code>],
                    ["Teams", "Master team list — names, base colors, logos. + Link/Unlink and search by player.", <Code>teams</Code>],
                    ["Standings", "Per-season W/L/LP. Auto-generated from games.", <Code>standings</Code>],
                    ["Schedule", "Game definitions before scores are entered", <Code>games</Code>],
                    ["Game Stats", "Per-player per-game stat rows (flat view)", <Code>player_game_stats</Code>],
                    ["Power Rankings", "Weekly editorial team rankings", <Code>power_rankings</Code>],
                    ["Seasons", "Create/edit season metadata", <Code>seasons</Code>],
                    ["Stream", "Twitch stream URL + chat moderation", <span><Code>stream_settings</Code>, <Code>stream_chat_messages</Code></span>]
                  ]}
                />
              </Section>
            </div>

            <div id="guide-delete-scope">
              <Section id="delete-scope" title="Delete behavior & scope" activeId={activeId}>
                <p>
                  Each delete affects different rows depending on database foreign-key cascades.
                  Destructive deletes now require typing the entity's name to confirm.
                </p>
                <Table
                  headers={["Where you clicked", "What gets deleted"]}
                  rows={[
                    [
                      <><strong>Players tab → Delete</strong></>,
                      <span>Modal asks: <em>Remove from current season</em> (just rosters this season — stats preserved) <strong>or</strong> <em>Delete player completely</em> (every roster, every stat, every season).</span>
                    ],
                    [
                      <><strong>Teams tab → Delete</strong></>,
                      <span>Modal asks: <em>Remove from current season</em> (drops <Code>team_seasons</Code> for this season + cascading rosters/stats — blocked if any games reference) <strong>or</strong> <em>Delete team completely</em> (every season the team appeared in).</span>
                    ],
                    [
                      <><strong>Teams &amp; Rosters → Edit Roster → ❌</strong></>,
                      <span>Just removes <strong>that one player from that one team's roster in the selected season</strong>. Stats and other-season rosters preserved.</span>
                    ],
                    [
                      <><strong>Teams &amp; Rosters → 🗑️ next to a team</strong></>,
                      <span>Removes the team from <strong>just the selected season</strong> (drops <Code>team_seasons</Code>, this season's rosters and stats for that team). Other seasons preserved.</span>
                    ],
                    [
                      <><strong>Schedule / Game Results → Delete game</strong></>,
                      <span>Removes the single game and its <Code>player_game_stats</Code> rows. Other games and stats unaffected.</span>
                    ],
                    [
                      <><strong>Game Stats / Power Rankings → Delete row</strong></>,
                      <span>Just that single row. No cascades.</span>
                    ],
                    [
                      <><strong>Seasons tab → Delete</strong></>,
                      <span><strong className="text-red-400">Total nuke.</strong> Wipes every team_seasons, every game, every stat, every roster, every standing/power-ranking/bracket for that season. Requires typing the season name.</span>
                    ]
                  ]}
                />
                <div className="bg-yellow-900/20 border border-yellow-700 rounded p-3 text-sm">
                  <strong className="text-yellow-300">FK protection:</strong>{' '}
                  Deleting a team or team_seasons row that has <Code>games</Code> referencing it will fail with a constraint error.
                  Delete the games first, or just leave the team in place.
                </div>
              </Section>
            </div>

            <div id="guide-shortcuts">
              <Section id="shortcuts" title="Speed-ups & shortcuts" activeId={activeId}>
                <Table
                  headers={["Need", "Where"]}
                  rows={[
                    ["Create many teams at once", "Teams tab → 📋 Bulk Add Teams (paste, optional ,#hex color)"],
                    ["Create many players at once", "Players tab → 📋 Bulk Add Players (optional ,DisplayName)"],
                    ["Link every base team to current season", "Teams tab → 🔗 Link All Unlinked"],
                    ["Copy last season's team list", "Teams tab → 📑 Clone From Season..."],
                    ["Add many players to a team's roster", "Teams & Rosters → Edit Roster → 📋 Bulk paste roster"],
                    ["Create a new player while editing a roster", "Type a new name in the player picker — \"+ Create player 'X'\" appears at bottom"],
                    ["Find which team a player is on", "Teams tab → search box (matches team name OR any player name across all seasons)"],
                    ["Pick a hex color", "Any color field — click the swatch for OS color picker"]
                  ]}
                />
              </Section>
            </div>

            <div id="guide-keyboard">
              <Section id="keyboard" title="Keyboard shortcuts" activeId={activeId}>
                <Table
                  headers={["Key", "Action"]}
                  rows={[
                    [<Code>n</Code>, "Open the Add New modal for the current tab"],
                    [<Code>/</Code>, "Focus the team search box (Teams tab only)"],
                    [<Code>Esc</Code>, "Close the current modal"],
                    [<><Code>Ctrl</Code>/<Code>Cmd</Code>+<Code>Enter</Code></>, "Submit the current form modal"],
                    [<>Arrow keys + <Code>Enter</Code></>, "Navigate searchable dropdowns"]
                  ]}
                />
                <p className="text-sm text-gray-400">Shortcuts only fire when not focused on an input/textarea.</p>
              </Section>
            </div>

            <div id="guide-gotchas">
              <Section id="gotchas" title="Gotchas & invariants" activeId={activeId}>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>OTG flag drives overtime detection.</strong> When entering per-game stats, mark <Code>otg</Code> on the player who scored the OT goal. Without it, the standings calculator treats every game as regulation, breaking LP/OTL.
                  </li>
                  <li>
                    <strong>Standings don't auto-update after editing scores.</strong> Click ⚡ Auto-Generate on the Standings tab to recompute from games + stats.
                  </li>
                  <li>
                    <strong>Only one season should be <Code>is_active = true</Code>.</strong> Multiple actives confuse the dynamic season lookup. The system uses <em>most recent active by start_date</em> as a tiebreaker, but tidy is better.
                  </li>
                  <li>
                    <strong>Teams &amp; Rosters' "Add Team to Season" modal vs Teams tab's "+ Link to Season" button</strong> — both create the same <Code>team_seasons</Code> row. The modal lets you set <Code>display_name</Code> and conference at link time; the button uses defaults.
                  </li>
                  <li>
                    <strong>The "display_name" on a player or team_seasons row is per-season.</strong> The base team/player name in the master tables is unchanged.
                  </li>
                  <li>
                    <strong>Games reference <Code>team_season_id</Code>, not <Code>team_id</Code>.</strong> If a team rebrands mid-season, edit the team_seasons.display_name; don't change the base team.
                  </li>
                  <li>
                    <strong>Forfeits use checkboxes on the game row,</strong> not a separate "outcome" field. After marking, run Auto-Generate to update standings (forfeit = 0 LP for that team).
                  </li>
                  <li>
                    <strong>Stats history is preserved when removing a player from a season's roster.</strong> Their player_game_stats stay (they did play those games). Only roster_memberships rows for the season go away.
                  </li>
                </ul>
              </Section>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-800">
              Need more? See <Code>docs/admin/ADMIN_GUIDE.md</Code> in the repo for the full reference.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGuideModal;
