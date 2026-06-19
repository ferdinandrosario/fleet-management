# One-time passwords for phone verification (tenant schema). The code is stored
# hashed (code_digest) — never plaintext. Single-use (consumed_at), short expiry
# (expires_at), and attempt-capped (attempts) — the hardened-OTP controls from
# the threat model. Per-phone/IP request throttling is handled by rack-attack.
class CreateOneTimePasswords < ActiveRecord::Migration[8.1]
  def change
    create_table :one_time_passwords do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.string :code_digest, null: false
      t.datetime :expires_at, null: false
      t.datetime :consumed_at
      t.integer :attempts, null: false, default: 0

      t.timestamps
    end
  end
end
