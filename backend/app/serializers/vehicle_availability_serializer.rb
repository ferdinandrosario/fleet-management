# Serializes vehicle availability blocks (Session 5).
module VehicleAvailabilitySerializer
  module_function

  def call(availability)
    return nil if availability.nil?

    {
      id: availability.uuid,
      vehicle_id: availability.vehicle.uuid,
      start_time: availability.start_time.iso8601,
      end_time: availability.end_time.iso8601,
      reason: availability.reason
    }
  end
end
