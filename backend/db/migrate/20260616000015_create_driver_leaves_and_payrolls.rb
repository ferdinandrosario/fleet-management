# Migration for Leave Management and Driver Payroll (Session 9).
class CreateDriverLeavesAndPayrolls < ActiveRecord::Migration[8.1]
  def change
    create_table :driver_leaves do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.references :driver, null: false, foreign_key: { to_table: :users, on_delete: :cascade }
      t.references :approved_by, foreign_key: { to_table: :users, on_delete: :nullify }

      t.date :start_date, null: false
      t.date :end_date, null: false
      t.text :reason
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :driver_leaves, :uuid, unique: true
    add_index :driver_leaves, [ :driver_id, :start_date, :end_date ]

    create_table :driver_payrolls do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.references :driver, null: false, foreign_key: { to_table: :users, on_delete: :cascade }

      t.date :period_start, null: false
      t.date :period_end, null: false
      t.integer :completed_jobs_count, null: false, default: 0
      t.decimal :total_hours_worked, precision: 10, scale: 2, null: false, default: 0.0
      t.integer :base_pay_cents, null: false, default: 0
      t.integer :bonus_cents, null: false, default: 0
      t.integer :deductions_cents, null: false, default: 0
      t.integer :total_payout_cents, null: false, default: 0
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :driver_payrolls, :uuid, unique: true
    add_index :driver_payrolls, [ :driver_id, :period_start, :period_end ]
  end
end
