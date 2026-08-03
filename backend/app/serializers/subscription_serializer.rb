# Serializes subscriptions (Session 4).
module SubscriptionSerializer
  module_function

  def call(subscription)
    return nil if subscription.nil?

    {
      id: subscription.uuid,
      status: subscription.status,
      razorpay_subscription_id: subscription.razorpay_subscription_id,
      plan: PlanSerializer.call(subscription.plan)
    }
  end
end
