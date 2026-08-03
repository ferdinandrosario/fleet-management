# Super-admin subscription management controller (Session 4).
module Api
  module V1
    module SuperAdmin
      class SubscriptionsController < BaseController
        def show
          subscription = Subscription.find_by!(uuid: params[:id])
          authorize subscription
          render_success(data: { subscription: SubscriptionSerializer.call(subscription) })
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        def update
          subscription = Subscription.find_by!(uuid: params[:id])
          authorize subscription

          if subscription_params[:plan_id].present?
            plan = Plan.find_by(uuid: subscription_params[:plan_id])
            if plan.nil?
              return render_error(code: "plan_not_found", message: I18n.t("errors.not_found"), status: :unprocessable_content)
            end
            subscription.plan = plan
          end

          update_data = subscription_params.except(:plan_id)
          if subscription.update(update_data)
            render_success(data: { subscription: SubscriptionSerializer.call(subscription) })
          else
            render_validation_errors(subscription)
          end
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        private

        def subscription_params
          params.permit(:status, :plan_id, :razorpay_subscription_id)
        end
      end
    end
  end
end
