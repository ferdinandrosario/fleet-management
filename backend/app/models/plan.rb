# A subscription plan/tier (public schema). Price is INR integer paise; `limits`
# is a resource → cap map enforced by PlanLimits (a missing/nil cap = unlimited).
class Plan < ApplicationRecord
  include HasPublicUuid

  has_many :subscriptions, dependent: :restrict_with_exception

  enum :tier, { basic: 0, pro: 1, enterprise: 2 }, default: :basic
  enum :interval, { monthly: 0, yearly: 1 }, default: :monthly

  validates :name, presence: true, uniqueness: true
  validates :price_paise, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :active, -> { where(active: true) }

  # The cap for a resource, or nil when the plan doesn't limit it (unlimited).
  def limit_for(resource)
    limits[resource.to_s]
  end
end
