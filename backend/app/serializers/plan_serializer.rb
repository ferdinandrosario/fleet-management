# Serializes subscription plans (Session 4).
module PlanSerializer
  module_function

  def call(plan)
    return nil if plan.nil?

    {
      id: plan.uuid,
      name: plan.name,
      tier: plan.tier,
      interval: plan.interval,
      price_paise: plan.price_paise,
      limits: plan.limits || {},
      active: plan.active
    }
  end
end
