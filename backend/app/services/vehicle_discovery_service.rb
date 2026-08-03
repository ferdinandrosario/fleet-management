# Location-based vehicle discovery and proximity search (Session 6).
# Filters vehicles by category, spatial proximity (radius in km), and availability window.
class VehicleDiscoveryService
  Result = Struct.new(:vehicles, :distances, keyword_init: true)

  class << self
    def call(latitude: nil, longitude: nil, radius_km: 50.0, category: nil, start_time: nil, end_time: nil)
      scope = Vehicle.available_only
      scope = scope.by_category(category) if category.present?

      if start_time.present? && end_time.present?
        st = Time.zone.parse(start_time.to_s) rescue nil
        et = Time.zone.parse(end_time.to_s) rescue nil

        if st && et
          # Exclude vehicles with conflicting availability blocks
          busy_vehicle_ids_avail = VehicleAvailability.where("start_time < ? AND end_time > ?", et, st).pluck(:vehicle_id)
          # Exclude vehicles with active overlapping bookings
          busy_vehicle_ids_book = Booking.active.overlapping_range(st, et).pluck(:vehicle_id)

          busy_ids = (busy_vehicle_ids_avail + busy_vehicle_ids_book).uniq
          scope = scope.where.not(id: busy_ids) if busy_ids.any?
        end
      end

      vehicles_list = scope.to_a
      distances_map = {}

      if latitude.present? && longitude.present?
        lat_f = latitude.to_f
        lng_f = longitude.to_f
        max_dist = radius_km.to_f

        vehicles_list = vehicles_list.select do |v|
          dist = v.distance_to(lat_f, lng_f)
          if dist && dist <= max_dist
            distances_map[v.uuid] = dist
            true
          elsif dist.nil?
            true # Include vehicles without coordinates at end of list
          else
            false
          end
        end

        vehicles_list.sort_by! { |v| distances_map[v.uuid] || 999999 }
      end

      Result.new(vehicles: vehicles_list, distances: distances_map)
    end
  end
end
