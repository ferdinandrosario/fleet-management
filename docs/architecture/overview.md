# Architecture

## Shape

API-only Rails backend serving three clients (mobile, web admin, and — for
health/automation — anything that speaks HTTP). No server-rendered HTML; every
response is the standard JSON envelope. Clients hold their own UI and state.

```
mobile (Expo) ─┐
web (Vite)┼─▶  Rails 8.1 API  ─▶  PostgreSQL 18 + PostGIS
                │     (api_only)          (schema-per-tenant)
                │       │
                │       ├─ Solid Queue (jobs), Solid Cache, Solid Cable
                │       └─ Razorpay adapter (sandbox), Notifier adapter (mock)
```

**Why API-only:** the clients are independent apps (native mobile, SPA admin),
so the backend renders no views — it's a pure JSON API. This keeps one contract
(the envelope) and lets each client own its rendering and i18n.

## Request flow (current)

```
Request
  → Rack::Attack (throttle; safelist health)            initializers/rack_attack.rb
  → Rack::Cors (allowlist)                               initializers/cors.rb
  → SecureHeaders (CSP + hardening on the response)      initializers/secure_headers.rb
  → Router (/api/v1/…)                                   config/routes.rb
  → ApplicationController
       around_action :switch_locale (Accept-Language)    application_controller.rb
       [Session 3] authenticate → resolve + switch tenant
       [Session 3+] Pundit authorize (default-deny)
  → Controller action → service/model → serializer
  → Standard envelope { status, data, error }
```

The full auth + tenant-resolution flow (JWT, refresh rotation, `X-Tenant` +
claim cross-check, `Apartment::Tenant.switch`) lands in Session 3 and is
documented in `docs/feature/auth.md` then.

## Layers (backend)

Controllers (thin: params → one service/model → serializer) · Services
(orchestration, `.call`) · Serializers (the on-the-wire shape) · Models (domain
state only). Rules: `backend/AGENTS.md`.

## Response envelope

Every response, success or error:

```json
{ "status": "success" | "error", "data": {…}, "error": null }
```

Centralized on `ApplicationController` (`render_success` / `render_error`) so
REST responses can't drift. Validation errors carry `error.fields`.

## Multi-tenancy & security

The two cross-cutting concerns have their own canonical docs:
[multi-tenancy](../feature/multi-tenancy.md) (schema-per-tenant, isolation,
runbook) and [security](../security/threat-model.md) (threat model + controls).

## Internationalization

English locale (`en` base/fallback). Backend
messages resolve through Rails I18n (`config/locales/*.yml`), locale chosen per
request from `Accept-Language`. No hard-coded user-facing strings.
