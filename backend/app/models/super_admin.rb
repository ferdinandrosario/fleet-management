# Platform operator (public schema). Manages owners and their subscriptions;
# has no access to tenant business data (enforced by Pundit policies, Session 4).
class SuperAdmin < ApplicationRecord
  include HasPublicUuid

  has_secure_password

  before_validation :normalize_email

  validates :email, presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase.presence
  end
end
