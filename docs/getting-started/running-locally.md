# Running locally

The day-to-day workflow once you've done [`prerequisites.md`](prerequisites.md),
[`backend/setup.md`](../backend/setup.md), and [`mobile/setup.md`](../mobile/setup.md).
You run the backend and the mobile app at the same time, in **separate
terminals** (we don't use a process orchestrator on purpose).

## The two-terminal loop

**Terminal 1 — backend API:**

```bash
cd backend
bin/rails server            # http://localhost:3000
```

**Terminal 2 — mobile (Metro bundler):**

```bash
cd mobile
npx expo start              # Metro on :8081 — press i / a / w
```

Leave both running. Edit code; the backend reloads per request, Metro
hot-reloads the app.

## Pointing the app at the backend

The app reads `EXPO_PUBLIC_API_BASE_URL` (only `EXPO_PUBLIC_*` vars reach the
bundle). `localhost` **inside a simulator/emulator means the simulated device**,
not your Mac — so the right value depends on where the app runs:

| You run the app on… | Set `EXPO_PUBLIC_API_BASE_URL` to | Extra step |
|---|---|---|
| iOS Simulator | `http://localhost:3000` | — |
| Android emulator | `http://10.0.2.2:3000` | — (`10.0.2.2` is the emulator's alias for your Mac) |
| Physical phone (same Wi-Fi) | `http://<your-Mac-LAN-IP>:3000` | start Rails with `bin/rails server -b 0.0.0.0` |
| Expo web (browser) | `http://localhost:3000` | the backend's CORS allowlist already includes `:8081` |

Put the value in `mobile/.env` and restart Metro so it's picked up:

```bash
# mobile/.env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

```bash
npx expo start --clear      # --clear is required after changing env values
```

Find your Mac's LAN IP with `ipconfig getifaddr en0`.

**CORS:** browser clients must be on the backend's allowlist. The default
covers local dev (`:5173` web admin, `:8081` Expo web). To add an origin, set
`CORS_ALLOWED_ORIGINS` for the Rails server (see `backend/AGENTS.md` env table).
The native app makes non-CORS requests, so it's unaffected.

## The inner edit → test loop

Work test-first. Run the focused test for what you're touching; run the full
gate before you push.

**Backend:**

```bash
cd backend
bundle exec rspec spec/models/owner_spec.rb     # one file, fast (no coverage gate)
bundle exec rspec spec/requests/                 # a folder
COVERAGE=full bundle exec rspec                  # full suite + 100% line gate (what CI runs)
bin/rubocop -a                                   # autofix style before pushing
```

**Mobile:**

```bash
cd mobile
npm run test:watch                               # re-runs on save
npm test                                         # one-shot, both platform presets
npm run typecheck                                # tsc --noEmit
npm run lint
```

## Resetting the database

When migrations or seeds get into a weird state, rebuild from scratch:

```bash
cd backend
bin/rails db:drop db:prepare      # drop, recreate, migrate dev + test
```

If `db:drop` complains about open connections, stop the server (and any
`rails console`) first, or force it:

```bash
psql -d postgres -c "DROP DATABASE IF EXISTS fleet_management_development WITH (FORCE);"
```

## Tenants (multi-tenant dev)

The public-schema models exist; per-tenant business data starts in Session 5.
Useful commands today (see [`feature/multi-tenancy.md`](../feature/multi-tenancy.md)):

```bash
bin/rails tenants:list            # => No tenants provisioned yet.
bin/rails "tenants:create[acme]"  # create an isolated tenant schema
```

## When something breaks

Most local failures are the mise / system-Ruby mix-up or a stale Metro cache —
both are in [`troubleshooting/backend.md`](../troubleshooting/backend.md). Quick checks:
`cd backend && ruby -v` must say `4.0.6`; `npx expo start --clear` clears Metro.
