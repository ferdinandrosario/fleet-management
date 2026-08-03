# Authenticates platform super-admin operators (Session 4).
module Api
  module V1
    module SuperAdmin
      class SessionsController < ApplicationController
        def create
          admin = ::SuperAdmin.find_by(email: session_params[:email].to_s.strip.downcase)
          if admin&.authenticate(session_params[:password])
            token = JwtService.encode_access(subject: admin.uuid, role: "super_admin", tenant: "public")
            render_success(
              data: {
                access_token: token,
                super_admin: {
                  id: admin.uuid,
                  email: admin.email
                }
              }
            )
          else
            render_error(
              code: "invalid_credentials",
              message: I18n.t("errors.invalid_credentials"),
              status: :unauthorized
            )
          end
        end

        private

        def session_params
          params.permit(:email, :password)
        end
      end
    end
  end
end
