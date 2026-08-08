# Serializes global vehicle model catalog entries.
module VehicleModelSerializer
  module_function

  def call(vm)
    return nil if vm.nil?

    {
      id: vm.uuid,
      make: vm.make,
      name: vm.name,
      category: vm.category,
      active: vm.active,
      created_at: vm.created_at.iso8601
    }
  end
end
