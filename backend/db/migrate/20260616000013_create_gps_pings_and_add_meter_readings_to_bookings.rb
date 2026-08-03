# Migration for Driver Work Execution & Real-Time GPS Tracking (Session 7).
class CreateGpsPingsAndAddMeterReadingsToBookings < ActiveRecord::Migration[8.1]
  def change
    # Meter readings for job execution start and completion
    add_column :bookings, :start_meter_reading, :decimal, precision: 10, scale: 2
    add_column :bookings, :end_meter_reading, :decimal, precision: 10, scale: 2
    add_column :bookings, :job_started_at, :datetime
    add_column :bookings, :job_finished_at, :datetime

    create_table :gps_pings do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.references :booking, null: false, foreign_key: { on_delete: :cascade }
      t.references :driver, null: false, foreign_key: { to_table: :users, on_delete: :cascade }

      t.decimal :latitude, null: false, precision: 10, scale: 6
      t.decimal :longitude, null: false, precision: 10, scale: 6
      t.decimal :speed_kmh, precision: 5, scale: 2, default: 0.0

      t.datetime :recorded_at, null: false

      t.timestamps
    end

    add_index :gps_pings, :uuid, unique: true
    add_index :gps_pings, [ :booking_id, :recorded_at ]
  end
end
