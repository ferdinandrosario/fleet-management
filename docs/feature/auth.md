# Feature: Auth & onboarding

Phone + password authentication for tenant users (customer/driver/owner_admin),
with OTP phone verification and rotating JWTs. Endpoints: see [api/reference.md](../api/reference.md);
roles: see [security/roles-and-permissions.md](../security/roles-and-permissions.md).

## Why custom JWT (not devise-jwt)

We need rotating refresh + server-side revocation + a tenant claim baked into the
token. devise-jwt is built around Devise's session model; bolting that on fights
the library and is hard to get to 100% coverage. A small explicit token service
(`bcrypt` + the `jwt` gem) is more auditable and fully testable. Tradeoff: we own
more code — mitigated by tests + brakeman.

## Tokens

| | Lifetime | Carries | Revocation |
|---|---|---|---|
| **access** | 15 min (`JwtService::ACCESS_TTL`) | `sub` (user uuid), `role`, `tenant`, `jti`, `exp` | none — short-lived by design |
| **refresh** | 30 days, **rotating** | `sub`, `tenant`, `jti`, `family`, `exp` | DB-tracked (`RefreshToken`) |

`JwtService` signs with `secret_key_base` (HS256). `AuthTokenService` issues +
rotates: each refresh revokes the old `jti` and issues a new one in the same
`family`. **Presenting an already-revoked jti = theft → the whole family is
revoked** (`AuthTokenService.rotate`). Logout revokes all of a user's refresh
tokens.

## Hardened OTP (`OtpService`)

Phone verification codes are **random, hashed (bcrypt), single active per user,
short expiry (10 min), attempt-capped (5), single-use**. Codes are sent via the
`Notifier` adapter (mock/log in dev; live SMS in Session 9). `create` (request a
code) never reveals whether the phone exists — **no user enumeration**. Per-phone/
IP request throttling is rack-attack's job (`config/initializers/rack_attack.rb`).

## Tenant resolution + isolation (request path)

```
X-Tenant header → TenantRegistry lookup (public) → reject unknown (404)
  → Current.tenant = slug → Apartment::Tenant.switch(schema) { … }   (TenantResolution)
    → Bearer access token → decode → require type=access AND tenant == Current.tenant
      → load User by uuid *inside the tenant schema*                 (Authentication)
        → Pundit authorize (default-deny)                           (AuthenticatedController)
```

A token's `tenant` claim must equal the resolved tenant, and the user is loaded
inside the tenant schema — so **an alpha token can't reach beta** (proven in
`spec/requests/api/v1/cross_tenant_isolation_spec.rb`).

## Authorization

Pundit default-deny: `ApplicationPolicy` denies everything; subclasses open
specific actions. `AuthenticatedController` runs `after_action :verify_authorized`
(an action that forgets to `authorize` fails). Role + tenant come from the
verified token (`Current.user` / `Current.tenant`), never from params (e.g.
self-registration forces `role: customer`).

## Threat-model coverage (updates [security/threat-model.md](../security/threat-model.md))

- **T2 broken auth / token theft** — short access + rotating refresh + family
  revocation on reuse. ✅
- **T3 OTP abuse** — hashed, single-use, expiring, attempt-capped + throttled;
  no enumeration. ✅
- **T4 broken authz / priv-esc** — Pundit default-deny; role/tenant from token;
  strict params. ✅
- **T1 cross-tenant** — token tenant claim cross-checked + tenant-schema load. ✅

## Data (tenant schema)

`users` (phone **encrypted, deterministic**; role enum; `password_digest`;
`phone_verified_at`; `locale`), `one_time_passwords` (hashed code, expiry,
attempts), `refresh_tokens` (jti, family, expiry, revoked_at). All tenant-scoped.

## How to extend

New role-gated endpoint: subclass `AuthenticatedController`, add a Pundit policy
(default-deny), `authorize` in every action, scope queries to `Current` /
tenant. Add localized messages to all six `config/locales/*.yml`.
