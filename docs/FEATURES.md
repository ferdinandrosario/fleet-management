# Features

One bullet per shipped surface, by feature. Canonical detail lives in
`docs/feature/<name>.md`.

## Platform foundation (Session 1)

- **Health** — `GET /api/v1/health` returns the standard envelope; framework
  `/up` for load balancers. (`docs/backend/setup.md`)
- **Multi-tenancy** — schema-per-tenant (ros-apartment), PostGIS in public,
  tenant provisioning rake tasks, isolation mechanism. → [feature/multi-tenancy.md](feature/multi-tenancy.md)
- **Security baseline** — secure_headers/CSP, strict CORS, rack-attack
  throttles, force_ssl, AR encryption, log filtering, Pundit default-deny
  scaffolding. → [security/threat-model.md](security/threat-model.md)
- **Internationalization** — Rails I18n, six locales (en/ta/ml/te/mr/hi),
  Accept-Language resolution. (`docs/architecture/overview.md`)
- **Public-schema models** — SuperAdmin, Owner (tenant), Subscription,
  TenantRegistry. → [feature/multi-tenancy.md](feature/multi-tenancy.md)

## Mobile foundation (Session 2)

- **App shell** — Expo + React Navigation auth gate (Welcome ↔ Home by session
  status), TanStack Query + SafeArea providers. → [mobile/design.md](mobile/design.md)
- **Styling** — NativeWind v4 + design tokens; owned `Button` primitive;
  loading/empty/error/offline state views. → [mobile/design.md](mobile/design.md)
- **Theming** — four-state Light / Dark / AMOLED Black / System toggle
  (light stays the sunlight-first default; Black renders a true-`#000`
  canvas for OLED screens), persisted per device. → [mobile/design.md](mobile/design.md)
- **i18n** — i18next, 6 locales (en/ta/ml/te/mr/hi), device detection, runtime
  language picker. → [mobile/design.md](mobile/design.md)
- **API client** — one typed fetch transport, standard envelope, auth +
  `X-Tenant` + `Accept-Language` headers. (`docs/mobile/setup.md`)
- **Secure session** — tokens in Keychain/Keystore (expo-secure-store), restore
  on launch. (`mobile/src/stores/auth-store.ts`)

## Auth & onboarding (Session 3 — backend)

- **Registration** — customer self-signup (role forced server-side) → OTP sent.
- **Hardened OTP** — hashed, single-use, expiring, attempt-capped, no enumeration.
- **JWT tokens** — short access + rotating refresh with family reuse-detection;
  logout revokes. → [feature/auth.md](feature/auth.md)
- **Tenant resolution + isolation** — `X-Tenant` + token claim cross-check,
  per-request schema switch. → [feature/multi-tenancy.md](feature/multi-tenancy.md)
- **Profile** — `GET/PATCH /api/v1/me`, Pundit default-deny. → [api/reference.md](api/reference.md), [security/roles-and-permissions.md](security/roles-and-permissions.md)
- **Mobile auth** — Welcome → Login/Register/OTP screens, token lifecycle in the
  secure store, role-aware routing (auth stack ↔ app stack), logout. →
  [mobile/design.md](mobile/design.md)

## Tenants, Subscriptions & Plan Limits (Session 4)

- **SuperAdmin Auth & Management** — `POST /api/v1/super_admin/login`, Bearer JWT access tokens for public-schema platform operators. → [feature/subscriptions.md](feature/subscriptions.md)
- **End-to-End Tenant Provisioning** — `TenantProvisioningService` creates Owner + Registry + Subscription in public schema, creates PostgreSQL schema (`Apartment::Tenant.create`), and initializes `owner_admin` User inside the tenant schema. → [feature/subscriptions.md](feature/subscriptions.md)
- **Plan Limits Enforcement** — `PlanLimitService` checks and enforces resource caps defined in `Plan#limits`. → [feature/subscriptions.md](feature/subscriptions.md)
- **SuperAdmin APIs** — Paginated owner list/show/status updates, subscription plan CRUD, and owner subscription management (`GET/POST/PATCH /api/v1/super_admin/*`). → [feature/subscriptions.md](feature/subscriptions.md)

## Vehicles, Availability, Pricing & Discounts (Session 5)

- **Tenant Vehicle Fleet Management** — `GET/POST/PATCH/DELETE /api/v1/vehicles`, schema-isolated vehicle listings supporting tractors, JCBs, heavy vehicles, buses, cranes, and harvesters. → [feature/vehicles.md](feature/vehicles.md)
- **Plan Vehicle Quota Enforcement** — `VehiclesController#create` checks `PlanLimitService` before creating listings and returns `code: "plan_limit_exceeded"` (HTTP 403) when cap is met. → [feature/vehicles.md](feature/vehicles.md)
- **Availability & Holds Management** — `GET/POST/DELETE /api/v1/vehicles/:id/availabilities`, schedule maintenance holds or booked date ranges. → [feature/vehicles.md](feature/vehicles.md)
- **Tiered Discounts & Pricing Rules** — `GET/POST/DELETE /api/v1/vehicles/:id/pricing_rules`, configure duration-based rate overrides or percentage discounts. → [feature/vehicles.md](feature/vehicles.md)
- **Instant Rental Quote Engine** — `GET /api/v1/vehicles/:id/quote?hours=X&days=Y`, `PricingCalculatorService` computes base rates and applies discount rules. → [feature/vehicles.md](feature/vehicles.md)

## Coming

discovery & booking (S6) · driver execution (S7) · reviews (S8) · leave/payroll/notifications (S9) · reporting & web admin (S10).
