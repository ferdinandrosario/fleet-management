# Resolves the tenant for every request from the `X-Tenant` header, rejects
# unknown tenants, and runs the action inside the tenant's schema (block-form
# switch — never switch! outside the console). This is layer 1+2 of the
# isolation guarantee (docs/feature/multi-tenancy.md). The tenant is then
# cross-checked against the JWT claim in the Authentication concern.
module TenantResolution
  extend ActiveSupport::Concern

  included do
    around_action :resolve_and_switch_tenant
  end

  private

  def resolve_and_switch_tenant(&block)
    slug = request.headers["X-Tenant"].to_s.strip
    registry = TenantRegistry.find_by(slug: slug) if slug.present?

    if registry.nil?
      return render_error(
        code: "unknown_tenant",
        message: I18n.t("errors.unknown_tenant"),
        status: :not_found
      )
    end

    Current.tenant = registry.slug
    Apartment::Tenant.switch(registry.schema_name, &block)
  end
end
