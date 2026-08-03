# Pricing and discount rules for a vehicle (tenant schema).
# Overrides hourly/daily rates or applies percentage discounts based on duration.
class PricingRule < ApplicationRecord
  include HasPublicUuid

  belongs_to :vehicle

  validates :min_duration_hours, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :discount_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :override_hourly_rate_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :override_daily_rate_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true

  scope :active, -> { where(active: true) }
end
