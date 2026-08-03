# Serializes pricing rules (Session 5).
module PricingRuleSerializer
  module_function

  def call(rule)
    return nil if rule.nil?

    {
      id: rule.uuid,
      vehicle_id: rule.vehicle.uuid,
      min_duration_hours: rule.min_duration_hours,
      discount_percentage: rule.discount_percentage.to_f,
      override_hourly_rate_cents: rule.override_hourly_rate_cents,
      override_daily_rate_cents: rule.override_daily_rate_cents,
      start_date: rule.start_date&.iso8601,
      end_date: rule.end_date&.iso8601,
      active: rule.active
    }
  end
end
