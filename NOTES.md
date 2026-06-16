# Scoping Notes — Level 3 SDE2 Analytics Platform

> **Phase 0 confirmed** — 2026-06-16. See `AGENT_PLAYBOOK.md`.

## 1. Requirements, in my own words

Build a **performance-optimized analytics platform** (4-hour time box) that sits in front of the **external mock API** at `https://assessment-6xdhr.ondigitalocean.app`.

**Our backend** proxies/aggregates mock API data with a **caching layer** (in-memory, 5-min TTL, hit-ratio logging) and exposes:

| Endpoint | Behavior |
|----------|----------|
| `GET /api/analytics/dashboard` | Batch-fetch stores via mock `/api/batch`, aggregate, cache |
| `POST /api/analytics/batch` | Accept store IDs → single mock batch call → transform |
| `GET /api/analytics/trends/{store_id}` | Orders from mock store orders → hourly trends (24h), cached |

**Our frontend** must include performance patterns:

- `VirtualOrderList` — react-window, 1000+ orders
- `MemoizedMetrics` — React.memo + useMemo
- `DebouncedSearch` — 300ms debounce before API calls
- Batch fetch for multiple stores, progressive loading, CSV export

**Performance targets (all in scope — nothing cut):**

- Dashboard load < 2s
- WebSocket: 100 orders/sec
- Cache hit ratio > 70% (log + measure)
- Code splitting for bundle size

**Mock API resources:**

- `GET /api/stores`, `GET /api/orders`, `GET /api/stores/:id/metrics`
- `POST /api/batch`, `POST /api/orders/generate`
- WebSocket: `wss://assessment-6xdhr.ondigitalocean.app`

## 2. Decisions (confirmed)

| Topic | Decision |
|-------|----------|
| Stack | **Express + TypeScript** monorepo (not FastAPI) |
| Cache | **In-memory** with hit/miss logging; document trade-off vs Redis |
| Deploy | **Vercel** (serverless API + static web; in-memory cache per instance) |
| Scope | **Full scope** — no features dropped |
| Starter template | Build fresh in scaffold (not port official template) |
| WebSocket | Include in UI (full scope) |
| CSV export | Include (full scope) |

**Open defaults (confirm if you want different):**

- CSV export: dashboard aggregates + orders for selected stores
- Cache invalidation: TTL-only for v1 (no invalidate on generate unless time allows)

## 3. Features (ranked)

**Must-have**

- [ ] Caching layer with 5-min TTL + hit/miss logging
- [ ] `GET /api/analytics/dashboard` (batch + cache)
- [ ] `POST /api/analytics/batch`
- [ ] `GET /api/analytics/trends/{store_id}`
- [ ] VirtualOrderList (react-window)
- [ ] MemoizedMetrics
- [ ] DebouncedSearch (300ms)
- [ ] Dashboard loads in < 2s (measured)
- [ ] CSV export
- [ ] WebSocket live order feed
- [ ] Code splitting

**Nice-to-have**

- [ ] Progressive loading UX polish
- [ ] Cache invalidation on order generate
- [ ] Redis (deferred — in-memory chosen)

## 4. Data model (entities + fields)

- **Store** (from mock API): `id`, `name`, `chain`, `platform`, `status`, `location`, `metrics`, `created_at`
- **Order** (from mock API): `id`, `storeId`, `status`, `amount`, `createdAt`, …
- **StoreMetrics** (from mock API): success rate, processing time, revenue, …
- **DashboardAggregate** (our API): stores + metrics summary, `cachedAt`, `fromCache`
- **HourlyTrend** (our API): `storeId`, `hour`, `orderCount`, `revenue`
- **CacheEntry** (internal): key, payload, `expiresAt`

## 5. API endpoints

**Our API**

- `GET    /api/health` — smoke test + cache stats ✅
- `GET    /api/analytics/dashboard` — aggregated dashboard
- `POST   /api/analytics/batch` — body: `{ storeIds: string[] }`
- `GET    /api/analytics/trends/:storeId` — hourly 24h trends

**External mock API**

- `GET    /api/stores`
- `GET    /api/orders` (pagination)
- `GET    /api/stores/:storeId/metrics`
- `GET    /api/stores/:storeId/orders`
- `POST   /api/batch`
- `POST   /api/orders/generate`
- `WS     wss://assessment-6xdhr.ondigitalocean.app`

## 6. Stack & why

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Vite + React + TS | Fast dev, playbook default |
| Backend | Express + TS | Confirmed; matches scaffold + Vercel |
| Cache | In-memory (`MemoryCache`) | Confirmed; log hit ratio on `/api/health` |
| Data fetching (web) | TanStack Query | Batch + cache-friendly |
| Lists | react-window | Virtual scrolling requirement |
| Monorepo | pnpm workspaces | CI + shared tooling |
| Deploy | Vercel | Confirmed; `vercel.json` ready |

## 7. Build order (vertical slices)

1. ✅ Scaffold + `pnpm dev` + CI config
2. ✅ Confirm scope in this file
3. Mock API client + caching wrapper (in-memory)
4. `GET /api/analytics/dashboard` → test → minimal dashboard UI
5. `POST /api/analytics/batch` → batch store selector UI
6. `GET /api/analytics/trends/:storeId` → trends panel
7. VirtualOrderList + orders data (paginate / WS)
8. MemoizedMetrics + DebouncedSearch
9. CSV export
10. WebSocket live feed + code splitting
11. Perf: measure load time, cache hit ratio
12. Harden: validation, error/empty/loading states, e2e
13. Deploy + smoke test (with approval)

## 8. Talking points to remember to say out loud

- In-memory cache on Vercel: per-instance, not shared — fine for demo; Redis/Upstash for production
- Why cache TTL = 5 min — mock metrics are slow to fetch; batch reduces N calls to 1
- Virtual scrolling vs full list — constant DOM size for 1000+ rows
- Measuring cache hit ratio via `/api/health` + structured logs on cache get
- Code splitting: lazy dashboard panels + react-window in separate chunk
