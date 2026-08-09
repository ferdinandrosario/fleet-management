# Vehicle management and listing endpoints (Session 5).
module Api
  module V1
    class VehiclesController < AuthenticatedController
      def index
        authorize Vehicle
        scope = Vehicle.order(created_at: :desc)
        scope = scope.by_category(params[:category])
        scope = scope.where(status: params[:status]) if params[:status].present?

        pagy, vehicles = pagy(scope)
        render_success(
          data: {
            vehicles: vehicles.map { |v| VehicleSerializer.call(v) },
            pagination: {
              page: pagy.page,
              pages: pagy.pages,
              count: pagy.count,
              limit: pagy.limit
            }
          }
        )
      end

      def show
        vehicle = Vehicle.find_by!(uuid: params[:id])
        authorize vehicle
        render_success(data: { vehicle: VehicleSerializer.call(vehicle) })
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def create
        authorize Vehicle
        owner = Owner.find_by(slug: Current.tenant)
        limit_check = PlanLimitService.check(owner, :vehicles, current_count: Vehicle.count)
        unless limit_check.allowed?
          return render_error(
            code: "plan_limit_exceeded",
            message: I18n.t("errors.plan_limit_exceeded", default: "Plan vehicle limit reached"),
            status: :forbidden,
            fields: { limit: limit_check.limit, current: limit_check.current }
          )
        end

        vehicle = Vehicle.new(vehicle_params)
        if vehicle.save
          render_success(data: { vehicle: VehicleSerializer.call(vehicle) }, status: :created)
        else
          render_validation_errors(vehicle)
        end
      end

      def update
        vehicle = Vehicle.find_by!(uuid: params[:id])
        authorize vehicle
        if vehicle.update(vehicle_params)
          render_success(data: { vehicle: VehicleSerializer.call(vehicle) })
        else
          render_validation_errors(vehicle)
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def destroy
        vehicle = Vehicle.find_by!(uuid: params[:id])
        authorize vehicle
        vehicle.inactive!
        render_success(data: { vehicle: VehicleSerializer.call(vehicle) })
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def quote
        vehicle = Vehicle.find_by!(uuid: params[:id])
        authorize vehicle, :calculate_quote?

        hours = params[:hours].to_i
        days = params[:days].to_i
        quote_result = PricingCalculatorService.call(vehicle: vehicle, hours: hours, days: days)

        render_success(
          data: {
            vehicle_id: vehicle.uuid,
            base_paise: quote_result.base_paise,
            discount_paise: quote_result.discount_paise,
            final_paise: quote_result.final_paise,
            applied_rule: PricingRuleSerializer.call(quote_result.applied_rule)
          }
        )
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      private

      def vehicle_params
        params.permit(:name, :category, :registration_number, :model_year, :hourly_rate_paise, :daily_rate_paise, :status, :vehicle_model_id, specs: {})
      end
    end
  end
end
