# Super-admin subscription plan management controller (Session 4).
module Api
  module V1
    module SuperAdmin
      class PlansController < BaseController
        def index
          authorize Plan
          plans = Plan.order(tier: :asc, created_at: :asc)
          render_success(data: { plans: plans.map { |p| PlanSerializer.call(p) } })
        end

        def show
          plan = Plan.find_by!(uuid: params[:id])
          authorize plan
          render_success(data: { plan: PlanSerializer.call(plan) })
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        def create
          authorize Plan
          plan = Plan.new(plan_params)
          if plan.save
            render_success(data: { plan: PlanSerializer.call(plan) }, status: :created)
          else
            render_validation_errors(plan)
          end
        end

        def update
          plan = Plan.find_by!(uuid: params[:id])
          authorize plan
          if plan.update(plan_params)
            render_success(data: { plan: PlanSerializer.call(plan) })
          else
            render_validation_errors(plan)
          end
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        private

        def plan_params
          params.permit(:name, :tier, :interval, :price_paise, :active, limits: {})
        end
      end
    end
  end
end
