module Api
  module V1
    # Customer self-registration. Role is forced to customer server-side (you
    # can't self-register as driver/owner_admin — those are created by
    # privileged users). A successful signup sends an OTP to verify the phone.
    class RegistrationsController < BaseController
      def create
        user = User.new(registration_params.merge(role: :customer))
        if user.save
          OtpService.issue(user)
          render_success(
            data: { id: user.uuid, phone_verification_required: true },
            status: :created
          )
        else
          render_validation_errors(user)
        end
      end

      private

      def registration_params
        params.require(:user).permit(:name, :phone, :password, :locale)
      end
    end
  end
end
