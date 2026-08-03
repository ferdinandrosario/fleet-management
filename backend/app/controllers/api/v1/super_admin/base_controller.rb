# Base controller for super-admin platform endpoints (Session 4).
# Operates exclusively in public schema; authenticates SuperAdmin via Bearer JWT.
module Api
  module V1
    module SuperAdmin
      class BaseController < ApplicationController
        before_action :authenticate_super_admin!
        after_action :verify_authorized

        private

        def authenticate_super_admin!
          token = bearer_token
          return unauthorized if token.blank?

          payload = JwtService.decode(token)
          return unauthorized if invalid_super_admin_access?(payload)

          Current.super_admin = ::SuperAdmin.find_by(uuid: payload["sub"])
          unauthorized if Current.super_admin.nil?
        end

        def pundit_user
          Current.super_admin
        end

        def invalid_super_admin_access?(payload)
          payload.nil? || payload["type"] != "access" || payload["role"] != "super_admin" || payload["tenant"] != "public"
        end

        def bearer_token
          request.headers["Authorization"].to_s.delete_prefix("Bearer ").strip.presence
        end

        def unauthorized
          render_error(code: "unauthorized", message: I18n.t("errors.unauthorized"), status: :unauthorized)
        end
      end
    end
  end
end
