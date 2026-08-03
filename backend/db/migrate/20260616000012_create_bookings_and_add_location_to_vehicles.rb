# Migration for Location-Based Discovery & Booking Management (Session 6).
class CreateBookingsAndAddLocationToVehicles < ActiveRecord::Migration[8.1]
  def change
    # Add spatial location columns to vehicles table (tenant schema)
    add_column :vehicles, :latitude, :decimal, precision: 10, scale: 6
    add_column :vehicles, :longitude, :decimal, precision: 10, scale: 6
    add_column :vehicles, :address, :string

    add_index :vehicles, [ :latitude, :longitude ]

    create_table :bookings do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.references :vehicle, null: false, foreign_key: { on_delete: :restrict }
      t.references :customer, null: false, foreign_key: { to_table: :users, on_delete: :restrict }
      t.references :driver, foreign_key: { to_table: :users, on_delete: :nullify }

      t.datetime :start_time, null: false
      t.datetime :end_time, null: false
      t.string :pickup_address
      t.decimal :pickup_latitude, precision: 10, scale: 6
      t.decimal :pickup_longitude, precision: 10, scale: 6

      t.integer :status, null: false, default: 0
      t.integer :payment_status, null: false, default: 0

      t.integer :total_cents, null: false, default: 0
      t.integer :advance_cents, null: false, default: 0

      t.string :razorpay_order_id
      t.string :razorpay_payment_id

      t.timestamps
    end

    add_index :bookings, :uuid, unique: true
    add_index :bookings, :status
    add_index :bookings, :payment_status
    add_index :bookings, [ :start_time, :end_time ]
    add_index :bookings, :razorpay_order_id
  end
end
