# Owners = tenants (public schema). Each owner is one business and maps to one
# isolated tenant schema (see tenant_registries). `slug` is the schema name and
# is validated to a safe identifier. `status` drives lifecycle (pending →
# active → suspended/cancelled). `uuid` is the external identifier.
class CreateOwners < ActiveRecord::Migration[8.1]
  def change
    create_table :owners do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.string :name, null: false
      t.string :slug, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :owners, :uuid, unique: true
    add_index :owners, :slug, unique: true
    add_index :owners, :status # filtered in the super-admin owner list
  end
end
