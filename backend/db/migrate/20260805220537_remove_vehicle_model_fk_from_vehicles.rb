class RemoveVehicleModelFkFromVehicles < ActiveRecord::Migration[8.1]
  def up
    remove_foreign_key :vehicles, :vehicle_models if foreign_key_exists?(:vehicles, :vehicle_models)
  end

  def down
    add_foreign_key :vehicles, :vehicle_models if table_exists?(:vehicle_models)
  end
end
