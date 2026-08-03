# Owner subscription (public schema) — the SaaS billing record, one per owner.
# Razorpay is the source of truth; status mirrors the Razorpay subscription
# lifecycle and drives owner suspension on lapse (Session 4).
class Subscription < ApplicationRecord
  include HasPublicUuid

  belongs_to :owner
  belongs_to :plan

  enum :status, {
    incomplete: 0, trialing: 1, active: 2, past_due: 3, canceled: 4
  }, default: :incomplete

  validates :owner_id, uniqueness: true
  validates :razorpay_subscription_id, uniqueness: true, allow_nil: true
end
