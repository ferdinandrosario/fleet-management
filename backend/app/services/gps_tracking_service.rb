# Real-time GPS location ingestion and telemetry tracking trail service (Session 7).
class GpsTrackingService
  Result = Struct.new(:success, :ping, :trail, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def record_ping(booking:, driver:, latitude:, longitude:, speed_kmh: 0.0)
      if booking.nil? || driver.nil?
        return Result.new(success: false, errors: { booking: [ "booking and driver are required" ] })
      end

      unless booking.in_progress? || booking.confirmed?
        return Result.new(success: false, errors: { booking: [ "must be confirmed or in_progress to record GPS" ] })
      end

      if booking.driver_id != driver.id
        return Result.new(success: false, errors: { driver: [ "is not assigned to this booking" ] })
      end

      ping = booking.gps_pings.new(
        driver: driver,
        latitude: latitude,
        longitude: longitude,
        speed_kmh: speed_kmh,
        recorded_at: Time.current
      )

      if ping.save
        # Update vehicle real-time coordinates for discovery map
        booking.vehicle.update(latitude: latitude, longitude: longitude)
        Result.new(success: true, ping: ping)
      else
        Result.new(success: false, errors: ping.errors.to_hash)
      end
    end

    def get_trail(booking:)
      if booking.nil?
        return Result.new(success: false, errors: { booking: [ "not found" ] })
      end

      pings = booking.gps_pings.chronological.to_a
      Result.new(success: true, trail: pings)
    end
  end
end
