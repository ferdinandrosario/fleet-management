# Gives a model a non-enumerable external identifier (`uuid`) distinct from its
# internal bigint PK. Externally exposed ids are UUIDs (security: no sequential
# id enumeration); the bigint PK stays internal (backend/AGENTS.md Database).
#
# The value is assigned at instantiation (after_initialize on new records), so
# every record — including one persisted with a callback-skipping write — has a
# uuid before INSERT, and it's readable immediately without a reload. The column
# is also NOT NULL + unique with a DB-level gen_random_uuid() default as a final
# guard for raw SQL inserts.
module HasPublicUuid
  extend ActiveSupport::Concern

  included do
    after_initialize :assign_uuid, if: :new_record?
    validates :uuid, presence: true, uniqueness: true
  end

  private

  def assign_uuid
    self.uuid ||= SecureRandom.uuid
  end
end
