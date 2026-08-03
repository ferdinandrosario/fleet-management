# Serializes vehicle listings (Session 5 & 8).
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
      address: vehicle.address,
      latitude: vehicle.latitude&.to_f,
      longitude: vehicle.longitude&.to_f,
      average_rating: vehicle.average_rating.to_f,
      reviews_count: vehicle.reviews_count,
      specs: vehicle.specs || {},
      created_at: vehicle.created_at.iso8601
    }
  end
end
