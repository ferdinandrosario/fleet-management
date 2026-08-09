# Migration for vehicles, vehicle availabilities, and pricing rules (Session 5).
# All tables are tenant-scoped (live inside each tenant schema).
class CreateVehicles < ActiveRecord::Migration[8.1]
  def change
    create_table :vehicles do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.string :name, null: false
      t.integer :category, null: false, default: 0
      t.string :registration_number, null: false
      t.integer :model_year
      t.integer :hourly_rate_paise, null: false, default: 0
      t.integer :daily_rate_paise, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.jsonb :specs, null: false, default: {}

      t.timestamps
    end

    add_index :vehicles, :uuid, unique: true
    add_index :vehicles, :registration_number, unique: true
    add_index :vehicles, :category
    add_index :vehicles, :status

    create_table :vehicle_availabilities do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.references :vehicle, null: false, foreign_key: { on_delete: :cascade }
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false
      t.integer :reason, null: false, default: 0

      t.timestamps
    end

    add_index :vehicle_availabilities, :uuid, unique: true
    add_index :vehicle_availabilities, [ :vehicle_id, :start_time, :end_time ], name: "idx_vehicle_avail_lookup"

    create_table :pricing_rules do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.references :vehicle, null: false, foreign_key: { on_delete: :cascade }
      t.integer :min_duration_hours, null: false, default: 0
      t.decimal :discount_percentage, precision: 5, scale: 2, null: false, default: 0.0
      t.integer :override_hourly_rate_paise
      t.integer :override_daily_rate_paise
      t.date :start_date
      t.date :end_date
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :pricing_rules, :uuid, unique: true
  end
end
