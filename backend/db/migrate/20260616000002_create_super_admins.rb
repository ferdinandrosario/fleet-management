# Platform operators (public schema). They manage owners + billing and CANNOT
# read tenant business data. `uuid` is the externally exposed identifier
# (non-enumerable); the bigint PK stays internal (backend/AGENTS.md Database).
class CreateSuperAdmins < ActiveRecord::Migration[8.1]
  def change
    create_table :super_admins do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.string :email, null: false
      t.string :password_digest, null: false

      t.timestamps
    end

    add_index :super_admins, :uuid, unique: true
    add_index :super_admins, :email, unique: true
  end
end
