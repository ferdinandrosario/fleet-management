class RemoveVehicleModelFkFromVehicles < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :vehicles, :vehicle_models
  end
end
