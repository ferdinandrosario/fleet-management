# A hashed, single-use, expiring OTP for phone verification (tenant schema).
# Verification logic (digest compare, attempt counting, consumption) lives in
# OtpService; the model holds state + predicates only.
class OneTimePassword < ApplicationRecord
  MAX_ATTEMPTS = 5

  belongs_to :user

  scope :active, -> { where(consumed_at: nil).where(expires_at: Time.current..) }

  def expired?
    expires_at <= Time.current
  end

  def consumed?
    consumed_at.present?
  end

  def locked?
    attempts >= MAX_ATTEMPTS
  end
end
