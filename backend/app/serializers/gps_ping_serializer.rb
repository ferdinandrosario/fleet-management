# Serializes GPS location telemetry pings (Session 7).
module GpsPingSerializer
  module_function

  def call(ping)
    return nil if ping.nil?

    {
      id: ping.uuid,
      latitude: ping.latitude,
      longitude: ping.longitude,
      speed_kmh: ping.speed_kmh,
      recorded_at: ping.recorded_at.iso8601
    }
  end
end
