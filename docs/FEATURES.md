# Features

One bullet per shipped surface, by feature. Canonical detail lives in
`docs/feature/<name>.md`.

## Platform foundation (Session 1)

- **Health** — `GET /api/v1/health` returns the standard envelope; framework
  `/up` for load balancers. (`docs/02-backend-setup.md`)
- **Multi-tenancy** — schema-per-tenant (ros-apartment), PostGIS in public,
  tenant provisioning rake tasks, isolation mechanism. → [feature/multi-tenancy.md](feature/multi-tenancy.md)
- **Security baseline** — secure_headers/CSP, strict CORS, rack-attack
  throttles, force_ssl, AR encryption, log filtering, Pundit default-deny
  scaffolding. → [feature/security.md](feature/security.md)
- **Internationalization** — Rails I18n, six locales (en/ta/ml/te/mr/hi),
  Accept-Language resolution. (`docs/05-architecture.md`)
- **Public-schema models** — SuperAdmin, Owner (tenant), Subscription,
  TenantRegistry. → [feature/multi-tenancy.md](feature/multi-tenancy.md)

## Mobile foundation (Session 2)

- **App shell** — Expo + React Navigation auth gate (Welcome ↔ Home by session
  status), TanStack Query + SafeArea providers. → [design.md](design.md)
- **Styling** — NativeWind v4 + design tokens; owned `Button` primitive;
  loading/empty/error/offline state views. → [design.md](design.md)
- **i18n** — i18next, 6 locales (en/ta/ml/te/mr/hi), device detection, runtime
  language picker. → [design.md](design.md)
- **API client** — one typed fetch transport, standard envelope, auth +
  `X-Tenant` + `Accept-Language` headers. (`docs/03-mobile-setup.md`)
- **Secure session** — tokens in Keychain/Keystore (expo-secure-store), restore
  on launch. (`mobile/src/stores/auth-store.ts`)

## Auth & onboarding (Session 3 — backend)

- **Registration** — customer self-signup (role forced server-side) → OTP sent.
- **Hardened OTP** — hashed, single-use, expiring, attempt-capped, no enumeration.
- **JWT tokens** — short access + rotating refresh with family reuse-detection;
  logout revokes. → [feature/auth.md](feature/auth.md)
- **Tenant resolution + isolation** — `X-Tenant` + token claim cross-check,
  per-request schema switch. → [feature/multi-tenancy.md](feature/multi-tenancy.md)
- **Profile** — `GET/PATCH /api/v1/me`, Pundit default-deny. → [api.md](api.md), [roles.md](roles.md)
- **Mobile auth** — Welcome → Login/Register/OTP screens, token lifecycle in the
  secure store, role-aware routing (auth stack ↔ app stack), logout. →
  [design.md](design.md)

## Coming

tenants/subscriptions/plan limits (S4) · vehicles &
pricing (S5) · discovery & booking (S6) · driver execution (S7) · reviews (S8)
· leave/payroll/notifications (S9) · reporting & web admin (S10).
