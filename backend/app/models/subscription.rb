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

  GSTIN_REGEX = /\A[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\z/

  attr_accessor :gstin

  validates :owner_id, uniqueness: true
  validates :razorpay_subscription_id, uniqueness: true, allow_nil: true
  validates :gstin, format: { with: GSTIN_REGEX, message: "is an invalid GSTIN format" }, allow_blank: true, allow_nil: true

  # 18% GST tax breakdown (paise) for Indian B2B invoicing
  def gst_breakdown(same_state: true)
    base_price = plan&.price_paise.to_i
    tax_paise = (base_price * 0.18).round
    if same_state
      { cgst_paise: tax_paise / 2, sgst_paise: tax_paise / 2, igst_paise: 0, total_paise: base_price + tax_paise }
    else
      { cgst_paise: 0, sgst_paise: 0, igst_paise: tax_paise, total_paise: base_price + tax_paise }
    end
  end
end
