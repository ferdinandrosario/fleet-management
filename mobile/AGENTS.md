# Mobile — React Native (Expo)

Canonical ruleset for `mobile/`. Agents that resolve the nearest
`AGENTS.md` (Codex, Cursor, …) load this automatically when editing
this tree; Claude Code reaches it via `.claude/skills/mobile/SKILL.md`.
Universal rules: [`AGENTS.md`](../AGENTS.md).

## Stack

- **TypeScript required.**
- Expo managed workflow (template: `blank-typescript`), Expo SDK 56.
- React Native 0.85, React 19.2.
- ESLint with the Expo-shipped config. **No Prettier.**

## Version & stability (mobile delta)

Universal rule in [`AGENTS.md`](../AGENTS.md) "VERSION & STABILITY".
Mobile-specific:

- **Node.js: `26.3.1`** — latest stable, **pinned exact** in
  [`.mise.toml`](../.mise.toml) and CI (see [`AGENTS.md`](../AGENTS.md)
  R10 + VERSION & STABILITY), even while it is a "Current" line not yet
  promoted to LTS. Never a prerelease, never an EOL line.
- **Expo SDK:** latest stable production release. **No SDK RCs, no
  preview tags, no Expo `canary`.** Wait for the GA before bumping.
- **React Native:** latest stable. **No RN nightlies, no `0.x.x-rc` builds.**
- **Toolchain:** Xcode and Android Studio on stable channels only.
  Beta Xcode breaks JS bundling.
- **Audit before each release:** `npm audit --production` (expected:
  `found 0 vulnerabilities`).
- **Compatibility-pin exception:** `tailwindcss@3.4.17` is pinned because
  NativeWind v4 doesn't yet support Tailwind v4. This is the *only* place
  Tailwind v3 may stay; it lifts the day NativeWind v4 supports Tailwind v4.

## Rules

- **Functional components + hooks. No class components.** Local UI state is
  `useState` / `useEffect`. **Server state is TanStack Query** (caching,
  pagination, lazy fetch — the approved Session 0 stack). **Global app state
  (auth status, language, theme) is a set of small Zustand stores** — no Redux.
  Owned UI primitives under `src/components/ui/` stay hand-shaped.
- **Data fetching: TanStack Query over the shared `fetch` client
  `src/lib/api.ts`.** `request` / `upload` / `querystring`, the envelope
  parsing, the `ApiResult<T>` type, and the auth + `X-Tenant` headers live in
  `src/lib/api.ts` once. Feature clients
  (`src/features/<name>/<name>-client.ts`) hold endpoint functions; feature
  hooks wrap them in `useQuery` / `useMutation`. **No axios, SWR, ky** — the
  transport is always the shared fetch client.
- **Client types mirror backend serializers field-by-field.** The `type`s
  in `src/features/<name>/<name>-client.ts` are the on-the-wire contract
  from `backend/app/serializers/` hand-transcribed — names, types, and
  `| null`. A serializer change updates the client type in the same change.
- **UI: NativeWind v4 + react-native-reusables (RNR)** owned components
  under `src/components/ui/`. Compose primitives; don't reach for
  third-party RN component libraries.
- **Visual feedback: green = success, red = failure.** Use these colors
  consistently for status UI.
- **Add new libraries only with a PR justification.** The Already-approved
  list below is the current baseline.

## Forbidden

- **Business logic in components.** Logic that isn't rendering or local UI
  state belongs in plain TS modules under the feature folder (e.g.
  `src/features/<name>/api.ts`, `src/features/<name>/format.ts`).
- Any third-party **HTTP** client (axios/SWR/ky) — the transport is the shared
  `src/lib/api.ts` fetch wrapper, used as TanStack Query's `queryFn`. Redux or a
  global-state library beyond Zustand (one small store per concern:
  auth, language, theme).
- Editing `src/components/ui/*` from inside a feature folder. If you need a
  new variant, extend the primitive's `cva` map.
- Duplicating fetch plumbing in a feature client — `src/lib/api.ts` is the
  only fetch wrapper.
- **`as unknown as T` (double-cast) anywhere.** It silences structural
  checking entirely, so a later field rename keeps compiling while building
  wrong objects. If a plain assignment is rejected, fix the type (or the
  data), not the compiler. Single `as` needs a comment saying why the
  compiler can't see the truth.

## Already-approved libraries

Every library added with a written PR reason is recorded here (what it
does, why an Expo/RN default doesn't cover it, its Jest mock location) so a
future maintainer never reverse-engineers an unexplained dependency.

| Library | What / why | Mock (tests) |
|---|---|---|
| `@tanstack/react-query` | server-state cache + pagination + lazy fetch (approved S0); wraps the shared fetch client | MSW intercepts the underlying `fetch` |
| `zustand` | small global stores (auth status, language, theme) — no Redux | plain (store reset per test) |
| `nativewind` + `tailwindcss@3.4.17` | Tailwind styling for RN; Tailwind v3 pinned (NativeWind v4 caveat) | n/a |
| `i18next` + `react-i18next` + `expo-localization` | 6-locale i18n + device locale detection | init with test resources |
| `expo-secure-store` | tokens in Keychain/Keystore, never AsyncStorage | jest mock module |
| `@react-native-async-storage/async-storage` | non-sensitive UI prefs only (theme choice); secrets stay in secure-store | official in-memory mock |
| `@react-navigation/native` + `native-stack` | navigation — `App.tsx` is the router shell + auth gate (folder layout) | jest-expo handles native deps |
| `clsx` + `tailwind-merge` + `class-variance-authority` | the `cn()` helper + `cva` variant maps for owned primitives | n/a (pure) |

(Versions are pinned to what Expo SDK 56 requires; see `package.json`.)

## Base URL by environment

`localhost` from inside a simulator means "the simulated device", **not**
your dev machine. Set `EXPO_PUBLIC_API_BASE_URL` per target:

| Target | API base |
|---|---|
| **iOS Simulator** | `http://localhost:3000` |
| **Android emulator** | `http://10.0.2.2:3000` (AVD NAT alias for host loopback) |
| **Physical device** (same Wi-Fi) | `http://<LAN_IP>:3000`, and start Rails with `bin/rails s -b 0.0.0.0` |
| Expo web target | `http://localhost:3000` (subject to backend CORS) |

## Env vars (load-bearing)

- **Only `EXPO_PUBLIC_*` vars are exposed to the JS bundle.** Anything else
  is `undefined` at runtime.
- Read via `process.env.EXPO_PUBLIC_FOO`.
- Add new vars to `.env.example` in the same commit.
- After changing env values, restart Metro: `npx expo start --clear`.

Every var the bundle reads is recorded in `.env.example` and in the
per-feature doc that introduces it; add both in the same change.

## API contract (matches backend)

Every backend response uses the envelope:

```json
{ "status": "success" | "error", "data": {...}, "error": null }
```

- Read `res.ok` for transport success, then read `body.status` for
  application success.
- Render `body.data` on success, `body.error.message` on error.
- Server keys are **snake_case** — match what the backend sends.

## Folder layout

```
mobile/
  index.ts              # first line: import './global.css'
  App.tsx               # router shell + auth gate
  src/
    components/ui/      # RNR owned source — composed, not edited from features
    features/<name>/    # screens + <name>-client.ts + format helpers per feature
    lib/api.ts          # shared fetch client (request/upload/querystring + envelope)
    lib/utils.ts        # cn() helper
```

Don't convert `app.json` to `app.config.ts` unless dynamic config is
actually needed.

## Commands

```bash
npm install
npx expo start            # Metro, port 8081
# then press: i (iOS) · a (Android) · w (web)
npx expo start --clear    # clear Metro cache (after env changes)
npm run typecheck         # type check — tsc --noEmit (not a test runner)
npm test                  # Jest one-shot (iOS + Android projects)
npm run test:watch        # Jest watch
npm run test:coverage     # Jest with coverage (HTML in mobile/coverage/)
```

## Testing

- **Stack:** `jest-expo` + `@testing-library/react-native` + MSW.
- **Coverage policy** (universal — see [`AGENTS.md`](../AGENTS.md) "TEST
  COVERAGE"): target 100% / floor 90% on every dimension
  (lines/branches/functions/statements). The pins live in
  `mobile/jest.config.js` as a ratchet — each holds the highest value the
  suite already clears; raise a pin only after the suite clears the new
  value, never lower one, never red-CI the next commit. Record any
  below-floor dimension's one-line *why* here when it first dips.
- **Two platforms per run.** `jest.config.js` declares two `projects`
  (`jest-expo/ios`, `jest-expo/android`) so the suite is exercised against
  both presets in a single `npm test`.
- **File names:** `<thing>.test.tsx` (or `.ts` for hook-only specs) next to
  the code under test. Integration specs live next to the screen they drive.
- **Three layers, three patterns:**
  - **Component** — `jest.mock(...)` the hook the component depends on;
    drive every render branch.
  - **Hook** — `renderHook` + MSW handlers; assert the state machine.
  - **Integration** — no mocks above the network; MSW intercepts `fetch`.
- **Env vars are read at module load.** A top-level `const` capturing
  `process.env.EXPO_PUBLIC_API_BASE_URL` is evaluated at import, so test
  files cannot set it from `beforeAll`. Set Expo public env vars at the
  **top of `jest.setup.ts`**.
- **Don't add a third-party HTTP/state lib to dodge the test setup.** MSW
  solves the network mock; `useState` + `useEffect` covers the rest.
