# LoopAI Level 3 — Analytics Platform

Performance-optimized analytics platform for the **SDE2 Level 3** assignment: caching layer, batch aggregation against the external mock API, and a React UI with virtual scrolling and debounced search.

**Problem statement:** [LEVEL_3_SDE2_INSTRUCTIONS.md](https://assessment-6xdhr.ondigitalocean.app/docs/LEVEL_3_SDE2_INSTRUCTIONS.md)

**Mock API docs:** https://assessment-6xdhr.ondigitalocean.app/docs

## Structure

```
loopai-level3-analytics/
├── apps/
│   ├── web/          # Vite + React — dashboard UI
│   └── api/          # Express — analytics + cache layer
├── api/entry.ts      # Vercel serverless entry
├── e2e/              # Playwright
├── docker-compose.yml  # Redis (optional)
├── NOTES.md          # Scope (fill before feature work)
├── AGENT_PLAYBOOK.md
└── commit_rules.md
```

## Prerequisites

- Node 20+
- pnpm 10+ (`corepack enable`)
- Docker (optional, for Redis): `docker compose up -d redis`

## Run locally

```bash
cp .env.example .env
pnpm install
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001

```bash
curl localhost:3001/api/health
```

## Commands

```bash
pnpm test           # unit tests
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e       # Playwright (starts api + web)
```

## Current status (scaffold)

- Monorepo scaffold with health check and cache stats
- Analytics route stubs return `501` until implemented
- Placeholder components: `VirtualOrderList`, `MemoizedMetrics`, `DebouncedSearch`
- In-memory cache (Redis wiring in next slice)

## Workflow

1. Complete `NOTES.md` with scope decisions
2. Follow `AGENT_PLAYBOOK.md` and `commit_rules.md`
3. Build vertical slices: endpoint → UI → test
4. Deploy to Vercel only after explicit approval

## Assignment deliverables checklist

- [ ] Redis caching working (or in-memory + documented trade-off)
- [ ] Batch API implemented
- [ ] Virtual scrolling for large lists
- [ ] Dashboard loads in < 2 seconds
- [ ] CSV export functionality
