# Serializes tenant owners (Session 4).
module OwnerSerializer
  module_function

  def call(owner)
    return nil if owner.nil?

    {
      id: owner.uuid,
      name: owner.name,
      slug: owner.slug,
      status: owner.status,
      subscription: SubscriptionSerializer.call(owner.subscription),
      created_at: owner.created_at.iso8601
    }
  end
end
