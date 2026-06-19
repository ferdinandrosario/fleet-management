# Owner = tenant (public schema). One business; maps to one isolated tenant
# schema via its tenant_registry. `slug` doubles as the PostgreSQL schema name,
# so it's constrained to a safe identifier. Lifecycle: pending → active →
# suspended (billing lapse) → cancelled (offboarded).
class Owner < ApplicationRecord
  include HasPublicUuid

  has_one :subscription, dependent: :destroy
  has_one :tenant_registry, dependent: :destroy

  enum :status, { pending: 0, active: 1, suspended: 2, cancelled: 3 }, default: :pending

  before_validation :normalize_slug

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true,
            format: {
              with: /\A[a-z][a-z0-9_]*\z/,
              message: "must start with a letter and use only lowercase letters, numbers, or underscores"
            }

  private

  def normalize_slug
    self.slug = slug.to_s.strip.downcase.presence
  end
end
