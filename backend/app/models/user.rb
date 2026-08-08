# Tenant user (tenant schema): customer, driver, or owner_admin. Authenticates
# by phone + password (+ OTP phone verification). `phone` is encrypted at rest
# (deterministic, so it stays uniquely indexable and queryable).
class User < ApplicationRecord
  include HasPublicUuid

  has_secure_password

  encrypts :phone, deterministic: true

  has_many :one_time_passwords, dependent: :destroy
  has_many :refresh_tokens, dependent: :destroy

  enum :role, { customer: 0, driver: 1, owner_admin: 2 }, default: :customer

  before_validation :normalize_phone

  validates :name, presence: true
  validates :phone, presence: true, uniqueness: true,
            format: { with: /\A\+?[0-9]{10,15}\z/, message: "must be a valid phone number" }
  validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s) }

  def phone_verified?
    phone_verified_at.present?
  end

  def formatted_phone
    return phone if phone.blank?
    phone =~ /\A[6-9]\d{9}\z/ ? "+91#{phone}" : phone
  end

  private

  def normalize_phone
    self.phone = phone.to_s.strip.delete(" ").delete("-").presence
  end
end
