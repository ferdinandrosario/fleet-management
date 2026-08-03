# Fleet Management docs

## What this is

Fleet Management is a **multi-tenant SaaS** that lets commercial-vehicle
owners in India (tractors, JCBs, heavy vehicles, buses) run their rental
business, and lets customers discover, book, and pay for vehicles.

- **Owners** list vehicles + specs + photos, set availability and
  pricing/discounts, create driver logins, and view revenue reports.
- **Customers** browse by location + rating, book, pay a token advance
  (Razorpay), track the job, then upload a completion photo and rate the
  driver/vehicle.
- **Drivers** start work, stream GPS, record kilometres, and complete
  jobs; they also request leave and view payslips.
- **Super admins** (platform operators) manage owners and their
  subscriptions/billing — and **cannot** read any owner's business data.

Each owner is a **tenant**. Tenants are isolated at the database level
(schema-per-tenant via `ros-apartment`): a user for one tenant can never
reach another tenant's data. This is the product's #1 security property.

## Codebases

```
backend/    Rails 8.1.3 API (Ruby 4.0.6) · PostgreSQL + PostGIS · serves all clients
mobile/     Expo / React Native · customer + driver + owner field ops
web-admin/  React (Vite) · super-admin + owner reporting (built last, kept minimal)
docs/       source of truth (this folder)
```

All clients speak the same JSON API. Every response uses one envelope:

```json
{ "status": "success" | "error", "data": {...}, "error": null }
```

The API is versioned under `/api/v1`. A liveness probe at
`GET /api/v1/health` returns the envelope; the framework's `/up` returns
200 for load balancers.

## How it's built — session by session

The app is delivered in numbered sessions, each test-first with docs in
the same step, each ending in a review checkpoint. Paid integrations stay
mocked/sandboxed until the final session.

| Session | Theme |
|---|---|
| 0 | Plan, tradeoffs, threat model (no code) — **done** |
| 1 | Backend foundation + TDD harness + security baseline — **done** |
| 2 | Mobile foundation (nav, i18n, secure storage, API client) — **done** |
| 3 | Auth & onboarding (OTP, JWT, Pundit) — **done** |
| 4 | Tenants, owners, subscriptions, plan limits (super admin) — **done** |
| 5 | Vehicles, availability, pricing, discounts (owner) — **done** |
| 6 | Discovery + booking + payment (customer) — **done** |
| 7 | Driver work execution + GPS tracking — **done** |
| 8 | Completion photos + reviews + rating aggregation — **done** |
| 9 | Leave, payroll, notifications — **done** |
| 10 | Reporting, dashboards, exports + web admin — **done** |
| 11 | Hardening pass (security/perf/coverage/i18n) — **done** |
| 12 | Paid integrations + go-live — **next** |

## Where to go next

`docs/` is organized by **topic folder** — reading order is this table, not
filename prefixes. Set up a fresh box top-to-bottom, or jump to a topic:

| You want to… | Read |
|---|---|
| Install the tools | [getting-started/prerequisites.md](getting-started/prerequisites.md) |
| Run the API | [backend/setup.md](backend/setup.md) |
| Run the mobile app | [mobile/setup.md](mobile/setup.md) |
| Run both together (daily workflow) | [getting-started/running-locally.md](getting-started/running-locally.md) |
| Understand how it fits together | [architecture/overview.md](architecture/overview.md) |
| Read the API contract | [api/reference.md](api/reference.md) |
| Follow the UI / UX / i18n design system | [mobile/design.md](mobile/design.md) |
| See roles & the permission matrix | [security/roles-and-permissions.md](security/roles-and-permissions.md) |
| Check the threat model & controls | [security/threat-model.md](security/threat-model.md) |
| Build / extend / debug a feature | [feature/auth.md](feature/auth.md), [feature/multi-tenancy.md](feature/multi-tenancy.md) |
| Diagnose a failure | [troubleshooting/backend.md](troubleshooting/backend.md) |
| Add a feature (the doc checklist) | [CONTRIBUTING.md](CONTRIBUTING.md) |

Cross-agent rules: [`AGENTS.md`](../AGENTS.md). New topic areas
(`development/` conventions, `operations/` tuning, `deployment/`) are added
under their own folder when their subject lands (Sessions 4+).
