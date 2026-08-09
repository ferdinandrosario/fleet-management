# Driver payroll settlement endpoints (Session 9).
module Api
  module V1
    class DriverPayrollsController < AuthenticatedController
      def index
        authorize DriverPayroll

        scope = Current.user.driver? ? DriverPayroll.where(driver_id: Current.user.id) : DriverPayroll.all
        pagy, payrolls = pagy(scope.chronological.includes(:driver))

        render_success(
          data: {
            payrolls: payrolls.map { |p| DriverPayrollSerializer.call(p) },
            pagination: {
              page: pagy.page,
              pages: pagy.pages,
              count: pagy.count,
              limit: pagy.limit
            }
          }
        )
      end

      def calculate
        driver = User.find_by!(uuid: params[:driver_id])
        authorize DriverPayroll

        result = PayrollService.calculate_payroll(
          driver: driver,
          period_start: params[:period_start],
          period_end: params[:period_end],
          bonus_paise: params[:bonus_paise],
          deductions_paise: params[:deductions_paise]
        )

        if result.success?
          render_success(data: { payroll: DriverPayrollSerializer.call(result.payroll) }, status: :created)
        else
          render_error(
            code: "payroll_calculation_failed",
            message: I18n.t("errors.payroll_calculation_failed", default: "Could not calculate payroll"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def pay
        payroll = DriverPayroll.find_by!(uuid: params[:id])
        authorize payroll

        result = PayrollService.mark_as_paid(payroll: payroll)

        if result.success?
          render_success(data: { payroll: DriverPayrollSerializer.call(result.payroll) })
        else
          render_error(
            code: "payroll_payment_failed",
            message: I18n.t("errors.payroll_payment_failed", default: "Could not settle payroll payment"),
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
