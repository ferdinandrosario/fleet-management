# Contributing

How to make a change here so it lands clean. The full rules are in
[`../AGENTS.md`](../AGENTS.md) (canonical) and the nearest `<dir>/AGENTS.md`;
this is the short, practical checklist.

## The golden rules (why this repo feels strict)

1. **Test-first.** Write a failing test, make it pass, refactor. No production
   code without a test that required it. Backend is **100% line coverage,
   enforced** (CI fails below it); mobile targets 100% with a 90% floor.
2. **Docs ship with code, same change.** A code change that doesn't update its
   docs is incomplete. There's a `Stop` hook that warns when `backend/`/`mobile/`
   changed but `docs/` didn't.
3. **No TODO/FIXME comments.** A `PostToolUse` hook blocks a code file that
   contains one. File an issue or do it now.
4. **Latest stable versions, pinned.** One tool bump per change, with the
   version-bump audit (`AGENTS.md` → VERSION & STABILITY).
5. **You commit, not the tooling.** Changes land in the working tree; a human
   reviews and commits. (See [git workflow](#git) below.)

## What to update when you change…

This is the contract — change the left, update the right in the **same change**
(from [`AGENTS.md`](AGENTS.md) and [`AGENTS.md` (docs)](AGENTS.md)):

| If you changed… | Also update |
|---|---|
| user-visible behavior | `README.md`, `docs/00-overview.md`, `docs/05-architecture.md` |
| an endpoint or feature surface | `docs/feature/<feature>.md`, `docs/FEATURES.md` |
| `backend/` files | `docs/02-backend-setup.md` (+ the relevant feature doc) |
| `mobile/` files | `docs/03-mobile-setup.md` (+ `docs/design.md`) |
| an env var | `<codebase>` env table (`backend/AGENTS.md`) or `mobile/.env.example`, plus `docs/04-running-locally.md` |
| a failure mode you hit | `docs/09-troubleshooting.md` |
| a non-default library | the matching `<dir>/AGENTS.md` "Already-approved" table (what it does, why, where configured) |
| a pinned tool/runtime version | run the version-bump audit; update **every** quoted copy (root configs, READMEs, numbered docs, CI) |

## Adding a feature end-to-end (typical flow)

1. **Backend, test-first.** Model + migration (index every FK and filter
   column; external ids are UUIDs) → service → serializer → thin controller,
   each with specs. Authorize with Pundit (default-deny), scope to the current
   tenant, paginate collections, strict params. Add the threat-model row in
   `docs/feature/security.md` if relevant.
2. **Mobile, test-first.** Feature folder `src/features/<name>/` with a client
   (types mirroring the serializer field-by-field), TanStack Query hooks, and
   screens composed from owned primitives. Every user-facing string via `t()`.
   Render loading/empty/error/offline states.
3. **Docs, same change.** A `docs/feature/<name>.md` is the canonical reference
   (endpoints, data model, threat model, how-to-extend) + a `docs/FEATURES.md`
   bullet.

## Before you push — run the gates

```bash
# backend
cd backend
COVERAGE=full bundle exec rspec            # 60+ examples, 100% line coverage
bin/rubocop                                # style
bundle exec brakeman -q                    # security (SAST)
bundle exec bundler-audit check --update   # vulnerable gems

# mobile
cd mobile
npm run typecheck && npm run lint && npm test
```

All of these run in CI ([`.github/workflows/`](../.github/workflows/)) and
block on failure.

## Git

Changes are made in the working tree; **a human reviews and commits** — the
tooling does not push or open PRs on its own. Keep backend and mobile in
**separate commits** even within one change (a universal rule). PRs merge with
**Rebase and merge** (linear history).

## Where the rules live

- [`AGENTS.md`](../AGENTS.md) — universal rules (role, stack, absolute rules,
  versioning, coverage, output format).
- [`backend/AGENTS.md`](../backend/AGENTS.md) — Rails layer rules, API
  envelope, DB, approved gems, env vars.
- [`mobile/AGENTS.md`](../mobile/AGENTS.md) — RN/Expo rules, state/data, UI,
  testing, env vars.
- [`docs/AGENTS.md`](AGENTS.md) — docs numbering + this checklist's source.
