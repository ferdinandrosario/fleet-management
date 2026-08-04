# Helpers for request specs that exercise tenant-scoped endpoints. Provisioning
# creates the schema (DDL) + the public registry row, so tag such specs
# `:tenant_schema` (truncation strategy) and drop the schema in an `after`.
module TenantHelpers
  def schema_exists?(name)
    quoted = ActiveRecord::Base.connection.quote(name)
    ActiveRecord::Base.connection.select_value(
      "SELECT 1 FROM information_schema.schemata WHERE schema_name = #{quoted}"
    ).present?
  end

  def provision_tenant(slug)
    Apartment::Tenant.create(slug) unless schema_exists?(slug)
    owner = Owner.create!(name: slug.tr("_", " ").capitalize, company_name: "#{slug.tr('_', ' ').capitalize} Corp", address: "123 Main Street", slug: slug)
    TenantRegistry.create!(owner: owner, slug: slug, schema_name: slug)
    slug
  end

  def drop_tenant(slug)
    Apartment::Tenant.drop(slug) if schema_exists?(slug)
  end

  # Run a block inside a tenant's schema (e.g. to seed or assert tenant data).
  def in_tenant(slug, &block)
    Apartment::Tenant.switch(slug, &block)
  end
end

RSpec.configure { |config| config.include TenantHelpers }
