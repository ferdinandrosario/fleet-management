# Provisions a new tenant end-to-end (Session 4):
# 1. Public schema: Owner + TenantRegistry + Subscription
# 2. Schema creation: Apartment::Tenant.create(slug)
# 3. Tenant schema: initial owner_admin User
class TenantProvisioningService
  Result = Struct.new(:success, :owner, :tenant_registry, :subscription, :user, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def call(name:, company_name: nil, address: nil, slug:, plan:, owner_name:, owner_phone:, password:, status: :active)
      company_name = company_name.presence || name
      address = address.presence || "Default Address"
      owner = Owner.new(name: name, company_name: company_name, address: address, slug: slug, status: status)
      unless owner.valid?
        return Result.new(success: false, errors: owner.errors.to_hash)
      end

      user = nil
      tenant_registry = nil
      subscription = nil

      ActiveRecord::Base.transaction do
        owner.save!
        tenant_registry = TenantRegistry.create!(owner: owner, slug: owner.slug, schema_name: owner.slug)
        subscription = Subscription.create!(owner: owner, plan: plan, status: :active)
      end

      begin
        Apartment::Tenant.create(owner.slug)

        Apartment::Tenant.switch(owner.slug) do
          user = User.create!(
            name: owner_name,
            phone: owner_phone,
            password: password,
            role: :owner_admin,
            phone_verified_at: Time.current
          )
        end
      rescue StandardError => e
        Apartment::Tenant.drop(owner.slug)
        owner.destroy
        return Result.new(success: false, errors: { base: [ e.message ] })
      end

      Result.new(
        success: true,
        owner: owner,
        tenant_registry: tenant_registry,
        subscription: subscription,
        user: user,
        errors: nil
      )
    end
  end
end
