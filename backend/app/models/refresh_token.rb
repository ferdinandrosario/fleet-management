# A rotating refresh token record (tenant schema) — the revocation mechanism.
# Issue/rotate/revoke logic lives in the auth services; the model holds state.
class RefreshToken < ApplicationRecord
  belongs_to :user

  scope :active, -> { where(revoked_at: nil).where(expires_at: Time.current..) }

  def revoked?
    revoked_at.present?
  end

  def active?
    !revoked? && expires_at > Time.current
  end
end
