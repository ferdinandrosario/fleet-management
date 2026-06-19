require "rails_helper"

# Proves the schema-per-tenant mechanism: a tenant gets its own PostgreSQL
# schema, switching pins the search path to it, PostGIS stays reachable, and
# dropping removes it. Data-level cross-tenant isolation tests arrive with the
# first tenant-scoped model (Session 3 users); this guards the provisioning +
# switch primitives the isolation guarantee is built on.
RSpec.describe "Multi-tenancy (Apartment)", :tenant_schema do
  let(:slug) { "tenant_spec_acme" }

  def schema_exists?(name)
    quoted = ActiveRecord::Base.connection.quote(name)
    ActiveRecord::Base.connection.select_value(
      "SELECT 1 FROM information_schema.schemata WHERE schema_name = #{quoted}"
    ).present?
  end

  after do
    Apartment::Tenant.drop(slug) if schema_exists?(slug)
  end

  it "creates an isolated schema for a tenant" do
    expect { Apartment::Tenant.create(slug) }
      .to change { schema_exists?(slug) }.from(false).to(true)
  end

  it "pins the search path to the tenant inside a switch block" do
    Apartment::Tenant.create(slug)

    Apartment::Tenant.switch(slug) do
      search_path = ActiveRecord::Base.connection.select_value("SHOW search_path")
      expect(search_path).to include(slug)
    end
  end

  it "keeps PostGIS (public schema) visible inside a tenant" do
    Apartment::Tenant.create(slug)

    Apartment::Tenant.switch(slug) do
      version = ActiveRecord::Base.connection.select_value("SELECT postgis_version()")
      expect(version).to be_present
    end
  end

  it "drops the tenant schema" do
    Apartment::Tenant.create(slug)

    expect { Apartment::Tenant.drop(slug) }
      .to change { schema_exists?(slug) }.from(true).to(false)
  end
end
