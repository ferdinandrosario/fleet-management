module Api
  module V1
    # Login (phone + password) and refresh-token rotation. Logout lives on the
    # authenticated ProfileController (it needs a verified session to revoke).
    class SessionsController < BaseController
      def create
        user = User.find_by(phone: normalized_phone)

        unless user&.authenticate(params[:password])
          return render_error(
            code: "invalid_credentials",
            message: I18n.t("errors.invalid_credentials"),
            status: :unauthorized
          )
        end

        unless user.phone_verified?
          return render_error(
            code: "phone_unverified",
            message: I18n.t("errors.phone_unverified"),
            status: :forbidden
          )
        end

        render_tokens(user, AuthTokenService.issue(user, tenant: Current.tenant))
      end

      def refresh
        tokens = AuthTokenService.rotate(params[:refresh_token].to_s, tenant: Current.tenant)

        if tokens
          render_success(data: { access_token: tokens.access, refresh_token: tokens.refresh })
        else
          render_error(
            code: "invalid_token",
            message: I18n.t("errors.invalid_token"),
            status: :unauthorized
          )
        end
      end
    end
  end
end
