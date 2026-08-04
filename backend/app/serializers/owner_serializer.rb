# Serializes tenant owners (Session 4).
module OwnerSerializer
  module_function

  def call(owner, super_admin: false)
    return nil if owner.nil?

    data = {
      id: owner.uuid,
      name: owner.name,
      address: owner.address,
      slug: owner.slug,
      status: owner.status,
      subscription: SubscriptionSerializer.call(owner.subscription),
      created_at: owner.created_at.iso8601
    }

    data[:company_name] = owner.company_name if super_admin
    data
  end
end
