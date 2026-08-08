# Location-based vehicle discovery and proximity search (Session 6).
# Filters vehicles by category, spatial proximity (radius in km), and availability window.
class VehicleDiscoveryService
  Result = Struct.new(:vehicles, :distances, keyword_init: true)

  class << self
    def call(latitude: nil, longitude: nil, radius_km: 50.0, category: nil, start_time: nil, end_time: nil)
      scope = Vehicle.available_only.includes(:vehicle_model)
      scope = scope.by_category(category) if category.present?

      if start_time.present? && end_time.present?
        st = Time.zone.parse(start_time.to_s) rescue nil
        et = Time.zone.parse(end_time.to_s) rescue nil

        if st && et
          # Exclude vehicles with conflicting availability blocks
          busy_vehicle_ids_avail = VehicleAvailability.where("start_time < ? AND end_time > ?", et, st).select(:vehicle_id)
          # Exclude vehicles with active overlapping bookings
          busy_vehicle_ids_book = Booking.active.overlapping_range(st, et).select(:vehicle_id)

          scope = scope.where.not(id: busy_vehicle_ids_avail).where.not(id: busy_vehicle_ids_book)
        end
      end

      if latitude.present? && longitude.present?
        scope = scope.within_radius(latitude, longitude, radius_km)
                     .with_distance_from(latitude, longitude)
                     .order(Arel.sql("distance ASC"))
      end

      vehicles_list = scope.to_a
      distances_map = {}

      if latitude.present? && longitude.present?
        vehicles_list.each do |v|
          distances_map[v.uuid] = v.distance.to_f if v.respond_to?(:distance)
        end
      end

      Result.new(vehicles: vehicles_list, distances: distances_map)
    end
  end
end
