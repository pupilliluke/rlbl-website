# Developer Troubleshooting

Code-level, build-level, and infra issues. If you hit something not listed here, add it after you solve it.

For admin/data-level issues (login, standings, deletes), see [`../admin/TROUBLESHOOTING.md`](../admin/TROUBLESHOOTING.md).

## Vercel build fails: ESLint warnings treated as errors

**Symptom:** `npm run build` exits 1 in Vercel, output says "Failed to compile" with ESLint warnings (unused vars, missing useEffect deps, no-default-case in switch).

**Why:** CRA's production build sets `CI=true`, which makes ESLint warnings fatal. Vercel inherits this.

**Fix categories:**

### 1. Unused imports
```jsx
// Before
import { TrophyIcon, ChartBarIcon } from "./Icons";  // ChartBarIcon never used

// After
import { TrophyIcon } from "./Icons";
```

### 2. Unused variables
Either remove them or add a disable comment:
```jsx
// eslint-disable-next-line no-unused-vars
const [legacyVar, setLegacyVar] = useState(null);
```

### 3. useEffect missing dependencies
If you intentionally don't want exhaustive deps (e.g. you want a manual refresh trigger):
```jsx
useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedSeason]);  // intentionally not including fetchData
```

### 4. Switch missing default case
```jsx
switch (activeTab) {
  case 'players':
    // ...
    break;
  default:
    break;
}
```

**How to verify locally**: `npm run build` should print `Compiled successfully.` — if it says `Compiled with warnings.` and exits 1, Vercel will fail.

## Backend module won't load — `SyntaxError: Unexpected identifier`

**Symptom:** `node -e "require('./backend/api/playerGameStats')"` throws a SyntaxError on a line starting with `async someMethod()`.

**Why:** Method shorthand syntax (`async foo() { }`) is only valid inside class/object bodies. If a method definition got placed outside the closing `}` of its class, you get this. Happened twice during the initial OTG work.

**Fix:** Re-balance braces in the affected DAO file. Verify with:
```bash
node -e "const D = require('./backend/dao/PlayerGameStatsDao'); const d = new D(); console.log(typeof d.someMethod);"
```

## `Database connection error` on backend startup

**Symptom:** Backend logs `Database connection error:` followed by a network error.

**Causes (in priority order):**

1. **`DATABASE_URL` not set or wrong.** Check `.env.local`. Test the connection string in Neon's SQL Editor first.
2. **SSL not enabled.** Neon requires `?sslmode=require` in the URL or `ssl: { rejectUnauthorized: false }` in the Pool config (already handled in `lib/database.js`).
3. **Neon project paused** (free tier auto-pauses after inactivity). Hit any endpoint or open the Neon console to wake it.
4. **Local Postgres on the wrong port.** If you're running local Postgres instead of Neon, default port is 5432.

## Admin Teams tab "Add" modal is blank

**Symptom:** Click Add New on the Teams tab, modal opens with no input fields.

**Why:** Old behavior — the modal derived its fields from `currentData[0]` keys. Empty table → empty fields.

**Fix:** Already shipped. The modal now falls back to `Object.keys(formData)` from `getDefaultFormData(activeTab)`. If you see this regress, check the `currentKeys` derivation in `src/pages/admin/index.jsx`.

## "Vercel deploy hung at Building"

If a deploy hangs >5 minutes, cancel it (Vercel dashboard → ⋯ → Cancel). Check:

- Is `package-lock.json` committed? Vercel needs it for deterministic installs.
- Is the Node version in `package.json` `engines` supported by Vercel? (22.x is current).

## API endpoint returns 503 with "neon_auth schema does not exist"

**Was a problem with the deleted `/api/users` endpoint.** The endpoint has been removed in cleanup. If you see this now, you re-added something that depends on a `neon_auth` schema that doesn't exist — don't.

## CORS errors hitting API from frontend

**Symptom:** Browser console: "blocked by CORS policy" when frontend tries to call `/api/...`.

**Fix:** `backend/server.js` and `api/index.js` both use `cors()` middleware (open). If you see CORS errors:

- In dev: are you hitting `http://localhost:5000` directly from a non-localhost frontend? Add a specific origin to the `cors()` config.
- In prod: this should never happen since the frontend and API are on the same domain.

## Build succeeds but `/api/*` returns 404 in prod

**Cause:** Vercel didn't pick up `api/index.js` as a serverless function.

**Fix:**
1. Confirm `api/index.js` exists at the repo root (not `src/api/`).
2. Confirm `vercel.json` has the rewrite:
   ```json
   { "rewrites": [{ "source": "/api/(.*)", "destination": "/api" }] }
   ```
3. Force a redeploy from Vercel dashboard.

## Frontend uses fallback data instead of live data

**Symptom:** Pages show outdated info; console shows "Using fallback data due to API error".

**Cause:** API call failed. `apiService.js` exports `fallbackData` and pages catch errors and use it.

**Fix:** Check the network tab for the failing request. Usually a backend issue (DB connection, missing env var) — fix that.
