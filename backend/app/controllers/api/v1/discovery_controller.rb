# Location-based commercial vehicle discovery endpoint (Session 6).
module Api
  module V1
    class DiscoveryController < AuthenticatedController
      def vehicles
        authorize Vehicle, :index?

        radius = params[:radius_km].presence ? params[:radius_km].to_f : 50.0
        discovery = VehicleDiscoveryService.call(
          latitude: params[:latitude],
          longitude: params[:longitude],
          radius_km: radius,
          category: params[:category],
          start_time: params[:start_time],
          end_time: params[:end_time]
        )

        scope = discovery.vehicles
        pagy, vehicles = pagy(Kaminari.paginate_array(scope)) if defined?(Kaminari) rescue nil
        pagy, vehicles = pagy(scope) unless pagy

        render_success(
          data: {
            vehicles: vehicles.map { |v|
              data = VehicleSerializer.call(v)
              data[:distance_km] = discovery.distances[v.uuid] if discovery.distances[v.uuid]
              data
            },
            pagination: {
              page: pagy.page,
              pages: pagy.pages,
              count: pagy.count,
              limit: pagy.limit
            }
          }
        )
      end
    end
  end
end
