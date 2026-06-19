# Tenant registry (public schema): the lean slug → schema_name map used to
# resolve and pin the tenant on every request (Session 3). One row per owner.
class TenantRegistry < ApplicationRecord
  belongs_to :owner

  before_validation :normalize

  validates :owner_id, uniqueness: true
  validates :slug, presence: true, uniqueness: true,
            format: { with: /\A[a-z][a-z0-9_]*\z/ }
  validates :schema_name, presence: true, uniqueness: true

  private

  def normalize
    self.slug = slug.to_s.strip.downcase.presence
    self.schema_name = schema_name.to_s.strip.downcase.presence
  end
end
