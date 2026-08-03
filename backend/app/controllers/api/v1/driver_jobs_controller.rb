# Driver assignment and job execution lifecycle endpoints (Session 7).
module Api
  module V1
    class DriverJobsController < AuthenticatedController
      def assign_driver
        booking = Booking.find_by!(uuid: params[:id])
        authorize booking, :assign_driver?

        driver = User.find_by!(uuid: params[:driver_id])
        result = JobExecutionService.assign_driver(booking: booking, driver: driver)

        if result.success?
          render_success(data: { booking: BookingSerializer.call(result.booking) })
        else
          render_error(
            code: "driver_assignment_failed",
            message: I18n.t("errors.driver_assignment_failed", default: "Could not assign driver"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def start_job
        booking = Booking.find_by!(uuid: params[:id])
        authorize booking, :start_job?

        result = JobExecutionService.start_job(
          booking: booking,
          driver: Current.user,
          start_meter_reading: params[:start_meter_reading]
        )

        if result.success?
          render_success(data: { booking: BookingSerializer.call(result.booking) })
        else
          render_error(
            code: "job_start_failed",
            message: I18n.t("errors.job_start_failed", default: "Could not start job"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def finish_job
        booking = Booking.find_by!(uuid: params[:id])
        authorize booking, :finish_job?

        result = JobExecutionService.finish_job(
          booking: booking,
          driver: Current.user,
          end_meter_reading: params[:end_meter_reading]
        )

        if result.success?
          render_success(data: { booking: BookingSerializer.call(result.booking) })
        else
          render_error(
            code: "job_finish_failed",
            message: I18n.t("errors.job_finish_failed", default: "Could not finish job"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end
    end
  end
end
