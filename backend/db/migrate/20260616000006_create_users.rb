# Tenant users (tenant schema — NOT excluded, so it lives per tenant and is
# isolated by the schema switch). Roles: customer (self-register), driver +
# owner_admin (created by privileged users). `phone` is encrypted at rest
# (Active Record Encryption, deterministic so it stays queryable + uniquely
# indexable). `phone_verified_at` is set once an OTP is verified. `locale` is
# the user's saved language preference (synced from the app).
class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.string :name, null: false
      t.string :phone, null: false
      t.integer :role, null: false, default: 0
      t.string :password_digest, null: false
      t.datetime :phone_verified_at
      t.string :locale, null: false, default: "en"

      t.timestamps
    end

    add_index :users, :uuid, unique: true
    add_index :users, :phone, unique: true # unique on the deterministic ciphertext
    add_index :users, :role
  end
end
