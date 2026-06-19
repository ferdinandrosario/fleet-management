# Tenant registry (public schema): the lean slug → schema_name map used to
# resolve and pin the tenant on every request, without loading the full Owner.
# One row per owner. `slug` matches the owner's slug; `schema_name` is the
# PostgreSQL schema ros-apartment switches into.
class CreateTenantRegistries < ActiveRecord::Migration[8.1]
  def change
    create_table :tenant_registries do |t|
      t.references :owner, null: false, foreign_key: true, index: { unique: true }
      t.string :slug, null: false
      t.string :schema_name, null: false

      t.timestamps
    end

    add_index :tenant_registries, :slug, unique: true
    add_index :tenant_registries, :schema_name, unique: true
  end
end
