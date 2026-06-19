# Docs — `docs/` is the source of truth

Canonical ruleset for `docs/`. Agents that resolve the nearest
`AGENTS.md` (Codex, Cursor, …) load this automatically when editing
this tree; Claude Code reaches it via `.claude/skills/docs/SKILL.md`.
Universal rules: [`AGENTS.md`](../AGENTS.md).

> Standard: a future maintainer with zero memory of the chat must
> rebuild the entire feature from `docs/feature/<feature>.md` alone.

## Layout (do not reshape)

```
docs/
  00-overview.md           # what the app is, two-codebase diagram
  01-prerequisites.md      # tool versions + install commands
  02-backend-setup.md      # empty dir → running Rails API
  03-mobile-setup.md       # empty dir → running mobile app
  04-running-locally.md    # daily workflow across both codebases
  05-architecture.md       # request flow, auth flow, why API-only
  06-conventions.md        # code style, folder layout, error format
  07-tuning.md             # formulas for every tunable runtime param
  08-deployment.md         # env vars, Postgres in prod
  09-troubleshooting.md    # symptom → fix per known failure mode
  CONTRIBUTING.md          # feature-doc checklist (every PR)
  FEATURES.md              # one bullet per surface, by feature
  feature/                 # per-feature canonical references (one file each)
    <feature>.md           # source of truth per feature
```

- Numbered files **00–09** are the linear top-to-bottom guide. Don't
  renumber. Don't insert a new number — extend an existing file or add
  a per-feature canonical file instead.
- **Per-feature canonical files live under `docs/feature/`** and are the
  source of truth for that feature. Endpoints / data model / reminders /
  threat model / env vars / how-to-extend all live there. Add a new
  feature as `docs/feature/<name>.md` — don't drop feature files back into
  the `docs/` root.

Each numbered guide and feature file is authored **in the same change as
the code it documents** (universal rule 5). The structure above is the
contract; a page exists once its subject does.

## Required for every doc-touching change

This mapping is the checklist — when you change the left, you must update
the right in the same change:

| If you changed… | You must also update |
|---|---|
| user-visible behavior | `README.md`, `docs/00-overview.md`, `docs/05-architecture.md` |
| an endpoint or feature surface | `docs/feature/<feature>.md`, `docs/FEATURES.md` |
| `backend/` files | `docs/02-backend-setup.md` |
| `mobile/` files | `docs/03-mobile-setup.md` |
| an env var | `<codebase>/.env.example`, `docs/04-running-locally.md`, `docs/08-deployment.md` |
| a failure mode | `docs/09-troubleshooting.md` |
| a tunable runtime parameter | `docs/07-tuning.md` (with the **formula** and the value at **all three load tiers** — basic / mid / heavy — not just one value) |
| a non-default lib | matching `<surface>/AGENTS.md` "Already-approved" |
| **a pinned tool/runtime version** (Ruby, Rails, Node, Postgres, Expo SDK, React Native, React, Ubuntu) | run the **version-bump audit grep** in the "Verification ritual" below; update **every** match (root configs, `README.md`, `docs/01-prerequisites.md`, `docs/08-deployment.md`, every `docs/feature/<feature>.md` that quotes it, CI workflows) in the same PR |

Change history lives in **git**, not in a doc: the commit message carries
the one-paragraph *why* and the verification command + real output. There
is no changelog file to update.

## Per-feature canonical file — required sections

Every `docs/feature/<feature>.md` needs (skip a section only if it genuinely
does not apply — and explain why in one line):

1. **Lede** — one paragraph: what the feature is, who it's for.
2. **Data model** — every model, every column, every association.
   Encrypted columns flagged. Default values stated.
3. **Endpoints** — verb + path + auth + request shape + response shape
   (the envelope). Status codes on error.
4. **Reminders / jobs** (if any) — which Solid Queue job, the recurring
   schedule, which channel it broadcasts on, idempotency.
5. **Screens** — mobile (`src/features/<name>/`) component list, what each
   renders.
6. **Env vars** — every `EXPO_PUBLIC_*` / Rails ENV the feature reads, with
   local default + production source.
7. **Threat model** (if user data or auth-adjacent) — what an attacker
   would try, what blocks them.
8. **How to extend** — adding a column, a new sub-resource, a new reminder
   kind. Concrete steps, not "follow the patterns".

## Style

- **Tables for endpoints / env vars / status codes** — not bullet lists.
- **Code fences with language tags** — ```` ```sh ````, ```` ```ruby ````,
  ```` ```tsx ````, ```` ```json ````. Not bare ```` ``` ````.
- **File paths in backticks** — `backend/app/models/user.rb`, never
  `User model`.
- **Markdown links to siblings** — `[multi-tenancy](feature/multi-tenancy.md)`, not "see multi-tenancy.md".
  Use relative paths so `gh pr view` renders them.
- **No future tense** — "the controller validates" not "will validate".
  Docs describe the system that exists now.
- **No "currently" / "for now" / "as of" — and no `🆕` / "NEW" /
  "recently" markers** — these all rot. State the fact; if it changes, the
  next PR updates the fact.

## Version & stability in examples (docs delta)

Universal rule in [`AGENTS.md`](../AGENTS.md) "VERSION & STABILITY".
Docs-specific:

- Every command example uses the **current Ubuntu LTS** (today: 26.04) on
  Linux, or the macOS stable public release. Never reference non-LTS, beta,
  or EOL OS versions in an example.
- Every runtime / package manager / framework version in an example is the
  **latest stable release** at write time. Never RC/canary/preview/deprecated.
- Every command shows its real expected output — the actual success line,
  not a paraphrase. A command without its success signal is incomplete.
- Pinned-for-compatibility versions cited in docs (e.g. `tailwindcss@3.4.17`
  for NativeWind v4) carry the one-line `why` wherever the pin appears.

## Forbidden

- **Renumbering 00–09 files.** They're linked from `README.md` and every
  onboarding doc. Renumbering breaks every external reference.
- **Hand-rolled tables of contents.** GitHub renders headings
  automatically; a static TOC just rots.
- **Hard-coded inventory counts in prose** ("eleven features", "the ten
  endpoints above"). State the list, or point to the canonical inventory
  (`FEATURES.md`); a bare number drifts the moment the inventory changes —
  per [`AGENTS.md`](../AGENTS.md) rule 12.
- **"TBD" / "TODO" / "coming soon"** — if it's not done, it's not
  documented. Either ship it or don't claim it.
- **Diagrams as binary images** unless genuinely un-ASCII-able. Plain ASCII
  art renders in `gh pr view` and `cat`; PNGs don't.

## Verification ritual (run before reporting done)

```sh
# 1. No stale "no X" claims
rg -i 'no auth|no users|no sessions' docs/ README.md
# (expected: zero matches, OR every match is inside a quote/example)

# 2. Every new env var appears in its three places
rg 'EXPO_PUBLIC_NEW_VAR' mobile/.env.example docs/04-running-locally.md docs/08-deployment.md
# (expected: one hit in each)

# 3. Version-bump audit — run after every pinned-version change.
#    Replace OLD with the previous version string (e.g. 4.0.3, 26, 8.1.2).
grep -rn "OLD" \
  .ruby-version backend/.ruby-version .mise.toml \
  backend/Gemfile mobile/package.json \
  AGENTS.md backend/AGENTS.md mobile/AGENTS.md docs/AGENTS.md \
  README.md docs/ .github/workflows/
# (expected: zero matches)

# 4. Agent-file pointer integrity — run after editing any AGENTS.md or
#    its thin pointers.
grep -q '^@AGENTS.md' CLAUDE.md && echo "CLAUDE.md imports AGENTS.md OK"
ls AGENTS.md backend/AGENTS.md mobile/AGENTS.md docs/AGENTS.md
# (expected: confirmation line + all four canonical files listed)
```
