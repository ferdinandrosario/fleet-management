# Migration for Completion Photos, Reviews & Rating Aggregation (Session 8).
class CreateReviewsAndAddRatingsToVehicles < ActiveRecord::Migration[8.1]
  def change
    # Rating aggregation counters on vehicles table (tenant schema)
    add_column :vehicles, :average_rating, :decimal, precision: 3, scale: 2, default: 0.0, null: false
    add_column :vehicles, :reviews_count, :integer, default: 0, null: false

    create_table :reviews do |t|
      t.uuid :uuid, null: false, default: -> { "gen_random_uuid()" }
      t.references :booking, null: false, index: { unique: true }, foreign_key: { on_delete: :cascade }
      t.references :vehicle, null: false, foreign_key: { on_delete: :cascade }
      t.references :customer, null: false, foreign_key: { to_table: :users, on_delete: :cascade }
      t.references :driver, foreign_key: { to_table: :users, on_delete: :nullify }

      t.integer :rating, null: false
      t.text :comment
      t.string :completion_photo_url

      t.timestamps
    end

    add_index :reviews, :uuid, unique: true
    add_index :reviews, [ :vehicle_id, :rating ]
  end
end
