class CreateVehicleModels < ActiveRecord::Migration[8.1]
  def change
    create_table :vehicle_models do |t|
      t.string :uuid, null: false, index: { unique: true }
      t.string :name
      t.string :make
      t.integer :category
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :vehicle_models, [ :make, :name ], unique: true
  end
end
