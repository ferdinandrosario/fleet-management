# Multi-tenancy: schema-per-tenant (ros-apartment). One physical database;
# each owner ("tenant") gets an isolated PostgreSQL schema. The #1 security
# property of this app — a user for tenant A can never reach tenant B's data —
# rests on this plus token-derived tenant pinning + Pundit (docs/feature/multi-tenancy).
#
# We do NOT use an Apartment elevator (subdomain/middleware) to pick the
# tenant. Tenant is resolved per request from the verified JWT claim
# (cross-checked against the X-Tenant header) and applied with an explicit
# block-form `Apartment::Tenant.switch(slug) { ... }` (Session 3). Resolving
# from middleware would trust the request too early.

Apartment.configure do |config|
  config.use_schemas = true

  # We dump structure.sql (PostGIS needs it), so clone tenant schemas from SQL,
  # not schema.rb.
  config.use_sql = true

  # The shared/public schema holds platform-wide tables. These models always
  # read/write the public schema, never a tenant schema, even inside a `switch`
  # block — so a tenant request can never see another owner's billing/registry.
  config.excluded_models = %w[
    SuperAdmin
    Owner
    Subscription
    TenantRegistry
    Plan
    VehicleModel
  ]

  # Schemas always kept on the search path alongside the active tenant. `public`
  # holds PostGIS + btree_gist (and the shared/excluded tables), so listing it
  # here keeps spatial types resolvable inside every tenant context without the
  # extensions being cloned per tenant (db/migrate enable_postgis_extensions).
  config.persistent_schemas = %w[public]

  config.default_tenant = "public"

  # Known tenants, for `rake apartment:migrate` (apply pending migrations to
  # every tenant schema). Sourced from the tenant registry once it exists
  # (Chunk C); empty until the first owner is provisioned.
  config.tenant_names = lambda do
    if ActiveRecord::Base.connection.table_exists?("tenant_registries")
      TenantRegistry.pluck(:schema_name)
    else
      []
    end
  rescue ActiveRecord::NoDatabaseError, ActiveRecord::ConnectionNotEstablished
    []
  end
end
