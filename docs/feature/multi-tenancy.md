# Feature: Multi-tenancy (schema-per-tenant)

Source of truth for how tenant isolation works. This is the product's #1
security property: **a user for tenant A can never reach tenant B's data.**

## Model

One physical PostgreSQL database. One **schema per tenant** (owner), plus the
shared **public** schema. Implemented with `ros-apartment` (`use_schemas =
true`).

```
public schema (shared)            tenant schema (one per owner, isolated)
  super_admins                      vehicles, bookings, payments, …
  owners            ── slug ──▶     (created Session 5+; identical per tenant)
  subscriptions
  tenant_registries (slug → schema_name)
  PostGIS + btree_gist extensions
```

- **public** holds platform-wide data: super admins, owners (tenants),
  subscriptions, the tenant registry, and the PostGIS/btree_gist extensions.
  These four models are listed in `Apartment.excluded_models`, so they always
  read/write `public` even inside a `switch` block.
- **tenant schemas** hold each owner's business data (added from Session 5).

## Configuration

`config/initializers/apartment.rb`:

| Setting | Value | Why |
|---|---|---|
| `use_schemas` | `true` | schema-per-tenant on one database |
| `use_sql` | `true` | clone tenants from `structure.sql` (PostGIS needs SQL format) |
| `excluded_models` | SuperAdmin, Owner, Subscription, TenantRegistry | shared tables stay in public |
| `persistent_schemas` | `["public"]` | keeps PostGIS reachable in every tenant's search path |
| `default_tenant` | `"public"` | the non-tenant context |
| `tenant_names` | `-> { TenantRegistry.pluck(:schema_name) }` | which schemas `apartment:migrate` touches |

**No Apartment elevator.** We do **not** resolve the tenant from
subdomain/middleware. The tenant is resolved per request from the verified JWT
claim (cross-checked against the `X-Tenant` header) and applied with an
explicit block-form `Apartment::Tenant.switch(slug) { … }` (Session 3).
Resolving from middleware would trust the request before authentication.

## PostGIS-in-public caveat

PostGIS + btree_gist are installed in the **public** schema
(`db/migrate/..._enable_postgis_extensions.rb`), not per tenant. Because
`public` is a persistent schema, the spatial types resolve inside every tenant
context via the search path, and ros-apartment never clones the heavy extension
into each tenant schema. pg_dump writes them as `CREATE EXTENSION IF NOT EXISTS
… WITH SCHEMA public`, so the per-tenant structure load is a no-op.

`structure.sql` is post-processed by `lib/tasks/structure_sql_cleanup.rake`
after every dump (idempotent `CREATE SCHEMA`; re-adds the `CREATE EXTENSION`
lines pg_dump omits under `--schema`). Don't hand-edit `structure.sql`.

## Isolation — defense in depth

Four independent layers, each of which alone prevents a cross-tenant leak:

1. **Request resolution** — exactly one tenant per request; unknown tenants
   rejected (Session 3).
2. **Schema switch** — all tenant work runs inside block-form
   `Apartment::Tenant.switch`; outside it, tenant tables aren't on the search
   path. Never `switch!` outside the console.
3. **Token-derived tenant** — tenant comes from the verified JWT claim, never a
   param; a claim/`X-Tenant` mismatch is rejected (Session 3).
4. **Pundit default-deny + UUID lookups** — no policy ⇒ no access; external ids
   are non-enumerable UUIDs scoped to the current tenant.

**Tests.** `spec/multitenancy_spec.rb` proves the mechanism (create → switch
pins the search path → PostGIS reachable → drop). Data-level cross-tenant
isolation tests (tenant A can't read tenant B's rows) arrive with the first
tenant-scoped model in Session 3.

## Operations / runbook

Ruby is via mise (`cd backend`; `ruby -v` ⇒ `ruby 4.0.5`). Commands:

```bash
# List provisioned tenants
bin/rails tenants:list
# => No tenants provisioned yet.

# Create / drop a tenant schema (low-level primitive; Session 4 adds a
# provisioning service that also writes the registry row + first owner login)
bin/rails "tenants:create[acme]"     # => ✔ Created tenant schema 'acme'.
bin/rails "tenants:drop[acme]"        # => ✔ Dropped tenant schema 'acme'.

# Apply pending migrations to every tenant schema (and public)
bin/rails db:migrate                  # tenants migrate automatically with db:migrate
```

- **Advisory-lock caveat:** running tenant migrations in parallel can race on
  the schema search path. Migrate serially (the default). If you ever shard
  migration across workers, take a Postgres advisory lock per schema first.
- **Database-per-tenant escape hatch:** for stronger isolation you can set
  `Apartment.use_schemas = false` (one database per tenant). Not implemented —
  more cost + ops. Document and get sign-off before switching.

## How to extend

- A new **shared** (public) model: add it, add its name to
  `Apartment.excluded_models` in the **same change** (Apartment constantizes
  the list at boot).
- A new **tenant-scoped** model (Session 5+): just create it normally; it lives
  in every tenant schema automatically. Scope every lookup to the current
  tenant and add a cross-tenant isolation spec.

## Public-schema models (Session 1)

| Model | Key columns | Notes |
|---|---|---|
| `SuperAdmin` | uuid, email, password_digest | `has_secure_password`; no tenant data access |
| `Owner` | uuid, name, slug, status | tenant identity; status pending→active→suspended→cancelled |
| `Subscription` | uuid, owner_id, status, razorpay_subscription_id | one per owner; Razorpay is source of truth |
| `TenantRegistry` | owner_id, slug, schema_name | lean slug→schema map for request resolution |
