class ApiDocGrant < ApplicationRecord
  has_secure_token :token, length: 24

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :expires_at, presence: true

  scope :active, -> { where("expires_at > ?", Time.current) }

  def active?
    expires_at > Time.current
  end
end
