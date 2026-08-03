# Serializes vehicle listings (Session 5).
module VehicleSerializer
  module_function

  def call(vehicle)
    return nil if vehicle.nil?

    {
      id: vehicle.uuid,
      name: vehicle.name,
      category: vehicle.category,
      registration_number: vehicle.registration_number,
      model_year: vehicle.model_year,
      hourly_rate_cents: vehicle.hourly_rate_cents,
      daily_rate_cents: vehicle.daily_rate_cents,
      status: vehicle.status,
      specs: vehicle.specs || {},
      created_at: vehicle.created_at.iso8601
    }
  end
end
