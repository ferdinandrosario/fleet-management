# Vehicle availability management endpoints (Session 5).
module Api
  module V1
    class VehicleAvailabilitiesController < AuthenticatedController
      before_action :set_vehicle

      def index
        authorize Vehicle
        availabilities = @vehicle.vehicle_availabilities.order(start_time: :asc)
        render_success(data: { availabilities: availabilities.map { |a| VehicleAvailabilitySerializer.call(a) } })
      end

      def create
        authorize @vehicle, :update?
        availability = @vehicle.vehicle_availabilities.new(availability_params)
        if availability.save
          render_success(data: { availability: VehicleAvailabilitySerializer.call(availability) }, status: :created)
        else
          render_validation_errors(availability)
        end
      end

      def destroy
        availability = @vehicle.vehicle_availabilities.find_by!(uuid: params[:id])
        authorize @vehicle, :update?
        availability.destroy
        render_success(data: { id: params[:id] })
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      private

      def set_vehicle
        @vehicle = Vehicle.find_by!(uuid: params[:vehicle_id])
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def availability_params
        params.permit(:start_time, :end_time, :reason)
      end
    end
  end
end
