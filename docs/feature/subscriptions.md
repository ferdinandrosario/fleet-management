# Feature: Tenants, Subscriptions & Plan Limits (Session 4)

Source of truth for platform super-admin owner/tenant management, subscription tiers, and plan resource cap enforcement.

## Architecture & Isolation

Platform super-admins operate in the **public schema** with no direct access to tenant business data.
Authentication uses Bearer JWT access tokens carrying `role: "super_admin"` and `tenant: "public"`.

```
SuperAdmin (public schema)
   │
   ├── POST /api/v1/super_admin/login          ──▶ JWT (role: super_admin, tenant: public)
   ├── POST /api/v1/super_admin/owners         ──▶ TenantProvisioningService
   │                                                 ├─ Create Owner (public)
   │                                                 ├─ Create TenantRegistry (public)
   │                                                 ├─ Create Subscription (public)
   │                                                 ├─ Apartment::Tenant.create(slug)
   │                                                 └─ Create initial owner_admin User (tenant schema)
   ├── GET/PATCH /api/v1/super_admin/owners
   ├── GET/POST/PATCH /api/v1/super_admin/plans
   └── GET/PATCH /api/v1/super_admin/subscriptions
```

## Services

### 1. `TenantProvisioningService`
Handles end-to-end tenant setup atomically:
- Validates owner parameters (`name`, `slug`).
- Creates `Owner`, `TenantRegistry`, and `Subscription` in the public schema.
- Provisions a new PostgreSQL schema via `Apartment::Tenant.create(slug)`.
- Switches context to `slug` schema and creates the initial `owner_admin` `User`.
- Automatically rolls back database records and drops created schema if setup fails.

### 2. `PlanLimitService`
Enforces resource caps (e.g. max vehicles, max drivers) configured in `Plan#limits`:
- `PlanLimitService.check(owner, resource, current_count:)` — returns `Result(allowed:, limit:, current:, error:)`.
- `PlanLimitService.enforce!(owner, resource, current_count:)` — raises `PlanLimitExceededError` when a cap is hit.
- A `nil` limit in `Plan#limits` represents unlimited access.

## Authorization & Policies
Driven by Pundit default-deny:
- `OwnerPolicy` — Gated to `Current.super_admin`.
- `PlanPolicy` — Gated to `Current.super_admin`.
- `SubscriptionPolicy` — Gated to `Current.super_admin`.

## API Reference

| Method | Endpoint | Action |
|---|---|---|
| `POST` | `/api/v1/super_admin/login` | SuperAdmin email/password authentication |
| `GET` | `/api/v1/super_admin/owners` | List all owners with Pagy pagination |
| `GET` | `/api/v1/super_admin/owners/:uuid` | Get detailed owner status and subscription |
| `POST` | `/api/v1/super_admin/owners` | Provision a new tenant and owner account |
| `PATCH` | `/api/v1/super_admin/owners/:uuid/status` | Update owner status (`pending`, `active`, `suspended`, `cancelled`) |
| `GET` | `/api/v1/super_admin/plans` | List active/available subscription plans |
| `POST` | `/api/v1/super_admin/plans` | Create a new subscription plan tier |
| `PATCH` | `/api/v1/super_admin/plans/:uuid` | Update plan attributes or resource limits |
| `GET` | `/api/v1/super_admin/subscriptions/:uuid` | Get subscription details |
| `PATCH` | `/api/v1/super_admin/subscriptions/:uuid` | Update subscription status or switch plan |
