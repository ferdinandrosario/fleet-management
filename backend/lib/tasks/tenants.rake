# Tenant provisioning (schema-per-tenant via ros-apartment). Thin wrappers
# around Apartment so onboarding/offboarding has a documented, repeatable
# command surface (docs/runbook). Full programmatic provisioning — with the
# public registry row, seeds, and the first owner login — lands as a service
# in Session 4; these tasks are the operator-facing primitives.
#
#   bin/rails tenants:list
#   bin/rails "tenants:create[acme]"
#   bin/rails "tenants:drop[acme]"
#   bin/rails apartment:migrate         # apply pending migrations to every tenant
namespace :tenants do
  desc "List provisioned tenant schemas"
  task list: :environment do
    schemas = Apartment.tenant_names
    if schemas.empty?
      puts "No tenants provisioned yet."
    else
      puts "Tenants (#{schemas.size}):"
      schemas.each { |s| puts "  - #{s}" }
    end
  end

  desc "Create a tenant schema: tenants:create[slug]"
  task :create, [ :slug ] => :environment do |_task, args|
    slug = args.fetch(:slug)
    Apartment::Tenant.create(slug)
    puts "✔ Created tenant schema '#{slug}'."
  end

  desc "Drop a tenant schema (destructive): tenants:drop[slug]"
  task :drop, [ :slug ] => :environment do |_task, args|
    slug = args.fetch(:slug)
    Apartment::Tenant.drop(slug)
    puts "✔ Dropped tenant schema '#{slug}'."
  end
end
