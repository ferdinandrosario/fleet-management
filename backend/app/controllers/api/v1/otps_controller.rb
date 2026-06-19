module Api
  module V1
    # Phone-verification OTPs. `create` (request a code) always returns a generic
    # success — it never reveals whether the phone is registered (no user
    # enumeration). `verify` checks the code and, on success, issues the token
    # pair. Request/verify rate limits are enforced by rack-attack.
    class OtpsController < BaseController
      def create
        user = User.find_by(phone: normalized_phone)
        OtpService.issue(user) if user
        render_success(data: { sent: true })
      end

      def verify
        user = User.find_by(phone: normalized_phone)
        result = user && OtpService.verify(user, params[:code])

        if result&.ok
          render_tokens(user, AuthTokenService.issue(user, tenant: Current.tenant))
        else
          render_error(
            code: result ? result.error : "otp_invalid",
            message: I18n.t("errors.otp_invalid"),
            status: :unprocessable_content
          )
        end
      end
    end
  end
end
