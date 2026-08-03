# Driver leave application and approval endpoints (Session 9).
module Api
  module V1
    class DriverLeavesController < AuthenticatedController
      def index
        authorize DriverLeave

        scope = Current.user.driver? ? DriverLeave.where(driver_id: Current.user.id) : DriverLeave.all
        pagy, leaves = pagy(scope.chronological)

        render_success(
          data: {
            leaves: leaves.map { |l| DriverLeaveSerializer.call(l) },
            pagination: {
              page: pagy.page,
              pages: pagy.pages,
              count: pagy.count,
              limit: pagy.limit
            }
          }
        )
      end

      def create
        authorize DriverLeave

        result = DriverLeaveService.apply_leave(
          driver: Current.user,
          start_date: params[:start_date],
          end_date: params[:end_date],
          reason: params[:reason]
        )

        if result.success?
          render_success(data: { leave: DriverLeaveSerializer.call(result.leave) }, status: :created)
        else
          render_error(
            code: "leave_application_failed",
            message: I18n.t("errors.leave_application_failed", default: "Could not apply for leave"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      end

      def update_status
        leave = DriverLeave.find_by!(uuid: params[:id])
        authorize leave

        result = DriverLeaveService.update_leave_status(
          leave: leave,
          approver: Current.user,
          status: params[:status]
        )

        if result.success?
          render_success(data: { leave: DriverLeaveSerializer.call(result.leave) })
        else
          render_error(
            code: "leave_update_failed",
            message: I18n.t("errors.leave_update_failed", default: "Could not update leave status"),
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
