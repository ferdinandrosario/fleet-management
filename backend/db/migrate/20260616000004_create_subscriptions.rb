# Owner subscriptions (public schema) — the SaaS billing record. One per owner.
# Razorpay is the source of truth; `razorpay_subscription_id` links to it and is
# null until the subscription is created in Razorpay (Session 4, sandbox).
# `status` mirrors the Razorpay subscription lifecycle. Plans/tiers/limits land
# as a separate `plans` table in Session 4.
class CreateSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :subscriptions do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.references :owner, null: false, foreign_key: true, index: { unique: true }
      t.integer :status, null: false, default: 0
      t.string :razorpay_subscription_id

      t.timestamps
    end

    add_index :subscriptions, :uuid, unique: true
    add_index :subscriptions, :razorpay_subscription_id, unique: true,
              where: "razorpay_subscription_id IS NOT NULL"
  end
end
