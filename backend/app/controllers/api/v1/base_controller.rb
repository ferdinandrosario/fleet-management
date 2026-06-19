module Api
  module V1
    # Base for every tenant-scoped endpoint: resolves + switches into the tenant
    # before the action runs. Auth endpoints (register/otp/login) inherit this
    # directly (public within a tenant); protected endpoints use
    # AuthenticatedController.
    class BaseController < ApplicationController
      include TenantResolution

      private

      def normalized_phone
        params[:phone].to_s.strip.delete(" ").presence
      end
    end
  end
end
