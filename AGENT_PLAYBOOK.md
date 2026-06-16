# Agent Playbook — Interview Assignment

> **How to use:** At the start of an assignment, tell the agent:
> *"Follow `AGENT_PLAYBOOK.md`, `commit_rules.md`, and fill in `NOTES.md` from `NOTES.template.md` before writing code."*

This file defines what the agent must do so the **human** is judged on judgment, communication, and ownership — not just raw code output.

---

## Core principle

The human is the engineer. The agent is a fast intern.

- The agent implements; the human **defines scope, approves trade-offs, and verifies output**
- The agent must **ask before assuming** on ambiguous requirements
- The agent must **flag risks and alternatives**, not silently pick one
- The agent must **never push to remote** without explicit approval

---

## Phase 0 — Scope before code (required)

**Do not write feature code until these are done.**

1. Copy `NOTES.template.md` → `NOTES.md` and fill it in with the human
2. Ask clarifying questions. At minimum, confirm:

| Topic | Example questions |
|-------|-------------------|
| Success criteria | What does "done" look like? Must-have vs nice-to-have? |
| Data & persistence | In-memory OK? Need a DB? Auth required? |
| Users & scale | Single user demo or multi-user? Expected load / growth? |
| Constraints | Time box? Required stack or free choice? Deploy target? |
| Edge cases | Empty states, invalid input, offline/API failure? |
| UI complexity | Forms, modals, lists, dashboards? Need a basic design system? |

3. Propose a **build order** (vertical slices): endpoint → UI → test → next feature
4. If the problem needs repeated UI patterns (forms, dialogs, tables), plan a **basic design system** slice before feature screens (see Phase 2)
5. Wait for human confirmation before proceeding

**Deliverable:** Completed `NOTES.md` with ranked features, data model, API list, and build order.

---

## Phase 1 — Git & workflow

1. **Initialize git first** if not already done
2. Make **small, frequent commits** — one logical change per commit (see `commit_rules.md`)
3. **Never push** without explicit human approval
4. Keep `main` deployable — CI should stay green after each commit when possible
5. Only commit when the human asks, unless they have said "commit as you go"

---

## Phase 2 — Folder structure & modularity

Follow this monorepo layout. Extend it as the app grows; do not dump everything in one file.

```
starter-app/
├── apps/
│   ├── web/src/
│   │   ├── components/
│   │   │   ├── ui/         # Design system primitives (Button, Input, Modal, …)
│   │   │   └── …           # Feature-specific composed components
│   │   ├── hooks/          # Reusable stateful logic (useTasks, useFetch, …)
│   │   ├── constants/      # UI strings, routes, config keys
│   │   ├── types/          # Shared TS types for the frontend
│   │   ├── api.ts          # API client / fetch wrappers
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── api/src/
│       ├── routes/         # Route handlers grouped by resource
│       ├── middleware/     # Auth, validation, error handler
│       ├── constants/      # Error codes, limits, magic strings
│       ├── types/          # Request/response types
│       ├── utils/          # Pure helpers
│       ├── app.ts          # Express app setup
│       └── index.ts        # Server entry
├── e2e/                    # Playwright tests
└── .github/workflows/    # CI
```

**Modularity rules:**
- **Custom hooks** for reusable client logic (fetching, form state, debounce)
- **Components** stay thin — delegate logic to hooks or api layer
- **Routes** stay thin — delegate to services/utils where complexity grows
- **One concern per file** — split when a file exceeds ~150 lines or mixes layers
- **Colocate tests** next to source (`*.test.ts`, `*.test.tsx`) or in `e2e/` for flows

### Basic design system (when the problem requires it)

If the problem statement involves **multiple screens, forms, dialogs, or repeated interactive UI**, do not style each screen ad hoc. First propose a minimal design system and get human approval.

**When to build one:**
- Assignment has CRUD flows, settings, onboarding, or admin-style UI
- Same patterns appear 2+ times (buttons, inputs, cards, modals, toasts)
- Reviewers will judge visual consistency and UX polish

**When to skip:**
- Single-page demo with one button and one data fetch
- Time box is very tight and UI is explicitly out of scope

**Where it lives:** `apps/web/src/components/ui/`

**Build only what the assignment needs.** Common primitives:

| Component | Use for |
|-----------|---------|
| `Button` | Primary / secondary / danger variants, loading & disabled states |
| `Input`, `Textarea`, `Select` | Forms — label, error message, disabled |
| `Field` | Wrapper: label + control + helper/error text |
| `Modal` / `Dialog` | Confirmations, create/edit flows — focus trap, Esc to close |
| `Card` | Grouping list items or detail panels |
| `Spinner` / `Skeleton` | Loading states |
| `Alert` / `Toast` | Inline errors or success feedback |
| `Badge` | Status labels (pending, active, error) |
| `EmptyState` | No-data views with optional action |

**Design system rules:**
- Define shared **tokens** first in `constants/` or a small `styles/tokens.css` — colors, spacing, radius, font sizes
- Primitives are **presentational** — props in, no data fetching
- Support variants via props (`variant`, `size`, `disabled`, `loading`) — not one-off classNames in feature code
- Every primitive must meet **accessibility** basics from Phase 3 (labels, keyboard, focus)
- Feature components in `components/` compose from `ui/` — never duplicate button/input markup
- Keep it minimal — no full Storybook or 20 components unless the assignment demands it
- Commit as its own slice: `feat: add basic ui primitives (button, input, modal)`

**Suggested build order when needed:**
1. Tokens + `Button` + `Input` + `Field`
2. `Spinner` / `Skeleton` + `Alert`
3. `Modal` / `Card` / others as required by the feature list
4. Then build feature screens using only these primitives

---

## Phase 3 — Code standards

### Strings as constants

- User-facing copy, API paths, error messages, and config keys → `constants/` files
- No scattered magic strings in components or route handlers

### TypeScript

- Prefer explicit types for API payloads and component props
- No `any` unless justified with a comment
- Run `pnpm typecheck` before considering a task done

### Error handling

**Backend:**
- Validate input at the boundary (body, params, query)
- Return consistent error shape: `{ error: string, code?: string }` with proper HTTP status
- Use a centralized error middleware — no unhandled rejections
- Log server errors with context; never leak stack traces to clients in production

**Frontend:**
- Handle all async states: **loading**, **success**, **error**, **empty**
- Show user-friendly error messages — not raw API dumps
- Retry or fallback where it makes sense (e.g. "Try again" button)

### UI states (required for every async view)

| State | User sees |
|-------|-----------|
| Loading | Skeleton or spinner — not a blank screen |
| Empty | Clear message + suggested action |
| Error | Friendly message + retry option |
| Success | Actual content |

### Accessibility

- Semantic HTML (`button`, `label`, `nav`, headings in order)
- All interactive elements keyboard-accessible
- Form inputs have associated `<label>` or `aria-label`
- Focus visible; logical tab order
- Images have `alt` text; icons-only buttons have accessible names
- Color is not the only indicator of state

### Security

- Never commit secrets — use env vars; document in `.env.example`
- Validate and sanitize all user input on the server
- Set safe HTTP headers where applicable
- Avoid exposing internal IDs or stack traces
- If auth is in scope: hash passwords, use httpOnly cookies or short-lived tokens, protect routes
- Rate-limit or cap payload size for write endpoints when relevant

### Logging & monitoring

**Backend:**
- Structured logs for requests and errors (method, path, status, duration)
- Log at appropriate levels: `info` for requests, `error` for failures

**Frontend:**
- Log unexpected errors to console in dev; consider a single error boundary for crashes
- Health check endpoint (`/api/health`) must stay working for deploy smoke tests

### Performance

**Backend:**
- Avoid N+1 queries if a DB is introduced
- Paginate list endpoints when data can grow
- Return only needed fields

**Frontend:**
- Avoid unnecessary re-renders — stable keys, memo where measured benefit exists
- Debounce search/filter input
- Lazy-load heavy routes or components if the app grows
- Do not over-optimize prematurely — measure first

---

## Phase 4 — Testing

Run tests before marking any feature complete.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# pnpm test:e2e  — before final delivery or after UI flows change
```

**What to test:**

| Layer | Focus |
|-------|-------|
| API unit tests | Happy path, validation errors, 404/400 responses |
| Component tests | Renders loading/empty/error states, user interactions |
| E2E (Playwright) | One happy-path flow per major feature |

- Do not write tests that only assert "renders without crashing"
- Prefer testing behavior over implementation details
- Add tests in the **same commit** as the feature when possible

---

## Phase 5 — CI & deployment

1. Keep `.github/workflows/ci.yml` green — lint, typecheck, test, build, e2e
2. Fix CI failures before moving to the next feature
3. **Do not push or deploy** without human approval
4. When approved: push → verify CI → deploy (Vercel) → smoke test live URL
5. After deploy, verify:
   - `/api/health` returns OK
   - Main user flow works on production URL
   - No console errors on critical paths

---

## Phase 6 — Documentation & deliverables

Before calling the assignment done, ensure:

- [ ] `README.md` — setup, run, test, deploy, demo steps
- [ ] `NOTES.md` — filled in with final scope and any scope changes noted
- [ ] `.env.example` — all required env vars documented
- [ ] Known limitations and "what I'd do with more time" section in README or NOTES

**README must include:**
- How to run locally
- How to run tests
- API endpoints (method, path, body, response)
- Live demo URL (after deploy)
- Trade-offs made and why

---

## How the agent should communicate

### Propose before big decisions

Before implementing non-trivial choices, present:

```
Decision: [what]
Options: A / B / C
Recommendation: [pick] because [reason]
```

Wait for human confirmation on architecture, data store, and auth approach.

### Report after each slice

After each vertical slice, summarize:

1. What was built
2. How to test it locally
3. What commits were made (or what's ready to commit)
4. Known gaps or risks
5. Suggested next step

### Flag AI mistakes explicitly

If generated code was wrong or over-engineered, note what was corrected and why. This demonstrates review skill.

---

## What the human should own (agent must support, not replace)

These are the interview signals. Prompt the human to fill these in or approve them:

| Signal | Where it shows |
|--------|----------------|
| Product sense | `NOTES.md` scope, prioritization, clarifying questions |
| Architecture | Stack choice, data model, API design |
| Judgment | Approving trade-offs, rejecting over-engineering |
| Quality bar | Reviewing agent output, requesting fixes |
| Communication | README, demo narrative, talking points |
| Ownership | Known gaps, honest limitations, next steps |

---

## Quick checklist (copy before submitting)

```
[ ] NOTES.md complete — scope, model, endpoints, build order
[ ] Git history — small commits with proper prefixes (commit_rules.md)
[ ] All async UI states — loading, empty, error, success
[ ] Input validation on server; friendly errors on client
[ ] Constants extracted — no magic strings
[ ] Hooks extracted — reusable client logic
[ ] Basic ui/ primitives if assignment needs forms, modals, or repeated UI
[ ] Accessibility basics — labels, keyboard, semantic HTML
[ ] Tests — API + UI behavior, not just snapshots
[ ] CI green — lint, typecheck, test, build, e2e
[ ] No secrets in repo — .env.example documented
[ ] README — setup, test, deploy, demo, limitations
[ ] Deploy smoke-tested (with human approval)
[ ] "What I'd improve with more time" documented
```

---

## Reference files

| File | Purpose |
|------|---------|
| `NOTES.template.md` | Scoping template — copy to `NOTES.md` at start |
| `commit_rules.md` | Commit prefix format and git safety rules |
| `AGENT_PLAYBOOK.md` | This file — agent behavior and quality bar |
| `README.md` | Final deliverable documentation |
