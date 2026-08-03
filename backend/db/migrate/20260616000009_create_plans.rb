# Subscription plans (public schema) — the SaaS product tiers a super admin
# assigns to owners. `price_paise` is INR in integer paise (never floats).
# `limits` is a jsonb map of resource → cap (e.g. {"vehicles"=>10,"drivers"=>5})
# enforced by PlanLimits. `razorpay_plan_id` links to the Razorpay Plan (null
# until created in the sandbox, behind the payments adapter).
class CreatePlans < ActiveRecord::Migration[8.1]
  def change
    create_table :plans do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.string :name, null: false
      t.integer :tier, null: false, default: 0
      t.integer :price_paise, null: false, default: 0
      t.integer :interval, null: false, default: 0
      t.jsonb :limits, null: false, default: {}
      t.string :razorpay_plan_id
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :plans, :uuid, unique: true
    add_index :plans, :name, unique: true
    add_index :plans, :active
  end
end
