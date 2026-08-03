# Web admin — React (Vite)

Canonical ruleset for `web-admin/`. Agents that resolve the nearest
`AGENTS.md` (Codex, Cursor, …) load this automatically when editing this
tree; Claude Code reaches it via `.claude/skills/web-admin/SKILL.md`.
Universal rules: [`AGENTS.md`](../AGENTS.md).

> **Status: Scaffolded with full Theme System & UI Component Library.** The web admin
> features a multi-mode theme provider (Dark Fleet, Light, Obsidian), status badges,
> interactive revenue charts, searchable data tables, and owner/super-admin dashboards.

## Stack

- **TypeScript required.**
- **React 19** on **Vite** (latest stable). SPA, not Next — no server
  runtime to host or pay for; it builds to static assets.
- **UI: shadcn/ui + Tremor.** shadcn for primitives (owned source under
  `src/components/ui/`, same model as mobile RNR); **Tremor** for the
  reporting dashboards/charts (revenue history, paid-vs-unpaid, per-driver
  earnings). Compose these — don't add a third component library.
- **i18n: i18next + react-i18next**, the same 6 locales as mobile
  (`en` base/fallback, `ta`, `ml`, `te`, `mr`, `hi`). **No hard-coded
  user-facing strings** — every label comes from a translation file.
- ESLint with the Vite/React TS config. **No Prettier** (matches mobile).

## Version & stability (web-admin delta)

Universal rule in [`AGENTS.md`](../AGENTS.md) "VERSION & STABILITY".
- **Node.js: `26.5.1`** — pinned exact in [`.mise.toml`](../.mise.toml), shared with mobile.
- React, Vite, shadcn/ui, Tremor, i18next: **latest stable**, never a
  prerelease.
- **Audit before each release:** `npm audit --production` (expected:
  `found 0 vulnerabilities`).

## Rules

- **Functional components, hooks only.** Local UI state with `useState` /
  `useEffect`. Server state via **TanStack Query** (cache, pagination,
  invalidation) — the one approved data lib, mirrored from the Session 0
  plan; record it in "Already-approved libraries" when the scaffold lands.
- **Data fetching through one shared client** (`src/lib/api.ts`) that
  parses the standard envelope and attaches the auth token + `X-Tenant`
  header. Feature modules hold endpoint functions only.
- **Client types mirror backend serializers field-by-field** — same rule
  as mobile; a serializer change updates the web type in the same change.
- **Auth tokens never in `localStorage`.** Access token in memory; refresh
  via httpOnly cookie or the in-memory rotation flow. (Web equivalent of
  the mobile Keychain rule — XSS must not be able to read a long-lived
  token.)
- **Visual feedback: green = success, red = failure** (matches mobile).
- **WCAG-AA**, the same UX principles as mobile (clarity over decoration,
  empty/loading/error states everywhere).

## Forbidden

- **Business logic in components** — logic lives in plain TS modules under
  the feature folder.
- A second component library, a second HTTP client, or a second state lib
  beyond the approved shadcn+Tremor / shared client / TanStack Query set.
- Auth tokens in `localStorage`/`sessionStorage`.
- `as unknown as T` double-casts (same rationale as mobile).

## Already-approved libraries

Recorded here (what it does, why a default doesn't cover it, test-mock
location) in the same PR as the lib, so a future maintainer never
reverse-engineers a dependency. Empty until the Session 10 scaffold.

## Env vars (load-bearing)

- Only `VITE_*` vars reach the bundle; anything else is `undefined` at
  runtime. Read via `import.meta.env.VITE_FOO`.
- Add every new var to `.env.example` in the same change.

## API contract (matches backend)

Same envelope as backend/mobile:

```json
{ "status": "success" | "error", "data": {...}, "error": null }
```

Read transport success, then `body.status`; render `body.data` or
`body.error.message`. Server keys are **snake_case**.

## Testing

- **Stack:** **Vitest** + `@testing-library/react` + **MSW**. (Vitest is
  the Vite-native runner — mobile's `jest-expo` is Expo-specific and does
  not apply here.)
- **Coverage policy** (universal — see [`AGENTS.md`](../AGENTS.md) "TEST
  COVERAGE"): target 100% / floor 90% on every dimension; pins live in
  the Vitest config as a ratchet. Record any below-floor dimension's
  one-line *why* here when it first dips.

## Folder layout

```
web-admin/
  index.html
  src/
    components/ui/    # shadcn owned source — composed, not edited from features
    features/<name>/  # pages + <name>-client.ts per feature
    lib/api.ts        # shared fetch client (envelope + auth + X-Tenant)
    lib/i18n.ts       # i18next init + locale resources
    main.tsx          # app shell + router + auth gate
```

## Commands

```bash
npm install
npm run dev              # Vite dev server
npm run build            # static production build → dist/
npm run typecheck        # tsc --noEmit
npm test                 # Vitest one-shot
npm run test:coverage    # Vitest with coverage
```
