# Real-time GPS location ingestion and tracking trail query endpoints (Session 7).
module Api
  module V1
    class GpsTrackingController < AuthenticatedController
      def create
        booking = Booking.find_by!(uuid: params[:id])
        authorize booking, :record_gps?

        result = GpsTrackingService.record_ping(
          booking: booking,
          driver: Current.user,
          latitude: params[:latitude],
          longitude: params[:longitude],
          speed_kmh: params[:speed_kmh] || 0.0
        )

        if result.success?
          render_success(data: { gps_ping: GpsPingSerializer.call(result.ping) }, status: :created)
        else
          render_error(
            code: "gps_ping_failed",
            message: I18n.t("errors.gps_ping_failed", default: "Could not record GPS location ping"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def show
        booking = Booking.find_by!(uuid: params[:id])
        authorize booking, :view_tracking?

        result = GpsTrackingService.get_trail(booking: booking)
        latest_ping = booking.gps_pings.latest_first.first

        render_success(
          data: {
            latest_location: GpsPingSerializer.call(latest_ping),
            trail: result.trail.map { |p| GpsPingSerializer.call(p) }
          }
        )
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end
    end
  end
end
