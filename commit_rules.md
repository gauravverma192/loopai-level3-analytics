# Commit Rules

Follow these rules for every commit during the assignment. Commits should be **small, logical, and reviewable** — one concern per commit when possible.

## Prefix format

Use Conventional Commits-style prefixes:

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feat` | New user-facing behavior or API capability | `feat: add task create endpoint and form` |
| `fix` | Bug fix | `fix: handle empty list in task feed` |
| `refactor` | Code change with no behavior change | `refactor: extract useTasks hook` |
| `test` | Add or update tests only | `test: cover task validation errors` |
| `chore` | Tooling, deps, config, CI | `chore: add env example for api url` |
| `docs` | README, NOTES, comments in docs | `docs: document setup and api endpoints` |
| `style` | Formatting, lint fixes (no logic change) | `style: fix eslint warnings in App.tsx` |
| `perf` | Performance improvement | `perf: memoize task list rows` |
| `ci` | CI/CD pipeline changes | `ci: add e2e job for happy path` |

## Message format

```
<prefix>: <short imperative summary>

[optional body — only if the why is not obvious]
```

**Rules:**
- Use **imperative mood**: "add", "fix", "update" — not "added" or "fixes"
- Keep the subject line under **72 characters**
- No period at the end of the subject line
- Body explains **why**, not what (the diff shows what)

**Good:**
```
feat: add loading and error states to task list

Surfaces API failures instead of showing a blank screen.
```

**Bad:**
```
updated stuff
fixed bug
WIP
```

## Commit cadence

Commit after each meaningful step — do not batch the entire assignment into one commit.

Suggested rhythm:
1. `chore: init git and scaffold` (if starting fresh)
2. `feat: add GET /api/tasks endpoint`
3. `feat: render task list with loading state`
4. `test: add api tests for task routes`
5. `fix: validate task title on create`
6. `docs: update README with demo steps`

## Git safety

- **Initialize git early** — first step after scaffolding
- **Never push** without explicit human approval
- **Never force-push** to `main` / `master`
- **Never commit secrets** — `.env`, API keys, tokens
- **Never skip hooks** (`--no-verify`) unless the human explicitly asks
- **Never amend** a commit that was already pushed

## Before each commit

1. Run relevant checks: `pnpm lint`, `pnpm typecheck`, `pnpm test` (at minimum for the area you changed)
2. Stage only files related to this commit
3. Write the message using the prefix format above
4. Confirm with `git status` after committing

## When the human asks for a commit

Only create commits when the human explicitly requests it. Otherwise, make changes and tell them what is ready to commit.
