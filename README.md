# Fleet Management

Multi-tenant commercial-vehicle booking platform for India (tractors, JCBs,
heavy vehicles, buses). Owners list vehicles; customers browse by location +
rating, book, and pay a token advance; drivers execute and track trips.
Schema-per-tenant isolation, Razorpay payments, six-language UI (English +
Tamil, Malayalam, Telugu, Marathi, Hindi).

Security-first, test-first (100% backend line coverage), docs-first. Built
session-by-session — see the [documentation map](#documentation) and
[`docs/README.md`](docs/README.md).

## New here? Start in this order

1. **[`docs/getting-started/prerequisites.md`](docs/getting-started/prerequisites.md)** — install Ruby
   + Node (via mise), PostgreSQL + PostGIS. Do this first.
2. **[`docs/backend/setup.md`](docs/backend/setup.md)** — empty clone →
   running API. (Quickstart below.)
3. **[`docs/mobile/setup.md`](docs/mobile/setup.md)** — empty clone →
   running mobile app.
4. **[`docs/getting-started/running-locally.md`](docs/getting-started/running-locally.md)** — the daily
   workflow: run backend + mobile together, the edit→test loop.

> **#1 gotcha:** if a command fails with `bundler`/Ruby errors, your shell is
> using macOS's system Ruby 2.6 instead of the project's 4.0.5. Make sure mise
> is activated (`cd backend && ruby -v` must print `ruby 4.0.5`). Details:
> [`docs/troubleshooting/backend.md`](docs/troubleshooting/backend.md).

## Monorepo layout

| Dir | What | Status |
|---|---|---|
| [`backend/`](backend/) | Rails 8.1 API (Ruby 4.0.5, PostgreSQL + PostGIS) | **running** — health endpoint, multi-tenancy, security baseline, public models |
| [`mobile/`](mobile/) | Expo / React Native app (customer · driver · owner) | **running** — nav, NativeWind, i18n, API client, secure session |
| [`web-admin/`](web-admin/) | React (Vite) admin SPA (super-admin · owner reporting) | rules only — built Session 10 |
| [`docs/`](docs/) | Source of truth (topic folders + per-feature files) | grows each session |

Rules every contributor (human or agent) follows: [`AGENTS.md`](AGENTS.md)
(canonical) + the nearest `<dir>/AGENTS.md`; file naming in
[`NAMING-CONVENTIONS.md`](NAMING-CONVENTIONS.md). Before sending a change, read
[`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## Quickstart — backend

Prerequisites: [`docs/getting-started/prerequisites.md`](docs/getting-started/prerequisites.md). Full
walkthrough + expected output: [`docs/backend/setup.md`](docs/backend/setup.md).

```bash
cd backend
bundle install        # => Bundle complete! 32 Gemfile dependencies, 136 gems now installed.
bin/rails db:prepare  # creates + migrates fleet_management_development and _test
bin/rails server      # boots on http://localhost:3000

# in another terminal:
curl -s localhost:3000/api/v1/health
# => {"status":"success","data":{"service":"fleet-management-api","status":"ok"},"error":null}
```

## Quickstart — mobile

Full walkthrough: [`docs/mobile/setup.md`](docs/mobile/setup.md).

```bash
cd mobile
npm install
npx expo start        # Metro on :8081 — press i (iOS) · a (Android) · w (web)
```

The app opens on the **Welcome** screen (app name + language picker). Point it
at your running backend with `EXPO_PUBLIC_API_BASE_URL` — see
[`docs/getting-started/running-locally.md`](docs/getting-started/running-locally.md).

## Quality gates (what CI runs)

```bash
# backend
cd backend
COVERAGE=full bundle exec rspec          # => 60 examples, 0 failures · Line Coverage: 100.0% (75 / 75)
bundle exec brakeman -q                  # => No warnings found
bundle exec bundler-audit check --update # => No vulnerabilities found
bin/rubocop                              # => no offenses detected

# mobile
cd mobile
npm run typecheck                        # => clean
npm run lint                             # => clean
npm test                                 # => Tests: 78 passed (ios + android presets)
```

CI: [`.github/workflows/backend-ci.yml`](.github/workflows/backend-ci.yml) +
[`.github/workflows/mobile-ci.yml`](.github/workflows/mobile-ci.yml). Every gate
blocks (red CI on any failure).

## Documentation

| Page | What it covers | Status |
|---|---|---|
| [`docs/README.md`](docs/README.md) | what the app is, the codebases, the session plan | ✅ |
| [`docs/getting-started/prerequisites.md`](docs/getting-started/prerequisites.md) | tool versions + install/verify | ✅ |
| [`docs/backend/setup.md`](docs/backend/setup.md) | empty clone → running API | ✅ |
| [`docs/mobile/setup.md`](docs/mobile/setup.md) | empty clone → running mobile app | ✅ |
| [`docs/getting-started/running-locally.md`](docs/getting-started/running-locally.md) | daily workflow across both codebases | ✅ |
| `docs/architecture/overview.md` | request flow, layers, why API-only | ✅ |
| `docs/development/conventions.md` | code style + folder + error format | _added when first needed_ |
| `docs/operations/tuning.md` | runtime tunables (formulas, load tiers) | _added when a tunable lands_ |
| `docs/deployment/` | env vars, prod Postgres, deploy | _added in the deploy session_ |
| [`docs/troubleshooting/backend.md`](docs/troubleshooting/backend.md) | symptom → fix per known failure mode | ✅ |
| [`docs/api/reference.md`](docs/api/reference.md) | endpoint reference (params, sample req/res, roles) | ✅ |
| [`docs/security/roles-and-permissions.md`](docs/security/roles-and-permissions.md) | roles + permission matrix (default-deny) | ✅ |
| [`docs/mobile/design.md`](docs/mobile/design.md) | UI libs, UX, tokens, i18n, component/screen inventory | ✅ |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | the per-change checklist | ✅ |
| [`docs/FEATURES.md`](docs/FEATURES.md) | one bullet per shipped surface | ✅ |
| [`docs/feature/`](docs/feature/) | per-feature canonical references (multi-tenancy, security, …) | grows |

## Status

Sessions 0–2 done (plan, backend foundation, mobile foundation). Session 3
(auth & onboarding) is next. **No paid service is wired** — every billable
integration (Razorpay live, SMS/WhatsApp, push, maps, hosting) is mocked or
sandboxed until the final go-live session.
