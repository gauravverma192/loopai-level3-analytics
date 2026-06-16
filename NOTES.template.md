# Scoping Notes (copy to NOTES.md at the start of the interview)

> Fill this in during the first 20 minutes, before writing code. It catches
> misunderstandings early and demonstrates product sense + prioritization.

## 1. Requirements, in my own words
-

## 2. Clarifying questions to ask
- Does data need to persist across restarts? (in-memory vs DB)
- Single user or multi-user / auth required?
- Any specific framework/host they want, or my choice?
- What does "done" look like — which features are must-have?

## 3. Features (ranked)
**Must-have**
- [ ]
- [ ]

**Nice-to-have**
- [ ]

## 4. Data model (entities + fields)
- Entity: ...
  - fields: ...

## 5. API endpoints
- `GET    /api/...`
- `POST   /api/...`
- `PATCH  /api/...`
- `DELETE /api/...`

## 6. Stack & why
- Frontend: Vite + React + TS (fast, familiar, AI generates it well)
- Backend: Express + TS (minimal, easy to explain)
- Deploy: Vercel (push-to-deploy, retire deploy risk early)

## 7. Build order (vertical slices)
1. Scaffold + `pnpm dev`
2. CI green + deploy empty app
3. Feature 1: endpoint → UI → test
4. Feature 2: ...
5. Harden (validation, error/empty/loading states)
6. Polish + redeploy + smoke test

## 8. Talking points to remember to say out loud
-
```
