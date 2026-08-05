class AddVehicleModelToVehicles < ActiveRecord::Migration[8.1]
  def change
    add_reference :vehicles, :vehicle_model, null: true, foreign_key: true
  end
end
