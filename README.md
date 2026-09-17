# GMPulse — Personal IPO Tracking Command Center

Private personal IPO portfolio & GMP tracker. Dark premium fintech dashboard for tracking IPOs you personally apply for: GMP, live GMP changes, subscription, estimated listing price/profit, allotment, listing performance.

> **Disclaimer:** GMP and estimated listing prices are unofficial indicators and are not guaranteed. Actual listing prices may differ significantly. This dashboard is for personal tracking and informational purposes only.

## Architecture

```
External GMP Source
        ↓
Backend GMP Service (Express + providers)
        ↓
MongoDB (or in-memory fallback if no URI)
        ↓
Frontend API (React Query, 3-min polling)
        ↓
Dashboard
```

- `server/` — Node.js + Express + TypeScript + Mongoose. GMP provider abstraction, 3-minute scheduler, GMP/subscription history, dashboard summary, calendar APIs.
- `client/` — React + Vite + TypeScript + Tailwind + Recharts + TanStack Query + Lucide icons.

## Prerequisites

- Node.js 18+
- MongoDB (optional for dev — app falls back to in-memory store if `MONGODB_URI` is empty)

## Quick start (clean install)

```bash
npm install
# installs server + client (postinstall runs both)

# 1. configure env
cp .env.example .env
# edit .env — at minimum leave GMP_PROVIDER=mock for demo mode

# 2. run both (backend :5001, frontend :5173 with /api proxy)
npm run dev

# or separately
npm run dev:server   # cd server && npm run dev
npm run dev:client   # cd client && npm run dev
```

Open http://localhost:5173

## Environment variables

See `.env.example`:

| Var | Default | Description |
|---|---|---|
| `PORT` | `5001` | Backend port |
| `MONGODB_URI` | `` | Mongo connection string. Empty = in-memory store (dev-friendly) |
| `GMP_PROVIDER` | `mock` | `mock` \| `primary` \| `fallback`. Mock = clearly labelled DEMO DATA |
| `GMP_API_URL` | `` | Primary provider endpoint |
| `GMP_API_KEY` | `` | Primary provider key (never commit) |
| `GMP_FALLBACK_URL` | `` | Fallback provider endpoint |
| `GMP_REFRESH_INTERVAL` | `180` | Seconds between GMP refreshes (min 60) |
| `JWT_SECRET` | `` | Reserved for future auth (optional login) |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |
| `SEED_DEMO` | `true` | Seed `SS Retail — Demo`, `Hero Motors — Demo` when store is empty (dev only) |

## GMP provider configuration

`server/src/services/gmpProviders.ts` exposes:

```ts
interface GmpProvider {
  name: string;
  getGmp(ipo: IPO): Promise<GmpData>;
}
```

- `PrimaryGmpProvider` — GET `${GMP_API_URL}?symbol=&name=` with `x-api-key` header. Expects `{ gmp, subscription?: {...} }` or similar; validates before returning.
- `FallbackGmpProvider` — same shape against `GMP_FALLBACK_URL`.
- `MockGmpProvider` — deterministic simulated walk (clearly labelled demo). Never used when a real provider is configured.

Backend caches per-IPO (`lastGmpFetchAt`) and only refetches when older than `GMP_REFRESH_INTERVAL`. Frontend polls `/api/ipos` every 3 minutes; no full-page reload.

If provider fails: previous valid GMP is preserved, response includes `gmpStale: true`, UI shows "Data temporarily unavailable / Last successful update".

## Scheduler

`server/src/jobs/gmpScheduler.ts` runs every `GMP_REFRESH_INTERVAL` seconds:

```
for each active IPO (status not Sold/Listed-expired unless enabled):
  fetch GMP → validate → update currentGmp → append gmp_history
```

Also refreshes on `POST /api/ipos` (initial fetch) and `POST /api/ipos/:id/gmp/refresh`.

## API endpoints

```
GET    /api/health
GET    /api/ipos?search=&status=&sort=&order=
POST   /api/ipos
GET    /api/ipos/:id
PUT    /api/ipos/:id
DELETE /api/ipos/:id
PUT    /api/ipos/:id/status
PUT    /api/ipos/:id/subscription
POST   /api/ipos/:id/subscription/snapshot
GET    /api/ipos/:id/gmp
POST   /api/ipos/:id/gmp/refresh
GET    /api/ipos/:id/gmp/history?range=6H|12H|1D|3D|ALL
GET    /api/ipos/:id/subscription/history
GET    /api/dashboard/summary
GET    /api/calendar?month=2026-09
POST   /api/import
GET    /api/export?format=json|csv
```

## Database models

- `IPO` — name, companyName, symbol, logoUrl, issuePrice, lotSize, lotsApplied, allottedLots, openDate, closeDate, allotmentDate, listingDate, status, currentGmp, lastGmpAt, gmpSource, subscription {retail, nii, qib, employee, total}, actualListingPrice, notes, userId (reserved for auth).
- `GmpHistory` — `{ ipoId, gmp, timestamp, source }` per successful update.
- `SubscriptionHistory` — `{ ipoId, retail, nii, qib, employee, total, label, timestamp }`.

Auth is intentionally simple for v1 (no login; `userId` reserved). To add JWT: set `JWT_SECRET`, add auth middleware, scope queries by `userId`. Documented in `server/src/server.ts`.

## Calculation formulas (centralized)

Server: `server/src/utils/calculations.ts` · Client: `client/src/utils/calculations.ts` (mirrored, no duplication inside each app).

```
quantity        = lotSize × lots
investment      = issuePrice × quantity
gmp%            = gmp / issuePrice × 100
estListing      = issuePrice + gmp
estProfit       = gmp × quantity   (= listingValue − investment)
listingGain%    = gmp% (same basis)
```

Example: P=742, G=135, lot=20, lots=1 → listing 877, qty 20, investment 14840, profit 2700, gmp% 18.19%.

## Testing

```bash
cd server && npm test        # node --test via tsx, covers calculations + validation
```

Covers: example numbers above, GMP=0, negative GMP, multiple lots/allotted lots, missing GMP, invalid input.

## Production build

```bash
npm run build      # builds client (dist/) + server (dist/)
npm start          # serves API + static client from server/dist/public
```

Server serves `../client/dist` statically when present.

## Project structure

See spec §3. Frontend components: `DashboardHeader SummaryCard IpoTable IpoRow GmpCard GmpChart SubscriptionCard SubscriptionChart ProfitCard StatusBadge AddIpoModal EditIpoModal DeleteConfirmation Countdown LiveIndicator`. Backend: controllers/routes/models/services/jobs/utils/config.
