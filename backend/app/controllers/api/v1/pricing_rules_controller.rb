# Pricing rules management endpoints (Session 5).
module Api
  module V1
    class PricingRulesController < AuthenticatedController
      before_action :set_vehicle

      def index
        authorize Vehicle
        rules = @vehicle.pricing_rules.order(min_duration_hours: :asc)
        render_success(data: { rules: rules.map { |r| PricingRuleSerializer.call(r) } })
      end

      def create
        authorize @vehicle, :update?
        rule = @vehicle.pricing_rules.new(pricing_rule_params)
        if rule.save
          render_success(data: { rule: PricingRuleSerializer.call(rule) }, status: :created)
        else
          render_validation_errors(rule)
        end
      end

      def destroy
        rule = @vehicle.pricing_rules.find_by!(uuid: params[:id])
        authorize @vehicle, :update?
        rule.destroy
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

      def pricing_rule_params
        params.permit(:min_duration_hours, :discount_percentage, :override_hourly_rate_cents, :override_daily_rate_cents, :start_date, :end_date, :active)
      end
    end
  end
end
