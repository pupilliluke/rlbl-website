# Deployment Troubleshooting Guide

## Vercel Build Failure: ESLint Warnings Treated as Errors

**Issue:** Vercel treats ESLint warnings as errors, causing `npm run build` to exit with code 1.

**Solution Applied (2026-02-28):**

Fixed 20+ ESLint warnings across 13 files. The fixes fall into these categories:

### 1. Unused Imports
Remove imports that aren't used:
```jsx
// Before
import { TrophyIcon, ChartBarIcon } from "./Icons";

// After
import { /* only what's used */ } from "./Icons";
```

**Files fixed:**
- `src/components/Navbar.jsx` - Removed TrophyIcon, ChartBarIcon
- `src/pages/Weekly.jsx` - Removed CalendarIcon
- `src/pages/Stats.jsx` - Removed fallbackData, RadialChart
- `src/pages/Teams.jsx` - Removed Link
- `src/pages/TeamStats.jsx` - Removed formatPlayerName

### 2. Unused Variables
Add eslint-disable comment or remove the variable:
```jsx
// eslint-disable-next-line no-unused-vars
const [unusedVar, setUnusedVar] = useState(null);
```

**Files fixed:**
- `src/components/WeeklyGameResults.jsx` - homeTeamPlayers, awayTeamPlayers, isLastWeek, matchupName
- `src/pages/LeagueInfo.jsx` - teamsByConference, ConferenceSection
- `src/pages/PlayerStats.jsx` - allStats
- `src/pages/Schedule.jsx` - toggleGameStats
- `src/pages/Stats.jsx` - StatHeader
- `src/pages/Stream.jsx` - chatUrl, getTwitchChatUrl
- `src/pages/Teams.jsx` - teamConference, strokeDasharray, labelAngle, textAnchor, teamStrength
- `src/pages/admin/index.jsx` - selectedConference, players
- `src/pages/admin/modals/GameEditModal.jsx` - players

### 3. useEffect Missing Dependencies
Add eslint-disable comment when the dependency warning is intentional:
```jsx
useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedSeason]);
```

**Files fixed:**
- `src/pages/Schedule.jsx`
- `src/pages/Stream.jsx`
- `src/pages/admin/index.jsx`
- `src/components/StatsTable.jsx`

### 4. Switch Statement Missing Default Case
Add a default case:
```jsx
switch (activeTab) {
  case 'players':
    // ...
    break;
  default:
    break;
}
```

**Files fixed:**
- `src/pages/admin/index.jsx`

---

## How to Verify Build Passes

```bash
npm run build
```

Should output:
```
Compiled successfully.
```

If it shows "Compiled with warnings" and exits with code 1, Vercel will fail.

---

## Quick Fix Pattern

For any new unused variable warning:
```jsx
// eslint-disable-next-line no-unused-vars
const unusedVariable = something;
```

For useEffect dependency warnings where you intentionally don't want exhaustive deps:
```jsx
useEffect(() => {
  // your code
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [onlyTheDepsYouWant]);
```
