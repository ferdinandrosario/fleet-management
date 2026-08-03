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

## Discovery, Booking & Payments (Session 6)

- **Location Proximity Vehicle Search** — `GET /api/v1/discovery/vehicles`, PostGIS spatial search filtering by latitude/longitude, radius_km, category, and date range availability. → [feature/bookings.md](feature/bookings.md)
- **Reservation Booking Lifecycle** — `GET/POST /api/v1/bookings`, `GET/PATCH /api/v1/bookings/:id`, creates reservations in `pending_payment` status and calculates advance deposit requirements. → [feature/bookings.md](feature/bookings.md)
- **Advance Token Payment Verification** — `POST /api/v1/bookings/:id/pay_advance`, `PaymentVerificationService` verifies payment token and promotes booking to `confirmed` status. → [feature/bookings.md](feature/bookings.md)
- **Reservation Cancellation** — `PATCH /api/v1/bookings/:id/cancel`, cancels active bookings and handles deposit refund status. → [feature/bookings.md](feature/bookings.md)

## Driver Work Execution & GPS Tracking (Session 7)

- **Driver Job Assignment** — `POST /api/v1/bookings/:id/assign_driver`, `JobExecutionService` assigns verified driver users to active bookings. → [feature/driver-execution.md](feature/driver-execution.md)
- **Meter Reading Job Lifecycle** — `POST /api/v1/bookings/:id/start_job`, `POST /api/v1/bookings/:id/finish_job`, records odometer/hour meter readings and manages `in_progress` → `completed` states. → [feature/driver-execution.md](feature/driver-execution.md)
- **Real-Time GPS Telemetry Ingestion** — `POST /api/v1/bookings/:id/gps_pings`, `GpsTrackingService` ingests live driver location pings and updates vehicle map coordinates. → [feature/driver-execution.md](feature/driver-execution.md)
- **Live Location Tracking Trail** — `GET /api/v1/bookings/:id/tracking`, returns real-time driver coordinates and chronological route history. → [feature/driver-execution.md](feature/driver-execution.md)

## Completion Photos, Reviews & Rating Aggregation (Session 8)

- **Booking Review & Proof Photo Submission** — `POST /api/v1/bookings/:id/review`, `ReviewService` validates completed booking and records rating, comment, and proof photo. → [feature/reviews.md](feature/reviews.md)
- **Automatic Rating Score Aggregation** — `Vehicle#update_rating_stats!` updates vehicle `average_rating` and `reviews_count` on review submission. → [feature/reviews.md](feature/reviews.md)
- **Vehicle Review Listing** — `GET /api/v1/vehicles/:id/reviews`, returns paginated customer feedback and aggregate rating summary. → [feature/reviews.md](feature/reviews.md)

## Driver Leave Management & Payroll Settlement (Session 9)

- **Driver Leave Application & Approval** — `POST /api/v1/driver_leaves`, `PATCH /api/v1/driver_leaves/:id/status`, `DriverLeaveService` manages driver leave requests and owner admin approvals. → [feature/payroll-and-leave.md](feature/payroll-and-leave.md)
- **Automated Driver Payroll Calculation** — `POST /api/v1/driver_payrolls/calculate`, `PayrollService` aggregates completed booking hours, base earnings cut (40%), bonuses, and deductions. → [feature/payroll-and-leave.md](feature/payroll-and-leave.md)
- **Payroll Settlement Payout** — `PATCH /api/v1/driver_payrolls/:id/pay`, transitions payroll settlement state to paid. → [feature/payroll-and-leave.md](feature/payroll-and-leave.md)

## Coming

reporting, dashboards, exports + web admin (S10).
