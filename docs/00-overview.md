# 00 — Overview

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
backend/    Rails 8.1 API (Ruby 4.0.5) · PostgreSQL + PostGIS · serves all clients
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
| 3 | Auth & onboarding (OTP, JWT, Pundit) — **next** |
| 4 | Tenants, owners, subscriptions, plan limits (super admin) |
| 5 | Vehicles, availability, pricing, discounts (owner) |
| 6 | Discovery + booking + payment (customer) |
| 7 | Driver work execution + GPS tracking |
| 8 | Completion photos + reviews + rating aggregation |
| 9 | Leave, payroll, notifications |
| 10 | Reporting, dashboards, exports + web admin |
| 11 | Hardening pass (security/perf/coverage/i18n) |
| 12 | Paid integrations + go-live |

## Where to go next

Follow the numbered guides in order:

1. [`01-prerequisites.md`](01-prerequisites.md) — install the tools
2. [`02-backend-setup.md`](02-backend-setup.md) — run the API
3. [`03-mobile-setup.md`](03-mobile-setup.md) — run the mobile app
4. [`04-running-locally.md`](04-running-locally.md) — daily workflow (both together)
5. [`05-architecture.md`](05-architecture.md) — how it fits together

Then: [`design.md`](design.md) (UI/UX/i18n), the per-feature references under
[`feature/`](feature/), and [`CONTRIBUTING.md`](CONTRIBUTING.md) before your
first change. Rules: [`../AGENTS.md`](../AGENTS.md). `06`–`08` are added when
their subject lands (conventions, tuning, deployment); `09-troubleshooting.md`
already exists for known failure modes.
