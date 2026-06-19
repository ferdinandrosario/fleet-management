# Rotating refresh tokens (tenant schema) — the server-side revocation
# mechanism. Each refresh issues a new row (new jti) in the same `family` and
# revokes the previous one. Presenting an already-revoked jti = token theft →
# the whole family is revoked. The JWT signature authenticates the token; we
# store jti/family/expiry/revoked_at (no plaintext token).
class CreateRefreshTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :refresh_tokens do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.string :jti, null: false
      t.string :family, null: false
      t.datetime :expires_at, null: false
      t.datetime :revoked_at

      t.timestamps
    end

    add_index :refresh_tokens, :jti, unique: true
    add_index :refresh_tokens, :family
  end
end
