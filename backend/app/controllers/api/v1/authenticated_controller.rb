module Api
  module V1
    # Base for endpoints that require a logged-in user. Adds token authentication
    # and enforces Pundit default-deny: `verify_authorized` fails the request if
    # an action forgot to call `authorize`.
    class AuthenticatedController < BaseController
      include Authentication

      after_action :verify_authorized

      private

      def pundit_user
        Current.user
      end
    end
  end
end
